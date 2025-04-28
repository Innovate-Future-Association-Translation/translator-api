import dotenv from 'dotenv';
import { authErrorMessages } from '../utils/errorMessages';
import jwt from 'jsonwebtoken';
dotenv.config();

// Default configuration values
const DEFAULT_PORT = 8000;
const DEFAULT_API_PREFIX = '/api/v1';
const DEFAULT_DB_CONNECTION = 'mongodb://127.0.0.1:27017/mydatabase';
const DEFAULT_SWAGGER_DOC_PATH = '/api-docs';
const DEFAULT_JWT_TOKEN_EXPIRY_IN = '15m';
const DEFAULT_JWT_SECRET = 'translatorapi_default_secret_key_2024';
const DEFAULT_GOOGLE_CALLBACK_URL = 'http://localhost:8000/api/v1/users/googleAuth/callback';
const DEFAULT_EMAIL_ADDRESS = 'ifatranslator@gmail.com';
const DEFAULT_EMAIL_REDIRECT_URL = 'http://localhost:8000';
const EMAIL_EXPIRY_TIME = 24 * 60 * 60 * 1000;
const EMAIL_TOKEN_RANDOM_BYTE = 32;
const ENCODING_METHOD = 'hex';
const DEFAULT_MEETING_REDIRECT_URL = 'http://localhost:3000/dashboard/instant-meeting-room';

interface Config {
  port: number;
  api: {
    prefix: string;
  };
  dbConnection: string;
  swaggerDocsPath: string;
  jwtSecret: string;
  jwtTokenExpiry: jwt.SignOptions['expiresIn'];
  googleOauthClient: string;
  googleSecret: string;
  googleRedirectUrl: string;
  sessionSecret: string;
  loginCallBackURL: string;
  emailUser: string;
  emailPasskey: string;
  emailRedirectURL: string;
  emailExpiryTime: number;
  emailTokenByte: number;
  encodingMethod: BufferEncoding;
  instantMeetingRedirectURL: string;
}

if (!process.env.JWT_SECRET) {
  console.warn(authErrorMessages.JWT_SECRET_NOT_SET);
}

const config: Config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT,
  api: { prefix: DEFAULT_API_PREFIX },
  dbConnection: process.env.DATABASE_URL || DEFAULT_DB_CONNECTION,
  swaggerDocsPath: process.env.SWAGGER_DOC_PATH || DEFAULT_SWAGGER_DOC_PATH,
  jwtSecret: process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
  jwtTokenExpiry: DEFAULT_JWT_TOKEN_EXPIRY_IN as jwt.SignOptions['expiresIn'],
  googleOauthClient: process.env.GOOGLE_CLIENT_ID || '',
  googleSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleRedirectUrl: process.env.GOOGLE_CALLBACK_URL || DEFAULT_GOOGLE_CALLBACK_URL,
  sessionSecret: process.env.SESSION_SECRET || '',
  loginCallBackURL:
    process.env.NODE_ENV === 'dev'
      ? `${process.env.APP_DEV_URL}/login-callback`
      : `${process.env.APP_URL}/login-callback`,
  emailUser: process.env.EMAIL_USER || DEFAULT_EMAIL_ADDRESS,
  emailPasskey: process.env.EMAIL_PASSKEY as string,
  emailRedirectURL: process.env.EMAIL_REDIRECT_URL || DEFAULT_EMAIL_REDIRECT_URL,
  emailExpiryTime: EMAIL_EXPIRY_TIME,
  emailTokenByte: EMAIL_TOKEN_RANDOM_BYTE,
  encodingMethod: ENCODING_METHOD || 'hex',
  instantMeetingRedirectURL:
    process.env.INSTANT_MEETING_REDIRECT_URL || DEFAULT_MEETING_REDIRECT_URL,
};

export default config;
