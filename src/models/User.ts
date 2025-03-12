import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import { findByCredential, generateLoginToken } from "../services/user/user.service"

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  mobile: string;
  language: string;
  selfDescription: string;
  generateLoginToken(): string;
}
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String },
  language: { type: String, required: true },
  selfDescription: { type: String },
});
interface IUserModel extends Model<IUser> {
  findByCredential(email: string, password: string): Promise<IUser | null>;
}

UserSchema.methods.generateLoginToken = generateLoginToken;
UserSchema.statics.findByCredential =findByCredential as IUserModel["findByCredential"];


UserSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const User = mongoose.model<IUser, IUserModel>("User", UserSchema);

export { User, IUser, IUserModel };
