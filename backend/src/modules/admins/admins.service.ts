import { Injectable, NotFoundException } from "@nestjs/common";
import { todo } from "../../common/utils/mock-response";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { pointAccount: true }
    });
    return users.map((user) => this.publicUser(user));
  }

  async getUser(id: string) {
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

  async listAdmins() {
    const admins = await this.prisma.admin.findMany({ orderBy: { createdAt: "desc" } });
    return admins.map((admin) => this.publicAdmin(admin));
  }

  async getAdmin(id: string) {
    const adminId = Number(id);
    if (!Number.isInteger(adminId)) {
      throw new NotFoundException("Admin not found.");
    }

    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException("Admin not found.");
    }

    return this.publicAdmin(admin);
  }

  adjustPoints() {
    return todo("TODO: admin_adjust transaction updates PointAccount and PointTransaction only; it is not manual_recharge.");
  }

  private publicUser(user: Awaited<ReturnType<PrismaService["user"]["findFirst"]>> & { pointAccount?: unknown }) {
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

  private publicAdmin(admin: Awaited<ReturnType<PrismaService["admin"]["findFirst"]>>) {
    return {
      id: admin?.id,
      username: admin?.username,
      role: admin?.role,
      status: admin?.status,
      lastLoginAt: admin?.lastLoginAt,
      createdAt: admin?.createdAt,
      updatedAt: admin?.updatedAt
    };
  }
}
