# 影约云流程地图

更新时间：2026-06-24

## 2026-06-24 customer-payment-inventory-closed-loop part4/part5

### part4 客户支付流程

1. 用户在商品详情页或订单页点击支付。
2. 页面把支付动作交给 `mobile-uniapp/src/pages/customer/orders/customerPaymentFlow.ts`。
3. flow owner 调 `payCustomerOrder(orderId)` 获取后端支付参数。
4. flow owner 调 `resolveCustomerPaymentAction(params)` 判断：
   - `paymentReady=false`：直接 fallback，展示后端 message。
   - `paymentReady=true` 且缺少 `timeStamp`：不拉起支付，走 fallback。
   - `paymentReady=true` 且环境支持：调用 `uni.requestPayment`。
5. 结果处理：
   - 商品详情页：支付成功或失败后都跳订单页，由订单页继续承接支付结果。
   - 订单页：支付成功后直接刷新列表；失败/取消则提示“稍后继续支付”。

### part5 工作台确认收款流程

1. 店员在订单详情动作区点击“确认收款”。
2. 显隐规则统一由 `studio-workbench/src/features/orders/orderPaymentRules.ts` 判断。
3. 动作 owner `useOrderDetailActions.ts` 调 `appStore.confirmOrderPayment(...)`。
4. `appStore` 经由 `backend.ts` 调 `POST /yy/order/{id}/payment/confirm`。
5. 成功后：
   - 更新当前订单
   - 调 `appStore.refreshOrderOperationalScope(nextOrder)`
   - 重载操作日志与详情衍生信息
6. 失败后：
   - 抽屉保持打开
   - 仅展示后端错误，不触发其他状态流转
