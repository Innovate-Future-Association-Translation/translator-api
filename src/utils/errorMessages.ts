export enum ServeErrorMessage {
  INTERNAL_SERVER_ERROR = 'Internal server error. Please try again later.',
  FAIL_FETCHING_USERS = 'Fail fetching user list',
}

export enum DatabaseErrorMessage {
  FAIL_TO_CONNECT_DATABASE = 'App failed to connect to database',
  MISSING_DATABASE_URL = 'DATABASE_URL is not defined in the environment variables.',
}

export enum AppErrorMessages {
  APP_FAIL_INITIALIZATION = 'Failed to initialize app:',
}

export enum authErrorMessages {
  INVALID_CREDENTIALS = 'Invalid email or password.',
  EMAIL_ALREADY_REGISTERED = 'Email is already registered.',
  MISSING_AUTH_TOKEN = 'Authorization token is missing.',
  INVALID_AUTH_TOKEN = 'Authorization token is invalid.',
  UNAUTHORIZED_ACCESS = 'You are not authorized to perform this action.',
  MISSING_REGISTRATION_FIELD = 'Required registration fields are missing.',
  VALIDATION_FAIL = 'fail the authentication format please see the details',
  DUPLICATION_EMAIL = 'this email has been registered',
  UNKNOWN_ERROR = 'registration fail due to unknown reason',
  JWT_SECRET_NOT_SET = 'JWT secret not set, please check JWT_SECRET environment variable',
  JWT_TOKEN_GENERATION_ERROR = 'Error generating login token',
  JWT_CONFIG_ERROR = 'JWT configuration error',
  USERNAME_ALREADY_TAKEN = 'Username already taken',
  USER_NOT_FOUND = 'User not found',
  FETCH_USER_ERROR = 'Failed to retrieve user information',
  INVALID_VERIFICATION_LINK = 'invalid or expired link',
  EXPIRED_VERIFICATION_LINK = 'expired link',
  EMAIL_NOT_VERIFIED = 'the email is not verified',
  SENDING_EMAIL_ERROR = 'error(s) occurs in sending email',
}

export enum meetingErrorMessage {
  FAIL_CREATING_MEETING_ROOM = 'fail to create a meeting room',
  MISSING_CREATOR_ID = 'missing creator id',
  ROOM_NOT_FOUND = 'meeting room not found or invalid',
  CANNOT_SAVE_TRANSCRIPT = 'fail to save meeting transcript',
  MISSING_ROOM_ID = 'Room ID is missing.',
  FAIL_GENERATING_QR_CODE = 'Failed to generate QR code.',
}
