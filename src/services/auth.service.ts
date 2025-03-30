import { User, IUser } from '../models/User';
import { authErrorMessages } from '../utils/errorMessages';
import { ErrorWithStatus } from '../middlewares/ErrorHandler';
import VerificationToken from '../models/VerificationToken';
import { ClientErrorStatus } from '../utils/errorStatusCode';
import crypto from 'crypto';
import { sendVerificationEmail } from './email.service';
import config from '../config';

const register = async (userData: IUser): Promise<void> => {
  const email = userData.email;
  const userName = userData.name;
  try {
    const newUser = new User(userData);
    await newUser.save();
    const token = crypto
      .randomBytes(config.emailTokenByte)
      .toString(config.encodingMethod as BufferEncoding);
    const expiresAt = new Date(Date.now() + config.emailExpiryTime);
    await VerificationToken.create({ userId: newUser._id, token, expiresAt });
    await sendVerificationEmail(email, token, userName);
  } catch (err: any) {
    if (err.code === ClientErrorStatus.DUPLICATION_EMAIL) {
      const conflictError: ErrorWithStatus = new Error(authErrorMessages.DUPLICATION_EMAIL);
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
