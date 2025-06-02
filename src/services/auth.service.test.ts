process.env.JWT_SECRET = 'testSecret';
import config from '../config';
config.jwtSecret = process.env.JWT_SECRET;

jest.mock('../services/email.service', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../models/VerificationToken', () => ({
  __esModule: true,
  default: {
    create: jest.fn().mockResolvedValue(undefined),
  },
}));

import authServices from '../services/auth.service';
import { User, IUser } from '../models/User';
import bcrypt from 'bcrypt';
import { authErrorMessages } from '../utils/errorMessages';

class TestError extends Error {
  status?: number;
  details?: string[];
}

interface MockUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  language: string;
  mobile: string;
  selfDescription: string;
  activated: boolean;
  save: jest.Mock;
  generateLoginToken: jest.Mock;
  findByCredential?: jest.Mock;
}

jest.mock('../models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Service Unit Tests', () => {
  const mockUserData: MockUser = {
    _id: '1234567890abcdef12345678',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    language: 'en',
    mobile: '+61412345678',
    selfDescription: 'I am a test user',
    activated: true,
    save: jest.fn(),
    generateLoginToken: jest.fn(),
  };

  const mockCredentials = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserData.save.mockReset();
    mockUserData.generateLoginToken.mockReset();
  });

  describe('register() - User Registration', () => {
    it('should successfully register a new user', async () => {
      mockUserData.save.mockResolvedValue(mockUserData);

      (User as jest.Mocked<any>).mockImplementation(() => mockUserData);

      await authServices.register(mockUserData as any);

      expect(User).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockUserData.name,
          email: mockUserData.email,
          password: mockUserData.password,
          language: mockUserData.language,
          mobile: mockUserData.mobile,
          selfDescription: mockUserData.selfDescription,
        })
      );
      expect(mockUserData.save).toHaveBeenCalled();
    });

    it('should throw conflict error when email already exists', async () => {
      const mockError = new TestError(authErrorMessages.DUPLICATION_EMAIL);
      mockError.status = 409;
      (mockError as any).code = 11000;

      mockUserData.save.mockRejectedValue(mockError);
      (User as jest.Mocked<any>).mockImplementation(() => mockUserData);

      await expect(authServices.register(mockUserData as any)).rejects.toMatchObject({
        message: authErrorMessages.DUPLICATION_EMAIL,
        status: 409,
      });
    });

    it('should handle unknown database errors', async () => {
      mockUserData.save.mockRejectedValue(new Error('Database connection failed'));
      (User as jest.Mocked<any>).mockImplementation(() => mockUserData);

      await expect(authServices.register(mockUserData as any)).rejects.toThrow(
        authErrorMessages.UNKNOWN_ERROR
      );
    });

    it('should throw error when required fields are missing', async () => {
      const invalidUserData = {
        email: 'test@example.com',
        password: 'password123',
      };

      (User as jest.Mocked<any>).mockImplementation((userData: Partial<IUser>) => {
        if (!userData.name || !userData.language) {
          throw new Error(authErrorMessages.MISSING_REGISTRATION_FIELD);
        }
        return mockUserData;
      });

      await expect(authServices.register(invalidUserData as any)).rejects.toThrow(
        authErrorMessages.UNKNOWN_ERROR
      );
    });
  });

  describe('login() - User Login', () => {
    it('should log in successfully and return a token', async () => {
      const mockUser = {
        ...mockUserData,
        activated: true,
        generateLoginToken: jest.fn().mockReturnValue('mockToken123'),
      };

      (User as jest.Mocked<any>).findByCredential = jest.fn().mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mocked<any>).mockResolvedValue(true);

      const token = await authServices.login(mockCredentials.email, mockCredentials.password);

      expect(User.findByCredential).toHaveBeenCalledWith(
        mockCredentials.email,
        mockCredentials.password
      );
      expect(mockUser.generateLoginToken).toHaveBeenCalled();
      expect(token).toBe('mockToken123');
    });

    it('should throw error when credentials are invalid', async () => {
      (User as jest.Mocked<any>).findByCredential = jest
        .fn()
        .mockRejectedValue(new Error(authErrorMessages.INVALID_CREDENTIALS));

      await expect(authServices.login('wrong@example.com', 'wrongpass')).rejects.toThrow(
        authErrorMessages.INVALID_CREDENTIALS
      );
    });

    it('should handle JWT generation errors', async () => {
      const mockUser = {
        ...mockUserData,
        activated: true,
        generateLoginToken: jest.fn(() => {
          throw new Error(authErrorMessages.JWT_TOKEN_GENERATION_ERROR);
        }),
      };

      (User as jest.Mocked<any>).findByCredential = jest.fn().mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mocked<any>).mockResolvedValue(true);

      await expect(authServices.login('test@example.com', 'password123')).rejects.toThrow(
        authErrorMessages.JWT_TOKEN_GENERATION_ERROR
      );
    });

    it('should throw error if JWT secret is not set', async () => {
      const originalJwtSecret = config.jwtSecret;
      config.jwtSecret = '';

      const mockUser = {
        ...mockUserData,
        activated: true,
        generateLoginToken: jest.fn(() => {
          if (!config.jwtSecret) {
            throw new Error(authErrorMessages.JWT_SECRET_NOT_SET);
          }
          return 'token';
        }),
      };

      (User as jest.Mocked<any>).findByCredential = jest.fn().mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mocked<any>).mockResolvedValue(true);

      await expect(authServices.login('test@example.com', 'password123')).rejects.toThrow(
        authErrorMessages.JWT_SECRET_NOT_SET
      );

      config.jwtSecret = originalJwtSecret;
    });

    it('should throw error when password is incorrect', async () => {
      (User as jest.Mocked<any>).findByCredential = jest
        .fn()
        .mockRejectedValue(new Error(authErrorMessages.INVALID_CREDENTIALS));

      await expect(authServices.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        authErrorMessages.INVALID_CREDENTIALS
      );
    });
  });
});
