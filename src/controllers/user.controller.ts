import { User, IUser } from "../models/User";
import { NextFunction, Request, Response } from "express";
import { ErrorWithStatus } from "../middlewares/ErrorHandler";
import { ClientErrorStatus } from "../utils/errorStatusCode";
import authServices from "../services/auth.service";
import { updateProfile } from "../services/user.service";
import { authErrorMessages } from "../utils/errorMessages";
import { authSuccessMessage } from "../utils/successMessage";
import { userProfileMessage } from "../utils/userProfileMessame";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    const err: ErrorWithStatus = new Error();
    err.status = ClientErrorStatus.BAD_REQUEST;
    err.message = (error as Error).message;
    next(error);
  }
};

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userData = req.body;
    const { name, email, password, mobile, language, selfDescription } =
      req.body;

    if (!name || !email || !password || !language) {
      const error: ErrorWithStatus = new Error(
        authErrorMessages.MISSING_REGISTRATION_FIELD
      );
      error.status = ClientErrorStatus.BAD_REQUEST;
      return next(error);
    }

    await authServices.register({
      name,
      email,
      password,
      mobile,
      language,
      selfDescription,
    } as IUser);
    res
      .status(201)
      .json({ message: authSuccessMessage.REGISTER_SUCCESSFULLY, name: name });
  } catch (error: any) {
    const err: ErrorWithStatus = new Error();
    err.status = error.status || ClientErrorStatus.BAD_REQUEST;
    err.message = (error as Error).message;
    next(err);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;
  try {
    const token = await authServices.login(email, password);

    res.json({
      message: authSuccessMessage.LOGIN_SUCCESSFULLY,
      token: token,
    });
  } catch (e : any) {
    const err: ErrorWithStatus = new Error();
    err.status = ClientErrorStatus.UNAUTHORIZED;
    err.message = e.message;
    next(err);
    
    next(e); // Pass the error to the error handler
  }
};

export const updateProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      const error: ErrorWithStatus = new Error(authErrorMessages.UNAUTHORIZED_ACCESS);
      error.status = ClientErrorStatus.UNAUTHORIZED;
      return next(error);
    }

    const { name, language, mobile, selfDescription } = req.body;
    
    if (!language) {
      const error: ErrorWithStatus = new Error(authErrorMessages.MISSING_REGISTRATION_FIELD);
      error.status = ClientErrorStatus.BAD_REQUEST;
      return next(error);
    }
    
    // make sure updated data is useful
    if (name && name.trim() === '') {
      const error: ErrorWithStatus = new Error(authErrorMessages.MISSING_REGISTRATION_FIELD);
      error.status = ClientErrorStatus.BAD_REQUEST;
      return next(error);
    }
    
    if (mobile && mobile.trim() === '') {
      const error: ErrorWithStatus = new Error(authErrorMessages.MISSING_REGISTRATION_FIELD);
      error.status = ClientErrorStatus.BAD_REQUEST;
      return next(error);
    }
    
    if (selfDescription && selfDescription.trim() === '') {
      const error: ErrorWithStatus = new Error(authErrorMessages.MISSING_REGISTRATION_FIELD);
      error.status = ClientErrorStatus.BAD_REQUEST;
      return next(error);
    }

    const updatedUser = await updateProfile(userId, {
      name,
      language,
      mobile,
      selfDescription
    });

    if (!updatedUser) {
      const error: ErrorWithStatus = new Error(userProfileMessage.UPDATE_PROFILE_NOT_FOUND);
      error.status = ClientErrorStatus.NOT_FOUND;
      return next(error);
    }

    res.status(200).json({
      message: userProfileMessage.UPDATE_PROFILE_SUCCESS,
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        language: updatedUser.language,
        mobile: updatedUser.mobile,
        selfDescription: updatedUser.selfDescription
      }
    });
  } catch (error) {
    next(error);
  }
};

export default { getUsers, registerController, loginController, updateProfileController };
