import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Start in-memory MongoDB if no external URI is configured
  if (!process.env.MONGODB_URI) {
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      process.env.MONGODB_URI = mongod.getUri();
      console.log(`In-memory MongoDB started at ${process.env.MONGODB_URI}`);
    } catch {
      console.error(
        'No MONGODB_URI set and mongodb-memory-server not available.',
        'Please set MONGODB_URI environment variable.',
      );
      process.exit(1);
    }
  }

  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  // Increase JSON body size limit for base64 image uploads
  app.use(require('express').json({ limit: '50mb' }));
  app.use(require('express').urlencoded({ limit: '50mb', extended: true }));

  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('YouApp API')
    .setDescription('YouApp Backend API - Login, Profile & Chat')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}
bootstrap();
