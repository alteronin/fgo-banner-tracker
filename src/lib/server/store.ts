import { Redis } from "@upstash/redis";

export interface StoredUser {
  sub: string;
  name: string;
  email: string;
  picture: string;
  updatedAt: number;
}

export interface StoredSync {
  updatedAt: number;
  data: unknown;
}

export function syncConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

function redisClient(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash Redis is not configured");
  return new Redis({ url, token });
}

export async function saveUser(user: StoredUser): Promise<void> {
  await redisClient().set(`fbtn:user:${user.sub}`, user);
}

export async function loadUser(sub: string): Promise<StoredUser | null> {
  try {
    const value = await redisClient().get<StoredUser>(`fbtn:user:${sub}`);
    return value ?? null;
  } catch {
    return null;
  }
}

export async function loadSync(sub: string): Promise<StoredSync | null> {
  const value = await redisClient().get<StoredSync>(`fbtn:sync:${sub}`);
  return value ?? null;
}

export async function saveSync(sub: string, data: unknown): Promise<number> {
  const updatedAt = Date.now();
  const record: StoredSync = { updatedAt, data };
  await redisClient().set(`fbtn:sync:${sub}`, record);
  return updatedAt;
}
