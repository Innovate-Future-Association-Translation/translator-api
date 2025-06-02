import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();
const key = process.env.AZURE_TRANSLATOR_KEY;
const endpoint = 'https://api.cognitive.microsofttranslator.com';
const location = process.env.AZURE_TRANSLATOR_REGION;

export const languageTranslate = async (text: string, from: string, to: string) => {
  try {
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
        from,
        to,
      },
      data: [{ text }],
    });
    return response.data;
  } catch (e) {
    console.log(e);
  }
};
