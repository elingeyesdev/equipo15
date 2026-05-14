import {
  Global,
  Module,
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ...args: string[]): Promise<string>;
  del(...keys: string[]): Promise<number>;
  incr(key: string): Promise<number>;
  pexpire(key: string, milliseconds: number): Promise<number>;
  scan(cursor: string, ...args: string[]): Promise<[string, string[]]>;
  quit(): Promise<string>;
}

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClient | null = null;
  private readonly fallbackMap = new Map<string, any>();
  private readonly expiryMap = new Map<string, number>();

  constructor() {
    const redisUrl = process.env['REDIS_URL'];
    if (redisUrl) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
        const Redis = require('ioredis');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        this.client = new Redis(redisUrl);
        this.logger.log('Redis client connected');
      } catch {
        this.logger.warn('ioredis not available, using in-memory Map fallback');
      }
    } else {
      this.logger.log('REDIS_URL not set, using in-memory Map fallback');
    }
  }

  async get(key: string): Promise<any> {
    if (this.client) {
      try {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      } catch {
        this.logger.warn(
          `Redis get failed for key "${key}", falling back to Map`,
        );
      }
    }
    const expiry = this.expiryMap.get(key);
    if (expiry && Date.now() > expiry) {
      this.fallbackMap.delete(key);
      this.expiryMap.delete(key);
      return null;
    }
    return this.fallbackMap.get(key) ?? null;
  }

  async set(key: string, value: any, ttlMs?: number): Promise<void> {
    if (this.client) {
      try {
        const serialized = JSON.stringify(value);
        if (ttlMs) {
          await this.client.set(key, serialized, 'PX', String(ttlMs));
        } else {
          await this.client.set(key, serialized);
        }
        return;
      } catch {
        this.logger.warn(
          `Redis set failed for key "${key}", falling back to Map`,
        );
      }
    }
    this.fallbackMap.set(key, value);
    if (ttlMs) {
      this.expiryMap.set(key, Date.now() + ttlMs);
    } else {
      this.expiryMap.delete(key);
    }
  }

  async del(key: string): Promise<void> {
    if (this.client) {
      try {
        await this.client.del(key);
        return;
      } catch {
        this.logger.warn(
          `Redis del failed for key "${key}", falling back to Map`,
        );
      }
    }
    this.fallbackMap.delete(key);
    this.expiryMap.delete(key);
  }

  async incr(key: string): Promise<number> {
    if (this.client) {
      try {
        return await this.client.incr(key);
      } catch {
        this.logger.warn(
          `Redis incr failed for key "${key}", falling back to Map`,
        );
      }
    }
    const current = (this.fallbackMap.get(key) as number) || 0;
    const next = current + 1;
    this.fallbackMap.set(key, next);
    return next;
  }

  async expire(key: string, ttlMs: number): Promise<void> {
    if (this.client) {
      try {
        await this.client.pexpire(key, ttlMs);
        return;
      } catch {
        this.logger.warn(
          `Redis expire failed for key "${key}", falling back to Map`,
        );
      }
    }
    this.expiryMap.set(key, Date.now() + ttlMs);
  }

  async delByPrefix(prefix: string): Promise<void> {
    if (this.client) {
      try {
        let cursor = '0';
        do {
          const [nextCursor, keys] = await this.client.scan(
            cursor,
            'MATCH',
            `${prefix}*`,
            'COUNT',
            '100',
          );
          cursor = nextCursor;
          if (keys.length > 0) {
            await this.client.del(...keys);
          }
        } while (cursor !== '0');
        return;
      } catch {
        this.logger.warn(
          `Redis delByPrefix failed for prefix "${prefix}", falling back to Map`,
        );
      }
    }
    for (const key of this.fallbackMap.keys()) {
      if (key.startsWith(prefix)) {
        this.fallbackMap.delete(key);
        this.expiryMap.delete(key);
      }
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }
}

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
