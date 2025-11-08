import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS for React frontend
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      // 👇 Cho phép frontend deploy trên Render
      /\.onrender\.com$/,
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ✅ Render cung cấp PORT động qua biến môi trường
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`✅ Server is running on port ${port}`);
}
bootstrap();
