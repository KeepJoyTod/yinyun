# 影约云部署包本地证据 2026-06-07

## 结论

本地已生成不含真实密钥的 Spring Boot API 部署包，目录位于 `dist\yingyue-api-deploy`。`dist/` 已在 `.gitignore` 中，不会进入仓库提交。

## 命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\yingyue-build-deploy-package.ps1
```

## 输出摘要

```text
yingyue deploy package created
output: D:\OtherProject\CameraApp\yingyue-cloud-repo\dist\yingyue-api-deploy
commit: 1ea962c
```

## 包内容

| 文件 | 用途 |
| --- | --- |
| `backend/ruoyi-admin.jar` | Spring Boot API 运行包 |
| `backend/.env.production.example` | 生产环境变量模板，不含真实密钥 |
| `deploy/yingyue-admin.service.example` | systemd 服务模板 |
| `conf/nginx/yingyue-api.nginx.example.conf` | Nginx API 反代模板 |
| `conf/caddy/YingyueApi.Caddyfile.example` | Caddy API 反代模板 |
| `sql/postgres/postgres_yy_photo_private_oss_migration_20260606.sql` | 私有 OSS 字段迁移 |
| `sql/postgres/postgres_yy_photo_asset_object_key_guard_20260607.sql` | `object_key` 数据库保护 |
| `sql/postgres/postgres_ry_vue_5.X.sql` | RuoYi 基础表 |
| `sql/postgres/postgres_ry_job.sql` | 定时任务基础表 |
| `sql/postgres/postgres_ry_workflow.sql` | 工作流基础表 |
| `sql/postgres/postgres_yy_cloud.sql` | 影约云业务基础表 |
| `sql/postgres/postgres_yy_cloud_codegen.sql` | 代码生成配置 |
| `sql/postgres/postgres_yy_cloud_demo_data.sql` | 测试/demo 数据，生产可跳过 |
| `tools/yingyue-production-preflight.ps1` | 生产预检脚本 |
| `tools/photo-pickup-smoke.ps1` | 客户取片 smoke 脚本 |
| `docs/*.md` | 部署和验证说明 |

## 安全检查

已对提交范围内的新增脚本/文档做敏感词扫描，未命中真实 AccessKey、AppSecret、GitHub token 或数据库密码。
