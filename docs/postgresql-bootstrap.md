# 影约云 PostgreSQL 初始化说明

## 结论

正式企业版默认使用 `PostgreSQL` 作为主库。RuoYi 基础表、SnailJob、Workflow 和影约云 `yy_` 业务表都应初始化到同一个业务库，例如 `yingyue_cloud`。

## 本地初始化

1. 创建数据库：

```powershell
createdb -h 127.0.0.1 -p 5432 -U postgres yingyue_cloud
```

2. 导入基础表和影约云业务表：

```powershell
cd D:\OtherProject\CameraApp\RuoYi-Vue-Plus-5.X
.\tools\import-yy-cloud.ps1 -Engine postgres -DbHost 127.0.0.1 -Port 5432 -Database yingyue_cloud -User postgres -IncludeBaseSchema -IncludeDemoData
```

3. 启动后端前设置环境变量：

```powershell
$env:DB_URL="jdbc:postgresql://127.0.0.1:5432/yingyue_cloud?useUnicode=true&characterEncoding=utf8&sslmode=disable&reWriteBatchedInserts=true"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="你的本地数据库密码"
$env:REDIS_PASSWORD="你的本地Redis密码"
```

## SQL 执行顺序

如果手动执行 SQL，顺序固定为：

1. `script/sql/postgres/postgres_ry_vue_5.X.sql`
2. `script/sql/postgres/postgres_ry_job.sql`
3. `script/sql/postgres/postgres_ry_workflow.sql`
4. `script/sql/postgres/postgres_yy_cloud.sql`
5. `script/sql/postgres/postgres_yy_cloud_codegen.sql`
6. `script/sql/postgres/postgres_yy_cloud_demo_data.sql`

## 上传 GitHub 注意

- 不上传真实 `.env`、数据库密码、Redis 密码、渠道 `app_secret`、`access_token`。
- `application-dev.yml` 和 `application-prod.yml` 只保留环境变量占位。
- 生产环境必须通过服务器环境变量或部署平台密钥管理注入真实口令。
