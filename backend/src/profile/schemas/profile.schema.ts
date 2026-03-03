import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true })
export class Profile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  birthday: Date;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  weight: number;

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop()
  horoscope: string;

  @Prop()
  zodiac: string;

  @Prop()
  imageUrl: string;

  @Prop({ enum: ['Male', 'Female', 'Other'] })
  gender: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
