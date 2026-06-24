> owner: studio-workbench-acceptance-checklist-20260615
> canonical_for: 门店工作台本地验证、浏览器验收、平台验收、部署和交接检查清单
> upstream: docs/studio-workbench-complete-delivery-plan-20260615.md, docs/studio-workbench-preimplementation-solutions-20260615.md
> downstream: docs/evidence/*

# 门店工作台验收清单

日期：2026-06-15

## 本地基础检查

执行目录：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
```

| 检查 | 命令 | 通过标准 |
| --- | --- | --- |
| Node/npm 可用 | `node -v; npm -v` | 输出版本号 |
| 单元和契约测试 | `npm test` | 全部测试通过 |
| 生产构建 | `npm run build` | 构建成功；已知 `@vueuse/core` annotation warning 不阻塞 |
| 本地开发服务 | `npm run dev` | 监听 `127.0.0.1:5190` |
| Git diff 格式 | 仓库根目录执行 `git diff --check` | 无 whitespace error |

## 浏览器核心路由验收

本地 URL：

```text
http://127.0.0.1:5190
```

线上 URL：

```text
https://studio.evanshine.me
```

| 路由 | 验收点 |
| --- | --- |
| `/login` | 登录表单在侧边/右侧工作区；员工入口和客户入口边界清楚；无横向溢出 |
| `/` | 经营概况、今日指标、趋势图加载态正常 |
| `/order/appointment` | 今日处理、状态筛选、订单详情、状态流转、改期入口可见 |
| `/dashboard/today` | 今日排期、待确认、已确认、可接待工位展示正常 |
| `/merchant/inventory` | 库存容量、冲突、服务组/门店字段清楚 |
| `/service/photos` | 相册、底片、上传入口、缩略图加载/失败态、批量选择正常 |
| `/service/selection` | 选片链接、已选数量、CSV 导出和空态正常 |
| `/product/service` | 服务产品配置、价格、上下架和选片规则正常 |
| `/product/douyin` | 商品映射、SKU、POI、落地页、待补字段可见 |
| `/order/verification` | 抖音来客验收用例、同步健康、logid/requestId 可复制 |
| `/member/customers` | 客户资料、来源、最近订单和备注可见 |
| `/collaboration/work-orders` | 工单池、阻塞/超时筛选、关联业务入口可见 |
| `/marketing/center` | 派生营销数据边界清楚，无假发券成功 |
| `/report/reviews` | 无评价表/API 时显示真实空态 |
| `/settings/roles` | 角色模板、权限矩阵、缺失权限复制清楚 |
| `/settings/logs` | 操作日志和渠道日志可分别展示；缺权限时不整页崩 |
| `/settings/channels` | 合法域名、Webhook/SPI 地址和上线检查清楚 |
| `/settings/workbench` | 工作台模式、安全边界、客户入口隔离清楚 |

## 旧路径兼容

| 旧路径 | 应跳转 |
| --- | --- |
| `/orders` | `/order/appointment` |
| `/schedule` | `/dashboard/today` |
| `/store` | `/merchant/store` |
| `/config` | `/product/service` |
| `/photo-mgmt` | `/service/photos` |
| `/online-selection` | `/service/selection` |
| `/settings` | `/settings/workbench` |

## 工作台安全验收

| 检查 | 通过标准 |
| --- | --- |
| API 模式登录 | 未登录访问工作台路由跳 `/login?redirect=...` |
| Demo 隔离 | API 模式后端失败不自动 fallback demo |
| 员工/客户隔离 | 员工登录态不复用客户手机号取片登录 |
| 权限过滤 | 无权限菜单不可访问，进入 `/403` |
| ID 安全 | 19 位雪花 ID 全程字符串，不转 JavaScript number |
| OSS 安全 | 裸 OSS URL 不公开，客户只走后端鉴权 |

## 平台验收

| 平台 | 验收动作 | 证据 |
| --- | --- | --- |
| 微信小程序 | 导入 `mobile-uniapp\dist\build\mp-weixin`，验收手机号/取片码、相册列表、预览、保存 | 截图或验收记录写入 `docs/evidence` |
| 抖音小程序 | 导入 `mobile-uniapp\dist\build\mp-toutiao`，验收同一取片链路 | 截图或验收记录写入 `docs/evidence` |
| OSS | 真实图片预览/保存通过，裸 OSS 403 | `new-photo-pickup-real-oss-evidence.ps1` 输出 |
| 抖音来客 | 发券 SPI、创单/支付回调、接单、整单核销均有真实 logid | `docs/evidence/douyin-life-*` |
| 服务器 | 香港2 `103.24.216.8` 静态资源部署后核心路由 200 | 部署证据 md/json |

## 常用命令

工作台验证：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test
npm run build
```

总状态检查：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\get-yingyue-delivery-status.ps1 -AsJson
.\tools\yingyue-platform-readiness.ps1
.\tools\print-miniapp-acceptance-handoff.ps1
.\tools\print-douyin-life-acceptance-handoff.ps1
```

真实 OSS 取片证据：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\new-photo-pickup-real-oss-evidence.ps1 -PrintRequiredInputs
```

小程序验收包：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\new-miniapp-acceptance-package.ps1
```

## 发布前检查

| 阶段 | 检查 |
| --- | --- |
| 提交前 | `git status --short --branch`; `git diff --check`; 新文档不含密钥 |
| 构建前 | `npm test`; `npm run build` |
| 推送前 | commit message 说明工作台优化或文档交付 |
| 部署前 | 备份服务器当前 `/var/www/studio.evanshine.me` |
| 部署后 | `/`, `/login`, `/order/appointment`, `/service/photos`, `/service/selection`, `/settings/logs` 返回 200 |
| 交接前 | 更新 `docs/evidence/*`，桌面镜像不包含 `APPSecret`、密码、token、OSS key |

