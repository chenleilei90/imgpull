import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { extractBearerToken, hashSessionToken } from "../../common/security/session-token";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(authorization: string | undefined) {
    const token = extractBearerToken(authorization);
    if (!token) {
      throw new UnauthorizedException("Missing bearer session token.");
    }

    const session = await this.prisma.userSession.findFirst({
      where: {
        tokenHash: hashSessionToken(token),
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

  async getById(id: string) {
    const userId = Number(id);
    if (!Number.isInteger(userId)) {
      throw new NotFoundException("User not found.");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { pointAccount: true }
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    return this.publicUser(user);
  }

  private publicUser(user: Awaited<ReturnType<PrismaService["user"]["findUnique"]>> & { pointAccount?: unknown }) {
    return {
      id: user?.id,
      email: user?.email,
      phone: user?.phone,
      status: user?.status,
      registerIp: user?.registerIp,
      lastLoginAt: user?.lastLoginAt,
      createdAt: user?.createdAt,
      updatedAt: user?.updatedAt,
      pointAccount: user?.pointAccount
    };
  }
}
