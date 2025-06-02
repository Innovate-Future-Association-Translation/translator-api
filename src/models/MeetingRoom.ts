import mongoose, { Schema, Document, Model } from 'mongoose';

interface IMeetingRoom extends Document {
  roomName?: string;
  creator: mongoose.Types.ObjectId;
  participant: mongoose.Types.ObjectId[];
}

const MeetingRoomSchema = new Schema<IMeetingRoom>(
  {
    roomName: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participant: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

const MeetingRoom: Model<IMeetingRoom> = mongoose.model('MeetingRoom', MeetingRoomSchema);
export { MeetingRoom, IMeetingRoom };
