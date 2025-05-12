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
DATABASE_URL=<replace this url by valid mogodb url>
API_PREFIX=/api/v1
SWAGGER_DOC_PATH=/api-docs
JWT_SECRET=aQuickBrownFoxJumpAwayALazyDog


##### Execute Your Project
- npm install
- npm run dev
  -- if there is package have not been installed in the project, follow terminal to complete the installation
- if you see Server and database initialized successfully the server was started.



###### Swagger API DOC URL
-Once you launch your project successfully, you are about the read and execute this swagger api document
 [Swagger API Docs](http://localhost:8000/api-docs)
```
