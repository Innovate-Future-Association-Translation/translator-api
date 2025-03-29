import dotenv from "dotenv";
import { AppErrorMessages, authErrorMessages } from "../utils/errorMessages";
dotenv.config();

// Default configuration values
const DEFAULT_PORT = 8000;
const DEFAULT_API_PREFIX = "/api/v1";
const DEFAULT_DB_CONNECTION = "mongodb://127.0.0.1:27017/mydatabase";
const DEFAULT_SWAGGER_DOC_PATH = "/api-docs";
const DEFAULT_JWT_TOKEN_EXPIRY_IN = "15mins";
const DEFAULT_JWT_SECRET = "translatorapi_default_secret_key_2024";
const DEFAULT_GOOGLE_CALLBACK_URL ="http://localhost:8000/api/v1/users/googleAuth/callback";
const DEFAULT_LOGIN_CALLBACK_URL = "http://localhost:3000/login-callback";

// Define the configuration interface
interface Config {
  port: number;
  api: {
    prefix: string;
  };
  dbConnection: string;
  swaggerDocsPath: string;
  jwtSecret: string;
  jwtTokenExpiry: string;
  googleOauthClient: string;
  googleSecret: string;
  googleRedirectUrl: string;
  sessionSecret:string;
  loginCallBackURL:string;
}

// Check critical configuration
if (!process.env.JWT_SECRET) {
  console.warn(authErrorMessages.JWT_SECRET_NOT_SET);
}

// Create the configuration object
const config: Config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT,
  api: { prefix: DEFAULT_API_PREFIX },
  dbConnection: process.env.DATABASE_URL || DEFAULT_DB_CONNECTION,
  swaggerDocsPath: process.env.SWAGGER_DOC_PATH || DEFAULT_SWAGGER_DOC_PATH,
  jwtSecret: process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
  jwtTokenExpiry: process.env.JWT_EXPIRY || DEFAULT_JWT_TOKEN_EXPIRY_IN,
  googleOauthClient: process.env.GOOGLE_CLIENT_ID || "",
  googleSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleRedirectUrl:
    process.env.GOOGLE_CALLBACK_URL || DEFAULT_GOOGLE_CALLBACK_URL,
  sessionSecret:process.env.SESSION_SECRET||"",
  loginCallBackURL:process.env.LOGIN_CALLBACK||DEFAULT_LOGIN_CALLBACK_URL
};

export default config;
