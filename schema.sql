CREATE DATABASE IF NOT EXISTS img_sync_platform
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE img_sync_platform;

CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `username` VARCHAR(64) NOT NULL COMMENT 'unique username',
  `email` VARCHAR(128) NOT NULL COMMENT 'unique email',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'password hash',
  `status` VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT 'active disabled pending',
  `user_type` VARCHAR(16) NOT NULL DEFAULT 'user' COMMENT 'user admin',
  `email_verified` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'email verified flag',
  `last_login_at` DATETIME NULL DEFAULT NULL COMMENT 'last login time',
  `last_login_ip` VARCHAR(64) NULL DEFAULT NULL COMMENT 'last login ip',
  `deleted_at` DATETIME NULL DEFAULT NULL COMMENT 'soft delete time',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'updated time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_status` (`status`),
  KEY `idx_users_user_type` (`user_type`),
  KEY `idx_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='users';

CREATE TABLE `plans` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `code` VARCHAR(32) NOT NULL COMMENT 'plan code',
  `name` VARCHAR(64) NOT NULL COMMENT 'plan name',
  `price_month` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'monthly price',
  `price_year` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'yearly price',
  `daily_sync_limit` INT NOT NULL DEFAULT 0 COMMENT 'daily sync limit',
  `monthly_sync_limit` INT NOT NULL DEFAULT 0 COMMENT 'monthly sync limit',
  `max_batch_size` INT NOT NULL DEFAULT 1 COMMENT 'max batch size',
  `max_concurrent_tasks` INT NOT NULL DEFAULT 1 COMMENT 'max concurrent tasks',
  `max_registry_accounts` INT NOT NULL DEFAULT 1 COMMENT 'max registries',
  `api_enabled` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'api enabled',
  `api_daily_limit` INT NOT NULL DEFAULT 0 COMMENT 'api daily limit',
  `max_image_size_bytes` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'max image size',
  `max_task_duration_seconds` INT NOT NULL DEFAULT 0 COMMENT 'max task duration',
  `log_retention_days` INT NOT NULL DEFAULT 7 COMMENT 'log retention days',
  `status` VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT 'active inactive',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'updated time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_plans_code` (`code`),
  KEY `idx_plans_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='plans';

CREATE TABLE `user_subscriptions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'user id',
  `plan_id` BIGINT UNSIGNED NOT NULL COMMENT 'plan id',
  `subscription_type` VARCHAR(32) NOT NULL DEFAULT 'free' COMMENT 'free monthly yearly manual',
  `status` VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT 'active expired canceled',
  `started_at` DATETIME NOT NULL COMMENT 'started at',
  `expired_at` DATETIME NOT NULL COMMENT 'expired at',
  `auto_renew` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'auto renew',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'updated time',
  PRIMARY KEY (`id`),
  KEY `idx_user_subscriptions_user_status` (`user_id`, `status`),
  KEY `idx_user_subscriptions_plan_id` (`plan_id`),
  KEY `idx_user_subscriptions_expired_at` (`expired_at`),
  CONSTRAINT `fk_user_subscriptions_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_user_subscriptions_plan_id`
    FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='user subscriptions';

CREATE TABLE `user_usage_counters` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'user id',
  `period_type` VARCHAR(16) NOT NULL COMMENT 'day month',
  `period_value` VARCHAR(16) NOT NULL COMMENT 'period value',
  `sync_success_count` INT NOT NULL DEFAULT 0 COMMENT 'sync success count',
  `api_call_count` INT NOT NULL DEFAULT 0 COMMENT 'api call count',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'updated time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_usage_counters_period` (`user_id`, `period_type`, `period_value`),
  KEY `idx_user_usage_counters_user_id` (`user_id`),
  CONSTRAINT `fk_user_usage_counters_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='user usage counters';

CREATE TABLE `registry_accounts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'user id',
  `name` VARCHAR(64) NOT NULL COMMENT 'registry name',
  `registry_type` VARCHAR(32) NOT NULL COMMENT 'harbor acr tcr',
  `registry_host` VARCHAR(255) NOT NULL COMMENT 'registry host',
  `region` VARCHAR(64) NULL DEFAULT NULL COMMENT 'region',
  `namespace_name` VARCHAR(128) NOT NULL COMMENT 'namespace or project',
  `username` VARCHAR(128) NOT NULL COMMENT 'login username',
  `secret_encrypted` TEXT NOT NULL COMMENT 'encrypted password or token',
  `is_default` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'default registry flag',
  `status` VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT 'active invalid disabled',
  `last_test_status` VARCHAR(32) NOT NULL DEFAULT 'untested' COMMENT 'success failed untested',
  `last_test_code` VARCHAR(64) NULL DEFAULT NULL COMMENT 'test code',
  `last_test_message` VARCHAR(500) NULL DEFAULT NULL COMMENT 'test message',
  `last_tested_at` DATETIME NULL DEFAULT NULL COMMENT 'last tested at',
  `remark` VARCHAR(255) NULL DEFAULT NULL COMMENT 'remark',
  `deleted_at` DATETIME NULL DEFAULT NULL COMMENT 'soft delete time',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'updated time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_registry_accounts_user_registry` (`user_id`, `registry_host`, `namespace_name`, `username`),
  KEY `idx_registry_accounts_user_id` (`user_id`),
  KEY `idx_registry_accounts_is_default` (`user_id`, `is_default`),
  KEY `idx_registry_accounts_status` (`status`),
  KEY `idx_registry_accounts_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_registry_accounts_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='registry accounts';

CREATE TABLE `api_keys` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'user id',
  `name` VARCHAR(64) NOT NULL COMMENT 'api key name',
  `key_prefix` VARCHAR(32) NOT NULL COMMENT 'key prefix',
  `key_hash` VARCHAR(255) NOT NULL COMMENT 'key hash',
  `scope` VARCHAR(255) NULL DEFAULT NULL COMMENT 'permission scope',
  `status` VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT 'active revoked',
  `last_used_at` DATETIME NULL DEFAULT NULL COMMENT 'last used at',
  `expired_at` DATETIME NULL DEFAULT NULL COMMENT 'expired at',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'updated time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_api_keys_key_prefix` (`key_prefix`),
  KEY `idx_api_keys_user_status` (`user_id`, `status`),
  CONSTRAINT `fk_api_keys_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='api keys';

CREATE TABLE `worker_nodes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `node_code` VARCHAR(64) NOT NULL COMMENT 'node code',
  `node_name` VARCHAR(64) NOT NULL COMMENT 'node name',
  `region` VARCHAR(64) NOT NULL COMMENT 'node region',
  `status` VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT 'active inactive maintenance',
  `health_status` VARCHAR(32) NOT NULL DEFAULT 'healthy' COMMENT 'healthy unhealthy',
  `weight` INT NOT NULL DEFAULT 100 COMMENT 'schedule weight',
  `current_load` INT NOT NULL DEFAULT 0 COMMENT 'current load',
  `current_task_count` INT NOT NULL DEFAULT 0 COMMENT 'current task count',
  `last_heartbeat_at` DATETIME NULL DEFAULT NULL COMMENT 'last heartbeat at',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'updated time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_worker_nodes_node_code` (`node_code`),
  KEY `idx_worker_nodes_status` (`status`),
  KEY `idx_worker_nodes_health_status` (`health_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='worker nodes';

CREATE TABLE `sync_tasks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `task_no` VARCHAR(64) NOT NULL COMMENT 'task number',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'user id',
  `registry_account_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'registry account id',
  `request_source` VARCHAR(32) NOT NULL DEFAULT 'web' COMMENT 'web api admin',
  `registry_type_snapshot` VARCHAR(32) NOT NULL COMMENT 'registry type snapshot',
  `registry_host_snapshot` VARCHAR(255) NOT NULL COMMENT 'registry host snapshot',
  `namespace_snapshot` VARCHAR(128) NOT NULL COMMENT 'namespace snapshot',
  `overwrite_on_exists` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'overwrite on exists',
  `total_count` INT NOT NULL DEFAULT 0 COMMENT 'total count',
  `success_count` INT NOT NULL DEFAULT 0 COMMENT 'success count',
  `failed_count` INT NOT NULL DEFAULT 0 COMMENT 'failed count',
  `canceled_count` INT NOT NULL DEFAULT 0 COMMENT 'canceled count',
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending_validate' COMMENT 'pending_validate queued running partial_success success failed canceled',
  `cancel_requested_at` DATETIME NULL DEFAULT NULL COMMENT 'cancel requested at',
  `canceled_at` DATETIME NULL DEFAULT NULL COMMENT 'canceled at',
  `canceled_by` VARCHAR(32) NULL DEFAULT NULL COMMENT 'user admin system',
  `error_summary` VARCHAR(500) NULL DEFAULT NULL COMMENT 'task error summary',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  `started_at` DATETIME NULL DEFAULT NULL COMMENT 'started time',
  `finished_at` DATETIME NULL DEFAULT NULL COMMENT 'finished time',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'updated time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sync_tasks_task_no` (`task_no`),
  KEY `idx_sync_tasks_user_status_created` (`user_id`, `status`, `created_at`),
  KEY `idx_sync_tasks_registry_account_id` (`registry_account_id`),
  KEY `idx_sync_tasks_request_source` (`request_source`),
  CONSTRAINT `fk_sync_tasks_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_sync_tasks_registry_account_id`
    FOREIGN KEY (`registry_account_id`) REFERENCES `registry_accounts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='sync tasks';

CREATE TABLE `sync_task_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `task_id` BIGINT UNSIGNED NOT NULL COMMENT 'task id',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'user id',
  `node_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'worker node id',
  `source_input` VARCHAR(255) NOT NULL COMMENT 'raw user input',
  `source_registry` VARCHAR(128) NOT NULL COMMENT 'source registry',
  `source_namespace` VARCHAR(255) NOT NULL COMMENT 'source namespace',
  `source_repo` VARCHAR(255) NOT NULL COMMENT 'source repo',
  `source_tag` VARCHAR(128) NOT NULL COMMENT 'source tag',
  `resolved_source_ref` VARCHAR(500) NOT NULL COMMENT 'resolved source ref',
  `target_registry` VARCHAR(191) NOT NULL COMMENT 'target registry',
  `target_namespace` VARCHAR(128) NOT NULL COMMENT 'target namespace',
  `target_repo` VARCHAR(191) NOT NULL COMMENT 'target repo',
  `target_tag` VARCHAR(64) NOT NULL COMMENT 'target tag',
  `resolved_target_ref` VARCHAR(500) NOT NULL COMMENT 'resolved target ref',
  `overwrite_on_exists` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'overwrite existing tag',
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending_validate' COMMENT 'pending_validate validated queued pulling tagging pushing success failed canceled',
  `auto_retry_count` INT NOT NULL DEFAULT 0 COMMENT 'auto retry count',
  `manual_retry_count` INT NOT NULL DEFAULT 0 COMMENT 'manual retry count',
  `image_size_bytes` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'image size bytes',
  `cancel_requested_at` DATETIME NULL DEFAULT NULL COMMENT 'cancel requested at',
  `canceled_at` DATETIME NULL DEFAULT NULL COMMENT 'canceled at',
  `started_at` DATETIME NULL DEFAULT NULL COMMENT 'started at',
  `finished_at` DATETIME NULL DEFAULT NULL COMMENT 'finished at',
  `error_code` VARCHAR(64) NULL DEFAULT NULL COMMENT 'error code',
  `error_message` VARCHAR(1000) NULL DEFAULT NULL COMMENT 'error message',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'updated time',
  PRIMARY KEY (`id`),
  KEY `idx_sync_task_items_task_status` (`task_id`, `status`),
  KEY `idx_sync_task_items_user_status` (`user_id`, `status`),
  KEY `idx_sync_task_items_node_status` (`node_id`, `status`),
  KEY `idx_sync_task_items_target_ref` (`user_id`, `target_registry`, `target_namespace`, `target_repo`, `target_tag`),
  CONSTRAINT `fk_sync_task_items_task_id`
    FOREIGN KEY (`task_id`) REFERENCES `sync_tasks` (`id`),
  CONSTRAINT `fk_sync_task_items_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_sync_task_items_node_id`
    FOREIGN KEY (`node_id`) REFERENCES `worker_nodes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='sync task items';

CREATE TABLE `sync_task_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `task_id` BIGINT UNSIGNED NOT NULL COMMENT 'task id',
  `task_item_id` BIGINT UNSIGNED NOT NULL COMMENT 'task item id',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'user id',
  `stage` VARCHAR(32) NOT NULL COMMENT 'validate pull tag push system',
  `level` VARCHAR(16) NOT NULL DEFAULT 'info' COMMENT 'info warn error',
  `message` TEXT NOT NULL COMMENT 'log message',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  PRIMARY KEY (`id`),
  KEY `idx_sync_task_logs_item_created` (`task_item_id`, `created_at`),
  KEY `idx_sync_task_logs_task_created` (`task_id`, `created_at`),
  CONSTRAINT `fk_sync_task_logs_task_id`
    FOREIGN KEY (`task_id`) REFERENCES `sync_tasks` (`id`),
  CONSTRAINT `fk_sync_task_logs_task_item_id`
    FOREIGN KEY (`task_item_id`) REFERENCES `sync_task_items` (`id`),
  CONSTRAINT `fk_sync_task_logs_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='sync task logs';

CREATE TABLE `synced_images` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'user id',
  `registry_account_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'registry account id',
  `task_id` BIGINT UNSIGNED NOT NULL COMMENT 'task id',
  `task_item_id` BIGINT UNSIGNED NOT NULL COMMENT 'task item id',
  `source_ref` VARCHAR(500) NOT NULL COMMENT 'source ref',
  `target_registry` VARCHAR(191) NOT NULL COMMENT 'target registry',
  `target_namespace` VARCHAR(128) NOT NULL COMMENT 'target namespace',
  `target_repo` VARCHAR(191) NOT NULL COMMENT 'target repo',
  `target_tag` VARCHAR(64) NOT NULL COMMENT 'target tag',
  `target_ref` VARCHAR(500) NOT NULL COMMENT 'target ref',
  `last_synced_at` DATETIME NOT NULL COMMENT 'last synced at',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'updated time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_synced_images_user_target` (`user_id`, `target_registry`, `target_namespace`, `target_repo`, `target_tag`),
  KEY `idx_synced_images_last_synced_at` (`last_synced_at`),
  KEY `idx_synced_images_registry_account_id` (`registry_account_id`),
  CONSTRAINT `fk_synced_images_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_synced_images_registry_account_id`
    FOREIGN KEY (`registry_account_id`) REFERENCES `registry_accounts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_synced_images_task_id`
    FOREIGN KEY (`task_id`) REFERENCES `sync_tasks` (`id`),
  CONSTRAINT `fk_synced_images_task_item_id`
    FOREIGN KEY (`task_item_id`) REFERENCES `sync_task_items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='synced images';
