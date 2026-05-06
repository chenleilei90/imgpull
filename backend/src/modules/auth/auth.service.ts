import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Admin, User } from "@prisma/client";
import { createPasswordHash, verifyPasswordHash } from "../../common/security/password";
import { createOpaqueSessionToken, extractBearerToken, hashSessionToken } from "../../common/security/session-token";
import { todo } from "../../common/utils/mock-response";
import { PrismaService } from "../../prisma/prisma.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";

interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  register(_dto: RegisterDto) {
    return todo("TODO: create user, hash password, create PointAccount, write LoginLog.");
  }

  async login(dto: LoginDto, meta: RequestMeta) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.account }, { phone: dto.account }],
        status: "normal"
      }
    });

    if (!user || !verifyPasswordHash(dto.credential, user.passwordHash)) {
      await this.writeLoginLog("user", dto.account, false, meta, user?.id, "invalid_credentials");
      throw new UnauthorizedException("Invalid account or credential.");
    }

    const token = createOpaqueSessionToken();
    const expiresAt = this.sessionExpiresAt();
    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        tokenHash: hashSessionToken(token),
        ip: meta.ip,
        userAgent: meta.userAgent,
        expiresAt
      }
    });
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await this.writeLoginLog("user", dto.account, true, meta, user.id);

    return {
      token,
      tokenType: "Bearer",
      expiresAt,
      user: this.publicUser(user)
    };
  }

  async logout(authorization: string | undefined) {
    const tokenHash = this.getTokenHashOrThrow(authorization);
    const result = await this.prisma.userSession.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    return { revoked: result.count > 0 };
  }

  async me(authorization: string | undefined) {
    const tokenHash = this.getTokenHashOrThrow(authorization);
    const session = await this.prisma.userSession.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: {
          include: {
            pointAccount: true
          }
        }
      }
    });

    if (!session || session.user.status !== "normal") {
      throw new UnauthorizedException("Session is invalid or expired.");
    }

    return this.publicUser(session.user);
  }

  async adminLogin(dto: LoginDto, meta: RequestMeta) {
    const admin = await this.prisma.admin.findFirst({
      where: {
        username: dto.account,
        role: "super_admin",
        status: "normal"
      }
    });

    if (!admin || !verifyPasswordHash(dto.credential, admin.passwordHash)) {
      await this.writeLoginLog("admin", dto.account, false, meta, admin?.id, "invalid_credentials");
      throw new UnauthorizedException("Invalid admin account or credential.");
    }

    const token = createOpaqueSessionToken();
    const expiresAt = this.sessionExpiresAt();
    await this.prisma.adminSession.create({
      data: {
        adminId: admin.id,
        tokenHash: hashSessionToken(token),
        ip: meta.ip,
        userAgent: meta.userAgent,
        expiresAt
      }
    });
    await this.prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
    await this.writeLoginLog("admin", dto.account, true, meta, admin.id);

    return {
      token,
      tokenType: "Bearer",
      expiresAt,
      admin: this.publicAdmin(admin)
    };
  }

  async adminLogout(authorization: string | undefined) {
    const tokenHash = this.getTokenHashOrThrow(authorization);
    const result = await this.prisma.adminSession.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    return { revoked: result.count > 0 };
  }

  async adminMe(authorization: string | undefined) {
    const tokenHash = this.getTokenHashOrThrow(authorization);
    const session = await this.prisma.adminSession.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      include: { admin: true }
    });

    if (!session || session.admin.status !== "normal" || session.admin.role !== "super_admin") {
      throw new UnauthorizedException("Admin session is invalid or expired.");
    }

    return this.publicAdmin(session.admin);
  }

  async getCurrentUser(authorization: string | undefined) {
    return this.me(authorization);
  }

  async getCurrentAdmin(authorization: string | undefined) {
    return this.adminMe(authorization);
  }

  private sessionExpiresAt() {
    const ttlSeconds = this.config.get<number>("security.sessionTtlSeconds") ?? 86_400;
    return new Date(Date.now() + ttlSeconds * 1000);
  }

  private getTokenHashOrThrow(authorization: string | undefined) {
    const token = extractBearerToken(authorization);
    if (!token) {
      throw new UnauthorizedException("Missing bearer session token.");
    }
    return hashSessionToken(token);
  }

  private async writeLoginLog(
    actorType: "user" | "admin",
    account: string,
    success: boolean,
    meta: RequestMeta,
    actorId?: number,
    failReason?: string
  ) {
    await this.prisma.loginLog.create({
      data: {
        actorType,
        actorId,
        account,
        success,
        failReason,
        ip: meta.ip,
        userAgent: meta.userAgent
      }
    });
  }

  private publicUser(user: User & { pointAccount?: { balancePoints: number; frozenPoints: number; version: number } | null }) {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      status: user.status,
      registerIp: user.registerIp,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      pointAccount: user.pointAccount
        ? {
            balancePoints: user.pointAccount.balancePoints,
            frozenPoints: user.pointAccount.frozenPoints,
            version: user.pointAccount.version
          }
        : null
    };
  }

  private publicAdmin(admin: Admin) {
    return {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      status: admin.status,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    };
  }
}

export const localOnlyCreatePasswordHash = createPasswordHash;
