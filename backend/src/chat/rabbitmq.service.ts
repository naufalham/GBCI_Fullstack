import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: any = null;
  private channel: any = null;
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.close();
  }

  private async connect(): Promise<void> {
    try {
      const uri = this.configService.get<string>(
        'RABBITMQ_URI',
        'amqp://localhost:5672',
      );
      this.connection = await amqplib.connect(uri);
      this.channel = await this.connection.createChannel();

      // Declare exchanges and queues
      await this.channel.assertExchange('chat_exchange', 'topic', {
        durable: true,
      });
      await this.channel.assertQueue('chat_notifications', { durable: true });
      await this.channel.assertQueue('chat_messages', { durable: true });

      await this.channel.bindQueue(
        'chat_notifications',
        'chat_exchange',
        'notification.*',
      );
      await this.channel.bindQueue(
        'chat_messages',
        'chat_exchange',
        'message.*',
      );

      // Consume notification queue
      await this.channel.consume(
        'chat_notifications',
        (msg: any) => {
          if (msg) {
            const content = JSON.parse(msg.content.toString());
            this.handleNotification(content);
            this.channel.ack(msg);
          }
        },
        { noAck: false },
      );

      this.logger.log('RabbitMQ connected successfully');
    } catch (error) {
      this.logger.warn(
        'RabbitMQ connection failed, running without message queue:',
        (error as Error).message,
      );
    }
  }

  private handleNotification(content: Record<string, unknown>): void {
    this.logger.log(`Notification received: ${JSON.stringify(content)}`);
  }

  async publishMessage(
    queue: string,
    message: Record<string, unknown>,
  ): Promise<void> {
    if (!this.channel) {
      this.logger.warn('RabbitMQ channel not available, skipping publish');
      return;
    }

    try {
      const routingKey =
        queue === 'chat_notifications' ? 'notification.new' : 'message.new';
      this.channel.publish(
        'chat_exchange',
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true },
      );
    } catch (error) {
      this.logger.error('Failed to publish message:', (error as Error).message);
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch (error) {
      this.logger.error('Error closing RabbitMQ:', (error as Error).message);
    }
  }
}
