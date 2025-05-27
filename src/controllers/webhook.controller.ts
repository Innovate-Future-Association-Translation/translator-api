import { Request, Response, NextFunction } from 'express';
import stripeService from '../services/stripe.service';
import subscriptionService from '../services/subscription.service';
import { User } from '../models/User';
import Stripe from 'stripe';
import mongoose from 'mongoose';

export const handleStripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;

  try {
    const event = await stripeService.constructWebhookEvent(req.body, sig);

    console.log(`处理 Stripe webhook 事件: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription') {
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          try {
            // 获取订阅详情
            const subscription = await stripeService.getSubscription(subscriptionId);

            // 获取用户
            const user = await User.findOne({ stripeCustomerId: customerId });
            if (!user) {
              console.error(`未找到 Stripe 客户 ID 对应的用户: ${customerId}`);
              break;
            }

            // 确定计划类型（基于价格ID）
            const priceId = subscription.items.data[0].price.id;
            let plan: 'basic' | 'premium' | 'enterprise' = 'basic';

            if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
              plan = 'premium';
            } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
              plan = 'enterprise';
            }

            // 检查是否已存在订阅记录
            const existingSubscription = await subscriptionService.getUserSubscription(user.id);
            if (existingSubscription) {
              // 更新现有订阅
              await subscriptionService.updateSubscriptionStatus(
                subscriptionId,
                subscription.status,
                subscription.items.data[0].current_period_start,
                subscription.items.data[0].current_period_end,
                subscription.cancel_at_period_end
              );
            } else {
              // 创建新订阅记录
              await subscriptionService.createSubscription(
                new mongoose.Types.ObjectId(user.id),
                customerId,
                subscriptionId,
                priceId,
                plan
              );
            }

            console.log(`成功处理订阅创建: 用户 ${user.email}, 计划 ${plan}`);
          } catch (error) {
            console.error('处理 checkout.session.completed 事件时出错:', error);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const firstItem = subscription.items.data[0];

        try {
          await subscriptionService.updateSubscriptionStatus(
            subscription.id,
            subscription.status,
            firstItem.current_period_start,
            firstItem.current_period_end,
            subscription.cancel_at_period_end
          );
          console.log(`成功更新订阅状态: ${subscription.id} -> ${subscription.status}`);
        } catch (error) {
          console.error('处理 customer.subscription.updated 事件时出错:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        try {
          await subscriptionService.updateSubscriptionStatus(subscription.id, 'canceled');
          console.log(`成功取消订阅: ${subscription.id}`);
        } catch (error) {
          console.error('处理 customer.subscription.deleted 事件时出错:', error);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        // 从 invoice lines 中获取 subscription ID
        let subscriptionId: string | null = null;
        if (invoice.lines && invoice.lines.data.length > 0) {
          const lineItem = invoice.lines.data.find(
            (item: Stripe.InvoiceLineItem) => item.subscription
          );
          if (lineItem && lineItem.subscription) {
            subscriptionId = lineItem.subscription as string;
          }
        }

        if (subscriptionId) {
          try {
            // 更新订阅期限
            const subscription = await stripeService.getSubscription(subscriptionId);
            const firstItem = subscription.items.data[0];

            await subscriptionService.updateSubscriptionStatus(
              subscriptionId,
              subscription.status,
              firstItem.current_period_start,
              firstItem.current_period_end
            );
            console.log(`🔄 订阅自动续费成功: ${subscriptionId}`);
            console.log(
              `📅 新的计费周期: ${new Date(firstItem.current_period_start * 1000).toISOString()} - ${new Date(firstItem.current_period_end * 1000).toISOString()}`
            );
          } catch (error) {
            console.error('处理 invoice.payment_succeeded 事件时出错:', error);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        // 从 invoice lines 中获取 subscription ID
        let subscriptionId: string | null = null;
        if (invoice.lines && invoice.lines.data.length > 0) {
          const lineItem = invoice.lines.data.find(
            (item: Stripe.InvoiceLineItem) => item.subscription
          );
          if (lineItem && lineItem.subscription) {
            subscriptionId = lineItem.subscription as string;
          }
        }

        if (subscriptionId) {
          try {
            await subscriptionService.updateSubscriptionStatus(subscriptionId, 'past_due');
            console.log(`成功处理付款失败事件: ${subscriptionId}`);

            // TODO: 这里可以发送邮件通知用户付款失败
          } catch (error) {
            console.error('处理 invoice.payment_failed 事件时出错:', error);
          }
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        try {
          // 获取用户
          const user = await User.findOne({ stripeCustomerId: customerId });
          if (!user) {
            console.error(`未找到 Stripe 客户 ID 对应的用户: ${customerId}`);
            break;
          }

          // 确定计划类型
          const priceId = subscription.items.data[0].price.id;
          let plan: 'basic' | 'premium' | 'enterprise' = 'basic';

          if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
            plan = 'premium';
          } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
            plan = 'enterprise';
          }

          // 检查是否已存在订阅记录
          const existingSubscription = await subscriptionService.getUserSubscription(user.id);
          if (!existingSubscription) {
            // 创建新订阅记录
            await subscriptionService.createSubscription(
              new mongoose.Types.ObjectId(user.id),
              customerId,
              subscription.id,
              priceId,
              plan
            );
            console.log(`通过 subscription.created 事件创建订阅: 用户 ${user.email}, 计划 ${plan}`);
          } else {
            console.log(`用户 ${user.email} 已有订阅记录，跳过创建`);
          }
        } catch (error) {
          console.error('处理 customer.subscription.created 事件时出错:', error);
        }
        break;
      }

      default:
        console.log(`未处理的事件类型：${event.type}`);
    }

    // 返回 200 响应，确认收到 webhook
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook 错误：', error);
    const err = new Error(`Webhook 错误：${(error as Error).message}`);
    (err as any).status = 400;
    next(err);
  }
};
