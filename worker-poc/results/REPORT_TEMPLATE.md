# Worker POC 测试报告模板

## 基本信息

- 测试时间：
- 测试人员：
- 测试环境：
- 操作系统：
- 网络环境：

## 工具版本

- skopeo version：
- crane version：
- jq version：
- docker version，可选：

## 镜像配置

- source image：
- target image：
- TARGET_IMAGE_CRANE：
- COPY_ALL_ARCH：
- PLATFORM：

## 执行结果

- skopeo inspect 是否成功：
- skopeo copy 是否成功：
- crane copy 是否成功：
- verify target digest 是否成功：

## Digest 记录

- source digest：
- target digest：
- digest 是否一致：
- digest 不一致原因判断：
  - 多架构 manifest 差异：
  - 单平台复制：
  - registry 重写 manifest：
  - 工具行为差异：
  - 其他：

## 日志路径

- source inspect JSON：
- source summary：
- skopeo copy log：
- crane copy log：
- verify digest report：
- 其他错误日志：

## 平台错误码映射

- 是否能映射到平台错误码：
- 建议错误码：
- 错误说明：

可选错误码参考：

- SOURCE_NOT_FOUND
- TARGET_AUTH_FAILED
- TARGET_NAMESPACE_MISSING
- TARGET_PUSH_DENIED
- NETWORK_TIMEOUT
- REGISTRY_TLS_ERROR
- DIGEST_VERIFY_FAILED

## 本 Case 结论

- 结论：
- 是否通过：
- 后续动作：

## 凭据安全确认

- 未在报告中记录账号、密码、token：
- 未提交 `.env`：
- 未提交 authfile：
