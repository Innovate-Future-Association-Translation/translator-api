import { User, IUser, IUserModel } from "../models/User";
import { authErrorMessages } from "../utils/errorMessages";
import { ErrorWithStatus } from "../middlewares/ErrorHandler";

const register = async (userData: IUser): Promise<void> => {
  try {
    const newUser = new User(userData);
    await newUser.save();
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

    const token: string = user.generateLoginToken();
    return token;
  
};

const authServices = { register, login };

export default authServices;
