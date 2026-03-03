import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { Message } from './schemas/message.schema';
import { Conversation } from './schemas/conversation.schema';

describe('ChatService', () => {
  let service: ChatService;

  const mockMessageModel = {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    updateMany: jest.fn(),
  };

  const mockConversationModel = {
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getModelToken(Message.name), useValue: mockMessageModel },
        {
          provide: getModelToken(Conversation.name),
          useValue: mockConversationModel,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should create a message and update conversation', async () => {
      const mockMsg = {
        _id: 'msg-id',
        senderId: '000000000000000000000001',
        receiverId: '000000000000000000000002',
        content: 'Hello!',
      };

      mockMessageModel.create.mockResolvedValue(mockMsg);
      mockConversationModel.findOneAndUpdate.mockResolvedValue({});

      const result = await service.sendMessage('000000000000000000000001', {
        receiverId: '000000000000000000000002',
        content: 'Hello!',
      });

      expect(result.content).toBe('Hello!');
      expect(mockConversationModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('viewMessages', () => {
    it('should return paginated messages', async () => {
      const mockMessages = [
        { content: 'Hi', senderId: '1', receiverId: '2' },
        { content: 'Hello', senderId: '2', receiverId: '1' },
      ];

      const chainedQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockMessages),
      };
      mockMessageModel.find.mockReturnValue(chainedQuery);
      mockMessageModel.countDocuments.mockResolvedValue(2);
      mockMessageModel.updateMany.mockResolvedValue({});

      const result = await service.viewMessages(
        '000000000000000000000001',
        '000000000000000000000002',
        1,
        50,
      );

      expect(result.messages).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('markAsRead', () => {
    it('should mark messages as read', async () => {
      mockMessageModel.updateMany.mockResolvedValue({ modifiedCount: 3 });

      await service.markAsRead(
        '000000000000000000000001',
        '000000000000000000000002',
      );

      expect(mockMessageModel.updateMany).toHaveBeenCalled();
    });
  });
});
