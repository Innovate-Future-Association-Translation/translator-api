import { NextFunction, Request, Response } from 'express';
import { ErrorWithStatus } from '../middlewares/ErrorHandler';
import config from '../config';
import meetingRoomServices from '../services/meetingRoom.service';
import { meetingErrorMessage } from '../utils/errorMessages';
import { meetingRoomSuccessMessage } from '../utils/successMessage';
import { MeetingErrorStatus } from '../utils/errorStatusCode';

export const createNewRoomController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { creatorId, roomName } = req.body;

    if (!creatorId) {
      throw new Error(meetingErrorMessage.MISSING_CREATOR_ID);
    }

    const newRoom = await meetingRoomServices.createMeetingRoom(creatorId, roomName);
    if (!newRoom || !newRoom._id) {
      throw new Error(meetingErrorMessage.FAIL_CREATING_MEETING_ROOM);
    }

    const { _id } = newRoom;

    res.status(200).json({
      message: meetingRoomSuccessMessage.CREATE_MEETING_ROOM_SUCCESSFULLY,
      redirectMeetingRoomUrl: `${config.instantMeetingRedirectURL}/${_id}`,
      participant: newRoom.participant,
      roomId: newRoom._id,
    });
  } catch (error) {
    const err: ErrorWithStatus = new Error();
    err.status = MeetingErrorStatus.BAD_REQUEST;
    err.message = (error as Error).message;
    next(err);
  }
};

export const getParticipants = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roomId } = req.body;
    const participants = await meetingRoomServices.getParticipantInfo(roomId);
    res.status(200).json({
      message: meetingRoomSuccessMessage.FETCH_PARTICIPANT_SUCCESSFULLY,
      participants: participants,
    });
  } catch (error) {
    const err: ErrorWithStatus = new Error();
    err.status = MeetingErrorStatus.BAD_REQUEST;
    err.message = (error as Error).message;
    next(err);
  }
};

const meetingRoomController = { createNewRoomController, getParticipants };
export default meetingRoomController;
