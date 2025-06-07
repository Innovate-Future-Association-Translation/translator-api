import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import meetingRoomServices from './meetingRoom.service';
import { ArrayBreaker } from '../utils/historyBigArrayBreaker';
dotenv.config();
const key = process.env.AZURE_TRANSLATOR_KEY;
const endpoint = 'https://api.cognitive.microsofttranslator.com';
const location = process.env.AZURE_TRANSLATOR_REGION;
//testing room Id:684454c7d79002dd299c71bd
export const historyRecordsRetranslation = async (roomId: string, to: string) => {
  const meetingRecordFetchResponse =
    await meetingRoomServices.fetchRawSpeechRecordsViaMeetingRoomID(roomId);
  const speechHistoryChunks: string[][] = ArrayBreaker(meetingRecordFetchResponse);

  const reTranslationResult: string[] = [];

  for (let i = 0; i < speechHistoryChunks.length; i++) {
    console.log(i);
    const chunk = speechHistoryChunks[i];

    const response = await axios({
      baseURL: endpoint,
      url: '/translate',
      method: 'post',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Ocp-Apim-Subscription-Region': location,
        'Content-Type': 'application/json',
        'X-ClientTraceId': uuidv4().toString(),
      },
      params: {
        'api-version': '3.0',
        to,
      },
      data: chunk.map((text) => ({ Text: text })),
    });

    reTranslationResult.push(...response.data);
  }
  return reTranslationResult;
};
