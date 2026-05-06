# 14 闭环审计

## 用户任务闭环

| 环节 | P0 前端演示 | 真实上线要求 |
| --- | --- | --- |
| 登录 | Mock Auth | session token + tokenHash |
| 仓库配置 | Mock 表单 | 加密保存凭据 |
| 项目维护 | 手动 mock | 手动维护，P1 自动同步 |
| 创建任务 | Mock | 数据库事务 |
| 积分冻结 | Mock 展示 | PointAccount + PointTransaction |
| Worker 执行 | 不执行 | claim / lease / copy |
| 日志 | Mock | attempt / stage / logs |
| 成功结算 | Mock | 事务结算 |
| 失败返还 | Mock | 事务返还 |
| 消息通知 | Mock | user_messages |

## 批量导入闭环

P0 前端演示：

- 多行粘贴。
- 解析预览。
- 重复、格式错误、超过上限提示。
- 多目标项目选择。
- 任务数 = 源镜像数 x 目标项目数。
- 提交后展示 batchNo 和 taskNo。

真实上线要求：

- 创建 ImageTaskBatch。
- 为每个源镜像和目标项目创建独立 ImageTask。
- 每条任务独立冻结积分。
- 幂等创建。
- 任务归属校验。

## 积分闭环

P0 展示：

- 可用积分。
- 冻结积分。
- 预计积分。
- 消费积分。
- 返还积分。
- 人工充值。

真实上线要求：

- PointAccount。
- PointTransaction。
- 事务更新。
- 乐观锁 version。
- 幂等键。

## 人工充值闭环

必须同时写入：

- RechargeOrder。
- PaymentRecord。
- PointTransaction。
- PointAccount。
- AdminAuditLog。
- UserMessage。

该闭环不能用普通积分修正替代。

## Worker 闭环

当前只展示 mock。

真实 Worker 前必须补：

- Worker 程序。
- Worker Docker 镜像或 Linux 二进制。
- X-Worker-Token。
- X-Claim-Token。
- heartbeat。
- claim。
- lease renew。
- control。
- credentials resolve。
- stage。
- logs。
- complete。
- fail。
- cancel ack。
- cleanup done。

## 凭据闭环

P0 文档要求：

- 管理员不可查看明文。
- 日志不可输出密钥。
- Worker 只获取短期凭据。
- 每任务独立 authfile。
- 任务结束清理临时文件。

真实上线前必须实现加密、密钥版本、轮换和解密审计。

## 支付闭环

P0：

- 人工充值闭环成立。
- 支付宝 / 微信支付只预留。

真实上线前必须：

- 接 SDK。
- 生成订单。
- 支付二维码。
- 回调验签。
- 金额校验。
- 幂等到账。
- 对账。

## 帮助与错误排查闭环

P0：

- 帮助文档中心。
- Markdown 文章详情。
- 管理员文章管理 mock。
- 错误码中心。

真实上线前：

- 后端存储。
- 搜索。
- 发布流程。
- 错误码和 Worker 错误映射。

## 合规闭环

P0：

- Footer。
- ICP / 公安备案待配置。
- 服务条款和隐私政策占位。

上线前：

- 配置真实 ICP。
- 配置真实公安备案。
- 完成正式条款。
- 完成正式隐私政策。
- 配置联系方式。
