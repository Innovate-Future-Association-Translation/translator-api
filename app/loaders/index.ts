
import startServer from "./express";
import connectDB from "./mongoose";
import { AppErrorMessages } from "../utils/errorMessages";

const init = async () :Promise<void> => {
  try {
    await connectDB();
    startServer(); 
    console.log(" Server and database initialized successfully.");
  } catch (error) {
    console.error(AppErrorMessages.APP_FAIL_INITIALIZATION, error);
    process.exit(1); 
  }
};

export default init;