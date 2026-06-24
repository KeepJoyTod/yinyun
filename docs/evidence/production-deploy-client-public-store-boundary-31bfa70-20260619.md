# 2026-06-19 客户公开 API 门店边界部署证据

## 范围

- Deployed code tree: `31bfa70 fix: hide internal default store from public client api`
- Final repo commit adds this evidence document on top of the same code changes.
- HK2 release: `client-public-store-boundary-31bfa70-20260619-235601`
- 只替换后端 `ruoyi-admin.jar`
- 不改前端、不改数据库、不改 nginx、不调用抖音写接口

## 修复点

- `/api/public/stores` 不返回内部默认门店 `DY-LIFE-DEFAULT / 抖音来客默认门店`
- `/api/public/stores/{storeId}/products` 拒绝内部默认门店
- `/api/public/stores/{storeId}/slots` 拒绝内部默认门店
- `/api/public/products/{productId}` 通过商品归属门店校验，拒绝内部默认门店商品
- `/api/public/pages/home` 的分类聚合只统计公开可见门店商品，避免混入内部默认门店商品

## 本地验证

```powershell
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyClientPublicApiServiceImplTest,YyChannelProductMappingServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

结果：`16 tests, 0 failures, 0 errors, 0 skipped`

```powershell
mvn -pl ruoyi-admin -am -DskipTests package
```

结果：`BUILD SUCCESS`

## HK2 部署

- 服务：`yingyue-admin.service`
- 部署后状态：`active`
- 应用启动完成时间：约 39 秒
- 注意：重启后过早请求公网接口会短暂出现 nginx `502 Bad Gateway`，待 Spring Boot 启动完成后恢复。

## 线上验证

`GET https://api.evanshine.me/api/public/stores`

- 返回门店数：`4`
- 门店 ID：`900000000000000100,900000000000000200,900000000000000300,900000000000000400`
- 不含 `DY-LIFE-DEFAULT`
- 不含 `默认门店`

`GET https://api.evanshine.me/api/public/stores/2063619430924812290/products`

- HTTP: `200`
- 业务 code: `500`
- msg: `门店不存在或已停用`

`GET https://api.evanshine.me/api/public/stores/2063619430924812290/slots?date=2026-06-20`

- HTTP: `200`
- 业务 code: `500`
- msg: `门店不存在或已停用`

`GET https://api.evanshine.me/api/public/pages/home?brandCode=yingyue`

- 业务 code: `200`
- 分类数：`2`

默认门店商品详情线上验证：

- 生产 `yy_product` 中 `store_id=2063619430924812290` 当前商品数为 `0`
- 因此商品详情绕过由单元测试覆盖，不造生产数据

SPI smoke:

```powershell
.\tools\run-douyin-life-spi-public-smoke.ps1
```

结果：`webhook-challenge 200 OK`，`public smoke passed`
