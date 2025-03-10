import { User } from "../models/User";
import { NextFunction, Request, Response } from "express";
import { ServeErrorMessagge } from "../utils/errorMessages";
import { ErrorWithStatus } from '../middlewares/ErrorHandler';
import { ClientErrorStatus } from "../utils/errorStatusCode";

export const getUsers = async (req: Request, res: Response,next: NextFunction): Promise<void> => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    const err: ErrorWithStatus = new Error();
    err.status = ClientErrorStatus.BAD_REQUEST;
    err.message = (error as Error).message;  
    next(err);  
  }
};

export default getUsers;
