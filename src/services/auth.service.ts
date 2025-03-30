import { User, IUser, IUserModel } from "../models/User";
import { authErrorMessages } from "../utils/errorMessages";
import { ErrorWithStatus } from "../middlewares/ErrorHandler";
import VerificationToken from "../models/VerificationToken";
import crypto from "crypto";
import { sendVerificationEmail } from "./email.service";

const register = async (userData: IUser): Promise<void> => {
  const email = userData.email;
  try {
    const newUser = new User(userData);
    await newUser.save();
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await VerificationToken.create({ userId: newUser._id, token, expiresAt });
    console.log("ver token created already");
    await sendVerificationEmail(email, token); //*
    console.log("email send already");
  } catch (err: any) {
    if (err.code === 11000) {
      const conflictError: ErrorWithStatus = new Error(
        authErrorMessages.DUPLICATION_EMAIL
      );
      conflictError.status = 409;
      throw conflictError; 
    }
    throw new Error(authErrorMessages.UNKNOWN_ERROR);
  }
};

const login = async (email: string, password: string): Promise<string> => {
    const user = await User.findByCredential(email, password);
    if (!user) {
      throw new Error(authErrorMessages.INVALID_CREDENTIALS);
    }

  if (!user.activated) {
    throw new Error(authErrorMessages.EMAIL_NOT_VERIFIED);
  }

  const token: string = user.generateLoginToken();
  return token;
};

const authServices = { register, login };

export default authServices;
