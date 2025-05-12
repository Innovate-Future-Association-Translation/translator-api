import config from '../config';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IFA Translator API',
      version: '1.0.0',
      description: 'API documentation for the IFA Translator project',
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.api.prefix}`,
      },
    ],
  },
  apis: ['./src/routes/v1/api.ts'],
};

export default swaggerOptions;
