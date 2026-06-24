# 影约云 yy 迁移计划

## 目标

把 `RuoYi-Vue-Plus-5.X + plus-ui` 作为企业版主线，先打通菜单、表结构、代码生成配置和 7 个标红功能的迁移骨架。

## 当前落点

- 后端模块：`RuoYi-Vue-Plus-5.X/ruoyi-modules/ruoyi-yy`
- 前端页面：`admin-ui/src/views/yy/**`
- 前端 API：`admin-ui/src/api/yy/**`
- 迁移元数据接口：`GET /yy/meta/priority-features`

## 7 个标红功能

| 编号 | 模块 | 页面 |
| --- | --- | --- |
| B-029 | 预约订单列表 | `yy/order/index.vue` |
| B-002 | 预约概况 | `yy/dashboard/index.vue` |
| B-008 | 门店管理 | `yy/store/index.vue` |
| B-022 | 在线选片配置 | `yy/product/index.vue` |
| C-020 | 底片/选片 | `yy/photo/index.vue` |
| B-026 | 抖音产品 | `yy/channel/douyin/index.vue` |
| B-027 | 美团产品 | `yy/channel/meituan/index.vue` |

## 迁移顺序

1. 先上线菜单和页面壳子，保证入口不空。
2. 再做 `yy_store`、`yy_product`、`yy_order`、`yy_photo_album`、`yy_photo_asset`、`yy_channel_*` 表结构。
3. 再用代码生成器批量生成 CRUD，手写 dashboard 和渠道 adapter。
4. 最后补筛选、状态流转、导出、同步日志、权限按钮。

## 代码生成约定

- 包名：`org.dromara.yy`
- 模块名：`yy`
- 业务前缀：`yy`
- 统一表前缀：`yy_`
- 先生成 CRUD，再人工补聚合页和渠道适配层

## 验证点

- 菜单能进入 7 个页面
- `mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests compile` 通过
- `pnpm build:prod` 通过
- `node tools/verify-yy-plus-ui.cjs` 能验证 7 个标红页面

说明：`pnpm exec vue-tsc --noEmit` 当前会触发 plus-ui 原模板的全局类型错误，错误集中在 `layout`、`workflow`、`system`、`monitor` 等目录，不作为本轮 yy 迁移验收门禁。生产构建和 yy 页面 smoke 作为当前可执行验收标准。
