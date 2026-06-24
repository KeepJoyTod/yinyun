# 影约云客户取片 Gap Audit

日期：2026-06-08

## 结论

当前客户取片端已完成主链路闭环、后台上传操作台、后台访问审计展示和多轮 UI 质感升级。H5 已通过三视口浏览器 smoke，微信/抖音小程序构建通过。客户 token 已从手机号级授权收紧为登录时相册集合授权。剩余 P0 集中在：生产服务器 OSS/stream 真图链路复验、微信/抖音开发者工具导入验证。

## 状态矩阵

| 项 | 状态 | 证据 | 备注 |
| --- | --- | --- | --- |
| 登录页 | DONE | H5 浏览器登录页可输入手机号/取片码并稳定跳转到相册页 | 已补品牌化入口和 redirect 支持 |
| 相册列表 | DONE | `photo-pickup-smoke.ps1` 和浏览器验收已通过 | 已有封面、张数、状态芯片 |
| 照片目录 | DONE | 浏览器真实路径可看到 2 张可见图片 | 缩略图可加载/失败态都有明确占位 |
| 照片预览 | DONE | 预览页可进入、切换上一张/下一张、显示序号；失败时有重试/返回 | 本机到 OSS 不稳定时会进入错误态 |
| H5 下载 | PARTIAL | URL 不暴露 `client_token`；可预览时会请求 `download-url` 后走 `/stream`；预览失败时禁用下载 | 当前本机 `/stream` 返回 500，签名 OSS URL 探针出现 TLS EOF，需服务器侧复验 |
| H5 图标/样式 | DONE | favicon 已补，页面 UI 已统一 | 仍有 `vue-router` warning，不影响功能 |
| H5 本地代理模式 | DONE | `dev:h5` 可直连本地后端并通过真实账号验收 | 适合本地联调 |
| H5 直连公网 API 模式 | DONE | `dev:h5:api` 可直连 `https://api.evanshine.me` | 适合验证公网/线上环境 |
| 后台上传操作台 | DONE | `npm run test:yy`、`npm run build:dev` 通过 | 上传成功后会自动切到底片列表并按相册过滤，上传结果显示 OSS Key |
| 真实图片上传 | PARTIAL | 当前验证依赖已有示例图和相册数据；后台上传操作台已增强 | 仍需要实际上传新图后再复验目录/预览/下载 |
| 微信小程序构建 | DONE | `npm run build:mp-weixin` 通过 | 需导入开发者工具进一步验收 |
| 抖音小程序构建 | DONE | `npm run build:mp-toutiao` 通过 | 需导入开发者工具进一步验收 |
| 微信开发者工具导入 | MISSING | 未完成现场导入验收 | 需验证登录、列表、详情、保存图片 |
| 抖音开发者工具导入 | MISSING | 未完成现场导入验收 | 需验证登录、列表、详情、保存图片 |
| 微信真机保存图片 | MISSING | 尚未做真机侧保存权限验证 | 需验证相册权限引导 |
| 抖音真机保存图片 | MISSING | 尚未做真机侧保存权限验证 | 需验证合法域名和保存能力 |
| 访问审计展示 | DONE | 后端 `/yy/photoAccessLog/list` 已补；后台“客片选片”增加“访问审计”Tab；目标单测和前端构建通过 | 已拆独立权限 `yy:photoAccessLog:list/export`，线上角色需补菜单授权 |
| 匿名取片授权范围 | DONE | `YyClientPhotoServiceImplTest.tokenShouldOnlyAuthorizeAlbumsMatchedAtVerifyTime` 已覆盖同手机号不同取片码 | token payload 已签入登录时匹配到的 albumIds，列表/详情/资产访问均校验 scope |
| 审计手机号筛选 | P1 | `customerPhone` 为加密字段，明文 like 查询可能失效 | 建议改手机号 hash/后四位/确定性等值查询 |

## 已验证命令

- `npm run typecheck`
- `npm test`
- `npm run test:h5`（390x844、320x568、844x390 三视口）
- `npm run build:mp-weixin`
- `npm run build:mp-toutiao`
- `npm run build:h5`
- `admin-ui`: `npm run test:yy`
- `admin-ui`: `npm run build:dev`
- `mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false -Dtest=YyClientPhotoServiceImplTest,YyPhotoAccessLogServiceImplTest "-Dsurefire.failIfNoSpecifiedTests=false" test`
- `mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false -Dtest=YyPhotoAccessLogServiceImplTest "-Dsurefire.failIfNoSpecifiedTests=false" test`
- `.\tools\photo-pickup-local-acceptance.ps1`
- `.\tools\photo-pickup-smoke.ps1 -BaseUrl http://127.0.0.1:8080 -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001 -AssetId 2063173289800183809`

## 下一步

1. 在生产/准生产服务器复验 OSS 签名 URL 和 `/client/photo/assets/{assetId}/stream`，确认不是本机网络/TLS/VPN 限制。
2. 上传真实测试图，复验目录缩略图、预览和下载。
3. 导入微信开发者工具和抖音开发者工具，验证构建产物可用。
4. 做微信/抖音真机保存图片验收。
5. 后续结合真实租户插件/数据权限做跨租户集成测试，确认数据库层租户隔离与 token scope 双保险。
