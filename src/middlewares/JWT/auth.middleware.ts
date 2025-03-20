import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../../config";
import { ErrorWithStatus } from "../ErrorHandler";
import { authErrorMessages } from "../../utils/errorMessages";
import { ClientErrorStatus } from "../../utils/errorStatusCode";
import { User } from "../../models/User";

interface JwtPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from request header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error: ErrorWithStatus = new Error(authErrorMessages.MISSING_AUTH_TOKEN);
      error.status = ClientErrorStatus.UNAUTHORIZED;
      return next(error);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      const error: ErrorWithStatus = new Error(authErrorMessages.MISSING_AUTH_TOKEN);
      error.status = ClientErrorStatus.UNAUTHORIZED;
      return next(error);
    }

    // Validate token
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    // Check if user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      const error: ErrorWithStatus = new Error(authErrorMessages.UNAUTHORIZED_ACCESS);
      error.status = ClientErrorStatus.UNAUTHORIZED;
      return next(error);
    }

    // Add user ID to request object
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    const err: ErrorWithStatus = new Error(authErrorMessages.INVALID_AUTH_TOKEN);
    err.status = ClientErrorStatus.UNAUTHORIZED;
    next(err);
  }
};

export default authMiddleware; 