import mongoose, { Schema, Document, Model } from 'mongoose';

interface ISpeechTranscript extends Document {
  meetingId: mongoose.Types.ObjectId;
  speakerName: string;
  speakerId: string;
  rawSpeechText: string;
}

const speechTranscriptSchema = new Schema<ISpeechTranscript>(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: 'MeetingRoom', required: true },
    speakerName: { type: String, required: true },
    speakerId: { type: String, required: true },
    rawSpeechText: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const SpeechTranscript: Model<ISpeechTranscript> = mongoose.model<ISpeechTranscript>(
  'SpeechTranscript',
  speechTranscriptSchema
);

export { SpeechTranscript, ISpeechTranscript };
