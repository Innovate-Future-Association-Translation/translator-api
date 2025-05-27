import { Request, Response, NextFunction } from 'express';
import { ErrorWithStatus } from '../middlewares/ErrorHandler';
import { ClientErrorStatus, ServerErrorStatus } from '../utils/errorStatusCode';
import stripeService from '../services/stripe.service';
import subscriptionService from '../services/subscription.service';
import { User } from '../models/User';
import config from '../config/index';

const PRICE_IDS = {
  basic: process.env.STRIPE_BASIC_PRICE_ID || '',
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || '',
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
};

// 验证必要的环境变量
const validateStripeConfig = () => {
  const missingVars = [];
  if (!PRICE_IDS.basic) missingVars.push('STRIPE_BASIC_PRICE_ID');
  if (!PRICE_IDS.premium) missingVars.push('STRIPE_PREMIUM_PRICE_ID');
  if (!PRICE_IDS.enterprise) missingVars.push('STRIPE_ENTERPRISE_PRICE_ID');
  if (!config.stripe.secretKey) missingVars.push('STRIPE_SECRET_KEY');
  if (!config.stripe.webhookSecret) missingVars.push('STRIPE_WEBHOOK_SECRET');

  if (missingVars.length > 0) {
    console.error('缺少必要的 Stripe 环境变量:', missingVars.join(', '));
    throw new Error(`缺少必要的 Stripe 环境变量: ${missingVars.join(', ')}`);
  }
};

// 在模块加载时验证配置
validateStripeConfig();

export const createCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { plan } = req.body;

    if (!userId) {
      const error: ErrorWithStatus = new Error('未授权访问');
      error.status = ClientErrorStatus.UNAUTHORIZED;
      return next(error);
    }

    // 输入验证和清理
    if (!plan || typeof plan !== 'string') {
      const error: ErrorWithStatus = new Error('订阅计划参数无效');
      error.status = ClientErrorStatus.BAD_REQUEST;
      return next(error);
    }

    const cleanPlan = plan.trim().toLowerCase();
    if (!PRICE_IDS[cleanPlan as keyof typeof PRICE_IDS]) {
      const error: ErrorWithStatus = new Error('无效的订阅计划');
      error.status = ClientErrorStatus.BAD_REQUEST;
      return next(error);
    }

    const user = await User.findById(userId);
    if (!user) {
      const error: ErrorWithStatus = new Error('用户不存在');
      error.status = ClientErrorStatus.NOT_FOUND;
      return next(error);
    }

    // 检查用户是否已有活跃订阅
    const existingSubscription = await subscriptionService.getUserSubscription(userId);
    if (existingSubscription && existingSubscription.status === 'active') {
      const error: ErrorWithStatus = new Error('用户已有活跃订阅');
      error.status = ClientErrorStatus.CONFLICT;
      return next(error);
    }

    // 创建或获取 Stripe 客户
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripeService.createCustomer(user.email, user.name);
      stripeCustomerId = customer.id;
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }

    // 验证环境变量
    const successUrl = process.env.APP_URL;
    const cancelUrl = process.env.APP_URL;

    if (!successUrl || !cancelUrl) {
      const error: ErrorWithStatus = new Error('应用配置错误');
      error.status = ServerErrorStatus.INTERNAL_SERVER_ERROR;
      return next(error);
    }

    // 确保 stripeCustomerId 不为 undefined
    if (!stripeCustomerId) {
      const error: ErrorWithStatus = new Error('Stripe 客户 ID 不存在');
      error.status = ServerErrorStatus.INTERNAL_SERVER_ERROR;
      return next(error);
    }

    // 创建 Checkout Session
    const session = await stripeService.createCheckoutSession(
      stripeCustomerId,
      PRICE_IDS[cleanPlan as keyof typeof PRICE_IDS],
      `${successUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      `${cancelUrl}/subscription/cancel`
    );

    res.status(200).json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('创建 Checkout Session 时出错:', error);
    next(error);
  }
};

export const createBillingPortalSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      const error: ErrorWithStatus = new Error('未授权访问');
      error.status = ClientErrorStatus.UNAUTHORIZED;
      return next(error);
    }

    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      const error: ErrorWithStatus = new Error('未找到客户信息');
      error.status = ClientErrorStatus.NOT_FOUND;
      return next(error);
    }

    const session = await stripeService.createBillingPortalSession(
      user.stripeCustomerId,
      `${process.env.APP_URL}/subscription/manage`
    );

    res.status(200).json({
      billingPortalUrl: session.url,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      const error: ErrorWithStatus = new Error('未授权访问');
      error.status = ClientErrorStatus.UNAUTHORIZED;
      return next(error);
    }

    const subscription = await subscriptionService.getUserSubscription(userId);

    res.status(200).json({
      hasSubscription: !!subscription,
      subscription: subscription
        ? {
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      const error: ErrorWithStatus = new Error('未授权访问');
      error.status = ClientErrorStatus.UNAUTHORIZED;
      return next(error);
    }

    const subscription = await subscriptionService.getUserSubscription(userId);
    if (!subscription) {
      const error: ErrorWithStatus = new Error('未找到订阅');
      error.status = ClientErrorStatus.NOT_FOUND;
      return next(error);
    }

    await stripeService.cancelSubscription(subscription.stripeSubscriptionId);
    await subscriptionService.updateSubscriptionStatus(
      subscription.stripeSubscriptionId,
      subscription.status,
      undefined,
      undefined,
      true
    );

    res.status(200).json({
      message: '订阅已设置为在当前计费周期结束时取消',
    });
  } catch (error) {
    next(error);
  }
};

const subscriptionController = {
  createCheckoutSession,
  createBillingPortalSession,
  getSubscriptionStatus,
  cancelSubscription,
};

export default subscriptionController;
