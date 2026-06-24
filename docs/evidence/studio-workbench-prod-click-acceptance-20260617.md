# Studio Workbench Production Click Acceptance - 2026-06-17

Target: `https://studio.evanshine.me`

## Scope

- Dashboard schedule slot click.
- Slot-scoped appointment orders.
- Appointment cancel validation path.
- Photo management actions:
  - 通知客户
  - 客片确认
  - 资料发送

## Results

| Flow | Result |
| --- | --- |
| Dashboard 11:00 slot | Passed. Slot detail opened with `11:00 - 11:30`, conflict state, capacity/orders, and actions `新增预约` / `查看该时段订单` / `调整容量`. |
| View slot orders | Passed. Opened `/order/appointment?...slotStart=11:00&slotEnd=11:30`; page displayed `时段 11:00-11:30` and scoped orders such as `JY-12152139`. |
| Cancel appointment validation | Passed. Clicking `取消预约` without a reason kept the order unchanged and showed the required cancel-reason state. No real cancellation was submitted. |
| Notify customer | Passed with fallback. `通知客户 SMS/人工` created fallback audit feedback: `已记录人工通知/待人工跟进 · requestId fallback-...`. |
| Confirm photos | Passed guard. `客片确认 提交确认` on a waiting-upload album failed safely: `客户尚未提交可确认的选片结果`. |
| Deliver materials | Passed guard. `资料发送 最终交付` failed safely: `请先完成客片确认，再执行最终交付`. |

## Observed Issue

- Photo management page shows `访问日志加载失败：没有访问权限，请联系管理员授权`.
- This does not block the three main action buttons, but the workbench role should get the read permission required by album access logs, or the panel should hide when the role lacks permission.

## Safety Boundary

- No real order was cancelled.
- No album was confirmed or delivered.
- `通知客户` currently writes only a fallback `yy_notification_log` record because the real SMS/subscription notification channel is not connected.
