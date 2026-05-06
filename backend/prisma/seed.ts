import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCAL_ADMIN_PASSWORD_HASH = "pbkdf2_sha256$210000$local-admin-salt$JXTgRh9yb3sCwkBHNSi8EvIN3I9n7y1EXOUDLASD6kU";
const LOCAL_USER_PASSWORD_HASH = "pbkdf2_sha256$210000$local-user-salt$6-7Fx6hzOf-hrTNLxTdnEW2G-Rs9_pCLZAeMGN5JX4s";

async function clearDatabase() {
  await prisma.$transaction([
    prisma.imageTaskLog.deleteMany(),
    prisma.imageTaskStage.deleteMany(),
    prisma.imageTaskAttempt.deleteMany(),
    prisma.imageTask.deleteMany(),
    prisma.activityClaim.deleteMany(),
    prisma.pointTransaction.deleteMany(),
    prisma.paymentRecord.deleteMany(),
    prisma.rechargeOrder.deleteMany(),
    prisma.userMembership.deleteMany(),
    prisma.pointAccount.deleteMany(),
    prisma.registryAccount.deleteMany(),
    prisma.userMessage.deleteMany(),
    prisma.workerHeartbeat.deleteMany(),
    prisma.workerNode.deleteMany(),
    prisma.activity.deleteMany(),
    prisma.rechargePackage.deleteMany(),
    prisma.membershipPlan.deleteMany(),
    prisma.announcement.deleteMany(),
    prisma.helpArticle.deleteMany(),
    prisma.errorCode.deleteMany(),
    prisma.systemConfig.deleteMany(),
    prisma.systemJob.deleteMany(),
    prisma.loginLog.deleteMany(),
    prisma.adminAuditLog.deleteMany(),
    prisma.userSession.deleteMany(),
    prisma.adminSession.deleteMany(),
    prisma.user.deleteMany(),
    prisma.admin.deleteMany()
  ]);
}

async function main() {
  await clearDatabase();

  const admin = await prisma.admin.create({
    data: {
      username: "super_admin",
      passwordHash: LOCAL_ADMIN_PASSWORD_HASH,
      role: "super_admin",
      status: "normal"
    }
  });

  const user = await prisma.user.create({
    data: {
      email: "ops@example.test",
      passwordHash: LOCAL_USER_PASSWORD_HASH,
      status: "normal",
      registerIp: "127.0.0.1"
    }
  });

  await prisma.pointAccount.create({
    data: {
      userId: user.id,
      balancePoints: 576,
      frozenPoints: 8,
      totalEarnedPoints: 626,
      totalConsumedPoints: 50,
      version: 1
    }
  });

  const freePlan = await prisma.membershipPlan.create({
    data: {
      code: "free",
      name: "Free",
      priceCents: 0,
      grantPoints: 30,
      dailyTaskLimit: 3,
      dailyPointLimit: 30,
      concurrentTaskLimit: 1,
      maxImageSizeMb: 1024
    }
  });

  await prisma.membershipPlan.createMany({
    data: [
      {
        code: "standard",
        name: "Standard",
        priceCents: 1900,
        grantPoints: 300,
        dailyTaskLimit: 30,
        dailyPointLimit: 300,
        concurrentTaskLimit: 2,
        maxImageSizeMb: 5120
      },
      {
        code: "pro",
        name: "Professional",
        priceCents: 9900,
        grantPoints: 1500,
        dailyTaskLimit: 150,
        dailyPointLimit: 1500,
        concurrentTaskLimit: 5,
        maxImageSizeMb: 20480
      }
    ]
  });

  await prisma.userMembership.create({
    data: {
      userId: user.id,
      planId: freePlan.id,
      status: "active",
      startedAt: new Date("2026-05-01T00:00:00.000Z"),
      expiresAt: null
    }
  });

  const rechargePackage = await prisma.rechargePackage.create({
    data: {
      name: "Points Pack 100",
      priceCents: 1000,
      points: 100,
      bonusPoints: 0,
      enabled: true,
      sortOrder: 1
    }
  });

  const registry = await prisma.registryAccount.create({
    data: {
      userId: user.id,
      provider: "harbor",
      name: "Demo Harbor Registry",
      registryUrl: "registry.example.test",
      namespace: "platform",
      usernameEncrypted: "encrypted_username_placeholder",
      passwordEncrypted: "encrypted_password_placeholder",
      secretKeyVersion: "v1",
      secretRotatedAt: new Date("2026-05-01T00:00:00.000Z"),
      status: "test_success",
      lastTestAt: new Date("2026-05-03T00:00:00.000Z")
    }
  });

  const workerRows = [
    { name: "worker-online", status: "online", executorType: "skopeo" },
    { name: "worker-maintenance", status: "maintenance", executorType: "crane" },
    { name: "worker-draining", status: "draining", executorType: "nerdctl" },
    { name: "worker-offline", status: "offline", executorType: "docker" },
    { name: "worker-disabled", status: "disabled", executorType: "skopeo" },
    { name: "worker-retired", status: "retired", executorType: "docker" },
    { name: "worker-deleted", status: "deleted", executorType: "skopeo" }
  ] as const;

  const workers = [];
  for (const worker of workerRows) {
    workers.push(
      await prisma.workerNode.create({
        data: {
          name: worker.name,
          status: worker.status,
          executorType: worker.executorType,
          tokenHash: `hash_${worker.name}_worker_token`,
          tokenVersion: 1,
          tokenRotatedAt: new Date("2026-05-01T00:00:00.000Z"),
          maxConcurrency: 2
        }
      })
    );
  }

  await Promise.all(
    workers.map((worker) =>
      prisma.workerHeartbeat.create({
        data: {
          workerId: worker.id,
          status: worker.status,
          currentTasks: worker.status === "online" ? 1 : 0,
          cpuUsage: 22.5,
          memoryUsage: 48.1,
          diskFreeBytes: BigInt(53_687_091_200)
        }
      })
    )
  );

  const tasks = await Promise.all([
    prisma.imageTask.create({
      data: {
        userId: user.id,
        registryAccountId: registry.id,
        assignedWorkerId: workers[0].id,
        sourceImage: "ghcr.io/example/api:v1.8",
        targetImage: "registry.example.test/platform/api:v1.8",
        architecture: "all",
        taskStatus: "succeeded",
        billingStatus: "settled",
        workerStatus: "completed",
        currentStage: "completed",
        estimatedPoints: 10,
        frozenPoints: 10,
        settledPoints: 7,
        estimatedSizeBytes: BigInt(4_939_212_390),
        pulledBytes: BigInt(4_939_212_390),
        pushedBytes: BigInt(4_939_212_390),
        sourceManifestDigest: "sha256:source-api-demo",
        targetManifestDigest: "sha256:target-api-demo",
        targetDigest: "sha256:target-api-demo",
        currentAttempt: 1,
        startedAt: new Date("2026-05-03T00:11:00.000Z"),
        finishedAt: new Date("2026-05-03T00:18:00.000Z"),
        settledAt: new Date("2026-05-03T00:18:30.000Z"),
        idempotencyKey: "task-success-20260503-000"
      }
    }),
    prisma.imageTask.create({
      data: {
        userId: user.id,
        registryAccountId: registry.id,
        assignedWorkerId: workers[0].id,
        sourceImage: "docker.io/library/nginx:latest",
        targetImage: "registry.example.test/ops/nginx:latest",
        architecture: "linux/amd64",
        taskStatus: "running",
        billingStatus: "frozen",
        workerStatus: "running",
        currentStage: "pushing",
        estimatedPoints: 8,
        frozenPoints: 8,
        estimatedSizeBytes: BigInt(5_583_457_484),
        pulledBytes: BigInt(4_080_218_931),
        pushedBytes: BigInt(3_865_470_566),
        sourceManifestDigest: "sha256:source-nginx-demo",
        currentAttempt: 1,
        startedAt: new Date("2026-05-03T00:22:00.000Z"),
        claimTokenHash: "hash_claim_running_task",
        claimExpiresAt: new Date("2026-05-03T00:32:00.000Z"),
        idempotencyKey: "task-running-20260503-001"
      }
    }),
    prisma.imageTask.create({
      data: {
        userId: user.id,
        registryAccountId: registry.id,
        assignedWorkerId: workers[2].id,
        sourceImage: "quay.io/coreos/etcd:v3.5",
        targetImage: "registry.example.test/ops/etcd:v3.5",
        architecture: "linux/amd64",
        taskStatus: "failed",
        billingStatus: "refunded",
        workerStatus: "completed",
        currentStage: "failed",
        estimatedPoints: 12,
        frozenPoints: 12,
        refundedPoints: 12,
        estimatedSizeBytes: BigInt(2_147_483_648),
        pulledBytes: BigInt(1_073_741_824),
        pushedBytes: BigInt(0),
        sourceManifestDigest: "sha256:source-etcd-demo",
        currentAttempt: 2,
        startedAt: new Date("2026-05-02T23:10:00.000Z"),
        finishedAt: new Date("2026-05-02T23:31:00.000Z"),
        refundedAt: new Date("2026-05-02T23:32:00.000Z"),
        idempotencyKey: "task-failed-20260502-118"
      }
    }),
    prisma.imageTask.create({
      data: {
        userId: user.id,
        registryAccountId: registry.id,
        sourceImage: "registry.k8s.io/pause:3.9",
        targetImage: "registry.example.test/ops/pause:3.9",
        architecture: "linux/amd64",
        taskStatus: "queued",
        billingStatus: "frozen",
        workerStatus: "unclaimed",
        currentStage: "queued",
        estimatedPoints: 3,
        frozenPoints: 3,
        idempotencyKey: "task-queued-20260502-119"
      }
    })
  ]);

  for (const task of tasks) {
    const attemptStatus = task.taskStatus === "failed" ? "failed" : task.taskStatus === "succeeded" ? "success" : "running";
    const stageStatus = task.taskStatus === "failed" ? "failed" : task.taskStatus === "succeeded" ? "success" : "running";
    const attemptNo = task.currentAttempt || 1;

    await prisma.imageTaskAttempt.create({
      data: {
        taskId: task.id,
        attemptNo,
        workerId: task.assignedWorkerId,
        status: attemptStatus,
        endedAt: task.finishedAt,
        errorCode: task.taskStatus === "failed" ? "TARGET_AUTH_FAILED" : null,
        errorMessage: task.taskStatus === "failed" ? "Target registry authentication failed." : null
      }
    });

    await prisma.imageTaskStage.createMany({
      data: [
        { taskId: task.id, attemptNo, stage: "submitted", status: "success" },
        { taskId: task.id, attemptNo, stage: "validating", status: "success" },
        { taskId: task.id, attemptNo, stage: task.currentStage, status: stageStatus }
      ]
    });

    await prisma.imageTaskLog.create({
      data: {
        taskId: task.id,
        attemptNo,
        level: task.taskStatus === "failed" ? "error" : "info",
        stage: task.currentStage,
        message: task.taskStatus === "failed" ? "TARGET_AUTH_FAILED; points refunded." : "P0 seed task log; no real registry copy."
      }
    });
  }

  const pointRows = [
    { type: "register_bonus", balanceDelta: 30, frozenDelta: 0, idempotencyKey: "seed-register-bonus" },
    { type: "freeze", balanceDelta: -8, frozenDelta: 8, idempotencyKey: "seed-freeze-running-task" },
    { type: "consume", balanceDelta: 3, frozenDelta: -10, idempotencyKey: "seed-settle-success-task" },
    { type: "refund", balanceDelta: 12, frozenDelta: -12, idempotencyKey: "seed-refund-failed-task" },
    { type: "manual_recharge", balanceDelta: 200, frozenDelta: 0, idempotencyKey: "seed-manual-recharge" },
    { type: "activity_grant", balanceDelta: 50, frozenDelta: 0, idempotencyKey: "seed-activity-grant" }
  ] as const;

  for (const row of pointRows) {
    await prisma.pointTransaction.create({
      data: {
        userId: user.id,
        type: row.type,
        balanceBefore: 100,
        frozenBefore: 0,
        balanceDelta: row.balanceDelta,
        frozenDelta: row.frozenDelta,
        balanceAfter: 100 + row.balanceDelta,
        frozenAfter: row.frozenDelta,
        refType: row.type,
        refId: user.id,
        idempotencyKey: row.idempotencyKey,
        operatorType: "system",
        remark: "P0 seed transaction"
      }
    });
  }

  const order = await prisma.rechargeOrder.create({
    data: {
      orderNo: "ord-20260503-002",
      userId: user.id,
      packageId: rechargePackage.id,
      orderType: "manual",
      payChannel: "manual",
      status: "paid",
      amountCents: 2000,
      points: 200,
      snapshotJson: { packageName: "Points Pack 100", p0: true },
      paidAt: new Date("2026-05-03T00:21:00.000Z"),
      idempotencyKey: "seed-order-manual-recharge"
    }
  });

  await prisma.paymentRecord.create({
    data: {
      orderId: order.id,
      provider: "manual",
      amountCents: 2000,
      status: "paid",
      paidAt: new Date("2026-05-03T00:21:00.000Z"),
      rawPayload: { provider: "manual", source: "seed" },
      idempotencyKey: "seed-payment-manual-recharge"
    }
  });

  const activity = await prisma.activity.create({
    data: {
      title: "P0 onboarding points",
      type: "claim_points",
      rewardPoints: 50,
      status: "enabled",
      startAt: new Date("2026-05-01T00:00:00.000Z"),
      endAt: new Date("2026-05-07T23:59:59.000Z")
    }
  });

  const activityTransaction = await prisma.pointTransaction.findUniqueOrThrow({
    where: { idempotencyKey: "seed-activity-grant" }
  });

  await prisma.activityClaim.create({
    data: {
      activityId: activity.id,
      userId: user.id,
      pointTransactionId: activityTransaction.id,
      idempotencyKey: "seed-activity-claim-user-1"
    }
  });

  await prisma.userMessage.createMany({
    data: [
      { userId: user.id, type: "task", title: "Task completed", content: "The demo successful task is completed.", refType: "image_task", refId: tasks[0].id },
      { userId: user.id, type: "task", title: "Task failed and points refunded", content: "The failed demo task was refunded.", refType: "image_task", refId: tasks[2].id },
      { userId: user.id, type: "order", title: "Manual recharge credited", content: "Manual recharge seed points were credited.", refType: "order", refId: order.id },
      { userId: user.id, type: "points", title: "Activity points credited", content: "Activity reward seed points were credited.", refType: "activity", refId: activity.id },
      { userId: user.id, type: "announcement", title: "System announcement", content: "P0 seed announcement is available." }
    ]
  });

  await prisma.announcement.create({
    data: {
      title: "P0 backend scaffold online",
      content: "P0 seed announcement.",
      status: "published",
      publishedAt: new Date("2026-05-02T09:00:00.000Z"),
      createdBy: admin.id
    }
  });

  await prisma.helpArticle.create({
    data: {
      slug: "registry-credentials",
      title: "How to configure private registry credentials",
      content: "Use a Robot Account or token. Never expose plaintext credentials.",
      category: "registry",
      status: "published",
      publishedAt: new Date("2026-05-02T09:00:00.000Z")
    }
  });

  await prisma.errorCode.createMany({
    data: [
      { code: "TARGET_AUTH_FAILED", message: "Target registry authentication failed.", suggestion: "Check Robot Account or token." },
      { code: "TARGET_NAMESPACE_MISSING", message: "Target namespace or project does not exist.", suggestion: "Create namespace or project before submitting the task." },
      { code: "TARGET_PUSH_DENIED", message: "Target registry has no push permission.", suggestion: "Grant push permission to the test account." }
    ]
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: "seed_manual_recharge",
      targetType: "user",
      targetId: user.id,
      afterJson: { points: 200, orderNo: order.orderNo },
      ip: "127.0.0.1"
    }
  });

  await prisma.loginLog.createMany({
    data: [
      { actorType: "user", actorId: user.id, account: "ops@example.test", success: true, ip: "127.0.0.1", userAgent: "seed" },
      { actorType: "admin", actorId: admin.id, account: "super_admin", success: true, ip: "127.0.0.1", userAgent: "seed" }
    ]
  });

  await prisma.systemConfig.createMany({
    data: [
      { key: "site.basic", group: "basic", valueJson: { siteName: "ImgPull", registrationEnabled: true, registerBonusPoints: 30 } },
      { key: "task.limits", group: "task", valueJson: { maxSingleTaskSizeGb: 20, defaultArchitecture: "linux/amd64", maxRetryCount: 1 } },
      { key: "billing.points", group: "billing", valueJson: { pointUnitPriceCents: 10, freezeMultiplier: 1, failedRefundPolicy: "full_refund" } },
      { key: "worker.runtime", group: "worker", valueJson: { leaseTtlSeconds: 300, heartbeatTimeoutSeconds: 90, maxConcurrencyPerNode: 2 } },
      { key: "payment.channels", group: "payment", valueJson: { manual: true, alipay: false, wechat: false } },
      { key: "notification.site_messages", group: "notification", valueJson: { siteMessageEnabled: true } }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
