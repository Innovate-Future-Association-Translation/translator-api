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

// ✅ Prometheus 相关
import { metricsMiddleware } from '../middlewares/metrics';
import { register } from '../utils/metrics';

const swaggerSpec = swaggerJSDoc(swaggerOptions);
const allowedOrigins = '*';

const startServer = () => {
  const app = express();

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
          const msg =
            'The CORS policy for this site does not allow access from the specified Origin.';
          console.error(`CORS Error: Origin ${origin} not allowed.`);
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
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

  // ✅ Prometheus 请求统计中间件
  app.use(metricsMiddleware);

  app.use(config.api.prefix, router);

  // ✅ Prometheus /metrics 路由
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  app.use(config.swaggerDocsPath, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use(errorHandler);

  if (!config.jwtSecret) {
    console.warn(authErrorMessages.JWT_CONFIG_ERROR);
  }

  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`SERVER STARTED on http://0.0.0.0:${config.port}`);
  });

  server.on('error', (err: Error) => {
    console.error('Server error:', err.message);
    process.exit(1);
  });
};

export default startServer;
