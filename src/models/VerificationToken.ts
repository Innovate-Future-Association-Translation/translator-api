import { Schema, model, Document } from 'mongoose';

interface IVerificationToken extends Document {
  userId: string;
  token: string;
  expiresAt: Date;
}

const VerificationTokenSchema = new Schema<IVerificationToken>({
  userId: { type: String, ref: 'User', required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

export default model<IVerificationToken>('VerificationToken', VerificationTokenSchema);
