# 部署说明

## 服务器前置条件

- Docker / Docker Compose
- 一个已解析到服务器的域名
- 服务器开放 `80`、`443` 端口
- PostgreSQL 数据盘备份策略

## 环境变量

本地开发复制 `.env.example` 为 `.env`。生产部署复制 `.env.production.example` 为 `.env.production`，至少修改：

```env
DATABASE_URL="postgresql://camera:strong-password@postgres:5432/camera_studio?schema=public"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
AUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="https://your-domain.example"
APP_DOMAIN="your-domain.example"
CADDY_EMAIL="admin@your-domain.example"
ADMIN_PHONE="17863026867"
ADMIN_PASSWORD="change-before-production"
POSTGRES_DB="camera_studio"
POSTGRES_USER="camera"
POSTGRES_PASSWORD="strong-password"
```

## 本地开发流程

```powershell
npm install
docker compose up -d
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

## 生产 Docker 部署

```bash
cp .env.production.example .env.production
# 修改 .env.production 里的 DATABASE_URL、AUTH_SECRET、POSTGRES_PASSWORD、ADMIN_PASSWORD、APP_DOMAIN、CADDY_EMAIL
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec web npm run prisma:seed
```

生产访问：

```text
https://你的域名/login
```

服务健康检查：

```bash
curl -fsS https://你的域名/api/health
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100 web
docker compose -f docker-compose.prod.yml logs --tail=100 caddy
```

## 数据备份

Linux 服务器：

```bash
chmod +x tools/backup-postgres.sh
./tools/backup-postgres.sh
```

Windows PowerShell：

```powershell
.\tools\backup-postgres.ps1
```

脚本默认输出到 `backups/`，保留 14 天。生产上建议加 cron：

```cron
10 3 * * * cd /opt/camera-studio && ./tools/backup-postgres.sh >> backups/backup.log 2>&1
```

## 恢复数据

```bash
cat backups/camera_studio_YYYYMMDD-HHMMSS.sql | docker compose -f docker-compose.prod.yml exec -T postgres sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
```

## 文件存储

V1 客片选片使用照片 URL 或服务器本地挂载路径。生产 compose 已挂载：

```text
camera_studio_uploads -> /app/public/uploads
```

后续如果要接 S3、MinIO 或 OSS，只需要把客片照片 URL 改成对象存储公网或签名访问地址。

## 部署验证命令

```bash
docker compose -f docker-compose.prod.yml config
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec web npx prisma migrate deploy
docker compose -f docker-compose.prod.yml exec web npm run prisma:seed
curl -fsS https://你的域名/api/health
```

## 上线检查

- `/dashboard` 未登录会跳转 `/login`。
- `/api/health` 返回 `ok: true`，数据库状态为 `ok`。
- `/booking` 可打开，客户预约提交后生成订单。
- 后台订单可确认、开始服务、完成、取消。
- 后台产品可新增、编辑、上架、下架。
- 后台门店、员工、服务组、客户、通知、统计、客片选片可打开。
- 客片相册可发布，分享链接 `/photo-albums/share/<token>` 可提交选片。
- 备份脚本能生成 `.sql` 文件。
- `npm test`、`npm run typecheck`、`npm run build` 通过。
