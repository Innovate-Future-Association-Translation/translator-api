# IFA Translator API

## Description
**IFA Translator API** is an AI-powered translation service built with Node.js, Express, and MongoDB. This RESTful API is designed to provide translation functionalities and manage user data. The API is documented using Swagger to provide interactive, detailed documentation for developers and stakeholders.

### tech stacks
nodeJs v20.10.0
MongoDB
ExpressJS

#### Environment Setup

Before running the application, ensure you have the following installed:
- [Node.js](recommended version: 20.10.0)
- [MongoDB] (either local or cloud-based)

Create a `.env` file in the project root (do not commit this file to version control) with the following variables:

```env
PORT=8000
DATABASE_URL=mongodb://127.0.0.1:27017/ifa-database
API_PREFIX=/api/v1
SWAGGER_DOC_PATH=/api-docs
JWT_SECRET=aQuickBrownFoxJumpAwayALazyDog