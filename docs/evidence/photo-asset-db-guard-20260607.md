# 客片底片 object_key 数据库保护验证 2026-06-07

## 结论

本地 PostgreSQL 测试库已执行私有 OSS 字段迁移和 object_key 保护迁移，约束验证通过。

## 环境

```text
container: yy-postgres
database: yingyue_cloud
PostgreSQL: 16.14
```

## 执行脚本

```powershell
Get-Content -LiteralPath backend\script\sql\postgres\postgres_yy_photo_private_oss_migration_20260606.sql -Raw -Encoding UTF8 | docker exec -i yy-postgres psql -U postgres -d yingyue_cloud -v ON_ERROR_STOP=1

Get-Content -LiteralPath backend\script\sql\postgres\postgres_yy_photo_asset_object_key_guard_20260607.sql -Raw -Encoding UTF8 | docker exec -i yy-postgres psql -U postgres -d yingyue_cloud -v ON_ERROR_STOP=1
```

## 执行结果

```text
private OSS migration: success
object_key guard migration: success
old visible blank object_key rows hidden: 2
duplicate active object_key rows cleaned: 0
```

## 约束验证

```text
visible active blank object_key count: 0
duplicate active object_key count: 0
constraint: ck_yy_photo_asset_visible_object_key
index: uk_yy_photo_asset_album_object_key_active
```

## 回归

迁移后重新执行客户取片 smoke：

```text
auth: success
albums: success count=1
detail: success albumId=903001, assetCount=2
preview-url: success
stream: success status=200, contentType=image/png
```

