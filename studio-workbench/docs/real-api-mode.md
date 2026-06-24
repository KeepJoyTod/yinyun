# 真实 API 模式说明

## 目标

`studio-workbench` 可以直接接真实后端数据，不再依赖 demo 假数据。

## 启动方式

1. 复制 `.env.example` 为 `.env.local`
2. 确认：
   - `VITE_STUDIO_DEMO=false`
   - `VITE_API_BASE_URL=https://api.evanshine.me`
   - `VITE_STUDIO_MIN_STORE_COUNT=4`
3. 启动前端开发服务

## 行为约束

- 门店数据必须来自 `GET /yy/store/list`
- 真实模式下门店数量少于 `VITE_STUDIO_MIN_STORE_COUNT` 时，直接报错
- 不允许前端硬编码四个真实店铺名称来补数
- demo 模式仍然保留，只用于离线演示

## 失败排查

- 先看 `GET /yy/store/list` 是否返回了至少 4 条门店
- 再看登录态、租户权限、后端是否只返回了测试店铺
- 如果当前账号只绑定了更少门店，说明是后端数据/权限问题，不是前端兜底能解决的问题
