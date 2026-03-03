import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '1995-08-17' })
  @IsDateString()
  @IsNotEmpty()
  birthday: string;

  @ApiProperty({ example: 175 })
  @IsNumber()
  @IsNotEmpty()
  height: number;

  @ApiProperty({ example: 70 })
  @IsNumber()
  @IsNotEmpty()
  weight: number;

  @ApiProperty({ example: ['Music', 'Sports', 'Travel'] })
  @IsArray()
  @IsString({ each: true })
  interests: string[];

  @ApiPropertyOptional({ example: 'Male', enum: ['Male', 'Female', 'Other'] })
  @IsOptional()
  @IsEnum(['Male', 'Female', 'Other'])
  gender?: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
