import { User } from '../models/User';
import { IMeetingRoom, MeetingRoom } from '../models/MeetingRoom';
import mongoose from 'mongoose';
import { ErrorWithStatus } from '../middlewares/ErrorHandler';
import { MeetingErrorStatus } from '../utils/errorStatusCode';
import { meetingErrorMessage } from '../utils/errorMessages';
import { SpeechTranscript } from '../models/MeetingRecords';

const createMeetingRoom = async (
  creatorId: mongoose.Types.ObjectId,
  roomName?: string
): Promise<IMeetingRoom | undefined> => {
  const newMeetingRoom = new MeetingRoom({
    roomName,
    creator: creatorId,
    participant: [creatorId],
  });

  await newMeetingRoom.save();
  return newMeetingRoom;
};

//this is only used for IT-38, if we have socket.io in later ticket to emit participant info, we don't need this
const getParticipantInfo = async (roomId: string): Promise<{ name: string }[] | undefined> => {
  const meetingRoom = await MeetingRoom.findById(roomId).exec();
  if (!meetingRoom) {
    const err: ErrorWithStatus = new Error(meetingErrorMessage.ROOM_NOT_FOUND) as ErrorWithStatus;
    err.status = MeetingErrorStatus.ROOM_NOT_FOUND;
    throw err;
  }
  const participantIds = meetingRoom.participant;
  const participants = await User.find({ _id: { $in: participantIds } }, 'name').exec();
  return participants.map((participant) => ({
    name: participant.name,
  }));
};

const saveInstantMeetingTranscript = async (
  meetingId: string,
  speakerName: string,
  speakerId: string,
  rawSpeechText: string
): Promise<void> => {
  const transcript = new SpeechTranscript({
    meetingId,
    speakerName,
    speakerId,
    rawSpeechText: rawSpeechText,
  });

  await transcript.save();
};

const getMeetingCreatorId = async (roomId: string): Promise<{ id: string } | undefined> => {
  const meetingRoom = await MeetingRoom.findById(roomId).exec();
  if (!meetingRoom) {
    const err: ErrorWithStatus = new Error(meetingErrorMessage.ROOM_NOT_FOUND) as ErrorWithStatus;
    err.status = MeetingErrorStatus.ROOM_NOT_FOUND;
    throw err;
  }

  return { id: meetingRoom.creator.toString() };
};

const addParticipantToDataBase = async (
  meetingId: string,
  participantId: string
): Promise<void> => {
  await MeetingRoom.findByIdAndUpdate(
    meetingId,
    {
      $addToSet: {
        participant: new mongoose.Types.ObjectId(participantId),
      },
    },
    { new: true }
  );
};

const meetingRoomServices = {
  createMeetingRoom,
  getParticipantInfo,
  saveInstantMeetingTranscript,
  getMeetingCreatorId,
  addParticipantToDataBase,
};

export default meetingRoomServices;
