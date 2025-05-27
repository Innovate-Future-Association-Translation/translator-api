import { Request, Response, NextFunction } from 'express';
import subscriptionService from '../../services/subscription.service';
import { ErrorWithStatus } from '../ErrorHandler';
import { ClientErrorStatus } from '../../utils/errorStatusCode';

export const requireSubscription = (requiredPlan?: 'basic' | 'premium' | 'enterprise') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        const error: ErrorWithStatus = new Error('未授权访问');
        error.status = ClientErrorStatus.UNAUTHORIZED;
        return next(error);
      }

      const hasAccess = await subscriptionService.checkSubscriptionAccess(userId, requiredPlan);

      if (!hasAccess) {
        const error: ErrorWithStatus = new Error(
          requiredPlan ? `需要 ${requiredPlan} 或更高级别的订阅计划` : '需要有效的订阅'
        );
        error.status = ClientErrorStatus.FORBIDDEN;
        return next(error);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
