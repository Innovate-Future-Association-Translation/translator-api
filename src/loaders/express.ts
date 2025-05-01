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
import { authErrorMessages } from "../utils/errorMessages";
import passport from "../middlewares/thirdPartyAuth/passport";
import session from "express-session";

const swaggerSpec = swaggerJSDoc(swaggerOptions);
const allowedOrigins = ['http://localhost:3000', 'http://192.168.0.108:3001'];

const startServer = () => {
  const app = express();

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        console.error(`CORS Error: Origin ${origin} not allowed.`); 
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }));

  app.use(morgan("combined"));
  app.use(helmet());  
  app.use(express.json());

  app.use(
    session({
      secret: config.sessionSecret,
      resave: true,
      saveUninitialized: true,
      cookie: {
        secure: false, 
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, 
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(config.api.prefix, router);

  app.use(
    config.swaggerDocsPath,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );

 
  app.use(errorHandler);

 
  if (!config.jwtSecret) {
    console.warn(authErrorMessages.JWT_CONFIG_ERROR);
  }

  // Start the server
  const server = app.listen(config.port, () => {
    console.log("SERVER STARTED:", config.port);
  });

  // Handle server errors
  server.on("error", (err: Error) => {
    console.error("Server error:", err.message);
    process.exit(1);
  });
};

export default startServer;