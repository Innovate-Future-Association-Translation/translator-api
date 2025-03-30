import { User, IUser } from "../models/User";
import VerificationToken from "../models/VerificationToken";
import { NextFunction, Request, Response } from "express";
import { ErrorWithStatus } from "../middlewares/ErrorHandler";
import { ClientErrorStatus } from "../utils/errorStatusCode";

import { authErrorMessages, ServeErrorMessage } from "../utils/errorMessages";
import crypto from "crypto";
import { sendVerificationEmail } from "../services/email.service";
import authServices from "../services/auth.service";
import { updateProfile } from "../services/user.service";
import { authSuccessMessage } from "../utils/successMessage";
import { userProfileMessage } from "../utils/userProfileMessage";

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
  } catch (e: any) {
    const err: ErrorWithStatus = new Error();
    err.status = ClientErrorStatus.UNAUTHORIZED;
    err.message = e.message;
    next(err);

    next(e); // Pass the error to the error handler
  }
};



export const getUserProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  
  try {
    if (!req.user || !req.user.id) {
      const error: ErrorWithStatus = new Error(authErrorMessages.UNAUTHORIZED_ACCESS);
      error.status = ClientErrorStatus.UNAUTHORIZED;
      return next(error);
    }
    const user = await User.findById(req.user.id);

    if (!user) {
      const error: ErrorWithStatus = new Error(authErrorMessages.UNAUTHORIZED_ACCESS);
      error.status = ClientErrorStatus.UNAUTHORIZED;
      return next(error);
    }
    res.status(200).json({
      name: user.name,
      email: user.email,
      mobile:user.mobile,
      language:user.language,
      selfDescription:user.selfDescription
      
    });
  } catch (error) {
    const err: ErrorWithStatus = new Error(authErrorMessages.FETCH_USER_ERROR);
    err.status = ClientErrorStatus.NOT_FOUND;
    next(err);
  }


}


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

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.query;
    const verification = await VerificationToken.findOne({ token });

    if (!verification) {
      res
        .status(400)
        .json({ message: authErrorMessages.INVALID_VERIFICATION_LINK });
      return;
    }

    if (new Date() > verification.expiresAt) {
      res
        .status(400)
        .json({ message: authErrorMessages.EXPIRED_VERIFICATION_LINK });
    }

    await User.findByIdAndUpdate(verification.userId, { activated: true });
    await VerificationToken.deleteOne({ token });

    res
      .status(200)
      .json({ message: authSuccessMessage.EMAIL_VERIFY_SUCCESSFULLY });
  } catch (error: any) {
    const err: ErrorWithStatus = new Error();
    err.status = ClientErrorStatus.BAD_REQUEST;
    err.message = (error as Error).message;
    next(error);
  }
};

export const resendVerificationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: authErrorMessages.INVALID_CREDENTIALS });
      return;
    }

    if (user.activated)
      res
        .status(400)
        .json({ message: authErrorMessages.EMAIL_ALREADY_REGISTERED });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await VerificationToken.findOneAndUpdate(
      { userId: user._id },
      { token, expiresAt },
      { upsert: true }
    );

    await sendVerificationEmail(email, token, user.name);

    res
      .status(200)
      .json({ message: authSuccessMessage.EMAIL_RESEND_SUCCESSFULLY });
  } catch (error: any) {
    res.status(500).json({
      message: ServeErrorMessage.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};



export default { getUsers, registerController, loginController, updateProfileController };

