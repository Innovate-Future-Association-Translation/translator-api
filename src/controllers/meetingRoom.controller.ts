import { NextFunction, Request, Response } from 'express';
import qrcode from 'qrcode';
import { ErrorWithStatus } from '../middlewares/ErrorHandler';
import config from '../config';
import meetingRoomServices from '../services/meetingRoom.service';
import { meetingErrorMessage } from '../utils/errorMessages';
import { meetingRoomSuccessMessage } from '../utils/successMessage';
import { MeetingErrorStatus } from '../utils/errorStatusCode';
import { historyRecordsRetranslation } from '../services/histroy-records-retranslation-service';

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

export const getMeetingCreator = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roomId } = req.body;
    const creator = await meetingRoomServices.getMeetingCreatorId(roomId);

    res.status(200).json({
      message: meetingRoomSuccessMessage.FETCH_Creator_SUCCESSFULLY,
      creator, //{id:string}
    });
  } catch (error) {
    const err: ErrorWithStatus = new Error();
    err.status = MeetingErrorStatus.BAD_REQUEST;
    err.message = (error as Error).message;
    next(err);
  }
};

export const generateMeetingQRCodeController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      const err: ErrorWithStatus = new Error(
        meetingErrorMessage.MISSING_ROOM_ID
      ) as ErrorWithStatus;
      err.status = MeetingErrorStatus.BAD_REQUEST;
      throw err;
    }

    const meetingLink = `${config.instantMeetingRedirectURL}/${roomId}`;
    const qrCodeDataURL = await qrcode.toDataURL(meetingLink);

    res.status(200).json({
      message: meetingRoomSuccessMessage.QR_CODE_GENERATED_SUCCESSFULLY,
      qrCode: qrCodeDataURL,
      meetingLink: meetingLink,
    });
  } catch (error) {
    const err: ErrorWithStatus = new Error();
    err.status = MeetingErrorStatus.INTERNAL_SERVER_ERROR;
    err.message = (error as Error).message || meetingErrorMessage.FAIL_GENERATING_QR_CODE;
    next(err);
  }
};

export const getMeetingRecordsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roomId } = req.body;
    const meetingRecordArray =
      await meetingRoomServices.fetchRawSpeechRecordsViaMeetingRoomID(roomId);

    res.status(200).json({
      message: meetingRoomSuccessMessage.FETCH_Creator_SUCCESSFULLY,
      meetingRecordArray,
    });
  } catch (error) {
    const err: ErrorWithStatus = new Error();
    err.status = MeetingErrorStatus.INTERNAL_SERVER_ERROR;
    err.message = (error as Error).message;
    next(err);
  }
};

export const reTranslateAllHistoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roomId, to } = req.body;
    const newTranslationResponse = await historyRecordsRetranslation(roomId, to);
    res.status(200).json({
      newTranslationForHistoryTranscript: newTranslationResponse,
    });
  } catch (error) {
    const err: ErrorWithStatus = new Error();
    err.status = MeetingErrorStatus.INTERNAL_SERVER_ERROR;
    err.message = (error as Error).message;
    next(err);
  }
};

const meetingRoomController = {
  createNewRoomController,
  getParticipants,
  generateMeetingQRCodeController,
  getMeetingCreator,
  getMeetingRecordsController,
  reTranslateAllHistoryController,
};
export default meetingRoomController;
