package org.dromara.yy.service;

import org.dromara.common.core.exception.ServiceException;
import org.dromara.yy.channel.YyChannelAdapter;
import org.dromara.yy.domain.bo.YyChannelInventoryBo;
import org.dromara.yy.domain.bo.YyChannelOrderQuery;
import org.dromara.yy.domain.vo.YyChannelApiResultVo;
import org.dromara.yy.domain.vo.YyChannelOrderVo;
import org.dromara.yy.domain.vo.YyChannelSyncResultVo;
import org.dromara.yy.domain.vo.YyChannelWebhookResultVo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 渠道适配器调度服务
 */
@Service
public class YyChannelAdapterService {

    private final Map<String, YyChannelAdapter> adapters;

    public YyChannelAdapterService(List<YyChannelAdapter> adapters) {
        this.adapters = adapters.stream()
            .collect(Collectors.toMap(adapter -> normalize(adapter.channelType()), Function.identity()));
    }

    /**
     * 查询渠道订单列表
     */
    public List<YyChannelOrderVo> searchList(String channelType, YyChannelOrderQuery query) {
        if (query == null) {
            query = new YyChannelOrderQuery();
        }
        query.setChannelType(normalize(channelType));
        return getAdapter(channelType).searchList(query);
    }

    /**
     * 按时间范围同步渠道订单到本地。
     */
    public YyChannelSyncResultVo syncOrders(String channelType, YyChannelOrderQuery query) {
        if (query == null) {
            query = new YyChannelOrderQuery();
        }
        query.setChannelType(normalize(channelType));
        return getAdapter(channelType).syncOrders(query);
    }

    /**
     * 从已保存的渠道原始报文回填本地订单字段。
     */
    public YyChannelSyncResultVo backfillLocalOrders(String channelType, YyChannelOrderQuery query) {
        if (query == null) {
            query = new YyChannelOrderQuery();
        }
        query.setChannelType(normalize(channelType));
        return getAdapter(channelType).backfillLocalOrders(query);
    }

    /**
     * 查询渠道订单详情
     */
    public YyChannelOrderVo orderDetail(String channelType, String externalOrderId) {
        return getAdapter(channelType).orderDetail(externalOrderId);
    }

    /**
     * 绑定并同步渠道官方订单。
     */
    public YyChannelOrderVo bindOrder(String channelType, YyChannelOrderQuery query) {
        if (query == null) {
            query = new YyChannelOrderQuery();
        }
        query.setChannelType(normalize(channelType));
        return getAdapter(channelType).bindOrder(query);
    }

    /**
     * 处理渠道 webhook 回调
     */
    public YyChannelWebhookResultVo handleWebhook(String channelType, String payload) {
        return getAdapter(channelType).handleWebhook(payload);
    }

    /**
     * 生成或探测渠道 client_token。
     */
    public YyChannelApiResultVo clientToken(String channelType, YyChannelOrderQuery query) {
        if (query == null) {
            query = new YyChannelOrderQuery();
        }
        query.setChannelType(normalize(channelType));
        return getAdapter(channelType).clientToken(query);
    }

    /**
     * 查询渠道服务购买状态。
     */
    public YyChannelApiResultVo serviceStatus(String channelType, YyChannelOrderQuery query) {
        if (query == null) {
            query = new YyChannelOrderQuery();
        }
        query.setChannelType(normalize(channelType));
        return getAdapter(channelType).serviceStatus(query);
    }

    /**
     * 查询渠道服务购买明细。
     */
    public YyChannelApiResultVo purchaseList(String channelType, YyChannelOrderQuery query) {
        if (query == null) {
            query = new YyChannelOrderQuery();
        }
        query.setChannelType(normalize(channelType));
        return getAdapter(channelType).purchaseList(query);
    }

    /**
     * 确认或拒绝渠道订单。
     */
    public YyChannelApiResultVo confirmOrder(String channelType, YyChannelOrderQuery query) {
        if (query == null) {
            query = new YyChannelOrderQuery();
        }
        query.setChannelType(normalize(channelType));
        return getAdapter(channelType).confirmOrder(query);
    }

    /**
     * 核销渠道订单。
     */
    public YyChannelApiResultVo verifyOrder(String channelType, YyChannelOrderQuery query) {
        if (query == null) {
            query = new YyChannelOrderQuery();
        }
        query.setChannelType(normalize(channelType));
        return getAdapter(channelType).verifyOrder(query);
    }

    public YyChannelApiResultVo upsertReservationInventorySku(String channelType, YyChannelInventoryBo bo) {
        YyChannelInventoryBo request = normalizeInventory(channelType, bo);
        return getAdapter(channelType).upsertReservationInventorySku(request);
    }

    public YyChannelApiResultVo saveReservationRealtimeStock(String channelType, YyChannelInventoryBo bo) {
        YyChannelInventoryBo request = normalizeInventory(channelType, bo);
        return getAdapter(channelType).saveReservationRealtimeStock(request);
    }

    public YyChannelApiResultVo triggerReservationStockUpdate(String channelType, YyChannelInventoryBo bo) {
        YyChannelInventoryBo request = normalizeInventory(channelType, bo);
        return getAdapter(channelType).triggerReservationStockUpdate(request);
    }

    public YyChannelApiResultVo saveReservationTimeStock(String channelType, YyChannelInventoryBo bo) {
        YyChannelInventoryBo request = normalizeInventory(channelType, bo);
        return getAdapter(channelType).saveReservationTimeStock(request);
    }

    public YyChannelApiResultVo getReservationTimeStock(String channelType, YyChannelInventoryBo bo) {
        YyChannelInventoryBo request = normalizeInventory(channelType, bo);
        return getAdapter(channelType).getReservationTimeStock(request);
    }

    private YyChannelAdapter getAdapter(String channelType) {
        YyChannelAdapter adapter = adapters.get(normalize(channelType));
        if (adapter == null) {
            throw new ServiceException("渠道插件未实现: " + channelType);
        }
        return adapter;
    }

    private YyChannelInventoryBo normalizeInventory(String channelType, YyChannelInventoryBo bo) {
        if (bo == null) {
            bo = new YyChannelInventoryBo();
        }
        bo.setChannelType(normalize(channelType));
        return bo;
    }

    private static String normalize(String channelType) {
        return channelType == null ? "" : channelType.toUpperCase(Locale.ROOT);
    }
}
