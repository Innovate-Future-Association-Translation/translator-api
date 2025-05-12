import express from 'express';
import router from '../routes/v1/api';
import config from '../config';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from '../utils/swagger';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import errorHandler from '../middlewares/ErrorHandler';
import { authErrorMessages } from '../utils/errorMessages';
import passport from '../middlewares/thirdPartyAuth/passport';
import session from 'express-session';

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const startServer = () => {
  const app = express();
  const allowedOrigins = [
    process.env.APP_URL,
    process.env.APP_DEV_URL,
  ].filter((origin): origin is string => typeof origin === "string");

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );

  app.use(morgan('combined'));
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

  app.use(config.swaggerDocsPath, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use(errorHandler);

  if (!config.jwtSecret) {
    console.warn(authErrorMessages.JWT_CONFIG_ERROR);
  }

  // Start the server
  const server = app.listen(config.port, () => {
    console.log('SERVER STARTED:', config.port);
  });

  // Handle server errors
  server.on('error', (err: Error) => {
    console.error('Server error:', err.message);
    process.exit(1);
  });
};

export default startServer;
