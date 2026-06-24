package org.dromara.yy.channel;

import org.dromara.yy.domain.bo.YyChannelOrderQuery;
import org.dromara.yy.domain.bo.YyChannelInventoryBo;
import org.dromara.yy.domain.vo.YyChannelApiResultVo;
import org.dromara.yy.domain.vo.YyChannelOrderVo;
import org.dromara.yy.domain.vo.YyChannelSyncResultVo;
import org.dromara.yy.domain.vo.YyChannelWebhookResultVo;

import java.util.List;

/**
 * 渠道插件适配器
 */
public interface YyChannelAdapter {

    /**
     * 渠道类型
     */
    String channelType();

    /**
     * 查询渠道订单列表
     */
    List<YyChannelOrderVo> searchList(YyChannelOrderQuery query);

    /**
     * 按时间范围同步渠道订单到本地。
     */
    default YyChannelSyncResultVo syncOrders(YyChannelOrderQuery query) {
        YyChannelSyncResultVo result = new YyChannelSyncResultVo();
        result.setChannelType(channelType());
        result.setSyncStatus("FAILED");
        result.setFailed(1);
        result.setMessage("当前渠道暂未实现订单同步接口");
        return result;
    }

    /**
     * 从已保存的渠道原始报文回填本地订单字段。
     */
    default YyChannelSyncResultVo backfillLocalOrders(YyChannelOrderQuery query) {
        YyChannelSyncResultVo result = new YyChannelSyncResultVo();
        result.setChannelType(channelType());
        result.setSyncStatus("FAILED");
        result.setFailed(1);
        result.setMessage("当前渠道暂未实现本地订单回填接口");
        return result;
    }

    /**
     * 查询渠道订单详情
     */
    YyChannelOrderVo orderDetail(String externalOrderId);

    /**
     * 绑定并同步渠道官方订单。
     */
    default YyChannelOrderVo bindOrder(YyChannelOrderQuery query) {
        YyChannelOrderVo result = new YyChannelOrderVo();
        result.setChannelType(channelType());
        result.setExternalOrderId(query == null ? "" : query.getOrderId());
        result.setExternalStatus("UNKNOWN");
        result.setSyncStatus("FAILED");
        result.setRawPayload("当前渠道暂未实现订单绑定接口");
        return result;
    }

    /**
     * 处理渠道 webhook 回调
     */
    default YyChannelWebhookResultVo handleWebhook(String payload) {
        YyChannelWebhookResultVo result = new YyChannelWebhookResultVo();
        result.setChannelType(channelType());
        result.setEventName("UNSUPPORTED");
        result.setProcessed(false);
        result.setMessage("当前渠道暂未实现 webhook 处理");
        result.setRawPayload(payload);
        return result;
    }

    /**
     * 生成或探测渠道 client_token。
     */
    default YyChannelApiResultVo clientToken(YyChannelOrderQuery query) {
        YyChannelApiResultVo result = new YyChannelApiResultVo();
        result.setChannelType(channelType());
        result.setApiName("client_token");
        result.setSuccess(false);
        result.setMessage("当前渠道暂未实现 client_token 接口");
        return result;
    }

    /**
     * 查询渠道服务购买状态。
     */
    default YyChannelApiResultVo serviceStatus(YyChannelOrderQuery query) {
        YyChannelApiResultVo result = new YyChannelApiResultVo();
        result.setChannelType(channelType());
        result.setApiName("service_status");
        result.setSuccess(false);
        result.setMessage("当前渠道暂未实现服务购买状态接口");
        return result;
    }

    /**
     * 查询渠道服务购买明细。
     */
    default YyChannelApiResultVo purchaseList(YyChannelOrderQuery query) {
        YyChannelApiResultVo result = new YyChannelApiResultVo();
        result.setChannelType(channelType());
        result.setApiName("purchase_list");
        result.setSuccess(false);
        result.setMessage("当前渠道暂未实现服务购买明细接口");
        return result;
    }

    /**
     * 渠道订单确认/拒单。
     */
    default YyChannelApiResultVo confirmOrder(YyChannelOrderQuery query) {
        YyChannelApiResultVo result = new YyChannelApiResultVo();
        result.setChannelType(channelType());
        result.setApiName("order_confirm");
        result.setSuccess(false);
        result.setMessage("当前渠道暂未实现订单确认接口");
        return result;
    }

    /**
     * 渠道订单核销。
     */
    default YyChannelApiResultVo verifyOrder(YyChannelOrderQuery query) {
        YyChannelApiResultVo result = new YyChannelApiResultVo();
        result.setChannelType(channelType());
        result.setApiName("order_verify");
        result.setSuccess(false);
        result.setMessage("当前渠道暂未实现订单核销接口");
        return result;
    }

    /**
     * 创建或更新预约库存 SKU。
     */
    default YyChannelApiResultVo upsertReservationInventorySku(YyChannelInventoryBo bo) {
        return unsupportedInventory("life_inventory_sku_upsert");
    }

    /**
     * 保存预约实时库存。
     */
    default YyChannelApiResultVo saveReservationRealtimeStock(YyChannelInventoryBo bo) {
        return unsupportedInventory("life_reception_stock_save");
    }

    /**
     * 通知渠道库存已更新。
     */
    default YyChannelApiResultVo triggerReservationStockUpdate(YyChannelInventoryBo bo) {
        return unsupportedInventory("life_reception_stock_trigger");
    }

    /**
     * 保存预约时段库存。
     */
    default YyChannelApiResultVo saveReservationTimeStock(YyChannelInventoryBo bo) {
        return unsupportedInventory("life_time_stock_save");
    }

    /**
     * 查询预约时段库存。
     */
    default YyChannelApiResultVo getReservationTimeStock(YyChannelInventoryBo bo) {
        return unsupportedInventory("life_time_stock_get");
    }

    private YyChannelApiResultVo unsupportedInventory(String apiName) {
        YyChannelApiResultVo result = new YyChannelApiResultVo();
        result.setChannelType(channelType());
        result.setApiName(apiName);
        result.setSuccess(false);
        result.setMessage("当前渠道暂未实现预约库存接口");
        return result;
    }
}
