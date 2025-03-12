import mongoose, { Connection } from "mongoose";
import config from "../config";
import { ServerErrorStatus } from "../utils/errorStatusCode";
import { DatabaseErrorMessage } from "../utils/errorMessages";
const connectDB = async (): Promise<Connection> => {
  const dbUrl = config.dbConnection;

  if (!dbUrl) {
    throw new Error(DatabaseErrorMessage.MISSING_DATABASE_URL);
  }

  try {
    const connection = await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log(`Database connected to ${dbUrl}`);
    return connection.connection;
  } catch (error) {
    throw new Error(DatabaseErrorMessage.FAIL_TO_CONNECT_DATABASE);
  }
};

export default connectDB;
