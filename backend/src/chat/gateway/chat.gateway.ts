import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from '../chat.service';
import { RabbitMQService } from '../rabbitmq.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map userId -> Set of socket IDs for multi-device support
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private rabbitMQService: RabbitMQService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;

      // Track socket connection
      if (!this.userSockets.has(payload.sub)) {
        this.userSockets.set(payload.sub, new Set());
      }
      this.userSockets.get(payload.sub)!.add(client.id);

      // Join personal room
      client.join(`user:${payload.sub}`);

      console.log(`User ${payload.sub} connected (socket: ${client.id})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const sockets = this.userSockets.get(client.userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(client.userId);
        }
      }
      console.log(`User ${client.userId} disconnected (socket: ${client.id})`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiverId: string; content: string; messageType?: string },
  ) {
    if (!client.userId) return;

    const message = await this.chatService.sendMessage(client.userId, {
      receiverId: data.receiverId,
      content: data.content,
      messageType: data.messageType,
    });

    // Emit to receiver's room
    this.server.to(`user:${data.receiverId}`).emit('newMessage', {
      ...message.toObject(),
      senderSocketId: client.id,
    });

    // Emit confirmation to sender
    client.emit('messageSent', message.toObject());

    // Publish to RabbitMQ for notification
    await this.rabbitMQService.publishMessage('chat_notifications', {
      type: 'new_message',
      senderId: client.userId,
      receiverId: data.receiverId,
      messageId: message._id.toString(),
      content: data.content,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiverId: string },
  ) {
    if (!client.userId) return;
    this.server.to(`user:${data.receiverId}`).emit('userTyping', {
      userId: client.userId,
    });
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiverId: string },
  ) {
    if (!client.userId) return;
    this.server.to(`user:${data.receiverId}`).emit('userStoppedTyping', {
      userId: client.userId,
    });
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { senderId: string },
  ) {
    if (!client.userId) return;
    await this.chatService.markAsRead(client.userId, data.senderId);
    this.server.to(`user:${data.senderId}`).emit('messagesRead', {
      readBy: client.userId,
    });
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }
}
