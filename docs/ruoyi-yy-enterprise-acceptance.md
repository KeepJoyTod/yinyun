# 影约云企业版验收说明

日期：2026-06-01

## 结论

正式企业版主线已切到 `RuoYi-Vue-Plus-5.X + plus-ui`，并完成影约云 `yy` 业务骨架、菜单、表结构、代码生成配置、演示数据和 7 个标红功能的前后端落点。

## 当前交付物

- 后端模块：`RuoYi-Vue-Plus-5.X/ruoyi-modules/ruoyi-yy`
- 前端页面：`plus-ui/src/views/yy/**`
- 前端 API：`plus-ui/src/api/yy/**`
- 数据脚本：
  - `RuoYi-Vue-Plus-5.X/script/sql/yy_cloud.sql`
  - `RuoYi-Vue-Plus-5.X/script/sql/yy_cloud_codegen.sql`
  - `RuoYi-Vue-Plus-5.X/script/sql/yy_cloud_demo_data.sql`
  - `RuoYi-Vue-Plus-5.X/script/sql/postgres/postgres_yy_cloud.sql`
  - `RuoYi-Vue-Plus-5.X/script/sql/postgres/postgres_yy_cloud_codegen.sql`
  - `RuoYi-Vue-Plus-5.X/script/sql/postgres/postgres_yy_cloud_demo_data.sql`
- 导入脚本：`RuoYi-Vue-Plus-5.X/tools/import-yy-cloud.ps1`
- 页面验证脚本：`tools/verify-yy-plus-ui.cjs`

## 7 个标红功能

| 编号 | 页面 | 当前状态 |
| --- | --- | --- |
| B-029 | 预约订单列表 | 已接入 |
| B-002 | 预约概况 | 已接入 |
| B-008 | 门店管理 | 已接入 |
| B-022 | 在线选片配置 | 已接入 |
| C-020 | 底片/选片 | 已接入 |
| B-026 | 抖音产品 | 已接入服务市场平台应用占位与插件框架 |
| B-027 | 美团产品 | 已接入占位与插件框架 |

## 已验证项

- 后端编译：`mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests compile`
- 前端构建：`pnpm build:prod`
- 页面 smoke：`tools/verify-yy-plus-ui.cjs`
- 数据校验：`yy_` 业务表、菜单、代码生成配置均已有 PostgreSQL 初始化脚本，正式库建议使用 `yingyue_cloud`

## 本地启动

1. 启动 PostgreSQL、Redis、后端、前端。
2. 后端登录默认使用：
   - 账号：`admin`
   - 密码：`admin123`
   - 租户：`000000`
3. 前端访问 `http://localhost:5174/`

## 导入命令

```powershell
cd RuoYi-Vue-Plus-5.X
.\tools\import-yy-cloud.ps1 -Engine postgres -DbHost 127.0.0.1 -Port 5432 -Database yingyue_cloud -User postgres -IncludeBaseSchema -IncludeDemoData
```

## 仍需真实联调的部分

- 抖店开放平台应用真实授权、订单类 API 权限、`shop_id`、`access_token` 和订单同步 webhook 联调
- 美团核销工具真实授权
- 外部订单同步的正式定时任务
- 生产环境 HTTPS、备份、监控的正式部署演练

## 备注

当前演示数据仅用于联调和页面验收，不代表正式业务初始化数据。
