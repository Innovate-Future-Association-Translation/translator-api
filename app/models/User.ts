import mongoose, { Schema, Document } from "mongoose";

// Define the User interface (including instance and static methods)
interface IUser extends Document {
  name: string;
  email: string;
  language: string;
}

// Define the User schema
const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  language: { type: String, required: true },
});

// Create and export the User model
const User = mongoose.model<IUser>("User", UserSchema);

export { User, IUser };
