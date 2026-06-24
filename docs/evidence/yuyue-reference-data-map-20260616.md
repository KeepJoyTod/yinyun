# 简约网参考数据与影约云生产数据对照

生成时间：2026-06-16

## 结论

- 已只读登录简约网参考系统并采集字段形态；未做新增、导出、核销、收款、改订单等写操作。
- 简约网当前可用门店是 4 家：`淄博万象汇店`、`威海智慧谷店`、`滨州万达店`、`滨州吾悦店`。
- 简约网员工管理有 13 条员工，角色不是只有店长/店员，还包括 `品牌管理员`、`创建者`；员工可绑定多门店。
- 抖音来客生产 OpenAPI 当前能查到真实订单：`client_token` 成功，近 7 天查单第一页检测到 10 条。
- 影约云生产库已经有 1003 条 `DOUYIN_LIFE` 已支付订单和 1003 条已同步映射，但目前都落到一个“抖音来客默认门店”，员工表为空，四门店主数据未对齐。
- 自动同步被安全闸拦住：抖音查询窗口返回量达到 `maxTotal=80`，不能简单扩大同步窗口，需要先修正门店/POI/时间过滤和同步策略。

## 参考系统采集

来源：`https://brand.yuyue123.cn/?vcode=319786#/home/dashboard`

安全处理：

- 不记录参考系统密码。
- 手机号只保存脱敏形态。
- 不保存完整客户隐私 payload。

### 首页经营概况

当前页面日期：2026-06-16。

| 指标 | 参考值 |
| --- | --- |
| 实际收入 | `￥0` |
| 预计收入 | `￥645` |
| 营业收入 | `￥0` |
| 违约金 | `￥0` |
| 商品金额 | `￥0` |
| 优惠减免 | `￥0` |
| 订单金额 | `￥0` |
| 退款金额 | `￥0` |
| 服务订单 | `6单` |
| 待服务 | `6单` |
| 服务中 | `0单` |
| 已完成 | `0单` |
| 已取消 | `1单` |

首页还包含：

- 预约概况：门店筛选、服务组筛选、看板/档期/订单切换。
- 今日档期：10:00 到 18:30 的半小时/近半小时粒度，展示 `订单：x` 和 `工位：已占/容量`。
- 产品分析：预约服务产品分布、下单产品分布。
- 运营入口：预约地址、美团核销地址、选片地址、二维码、软件下载。

### 门店管理

| 门店 | 本月订单 | 待服务单 | 页面操作 |
| --- | ---: | ---: | --- |
| 淄博万象汇店 | 2 | 1 | 服务组管理、产品配置、到店下单、订单属性 |
| 威海智慧谷店 | 31 | 3 | 服务组管理、产品配置、到店下单、订单属性 |
| 滨州万达店 | 84 | 6 | 服务组管理、产品配置、到店下单、订单属性 |
| 滨州吾悦店 | 64 | 13 | 服务组管理、产品配置、到店下单、订单属性 |

影约云映射建议：

- `yy_store` 必须补这 4 家门店，而不是只保留一个默认门店。
- 抖音 `poi_id`、商品 `sku_id/sku_out_id`、参考门店名需要映射到 `yy_store.id`。

### 员工管理

参考字段：

| 字段 | 说明 |
| --- | --- |
| 姓名 | 员工显示名 |
| 手机 | 登录/联系手机号，页面展示已脱敏 |
| 角色 | 创建者、品牌管理员、店长、店员 |
| 门店 | 可绑定一个或多个门店 |
| 状态 | 正常等 |
| 添加日期 | 员工创建时间 |

已见角色：

- `创建者`
- `品牌管理员`
- `店长`
- `店员`

关键差距：

- 当前影约云 `EmployeeDto` / `yy_employee` 是单 `storeId` 口径。
- 参考系统允许一个员工绑定多个门店。
- 建议补 `yy_employee_store` 关系表，或在导入阶段用 `primaryStoreId + storeScopes[]` 口径承接。

### 预约订单

参考页：`#/order/appointment`

筛选和动作：

- 门店筛选。
- 关键字筛选：姓名、手机、邮箱、订单号。
- 下单来源：收银台、微信、美团、小红书、抖音。
- 订单类型：普通预约订单、企业团单订单。
- 下单时间范围：最近一年、90 天、45 天、30 天、7 天、昨天、今天。
- 到店时间范围：最近一年、30 天、7 天、昨天、今天、明天、未来 7 天、未来 30 天、档期未定、未来所有。
- 状态分组：全部有效订单、待服务、服务中、已完成、待支付、已取消、已退单。
- 操作：导出、预约看板、美团验券、新增订单。

列表字段：

| 字段 | 页面含义 |
| --- | --- |
| 客户 | 姓名 + 脱敏手机号 |
| 产品 | 产品名、规格、来源标签、价格 |
| 销售额/收款 | 销售额、待收款、已结清 |
| 状态 | 待服务、待服务已过期等 |
| 门店 | 订单所属门店 |
| 备注 | 备注字段 |
| 到店时间 | 日期、星期、时间 |
| 下单时间 | 日期、星期、时间 |

样例中已见来源/产品：

- 抖音：团购预约-定金20到店退。
- 美团/大众点评：团购预约、现场预约通道。
- 自有服务：成人精致证件照、教育报考类证件、孕妇照、闺蜜写真。

## 抖音来客与生产库现状

验证命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\yingyue-douyin-openapi-remote-order-query.ps1 -SshPasswordFile "C:\Users\Administrator\Desktop\服务器\香港2.txt" -RecentHours 168 -PageSize 10
.\tools\get-douyin-life-acceptance-status.ps1 -Mode SshDocker -SshPasswordFile "C:\Users\Administrator\Desktop\服务器\香港2.txt" -AsJson -OutputJsonPath docs\evidence\douyin-life-acceptance-status-20260616-reference.json
.\tools\get-yingyue-production-data-snapshot.ps1 -Mode SshDocker -SshPasswordFile "C:\Users\Administrator\Desktop\服务器\香港2.txt" -OutputJsonPath docs\evidence\yingyue-production-data-snapshot-20260616-reference.json
```

OpenAPI 查单结果：

- `client_token`: 成功。
- 近 7 天查单：HTTP 200，`err_no=0`。
- 第一页检测订单数：10。
- 查单 logid：`20260616110159B83708FBB43BAEDFA13A`。

生产库快照：

| 项 | 当前值 |
| --- | ---: |
| `yy_store` | 1 |
| `yy_employee` | 0 |
| `yy_channel_account(DOUYIN_LIFE)` | 0 |
| `yy_order` 总数 | 1003 |
| `yy_order.channel_type=DOUYIN_LIFE` | 1003 |
| `yy_order.pay_status=PAID` | 1003 |
| `yy_order.status=PENDING` | 1003 |
| `yy_channel_order_mapping(DOUYIN_LIFE)` | 1005 |
| `SYNCED` 映射 | 1003 |
| `UNKNOWN` 映射 | 2 |

生产库当前门店：

| storeCode | storeName | 问题 |
| --- | --- | --- |
| `DY-LIFE-DEFAULT` | 抖音来客默认门店 | 还未拆到真实 4 门店 |

生产同步问题：

- 最近自动同步状态多次为 `SUSPICIOUS`。
- 原因：达到 `maxTotal=80` 安全上限。
- 结论：抖音 OpenAPI 能返回真实订单，但时间过滤/返回量行为需要进一步核准，不能把安全闸直接调大。

验收状态：

- `三方码发券 SPI`：PENDING。
- `预约创单/支付回调`：PENDING。
- `接单 OpenAPI`：PENDING。
- `整单核销 OpenAPI`：PENDING。
- `退款通知/申请`：PASS。
- 事件收件箱：2 条 `LIFE_ORDER_QUERY` 失败事件，可重试/排障。

## 需要用户/平台补齐

### 必须补齐

1. 四门店与抖音来客 POI 的映射表：
   - 门店名。
   - `yy_store.id`。
   - 抖音 `poi_id`。
   - 抖音 `account_id`。
   - 可用商品 `sku_id / sku_out_id`。

2. 员工真实导入数据：
   - 姓名。
   - 完整手机号。
   - 角色。
   - 可管理门店列表。
   - 是否允许用手机号作为工作台登录账号。
   - 初始密码规则。

3. 订单状态口径确认：
   - 参考系统的 `待服务/服务中/已完成/待支付/已取消/已退单` 映射到 `yy_order.status`。
   - 抖音已支付但未到店的订单是否统一显示为 `待服务`。
   - 缺到店时间的抖音订单是否进入“异常缺资料”。

4. 真实接单/核销验收资料：
   - 真实 `book_id`。
   - 真实券码或 `verify_token`。
   - 对应门店 `poi_id`。
   - 平台能力确认已开通。

### 建议补齐

1. 从简约网导出员工、门店、产品、预约订单 CSV/Excel。
2. 提供抖音来客后台四门店截图或导出的 POI/商品列表。
3. 确认是否迁移历史 1003 条 `DOUYIN_LIFE` 订单到真实门店，还是只从新订单开始正确归属。
4. 确认员工多门店权限模型：一员工多门店，还是复制成多条员工-门店记录。

## 下一步实现顺序

1. 补 `yy_store` 四门店主数据和 POI/SKU 映射。
2. 补员工多门店权限结构或兼容导入逻辑。
3. 修改抖音订单同步映射：优先按 payload/POI/SKU/商品映射解析真实门店、产品、金额、到店时间。
4. 修复自动同步策略：小窗口 + 明确过滤 + 保留 `maxTotal` 安全闸，不盲目扩大范围。
5. 工作台首页改为真实聚合：
   - 今日服务订单。
   - 待服务/服务中/已完成/已取消。
   - 今日预约时段与工位容量。
   - 同步健康和异常入口。
6. 预约订单页补全：
   - 全部有效订单、待服务、服务中、已完成、待支付、已取消、已退单。
   - 抖音/美团/微信/收银台来源筛选。
   - 缺资料、库存冲突、待收款、已结清标识。
7. 用真实订单补接单/核销 logid 验收。

## 产物

- `tools/get-yingyue-production-data-snapshot.ps1`
- `docs/evidence/yingyue-production-data-snapshot-20260616-reference.json`
- `docs/evidence/douyin-life-acceptance-status-20260616-reference.json`
- `docs/evidence/yuyue-reference-data-map-20260616.md`
