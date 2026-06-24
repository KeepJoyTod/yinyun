package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyChannelEventInboxBo;
import org.dromara.yy.domain.bo.YyChannelInventoryBo;
import org.dromara.yy.domain.bo.YyChannelOrderQuery;
import org.dromara.yy.domain.vo.YyChannelApiResultVo;
import org.dromara.yy.domain.vo.YyChannelAcceptanceCaseVo;
import org.dromara.yy.domain.vo.YyChannelAutoSyncStatusVo;
import org.dromara.yy.domain.vo.YyChannelEventInboxStatusVo;
import org.dromara.yy.domain.vo.YyChannelEventInboxVo;
import org.dromara.yy.domain.vo.YyChannelOrderVo;
import org.dromara.yy.domain.vo.YyChannelSyncHealthVo;
import org.dromara.yy.domain.vo.YyChannelSyncResultVo;
import org.dromara.yy.domain.vo.YyChannelWebhookResultVo;
import org.dromara.yy.service.IYyChannelEventInboxService;
import org.dromara.yy.service.IYyChannelSyncLogService;
import org.dromara.yy.service.YyChannelAdapterService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 影约云渠道插件统一入口
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/channel")
public class YyChannelController {

    private final YyChannelAdapterService yyChannelAdapterService;
    private final IYyChannelSyncLogService yyChannelSyncLogService;
    private final IYyChannelEventInboxService yyChannelEventInboxService;

    /**
     * 查询渠道订单列表
     */
    @SaCheckPermission("yy:channel:list")
    @GetMapping("/{channelType}/orders")
    public R<List<YyChannelOrderVo>> searchList(@PathVariable String channelType, YyChannelOrderQuery query) {
        return R.ok(yyChannelAdapterService.searchList(channelType, query));
    }

    /**
     * 按时间范围同步渠道订单到本地。
     */
    @SaCheckPermission("yy:channel:list")
    @PostMapping("/{channelType}/orders/sync")
    public R<YyChannelSyncResultVo> syncOrders(@PathVariable String channelType, @RequestBody(required = false) YyChannelOrderQuery query) {
        return R.ok(yyChannelAdapterService.syncOrders(channelType, query == null ? new YyChannelOrderQuery() : query));
    }

    /**
     * 从已保存的渠道原始报文回填本地订单字段。
     */
    @SaCheckPermission("yy:channel:list")
    @PostMapping("/{channelType}/orders/backfill")
    public R<YyChannelSyncResultVo> backfillLocalOrders(@PathVariable String channelType, @RequestBody(required = false) YyChannelOrderQuery query) {
        return R.ok(yyChannelAdapterService.backfillLocalOrders(channelType, query == null ? new YyChannelOrderQuery() : query));
    }

    /**
     * 查询开放平台验收用例与最近 logid。
     */
    @SaCheckPermission("yy:channel:list")
    @GetMapping("/{channelType}/acceptance-cases")
    public R<List<YyChannelAcceptanceCaseVo>> acceptanceCases(@PathVariable String channelType) {
        return R.ok(yyChannelSyncLogService.queryAcceptanceCases(channelType));
    }

    /**
     * 查询渠道自动同步状态。
     */
    @SaCheckPermission("yy:channel:list")
    @GetMapping("/{channelType}/auto-sync/status")
    public R<YyChannelAutoSyncStatusVo> autoSyncStatus(@PathVariable String channelType) {
        return R.ok(yyChannelSyncLogService.queryAutoSyncStatus(channelType));
    }

    /**
     * 查询渠道同步健康摘要。
     */
    @SaCheckPermission("yy:channel:list")
    @GetMapping("/{channelType}/sync-health")
    public R<YyChannelSyncHealthVo> syncHealth(@PathVariable String channelType) {
        YyChannelEventInboxStatusVo eventStatus = yyChannelEventInboxService.queryStatus(channelType);
        YyChannelAutoSyncStatusVo autoStatus = yyChannelSyncLogService.queryAutoSyncStatus(channelType);
        return R.ok(buildSyncHealth(channelType, eventStatus, autoStatus));
    }

    /**
     * 查询渠道事件收件箱列表。
     */
    @SaCheckPermission("yy:channel:list")
    @GetMapping("/{channelType}/event-inbox/list")
    public TableDataInfo<YyChannelEventInboxVo> eventInboxList(
        @PathVariable String channelType,
        YyChannelEventInboxBo bo,
        PageQuery pageQuery
    ) {
        YyChannelEventInboxBo query = bo == null ? new YyChannelEventInboxBo() : bo;
        query.setChannelType(channelType);
        return yyChannelEventInboxService.queryPageList(query, pageQuery);
    }

    /**
     * 查询渠道事件收件箱状态。
     */
    @SaCheckPermission("yy:channel:list")
    @GetMapping("/{channelType}/event-inbox/status")
    public R<YyChannelEventInboxStatusVo> eventInboxStatus(@PathVariable String channelType) {
        return R.ok(yyChannelEventInboxService.queryStatus(channelType));
    }

    /**
     * 将失败事件重新放回可处理状态。
     */
    @SaCheckPermission("yy:channel:list")
    @PostMapping("/{channelType}/event-inbox/{id}/retry")
    public R<YyChannelEventInboxVo> retryEventInbox(@PathVariable String channelType, @PathVariable Long id) {
        return R.ok(yyChannelEventInboxService.retryEvent(id, "管理员在 " + channelType + " 收件箱手动重试"));
    }

    /**
     * 查询渠道订单详情
     */
    @SaCheckPermission("yy:channel:list")
    @GetMapping("/{channelType}/orders/{externalOrderId}")
    public R<YyChannelOrderVo> orderDetail(@PathVariable String channelType, @PathVariable String externalOrderId) {
        return R.ok(yyChannelAdapterService.orderDetail(channelType, externalOrderId));
    }

    /**
     * 绑定并同步渠道官方订单。
     */
    @SaCheckPermission("yy:channel:list")
    @PostMapping("/{channelType}/orders/bind")
    public R<YyChannelOrderVo> bindOrder(@PathVariable String channelType, @RequestBody(required = false) YyChannelOrderQuery query) {
        return R.ok(yyChannelAdapterService.bindOrder(channelType, query == null ? new YyChannelOrderQuery() : query));
    }

    /**
     * 接收渠道 webhook 回调。
     */
    @SaIgnore
    @PostMapping("/{channelType}/webhook")
    public R<YyChannelWebhookResultVo> webhook(@PathVariable String channelType, @RequestBody(required = false) String payload) {
        return R.ok(yyChannelAdapterService.handleWebhook(channelType, payload));
    }

    /**
     * 渠道 client_token 联调。
     */
    @SaCheckPermission("yy:channel:list")
    @GetMapping("/{channelType}/client-token")
    public R<YyChannelApiResultVo> clientToken(@PathVariable String channelType, YyChannelOrderQuery query) {
        return R.ok(yyChannelAdapterService.clientToken(channelType, query));
    }

    /**
     * 查询服务市场已购状态。
     */
    @SaCheckPermission("yy:channel:list")
    @GetMapping("/{channelType}/service-status")
    public R<YyChannelApiResultVo> serviceStatus(@PathVariable String channelType, YyChannelOrderQuery query) {
        return R.ok(yyChannelAdapterService.serviceStatus(channelType, query));
    }

    /**
     * 查询服务市场购买明细。
     */
    @SaCheckPermission("yy:channel:list")
    @GetMapping("/{channelType}/purchase-list")
    public R<YyChannelApiResultVo> purchaseList(@PathVariable String channelType, YyChannelOrderQuery query) {
        return R.ok(yyChannelAdapterService.purchaseList(channelType, query));
    }

    /**
     * 确认或拒绝渠道订单。
     */
    @SaCheckPermission("yy:channel:list")
    @PostMapping("/{channelType}/confirm")
    public R<YyChannelApiResultVo> confirmOrder(@PathVariable String channelType, @RequestBody(required = false) YyChannelOrderQuery query) {
        return R.ok(yyChannelAdapterService.confirmOrder(channelType, query == null ? new YyChannelOrderQuery() : query));
    }

    /**
     * 核销渠道订单。
     */
    @SaCheckPermission("yy:channel:list")
    @PostMapping("/{channelType}/verify")
    public R<YyChannelApiResultVo> verifyOrder(@PathVariable String channelType, @RequestBody(required = false) YyChannelOrderQuery query) {
        return R.ok(yyChannelAdapterService.verifyOrder(channelType, query == null ? new YyChannelOrderQuery() : query));
    }

    /**
     * 创建或更新预约库存 SKU。
     */
    @SaCheckPermission("yy:channel:list")
    @PostMapping("/{channelType}/reservation/inventory-sku/upsert")
    public R<YyChannelApiResultVo> upsertReservationInventorySku(
        @PathVariable String channelType,
        @RequestBody(required = false) YyChannelInventoryBo bo
    ) {
        return R.ok(yyChannelAdapterService.upsertReservationInventorySku(channelType, bo == null ? new YyChannelInventoryBo() : bo));
    }

    /**
     * 保存预约实时库存。
     */
    @SaCheckPermission("yy:channel:list")
    @PostMapping("/{channelType}/reservation/stock/save")
    public R<YyChannelApiResultVo> saveReservationRealtimeStock(
        @PathVariable String channelType,
        @RequestBody(required = false) YyChannelInventoryBo bo
    ) {
        return R.ok(yyChannelAdapterService.saveReservationRealtimeStock(channelType, bo == null ? new YyChannelInventoryBo() : bo));
    }

    /**
     * 通知渠道库存已更新。
     */
    @SaCheckPermission("yy:channel:list")
    @PostMapping("/{channelType}/reservation/stock/trigger")
    public R<YyChannelApiResultVo> triggerReservationStockUpdate(
        @PathVariable String channelType,
        @RequestBody(required = false) YyChannelInventoryBo bo
    ) {
        return R.ok(yyChannelAdapterService.triggerReservationStockUpdate(channelType, bo == null ? new YyChannelInventoryBo() : bo));
    }

    /**
     * 保存预约时段库存。
     */
    @SaCheckPermission("yy:channel:list")
    @PostMapping("/{channelType}/reservation/time-stock/save")
    public R<YyChannelApiResultVo> saveReservationTimeStock(
        @PathVariable String channelType,
        @RequestBody(required = false) YyChannelInventoryBo bo
    ) {
        return R.ok(yyChannelAdapterService.saveReservationTimeStock(channelType, bo == null ? new YyChannelInventoryBo() : bo));
    }

    /**
     * 查询预约时段库存。
     */
    @SaCheckPermission("yy:channel:list")
    @GetMapping("/{channelType}/reservation/time-stock/get")
    public R<YyChannelApiResultVo> getReservationTimeStock(@PathVariable String channelType, YyChannelInventoryBo bo) {
        return R.ok(yyChannelAdapterService.getReservationTimeStock(channelType, bo == null ? new YyChannelInventoryBo() : bo));
    }

    private static YyChannelSyncHealthVo buildSyncHealth(
        String channelType,
        YyChannelEventInboxStatusVo eventStatus,
        YyChannelAutoSyncStatusVo autoStatus
    ) {
        YyChannelSyncHealthVo health = new YyChannelSyncHealthVo();
        health.setChannelType(StringUtils.isBlank(channelType) ? "DOUYIN_LIFE" : channelType.toUpperCase());
        health.setEventInboxStatus(eventStatus);
        health.setAutoSyncStatus(autoStatus);
        health.setFailedEventCount(eventStatus == null ? 0L : value(eventStatus.getFailedCount()));
        health.setRetryableEventCount(eventStatus == null ? 0L : value(eventStatus.getRetryableCount()));
        health.setDeadEventCount(eventStatus == null ? 0L : value(eventStatus.getDeadCount()));
        health.setLatestWebhookTime(eventStatus == null ? null : eventStatus.getLatestEventTime());
        health.setLatestAutoSyncTime(autoStatus == null ? null : autoStatus.getLastSyncTime());
        health.setLatestLogId(firstNotBlank(
            eventStatus == null ? "" : eventStatus.getLatestRequestId(),
            autoStatus == null ? "" : autoStatus.getLastLogId()
        ));
        if (value(health.getDeadEventCount()) > 0) {
            health.setHealthStatus("DEGRADED");
            health.setMessage("存在死信事件，需要管理员处理");
        } else if (value(health.getFailedEventCount()) > 0 || (autoStatus != null && Boolean.FALSE.equals(autoStatus.getSuccess()))) {
            health.setHealthStatus("WARNING");
            health.setMessage(firstNotBlank(eventStatus == null ? "" : eventStatus.getLatestErrorMessage(), autoStatus == null ? "" : autoStatus.getMessage(), "存在同步异常"));
        } else {
            health.setHealthStatus("HEALTHY");
            health.setMessage("Webhook 入站和补偿同步暂无异常");
        }
        return health;
    }

    private static long value(Long value) {
        return value == null ? 0L : value;
    }

    private static String firstNotBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            if (StringUtils.isNotBlank(value)) {
                return value;
            }
        }
        return "";
    }
}
