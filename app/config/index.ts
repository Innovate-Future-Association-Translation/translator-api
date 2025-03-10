import dotenv from "dotenv";
dotenv.config();

// Default configuration values
const DEFAULT_PORT = 8000;
const DEFAULT_API_PREFIX = "/api/v1";
const DEFAULT_DB_CONNECTION = "mongodb://127.0.0.1:27017/mydatabase";
const DEFAULT_SWAGGER_DOC_PATH = "/api-docs";

// Define the configuration interface
interface Config {
  port: number;
  api: {
    prefix: string;
  };
  dbConnection: string;
  swaggerDocsPath: string;
}

// Create the configuration object
const config: Config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT,
  api: { prefix: DEFAULT_API_PREFIX },
  dbConnection: process.env.DATABASE_URL || DEFAULT_DB_CONNECTION,
  swaggerDocsPath: process.env.SWAGGER_DOC_PATH || DEFAULT_SWAGGER_DOC_PATH,
};

export default config;
