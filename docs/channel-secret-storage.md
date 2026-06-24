# 渠道凭证存储规范

更新日期：2026-06-02

## 结论

渠道账号里的 `client_secret`、访问令牌、刷新令牌按敏感数据处理：

- 数据库字段：`yy_channel_account.app_secret_enc`、`access_token_enc`、`refresh_token_enc`
- 后端实体：已接入 RuoYi `@EncryptField`
- 后台接口：列表、详情、导出不回显明文，只返回 `******`
- 后台编辑：字段留空或保持 `******` 时保留原值，只有填写新值才覆盖

## 生产配置

默认配置里 `mybatis-encryptor.enable=false`。生产环境建议开启：

```yaml
mybatis-encryptor:
  enable: true
  algorithm: BASE64
  encode: BASE64
```

更正式的生产环境建议把算法改为 `AES` 或 `SM4`，并通过环境变量或服务器密钥管理注入 `password`，不要写进 Git：

```yaml
mybatis-encryptor:
  enable: true
  algorithm: AES
  encode: BASE64
  password: ${YY_MYBATIS_ENCRYPT_PASSWORD}
```

## 使用规则

1. 新增渠道账号时，填写真实 `client_secret` 或 token。
2. 保存后再次打开，只能看到 `******`。
3. 编辑账号时，如果不想改密钥，保持 `******` 或清空字段。
4. 需要换密钥时，直接输入新密钥保存。
5. 不在日志、导出文件、截图、聊天记录里展示真实密钥。

## 当前覆盖范围

| 字段 | 行为 |
| --- | --- |
| `app_secret_enc` | 入库加密、出库解密后接口脱敏 |
| `access_token_enc` | 入库加密、出库解密后接口脱敏 |
| `refresh_token_enc` | 入库加密、出库解密后接口脱敏 |

抖音来客、抖音服务市场、美团、微信生态都复用这一套渠道账号模型。
