import { updateProfile} from './user.service';
import { authErrorMessages } from '../utils/errorMessages';
import { User } from '../models/User';

// This file contains unit tests for functions in user.service.ts
// Run with Jest testing framework

/**
 * Test cases:
 * 
 * updateProfile function tests:
 * 1. Successfully update user profile
 * 2. Update user profile failure - Username already exists
 * 3. Update user profile failure - Empty language field
 * 4. Update user profile failure - User does not exist
 * 5. Update user profile failure - Database error
 * 
 * checkUsernameUniqueness function tests:
 * 1. Username uniqueness check - Username is unique
 * 2. Username uniqueness check - Username is not unique
 * 3. Username uniqueness check - Exclude current user
 * 4. Username uniqueness check - Database error
 */

// Implementation of test cases:

// Mock User model
jest.mock('../models/User', () => ({
  User: {
    findByIdAndUpdate: jest.fn(),
    findOne: jest.fn()
  }
}));

describe('User Service - updateProfile Function Tests', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test successful profile update
  test('Successfully update user profile', async () => {
    // Mock data
    const userId = '123456789012';
    const updateData = {
      name: 'New Username',
      language: 'English',
      mobile: '13800138000',
      selfDescription: 'I am a new user'
    };
    
    const mockUpdatedUser = {
      _id: userId,
      ...updateData
    };
    
    // Mock findOne to return null (indicating no other user with the same username)
    (User.findOne as jest.Mock).mockResolvedValueOnce(null);
    
    // Mock findByIdAndUpdate to return the updated user
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(mockUpdatedUser);
    
    const result = await updateProfile(userId, updateData);
    
    // Assert results
    expect(User.findOne).toHaveBeenCalledWith({ name: updateData.name, _id: { $ne: userId } });
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, updateData, { new: true });
    expect(result).toEqual(mockUpdatedUser);
  });

  // Test username already exists
  test('Update user profile failure - Username already exists', async () => {
    // Mock data
    const userId = '123456789012';
    const updateData = {
      name: 'Existing Username',
    };
    
    // Mock findOne to return a user (indicating username is already taken)
    (User.findOne as jest.Mock).mockResolvedValueOnce({ _id: 'anotherUserId', name: updateData.name });
    
    // Call function and assert error thrown
    await expect(updateProfile(userId, updateData)).rejects.toThrow('Username already taken');
    
    // Verify findByIdAndUpdate was not called
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  // Test empty language field
  test('Update user profile failure - Empty language field', async () => {
    // Mock data
    const userId = '123456789012';
    const updateData = {
      language: '',
    };
    
    // Call function and assert error thrown
    await expect(updateProfile(userId, updateData)).rejects.toThrow(authErrorMessages.MISSING_REGISTRATION_FIELD);
    
    // Verify findOne and findByIdAndUpdate were not called
    expect(User.findOne).not.toHaveBeenCalled();
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  // Test user does not exist
  test('Update user profile failure - User does not exist', async () => {
    // Mock data
    const userId = '123456789012';
    const updateData = {
      language: 'English',
    };
    
    // Mock findByIdAndUpdate to return null (indicating user not found)
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(null);
    
    // Call function and assert error thrown
    await expect(updateProfile(userId, updateData)).rejects.toThrow('User not found');
  });

  // Test database error
  test('Update user profile failure - Database error', async () => {
    // Mock data
    const userId = '123456789012';
    const updateData = {
      language: 'English',
    };
    
    // Mock findByIdAndUpdate to throw an error
    const dbError = new Error('Database connection error');
    (User.findByIdAndUpdate as jest.Mock).mockRejectedValueOnce(dbError);
    
    // Call function and assert same error thrown
    await expect(updateProfile(userId, updateData)).rejects.toThrow(dbError);
  });
});

