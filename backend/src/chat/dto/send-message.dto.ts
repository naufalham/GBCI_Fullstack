import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: '60f7b3b3b3b3b3b3b3b3b3b3' })
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({ example: 'Hello, how are you?' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 'text', enum: ['text', 'image', 'file'] })
  @IsOptional()
  @IsEnum(['text', 'image', 'file'])
  messageType?: string;
}
