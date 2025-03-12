import express, { Express, Request, Response } from "express";
import router from "../routes/v1/api";
import config from "../config";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "../utils/swagger";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import errorHandler from "../middlewares/ErrorHandler";

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const startServer = () => {
  const app = express();
  app.use(cors());
  //we make morgan as a utils file later on and used it to log the request
  app.use(morgan("combined"));
  app.use(helmet());
  app.use(express.json());
  app.use(config.api.prefix, router);
  app.use(
    config.swaggerDocsPath,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );

  app.use(errorHandler);

  const server = app.listen(config.port, () => {
    console.log("SERVER STARTED:", config.port);
  });

  server.on("error", (err: Error) => {
    console.error("Server error:", err.message);
    process.exit(1);
  });
};

export default startServer;
