# 复制订单契约

## 范围
- 订单详情页复制新单。
- 不包含支付迁移、退款迁移、异步任务中心和外部平台订单克隆。

## 请求
- `scheduleMode`: `REUSE_SLOT` / `UNDECIDED`
- `arrivalTime`: 复用档期时必填
- `slotDate`
- `slotStartTime`
- `slotEndTime`
- `remark`

## 响应
- `YyOrderVo`

## 规则
- 复制客户、门店、服务组、工位、总金额、备注和订单属性快照。
- 重置支付、退款、外部渠道、外部单号和库存占用事实。
- `REUSE_SLOT` 需要完整档期并重新校验库存。
- `UNDECIDED` 不写入档期，不触发库存确认。
