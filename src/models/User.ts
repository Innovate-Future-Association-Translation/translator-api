import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { findByCredential, generateLoginToken } from '../services/user.service';

interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  mobile: string;
  language: string;
  selfDescription: string;
  googleId?: string;
  generateLoginToken(): string;
  activated: boolean;
  stripeCustomerId?: string;
}
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // google id positive return negative
    },
  },
  mobile: { type: String },
  language: { type: String, required: true },
  selfDescription: { type: String },
  googleId: { type: String, default: undefined },
  activated: { type: Boolean, default: false },
  stripeCustomerId: { type: String, unique: true, sparse: true },
});
interface IUserModel extends Model<IUser> {
  findByCredential(email: string, password: string): Promise<IUser | null>;
  updateProfile(
    name: string,
    email: string,
    password: string,
    mobile: string,
    language: string,
    selfDescription: string
  ): Promise<IUser | null>;
  findUserOrCreateAccountForGoogleUser(
    email: string,
    googleId: string,
    name: string
  ): Promise<IUser | null>;
}

UserSchema.methods.generateLoginToken = generateLoginToken;
UserSchema.statics.findByCredential = findByCredential as IUserModel['findByCredential'];

UserSchema.pre<IUser>('save', async function (next) {
  if (this.isModified('password') && !this.googleId) {
    this.password = await bcrypt.hash(this.password as string, 8);
  }
  next();
});

const User = mongoose.model<IUser, IUserModel>('User', UserSchema);

export { User, IUser, IUserModel };
