import { Subscription, ISubscription } from '../models/Subscription';
import stripeService from './stripe.service';
import mongoose from 'mongoose';

const createSubscription = async (
  userId: mongoose.Types.ObjectId,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  stripePriceId: string,
  plan: 'basic' | 'premium' | 'enterprise',
  isDebugMode: boolean = false
): Promise<ISubscription> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    let stripeSubscription: any = null;
    let firstItem: any = null;

    // 如果不是调试模式，从 Stripe 获取真实数据
    if (!isDebugMode && !stripeSubscriptionId.startsWith('sub_mock_')) {
      try {
        stripeSubscription = await stripeService.getSubscription(stripeSubscriptionId);
        firstItem = stripeSubscription.items.data[0];
      } catch (error) {
        console.warn('无法从 Stripe 获取订阅信息，使用默认值:', error);
        isDebugMode = true;
      }
    }

    // 检查是否已存在订阅
    const existingSubscription = await Subscription.findOne({ userId }).session(session);
    if (existingSubscription) {
      // 更新现有订阅而不是创建新的
      existingSubscription.stripeCustomerId = stripeCustomerId;
      existingSubscription.stripeSubscriptionId = stripeSubscriptionId;
      existingSubscription.stripePriceId = stripePriceId;
      existingSubscription.status = isDebugMode ? 'active' : (stripeSubscription.status as any);
      existingSubscription.currentPeriodStart = isDebugMode
        ? new Date()
        : new Date(firstItem.current_period_start * 1000);
      existingSubscription.currentPeriodEnd = isDebugMode
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后
        : new Date(firstItem.current_period_end * 1000);
      existingSubscription.cancelAtPeriodEnd = isDebugMode
        ? false
        : stripeSubscription.cancel_at_period_end;
      existingSubscription.plan = plan;

      await existingSubscription.save({ session });
      await session.commitTransaction();
      return existingSubscription;
    }

    const subscription = new Subscription({
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      stripePriceId,
      status: isDebugMode ? 'active' : stripeSubscription.status,
      currentPeriodStart: isDebugMode
        ? new Date()
        : new Date(firstItem.current_period_start * 1000),
      currentPeriodEnd: isDebugMode
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后
        : new Date(firstItem.current_period_end * 1000),
      cancelAtPeriodEnd: isDebugMode ? false : stripeSubscription.cancel_at_period_end,
      plan,
    });

    await subscription.save({ session });
    await session.commitTransaction();
    return subscription;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const updateSubscriptionStatus = async (
  stripeSubscriptionId: string,
  status: string,
  currentPeriodStart?: number,
  currentPeriodEnd?: number,
  cancelAtPeriodEnd?: boolean
): Promise<ISubscription | null> => {
  const updateData: any = { status };

  if (currentPeriodStart) {
    updateData.currentPeriodStart = new Date(currentPeriodStart * 1000);
  }

  if (currentPeriodEnd) {
    updateData.currentPeriodEnd = new Date(currentPeriodEnd * 1000);
  }

  if (cancelAtPeriodEnd !== undefined) {
    updateData.cancelAtPeriodEnd = cancelAtPeriodEnd;
  }

  const subscription = await Subscription.findOneAndUpdate({ stripeSubscriptionId }, updateData, {
    new: true,
  });

  if (!subscription) {
    console.warn(`未找到订阅记录: ${stripeSubscriptionId}`);
  }

  return subscription;
};

const getUserSubscription = async (userId: string): Promise<ISubscription | null> => {
  return await Subscription.findOne({ userId }).sort({ createdAt: -1 });
};

const checkSubscriptionAccess = async (
  userId: string,
  requiredPlan?: 'basic' | 'premium' | 'enterprise'
): Promise<boolean> => {
  console.log(`检查用户 ${userId} 的订阅权限，要求计划: ${requiredPlan || '任何'}`);

  const subscription = await getUserSubscription(userId);
  console.log(
    '找到的订阅:',
    subscription
      ? {
          id: subscription._id,
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        }
      : null
  );

  if (!subscription) {
    console.log('未找到订阅记录');
    return false;
  }

  if (subscription.status !== 'active') {
    console.log(`订阅状态不是 active: ${subscription.status}`);
    return false;
  }

  if (subscription.currentPeriodEnd < new Date()) {
    console.log(`订阅已过期: ${subscription.currentPeriodEnd} < ${new Date()}`);
    return false;
  }

  if (requiredPlan) {
    const planHierarchy = { basic: 1, premium: 2, enterprise: 3 };
    const userPlanLevel = planHierarchy[subscription.plan];
    const requiredPlanLevel = planHierarchy[requiredPlan];
    const hasAccess = userPlanLevel >= requiredPlanLevel;
    console.log(
      `计划层级检查: 用户计划 ${subscription.plan}(${userPlanLevel}) >= 要求计划 ${requiredPlan}(${requiredPlanLevel}) = ${hasAccess}`
    );
    return hasAccess;
  }

  console.log('权限检查通过');
  return true;
};

const subscriptionService = {
  createSubscription,
  updateSubscriptionStatus,
  getUserSubscription,
  checkSubscriptionAccess,
};

export default subscriptionService;
