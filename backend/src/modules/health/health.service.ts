import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  async check() {
    const database = await this.checkDatabase();
    const redis = await this.checkRedis();
    const status = database.status === "ok" && redis.status === "ok" ? "ok" : "degraded";

    return {
      service: "imgpull-backend",
      status,
      timestamp: new Date().toISOString(),
      environment: this.config.get<string>("app.env") ?? "local",
      version: "0.1.0",
      database,
      redis
    };
  }

  private async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: "ok" };
    } catch (error: unknown) {
      return { status: "error", reason: this.safeReason(error) };
    }
  }

  private async checkRedis() {
    const redisUrl = this.config.get<string>("redis.url");
    if (!redisUrl) {
      return { status: "not_configured" };
    }

    const client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 0,
      enableOfflineQueue: false
    });

    try {
      await client.connect();
      const pong = await client.ping();
      return { status: pong === "PONG" ? "ok" : "error" };
    } catch (error: unknown) {
      return { status: "error", reason: this.safeReason(error) };
    } finally {
      client.disconnect();
    }
  }

  private safeReason(error: unknown) {
    if (error instanceof Error) {
      return error.name;
    }
    return "UnknownError";
  }
}
