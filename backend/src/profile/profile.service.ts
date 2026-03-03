import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { getHoroscope, getZodiac } from '../common/utils/zodiac.util';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
  ) {}

  async createProfile(
    userId: string,
    createProfileDto: CreateProfileDto,
  ): Promise<ProfileDocument> {
    const existing = await this.profileModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (existing) {
      throw new ConflictException('Profile already exists for this user');
    }

    const birthday = new Date(createProfileDto.birthday);
    const horoscope = getHoroscope(birthday);
    const zodiac = getZodiac(birthday);

    const profile = await this.profileModel.create({
      userId: new Types.ObjectId(userId),
      ...createProfileDto,
      birthday,
      horoscope,
      zodiac,
    });

    return profile;
  }

  async getProfile(userId: string): Promise<ProfileDocument> {
    const profile = await this.profileModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileDocument> {
    const updateData: Record<string, unknown> = { ...updateProfileDto };

    if (updateProfileDto.birthday) {
      const birthday = new Date(updateProfileDto.birthday);
      updateData.birthday = birthday;
      updateData.horoscope = getHoroscope(birthday);
      updateData.zodiac = getZodiac(birthday);
    }

    const profile = await this.profileModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }
}
