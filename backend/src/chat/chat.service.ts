import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
  ) {}

  async sendMessage(
    senderId: string,
    sendMessageDto: SendMessageDto,
  ): Promise<MessageDocument> {
    const { receiverId, content, messageType } = sendMessageDto;

    const message = await this.messageModel.create({
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(receiverId),
      content,
      messageType: messageType || 'text',
    });

    // Upsert conversation
    const participants = [
      new Types.ObjectId(senderId),
      new Types.ObjectId(receiverId),
    ].sort((a, b) => a.toString().localeCompare(b.toString()));

    await this.conversationModel.findOneAndUpdate(
      { participants: { $all: participants } },
      {
        $set: { participants, lastMessage: message._id },
        $inc: { unreadCount: 1 },
      },
      { upsert: true, new: true },
    );

    return message;
  }

  async viewMessages(
    userId: string,
    receiverId: string,
    page = 1,
    limit = 50,
  ): Promise<{ messages: MessageDocument[]; total: number; page: number }> {
    const senderObjId = new Types.ObjectId(userId);
    const receiverObjId = new Types.ObjectId(receiverId);

    const filter = {
      $or: [
        { senderId: senderObjId, receiverId: receiverObjId },
        { senderId: receiverObjId, receiverId: senderObjId },
      ],
    };

    const [messages, total] = await Promise.all([
      this.messageModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.messageModel.countDocuments(filter),
    ]);

    // Mark messages as read
    await this.messageModel.updateMany(
      { senderId: receiverObjId, receiverId: senderObjId, isRead: false },
      { $set: { isRead: true } },
    );

    return { messages: messages.reverse(), total, page };
  }

  async getConversations(userId: string): Promise<ConversationDocument[]> {
    return this.conversationModel
      .find({ participants: new Types.ObjectId(userId) })
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async markAsRead(userId: string, senderId: string): Promise<void> {
    await this.messageModel.updateMany(
      {
        senderId: new Types.ObjectId(senderId),
        receiverId: new Types.ObjectId(userId),
        isRead: false,
      },
      { $set: { isRead: true } },
    );
  }
}
