import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ViewMessagesDto } from './dto/view-messages.dto';

@ApiTags('Chat')
@Controller('api')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sendMessage')
  @ApiOperation({ summary: 'Send a message to another user' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async sendMessage(
    @Request() req: { user: { userId: string } },
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(req.user.userId, sendMessageDto);
  }

  @Get('viewMessages')
  @ApiOperation({ summary: 'View messages between two users' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async viewMessages(
    @Request() req: { user: { userId: string } },
    @Query() viewMessagesDto: ViewMessagesDto,
  ) {
    return this.chatService.viewMessages(
      req.user.userId,
      viewMessagesDto.receiverId,
      viewMessagesDto.page,
      viewMessagesDto.limit,
    );
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for the current user' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved' })
  async getConversations(@Request() req: { user: { userId: string } }) {
    return this.chatService.getConversations(req.user.userId);
  }
}
