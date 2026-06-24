# 影约云企业版第二批模块说明

## 结论

标红 7 项仍是第一优先级。第二批补的是企业日常运营底座：预约配置、员工、客户、通知、多端入口和经营报表。当前已经补进 `RuoYi-Vue-Plus + plus-ui` 主线的菜单、表结构、代码生成配置、演示数据和可操作页面。

## 新增后台入口

| 菜单 | 前端页面 | 优先级 |
| --- | --- | --- |
| 企业结构 | `admin-ui/src/views/yy/enterprise/index.vue` | P1 |
| 预约配置 | `admin-ui/src/views/yy/booking-config/index.vue` | P1 |
| 员工管理 | `admin-ui/src/views/yy/employee/index.vue` | P1 |
| 客户管理 | `admin-ui/src/views/yy/customer/index.vue` | P1 |
| 通知中心 | `admin-ui/src/views/yy/notification/index.vue` | P1 |
| 多端预约 | `admin-ui/src/views/yy/mobile/index.vue` | P1 |
| 经营报表 | `admin-ui/src/views/yy/report/index.vue` | P2 |

## 新增数据模型

| 表 | 作用 |
| --- | --- |
| `yy_service_group` | 门店服务组、默认容量和预约时长 |
| `yy_schedule_rule` | 每周预约时段和容量规则 |
| `yy_employee` | 员工台账、门店归属、系统用户绑定 |
| `yy_customer` | 客户档案、手机号去重、消费汇总 |
| `yy_notification_template` | 预约确认、选片提醒等通知模板 |
| `yy_notification_log` | 微信、短信、企微等发送日志 |
| `yy_mobile_channel_config` | H5、小程序、App 入口配置和 SDK 状态 |
| `yy_report_snapshot` | 门店日报、渠道统计、选片收入快照 |

## 后端接口

- `GET /yy/meta/priority-features`：只返回 7 个标红优先功能。
- `GET /yy/meta/enterprise-modules`：返回第二批企业模块清单。

## 下一步开发顺序

1. 用代码生成器导入新增 `yy_` 表，生成 CRUD。
2. 先做 `预约配置 -> H5/小程序可预约时段 -> 订单提交容量校验`。
3. 再做 `员工管理 -> 订单分配员工 -> 员工业绩报表`。
4. 再做 `客户管理 -> 订单自动沉淀客户 -> 客户详情`。
5. 最后补 `通知中心` 的微信/短信真实 SDK 和 `经营报表` 的快照任务；当前微信已先完成本地渠道映射查询与 webhook 日志落库。

## 验证命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests compile

cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
pnpm build:prod
```
