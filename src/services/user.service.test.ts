import { updateProfile } from './user.service';
import { authErrorMessages } from '../utils/errorMessages';
import { User } from '../models/User';

jest.mock('../models/User', () => ({
  User: {
    findByIdAndUpdate: jest.fn(),
    findOne: jest.fn(),
  },
}));

describe('User Service - updateProfile Function Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update user profile', async () => {
    const userId = '123456789012';
    const updateData = {
      name: 'New Username',
      language: 'English',
      mobile: '13800138000',
      selfDescription: 'I am a new user',
    };

    const mockUpdatedUser = {
      _id: userId,
      ...updateData,
    };

    (User.findOne as jest.Mock).mockResolvedValueOnce(null);
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(mockUpdatedUser);

    const result = await updateProfile(userId, updateData);

    expect(User.findOne).toHaveBeenCalledWith({ name: updateData.name, _id: { $ne: userId } });
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, updateData, { new: true });
    expect(result).toEqual(mockUpdatedUser);
  });

  it('should fail to update profile when username already exists', async () => {
    const userId = '123456789012';
    const updateData = {
      name: 'Existing Username',
    };

    (User.findOne as jest.Mock).mockResolvedValueOnce({
      _id: 'anotherUserId',
      name: updateData.name,
    });

    await expect(updateProfile(userId, updateData)).rejects.toThrow('Username already taken');

    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('should fail to update profile when language field is empty', async () => {
    const userId = '123456789012';
    const updateData = {
      language: '',
    };

    await expect(updateProfile(userId, updateData)).rejects.toThrow(
      authErrorMessages.MISSING_REGISTRATION_FIELD
    );

    expect(User.findOne).not.toHaveBeenCalled();
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('should fail to update profile when user does not exist', async () => {
    const userId = '123456789012';
    const updateData = {
      language: 'English',
    };

    (User.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(null);

    await expect(updateProfile(userId, updateData)).rejects.toThrow('User not found');
  });

  it('should fail to update profile when database error occurs', async () => {
    const userId = '123456789012';
    const updateData = {
      language: 'English',
    };

    const dbError = new Error('Database connection error');
    (User.findByIdAndUpdate as jest.Mock).mockRejectedValueOnce(dbError);

    await expect(updateProfile(userId, updateData)).rejects.toThrow(dbError);
  });
});
