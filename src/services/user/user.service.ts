import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../../config";
import { authErrorMessages } from "../../utils/errorMessages";
import { IUser, IUserModel , User} from "../../models/User"



export const generateLoginToken = function (this: IUser): string | null {
  try {
    return jwt.sign({ id: this.id.toString() }, config.jwtSecret, { expiresIn: "20mins" });
  } catch (error) {
    console.error("Error generating login token:", error);
    return null;
  }
};


export async function findByCredential(this: IUserModel,email:string, password: string) :Promise<IUser | null>  {
  const user = await this.findOne({ email });
  if (!user) {
    throw new Error(authErrorMessages.INVALID_CREDENTIALS);
  }
  const isCorrectPassword = await bcrypt.compare(password, user.password);
  if (!isCorrectPassword) {
    throw new Error(authErrorMessages.INVALID_CREDENTIALS);
  }
  return user;
};
