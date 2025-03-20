export enum ServeErrorMessagge {
    INTERNAL_SERVER_ERROR = "Internal server error. Please try again later.",
    FAIL_FETCHING_USERS = "Fail fetching user list"
  }
  
  export enum DatabaseErrorMessage {
    FAIL_TO_CONNECT_DATABASE = "App failed to connect to database",
    MISSING_DATABASE_URL= "DATABASE_URL is not defined in the environment variables."
  }

    
  export enum AppErrorMessages {
    APP_FAIL_INITIALIZATION = "Failed to initialize app:"
  }

export enum authErrorMessages{
  INVALID_CREDENTIALS = "Invalid email or password.",
  EMAIL_ALREADY_REGISTERED = "Email is already registered.",
  MISSING_AUTH_TOKEN = "Authorization token is missing.",
  INVALID_AUTH_TOKEN = "Authorization token is invalid.",
  UNAUTHORIZED_ACCESS = "You are not authorized to perform this action.",
  MISSING_REGISTRATION_FIELD =  "Required registration fields are missing.",
  VALIDATION_FAIL = "fail the authtication format please see the details" ,
  DUPLICATION_EMAIL =  "this email has been registered",
  UNKNOWN_ERROR = "registration fail due to unknown reason",
  JWT_SECRET_NOT_SET = "JWT secret not set, please check JWT_SECRET environment variable",
  JWT_TOKEN_GENERATION_ERROR = "Error generating login token",
  JWT_CONFIG_ERROR = "JWT configuration error",
  USERNAME_ALREADY_TAKEN = "Username already taken",
  USER_NOT_FOUND = "User not found"
}