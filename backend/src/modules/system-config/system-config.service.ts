import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateSystemConfigDto } from "./dto/system-config.dto";

@Injectable()
export class SystemConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const configs = await this.prisma.systemConfig.findMany({ orderBy: [{ group: "asc" }, { key: "asc" }] });
    return configs.map((config) => ({
      id: config.id,
      key: config.key,
      group: config.group,
      valueJson: config.valueJson,
      updatedBy: config.updatedBy,
      updatedAt: config.updatedAt
    }));
  }

  async get(key: string) {
    const config = await this.prisma.systemConfig.findUnique({ where: { key } });
    if (!config) {
      throw new NotFoundException("System config not found.");
    }

    return {
      id: config.id,
      key: config.key,
      group: config.group,
      valueJson: config.valueJson,
      updatedBy: config.updatedBy,
      updatedAt: config.updatedAt
    };
  }

  async update(key: string, dto: UpdateSystemConfigDto) {
    const existing = await this.prisma.systemConfig.findUnique({ where: { key } });
    if (!existing) {
      throw new NotFoundException("System config not found.");
    }

    const updated = await this.prisma.systemConfig.update({
      where: { key },
      data: {
        valueJson: dto.valueJson as Prisma.InputJsonValue,
        group: dto.group ?? existing.group
      }
    });

    return {
      id: updated.id,
      key: updated.key,
      group: updated.group,
      valueJson: updated.valueJson,
      updatedBy: updated.updatedBy,
      updatedAt: updated.updatedAt,
      audit: "TODO: write AdminAuditLog when admin auth guard is wired."
    };
  }
}
