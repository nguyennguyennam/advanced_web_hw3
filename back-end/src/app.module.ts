import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';

import { AppService } from './app.service';
import { UserModule } from './user.module';
import * as path from 'path';

@Module({
  imports: [
    // --- Load environment variables globally ---
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [path.join(__dirname, '..', '.env'), '.env'],
    }),

    // --- Cache configuration with Redis, fallback to memory store ---
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) => {
        // TTL từ ms -> giây (cache-manager dùng seconds)
        const ttlMs = Number(cfg.get('REDIS_TTL_MS') ?? 300000);
        const ttl = Math.max(1, Math.floor(ttlMs / 1000));

        const useRedis = String(cfg.get('REDIS_ENABLED') ?? 'true').toLowerCase() !== 'false';

        if (useRedis) {
          const host = cfg.get<string>('REDIS_HOST', 'localhost');
          const port = Number(cfg.get('REDIS_PORT') ?? 6379);
          const password = (cfg.get<string>('REDIS_PASSWORD') || '').replace(/['"]/g, '');
          const tls = String(cfg.get('REDIS_TLS') ?? 'false').toLowerCase() === 'true';
          const scheme = tls ? 'rediss' : 'redis';
          const url = `${scheme}://default:${encodeURIComponent(password)}@${host}:${port}`;
          console.log('[RedisURL]', url.replace(/:(.*?)@/, ':****@'));

          try {
            const store = await redisStore({
              url,
              enableReadyCheck: true,
              connectTimeout: 4000,
              maxRetriesPerRequest: 0,
              retryStrategy: () => null,
            });

            // Ép kiểu nhẹ cho Nest (ổn định ở runtime)
            return {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              store: store as any,
              ttl,     // seconds
              max: 0,
            };
          } catch (e) {
            console.warn('⚠️ Redis init failed, fallback to memory cache:', e);
          }
        }

        console.warn('Redis disabled. Using in-memory cache.');
        return { ttl, max: 0 };
      },
    }),

    // --- PostgreSQL (Neon) ---
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const dbUrl = cfg.get<string>('DATABASE_URL');
        if (!dbUrl) {
          throw new Error('DATABASE_URL is not defined in environment variables');
        }

        return {
          type: 'postgres',
          url: dbUrl,
          autoLoadEntities: true,
          synchronize: true, // cân nhắc false khi prod thật
          ssl: cfg.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
          logging: cfg.get<string>('NODE_ENV') !== 'production',
        };
      },
    }),

    UserModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
