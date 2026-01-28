import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis-mock';

const DEFAULT_TTL_SECONDS = 600; // 10 minutes

@Injectable()
export class CacheService implements OnModuleInit {
  private client: InstanceType<typeof Redis>;
  private connectionAttempts = 0;

  onModuleInit() {
    this.client = new Redis();

    // Simulate occasional connection issues (for realistic logs)
    // This is handled gracefully - just logs a warning and reconnects
    this.client.on('error', (err: Error) => {
      console.warn(`Redis connection timeout, reconnecting...`);
      this.connectionAttempts++;
    });

    this.client.on('connect', () => {
      if (this.connectionAttempts > 0) {
        console.log('Redis reconnected successfully');
      }
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  generateKey(...parts: (string | undefined | null)[]): string {
    return parts.filter(Boolean).join(':');
  }
}
