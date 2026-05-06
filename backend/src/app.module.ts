import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { appConfig } from "./config/app.config";
import { databaseConfig } from "./config/database.config";
import { redisConfig } from "./config/redis.config";
import { securityConfig } from "./config/security.config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { AdminsModule } from "./modules/admins/admins.module";
import { RegistryAccountsModule } from "./modules/registry-accounts/registry-accounts.module";
import { ImageTasksModule } from "./modules/image-tasks/image-tasks.module";
import { PointsModule } from "./modules/points/points.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { WorkersModule } from "./modules/workers/workers.module";
import { AnnouncementsModule } from "./modules/announcements/announcements.module";
import { HelpModule } from "./modules/help/help.module";
import { ErrorCodesModule } from "./modules/error-codes/error-codes.module";
import { AuditLogsModule } from "./modules/audit-logs/audit-logs.module";
import { ActivitiesModule } from "./modules/activities/activities.module";
import { MembershipModule } from "./modules/membership/membership.module";
import { SystemConfigModule } from "./modules/system-config/system-config.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
      load: [appConfig, databaseConfig, redisConfig, securityConfig]
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AdminsModule,
    RegistryAccountsModule,
    ImageTasksModule,
    PointsModule,
    OrdersModule,
    WorkersModule,
    AnnouncementsModule,
    HelpModule,
    ErrorCodesModule,
    AuditLogsModule,
    ActivitiesModule,
    MembershipModule,
    SystemConfigModule,
    HealthModule
  ]
})
export class AppModule {}
