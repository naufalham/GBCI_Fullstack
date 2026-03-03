import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Profile } from './schemas/profile.schema';

const MOCK_USER_ID = '507f1f77bcf86cd799439011';

describe('ProfileService', () => {
  let service: ProfileService;

  const mockProfileModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: getModelToken(Profile.name), useValue: mockProfileModel },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    jest.clearAllMocks();
  });

  describe('createProfile', () => {
    const createDto = {
      name: 'John Doe',
      birthday: '1995-08-17',
      height: 175,
      weight: 70,
      interests: ['Music', 'Sports'],
    };

    it('should create a profile with horoscope and zodiac', async () => {
      mockProfileModel.findOne.mockResolvedValue(null);
      mockProfileModel.create.mockResolvedValue({
        ...createDto,
        horoscope: 'Leo',
        zodiac: 'Pig',
      });

      const result = await service.createProfile('507f1f77bcf86cd799439011', createDto);

      expect(result.horoscope).toBe('Leo');
      expect(result.zodiac).toBe('Pig');
    });

    it('should throw ConflictException if profile exists', async () => {
      mockProfileModel.findOne.mockResolvedValue({ _id: 'existing' });

      await expect(
        service.createProfile('507f1f77bcf86cd799439011', createDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getProfile', () => {
    it('should return profile if found', async () => {
      const mockProfile = { name: 'John', horoscope: 'Leo' };
      mockProfileModel.findOne.mockResolvedValue(mockProfile);

      const result = await service.getProfile('507f1f77bcf86cd799439011');
      expect(result.name).toBe('John');
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockProfileModel.findOne.mockResolvedValue(null);

      await expect(
        service.getProfile('507f1f77bcf86cd799439011'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update profile and recalculate horoscope if birthday changes', async () => {
      mockProfileModel.findOneAndUpdate.mockResolvedValue({
        name: 'John',
        birthday: new Date('2000-03-25'),
        horoscope: 'Aries',
        zodiac: 'Dragon',
      });

      const result = await service.updateProfile('507f1f77bcf86cd799439011', {
        birthday: '2000-03-25',
      });

      expect(result.horoscope).toBe('Aries');
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockProfileModel.findOneAndUpdate.mockResolvedValue(null);

      await expect(
        service.updateProfile('507f1f77bcf86cd799439011', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
