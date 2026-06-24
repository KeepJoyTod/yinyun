# 影约云 Mobile UniApp 设计与合并说明

## 当前定位

`mobile-uniapp` 是影约云客户移动端，一套代码覆盖 H5、微信小程序、抖音小程序。当前合并 Joe 版后，移动端从单一取片工具扩展为：首页、预约、订单、底片、我的五栏入口。

## 合并原则

- 保留原生产取片链路：手机号 + 取片码、`X-Client-Token`、短期签名 URL、后端图片流代理不被覆盖。
- 合入 Joe 的 C 端页面、图标、参考素材、公开浏览 API 封装、客户态 API 骨架。
- 新增客户态与取片态双模式：底部 Tab 会员入口可预实现；旧取片入口继续可用。
- 后端尚未实现 Joe 期望的 `/api/public/*`、`/api/customer/*` 精确路径，前端以“真实接口优先、本地兜底预览”为策略。

## 视觉方向

新方向采用浅色蓝白磨砂风，不再沿用 Joe 版绿白主题。

- 页面背景：`#f5f9ff`、`#eef6ff`、轻蓝雾面渐变。
- 主操作：`#2563eb`，只用于主按钮、选中态、焦点态。
- 信息表面：白色/半透明白色卡片，细蓝灰边框，轻阴影。
- 警示/取消/退款：保留陶土色 `#b85b33` / `#9a4e1f`。
- 动效：150-300ms，优先 transform/opacity；按钮按压缩放。
- 弹层：订单详情和取消确认使用底部面板，不使用硬 Alert 弹窗。

## 已完成

- 合入 Joe 新增页面：首页、预约门店、门店商品、商品详情、订单、我的、客服、拍摄须知、webview。
- 合入 Joe 新增资源：tab 图标、参考样片、首页/样片占位图。
- 合入并扩展 `request.ts`：支持 `client`、`customer`、`none` 三种请求模式。
- 合入客户态 auth/token 骨架。
- 新增 `YyBottomSheet`，订单详情/取消确认已接入。
- 门店搜索增加 200ms 防抖。
- `api/home.ts` 增加公开接口兜底数据，后端补齐后自动优先使用真实接口。
- `api/customer.ts` 增加开发环境客户 API 兜底，生产环境仍等待真实接口。
- `pickup/albums/detail/preview` 改为客户态 + 取片码双模式。

## 后端缺口

当前后端没有精确实现以下路径：

- `/api/public/brand/{brandCode}`
- `/api/public/pages/home`
- `/api/public/stores`
- `/api/public/stores/{storeId}/products`
- `/api/public/products/{productId}`
- `/api/public/stores/{storeId}/slots`
- `/api/customer/auth/wechat-login`
- `/api/customer/auth/bind-phone`
- `/api/customer/profile`
- `/api/customer/orders`
- `/api/customer/albums`

已有可复用能力集中在：

- `/client/photo/*`
- `/client/orders/*`
- `/yy/mobile/orders`
- `/client/douyin-life/order-entries`

## 验证

已执行：

```bash
npm run typecheck
npm run test
```

后续提交前还需要执行：

```bash
npm run build:h5
npm run build:mp-weixin
npm run build:mp-toutiao
```
