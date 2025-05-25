import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const key = process.env.AZURE_TRANSLATOR_KEY;
const endpoint = 'https://api.cognitive.microsofttranslator.com';
const location = process.env.AZURE_TRANSLATOR_REGION;

export async function detectLanguage(text: string): Promise<string> {
  try {
    const response = await axios.post(`${endpoint}/detect?api-version=3.0`, [{ Text: text }], {
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Ocp-Apim-Subscription-Region': location,
        'Content-Type': 'application/json',
        'X-ClientTraceId': uuidv4(),
      },
    });
    return response.data[0]?.language || 'en';
  } catch (error) {
    console.error('Language detection failed:', error);
    return 'en';
  }
}
