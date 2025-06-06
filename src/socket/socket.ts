import { Server, Socket } from 'socket.io';
import { detectLanguage } from '../services/languageDetect.service';
import { languageTranslate } from '../services/languageTranslate.service';
import meetingRoomServices from '../services/meetingRoom.service';
import { meetingErrorMessage } from '../utils/errorMessages';

interface userStatus {
  userName: string;
  userId: string;
  speaking: boolean;
  isRaiseHand: boolean;
  isRecognizing?: boolean;
  recognizingText?: string | null;
}

/*
IT-42
used to check if the user already exist in the meeting room , if the user has exist in the front end status list
prevent he/she to join again, this used to prevent frontend join room multiples time for the same user. 
*/
const roomUsersMap = new Map<string, Set<string>>();

/* 
IT-39 Urgent will be applied if other teams mates delay the project used to update the room's user status continuously, if the other user join
room in the middle of the meeting, broadcast the current room's user state
*/
const roomStatusMap = new Map<string, userStatus[]>();
export const socketHandler = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join-room', async ({ roomId, userInitialStatusData }) => {
      const userId = userInitialStatusData.userId;

      if (!roomUsersMap.has(roomId)) {
        roomUsersMap.set(roomId, new Set());
      }
      const roomUsers = roomUsersMap.get(roomId)!;

      if (roomUsers.has(userId)) {
        console.log(`User ${userId} already in room ${roomId}, ignoring duplicate join.`);
        return;
      }
      roomUsers.add(userId);
      await meetingRoomServices.addParticipantToDataBase(roomId, userId);
      socket.join(roomId);
      console.log(`${userInitialStatusData.userName} joined room ${roomId}`);

      /*IT-39 if there is no room id in the room status map(it means there is new meeting room)
      create new status list in the status map
      */
      if (!roomStatusMap.has(roomId)) {
        roomStatusMap.set(roomId, []);
      }
      /*IT-39 found the status via the roomId and push this new user initial state in the status list
       */
      const currentRoomStatus = roomStatusMap.get(roomId)!;
      currentRoomStatus.push(userInitialStatusData);

      /*used to broadcast the user initial state to the frontend and the current roomstatus Map to the front end*/
      io.to(roomId).emit('broadcast-user-join-initial-status', userInitialStatusData);
      console.log(`current room with room id:${roomId} status`, roomStatusMap.get(roomId));
      io.to(roomId).emit('broadcast-current-room-status', roomStatusMap.get(roomId));
      socket.emit('sync-room-status-list', currentRoomStatus);
      io.to(roomId).emit('sync-room-participants-number', roomUsersMap.get(roomId)?.size);
    });

    socket.on('speech-text', async ({ roomId, text, user }) => {
      io.to(roomId).emit('broadcast-text', {
        text,
        user,
        roomId,
        timestamp: new Date().toISOString(),
      });
      meetingRoomServices
        .saveInstantMeetingTranscript(roomId, user.name, user.speakingUserId || user._id, text)
        .catch((err) => {
          console.error(meetingErrorMessage.CANNOT_SAVE_TRANSCRIPT, err);
        });
    });

    socket.on('synchronous-current-user-and-user-status-list', ({ roomId }) => {
      const roomStatusList = roomStatusMap.get(roomId);
      if (roomStatusList) {
        socket.emit('sync-room-status-list', roomStatusList);
      }
    });

    socket.on('update-user-status', (data) => {
      console.log('broadcast update users status:', data);
      io.to(data.roomId).emit('broadcast-user-status', data);
    });

    //here need to apply leave room method
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });

    // used to receive the raw speech text and do personalized translation
    socket.on('request-translate-for-me', async ({ text, myPreferLanguage }) => {
      console.log('text before implement personal-translation', text);
      console.log('user personalize language', myPreferLanguage);
      const detectedLanguage = await detectLanguage(text);
      console.log(detectedLanguage);
      const translatedLanguageData = await languageTranslate(
        text,
        detectedLanguage,
        myPreferLanguage
      );
      const [{ translations }] = translatedLanguageData;
      console.log('personalize translated language:', translations[0].text);
      socket.emit('personal-translation-result', {
        translatedText: translations[0].text,
      });
    });
  });
};
