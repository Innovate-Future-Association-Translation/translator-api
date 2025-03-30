import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../config';
import { authErrorMessages } from '../utils/errorMessages';
import { IUser, IUserModel, User } from '../models/User';

export const generateLoginToken = function (this: IUser): string {
  if (!config.jwtSecret) {
    throw new Error(authErrorMessages.JWT_SECRET_NOT_SET);
  }

  try {
    if (!this.id) {
      throw new Error(authErrorMessages.USER_NOT_FOUND);
    }

    const secret: jwt.Secret = config.jwtSecret;

    const token = jwt.sign({ id: this.id.toString() }, secret, {
      expiresIn: config.jwtTokenExpiry as jwt.SignOptions['expiresIn'],
    });

    if (!token) {
      throw new Error(authErrorMessages.JWT_TOKEN_GENERATION_ERROR);
    }
    return token;
  } catch (error) {
    console.error(authErrorMessages.JWT_TOKEN_GENERATION_ERROR, error);
    throw new Error(authErrorMessages.JWT_TOKEN_GENERATION_ERROR);
  }
};

export async function findByCredential(
  this: IUserModel,
  email: string,
  password: string
): Promise<IUser | null> {
  const user = await this.findOne({ email });
  if (!user) {
    throw new Error(authErrorMessages.INVALID_CREDENTIALS);
  }
  const isCorrectPassword = await bcrypt.compare(password, user.password as string);
  if (!isCorrectPassword) {
    throw new Error(authErrorMessages.INVALID_CREDENTIALS);
  }
  return user;
}

//google oAuth register service
export async function findUserOrCreateAccountForGoogleUser(
  email: string,
  googleId: string,
  name: string
): Promise<IUser | null> {
  const user = await User.findOne({ email });
  if (!user) {
    const newUser = new User({
      name: name,
      googleId: googleId,
      email: email,
      language: 'en',
      selfDescription: '',
      activated: true,
    });
    await newUser.save();
    return newUser;
  } else if (user && user.googleId === googleId) {
    return user;
  }

  return null;
}

export const updateProfile = async (
  userID: string,
  updateData: {
    name?: string;
    language?: string;
    mobile?: string;
    selfDescription?: string;
  }
): Promise<IUser | null> => {
  try {
    if (updateData.language !== undefined && updateData.language === '') {
      throw new Error(authErrorMessages.MISSING_REGISTRATION_FIELD);
    }

    if (updateData.name) {
      const existingUser = await User.findOne({
        name: updateData.name,
        _id: { $ne: userID },
      });
      if (existingUser) {
        throw new Error(authErrorMessages.USERNAME_ALREADY_TAKEN);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userID, updateData, {
      new: true,
    });

    if (!updatedUser) {
      throw new Error(authErrorMessages.USER_NOT_FOUND);
    }

    return updatedUser;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};
