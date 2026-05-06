# 03 计费、积分与会员

## P0 计费口径

P0 以积分为核心：

- 用户注册可获得赠送积分。
- 活动可赠送积分。
- 管理员可人工充值积分。
- 会员套餐可预留每日额度或月度赠送积分。
- 真实支付宝 / 微信支付只做模型和 UI 预留，不接 SDK，不生成二维码，不做真实回调。

## PointAccount 与 PointTransaction

积分需要拆成账户和流水：

### PointAccount

负责当前余额：

- `balancePoints`
- `frozenPoints`
- `totalEarnedPoints`
- `totalConsumedPoints`
- `version`

### PointTransaction

负责流水审计：

- `balanceBefore`
- `frozenBefore`
- `balanceDelta`
- `frozenDelta`
- `balanceAfter`
- `frozenAfter`
- `type`
- `refType`
- `refId`
- `idempotencyKey`

冻结、结算、返还、人工充值必须在数据库事务中同时更新 PointAccount 和 PointTransaction。

## 积分流水示例

冻结 10 积分：

```text
balance_delta = -10
frozen_delta = +10
```

成功消费 7，退回差额 3：

```text
balance_delta = +3
frozen_delta = -10
```

失败全额返还 10：

```text
balance_delta = +10
frozen_delta = -10
```

管理员人工充值 100：

```text
balance_delta = +100
frozen_delta = 0
type = manual_recharge
```

## 多目标和批量导入计费

规则：

```text
1 个源镜像 + 1 个目标项目 = 1 条独立 ImageTask
```

因此：

```text
预计冻结总积分 = 单条预计积分之和
```

示例：

```text
50 个源镜像 x 3 个目标项目 = 150 条 ImageTask
```

每条任务独立冻结、执行、成功、失败和返还。某一条失败不会影响其他任务。

P0 上限：

- 源镜像最多 50 行。
- 目标项目最多 3 个。
- 单次最多 150 条 ImageTask。

## 人工充值闭环

P0 必须支持管理员手动充值：

1. 用户在积分中心查看人工充值说明。
2. 用户线下付款或联系管理员。
3. 管理员后台选择用户，输入金额、到账积分和备注。
4. 系统创建 `recharge_order`。
5. 系统创建 `payment_record`，`provider = manual`。
6. 系统写入 `point_transactions`，`type = manual_recharge`。
7. 系统增加 PointAccount 余额。
8. 系统写入 `admin_audit_logs`。
9. 系统发送 `user_messages` 通知用户到账。

人工充值接口必须幂等，必须要求 `idempotencyKey`。

## 积分修正与人工充值的区别

- `manual_recharge`：人工充值，有订单和支付记录。
- `admin_adjust`：管理员修正积分，不一定有订单。

两者不能混用。

## 订单和支付模型

`recharge_orders`：

- `orderType = points / membership / manual`
- `payChannel = manual / alipay / wechat`
- `status = pending / paid / closed / refunded / failed`
- `amountCents`
- `points`
- `paidAt`
- `closedAt`
- `idempotencyKey`

`payment_records`：

- `provider = manual / alipay / wechat`
- `providerTradeNo`
- `amountCents`
- `status`
- `paidAt`
- `rawPayload`
- `idempotencyKey`

## 支付宝 / 微信支付边界

P0 不实现：

- 真实支付宝支付。
- 真实微信支付。
- 支付二维码。
- 支付 SDK。
- 自动回调到账。

P0 只预留：

- `POST /api/payments/alipay/notify`
- `POST /api/payments/wechat/notify`

后续真实接入必须完成：

- 签名验签。
- 金额校验。
- 订单状态幂等。
- 重复回调处理。
- 到账幂等。

## 会员关系

P0 保留会员模型：

- 普通会员。
- 专业会员。
- 充值包。

P0 可展示套餐和权益，但不做自动续费。用户会员关系使用 `UserMembership` 预留。
