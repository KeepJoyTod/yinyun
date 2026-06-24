package org.dromara.yy.channel.douyin;

import com.baomidou.mybatisplus.core.incrementer.IdentifierGenerator;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.channel.YyChannelAdapter;
import org.dromara.yy.domain.YyBookingSlotInventory;
import org.dromara.yy.domain.YyChannelAccount;
import org.dromara.yy.domain.YyChannelInventorySlot;
import org.dromara.yy.domain.YyChannelOrderMapping;
import org.dromara.yy.domain.YyChannelSyncLog;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPhotoAlbum;
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.domain.bo.YyChannelInventoryBo;
import org.dromara.yy.domain.bo.YyChannelOrderQuery;
import org.dromara.yy.domain.vo.YyChannelApiResultVo;
import org.dromara.yy.domain.vo.YyChannelEventInboxVo;
import org.dromara.yy.domain.vo.YyChannelOrderVo;
import org.dromara.yy.domain.vo.YyChannelSyncResultVo;
import org.dromara.yy.domain.vo.YyChannelWebhookResultVo;
import org.dromara.yy.mapper.YyChannelAccountMapper;
import org.dromara.yy.mapper.YyChannelInventorySlotMapper;
import org.dromara.yy.mapper.YyChannelOrderMappingMapper;
import org.dromara.yy.mapper.YyChannelSyncLogMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.dromara.yy.mapper.YyBookingSlotInventoryMapper;
import org.dromara.yy.service.IDouyinLifeStoreResolver;
import org.dromara.yy.service.IYyBookingSlotInventoryService;
import org.dromara.yy.service.IYyChannelEventInboxService;
import org.dromara.yy.service.IYyCustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * 抖音生活服务/团购订单适配器。
 */
@Component
@RequiredArgsConstructor
public class DouyinLifeChannelAdapter implements YyChannelAdapter {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final String CHANNEL_TYPE = "DOUYIN_LIFE";
    private static final String ORDER_QUERY_API = "life_order_query";
    private static final String ORDER_CONFIRM_API = "life_order_confirm";
    private static final String ORDER_VERIFY_API = "life_order_verify";
    private static final String TRIPARTITE_CODE_CREATE_API = "tripartite_code_create";
    private static final String INVENTORY_SKU_UPSERT_API = "life_inventory_sku_upsert";
    private static final String RECEPTION_STOCK_SAVE_API = "life_reception_stock_save";
    private static final String RECEPTION_STOCK_TRIGGER_API = "life_reception_stock_trigger";
    private static final String TIME_STOCK_SAVE_API = "life_time_stock_save";
    private static final String TIME_STOCK_GET_API = "life_time_stock_get";
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter SLOT_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter SLOT_TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final YyChannelAccountMapper channelAccountMapper;
    private final YyChannelInventorySlotMapper channelInventorySlotMapper;
    private final YyChannelOrderMappingMapper channelOrderMappingMapper;
    private final YyChannelSyncLogMapper channelSyncLogMapper;
    private final YyOrderMapper orderMapper;
    private final YyPhotoAlbumMapper photoAlbumMapper;
    private final YyStoreMapper storeMapper;
    private final IYyCustomerService customerService;
    private final IdentifierGenerator identifierGenerator;
    private final Environment environment;

    @Autowired(required = false)
    private IYyBookingSlotInventoryService bookingSlotInventoryService;

    @Autowired(required = false)
    private IYyChannelEventInboxService eventInboxService;

    @Autowired(required = false)
    private YyBookingSlotInventoryMapper bookingSlotInventoryMapper;

    @Autowired(required = false)
    private IDouyinLifeStoreResolver storeResolver;

    private volatile DouyinOpenApiClient openApiClient;

    @Override
    public String channelType() {
        return CHANNEL_TYPE;
    }

    @Override
    public YyChannelApiResultVo clientToken(YyChannelOrderQuery query) {
        LifeConfig config = resolveConfig(query);
        YyChannelApiResultVo missing = validateConfig("client_token", config, List.of("client_key", "client_secret"));
        if (missing != null) {
            return missing;
        }
        YyChannelApiResultVo result = client().clientToken(config.clientKey(), config.clientSecret());
        result.setChannelType(channelType());
        recordSyncLog(config, "client_token", result, null, null);
        return result;
    }

    @Override
    public List<YyChannelOrderVo> searchList(YyChannelOrderQuery query) {
        LifeConfig config = resolveConfig(query);
        ExternalOrderQueryResult queryResult = queryExternalOrders(config, query);
        if (queryResult.orders().isEmpty()) {
            if (Boolean.TRUE.equals(queryResult.apiResult().getSuccess())) {
                return List.of();
            }
            return List.of(fallbackOrder(queryResult.apiResult().getMessage(), queryResult.apiResult().getRawResponse(), query));
        }

        for (YyChannelOrderVo order : queryResult.orders()) {
            LocalOrderUpsertResult localResult = upsertLocalOrder(
                config,
                order.getExternalOrderId(),
                mapLocalStatus(order.getExternalStatus()),
                config == null ? null : config.storeId(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                "抖音来客查单同步",
                order.getAmount(),
                "",
                "",
                null,
                BigDecimal.ZERO,
                order.getRawPayload()
            );
            order.setLocalOrderId(localResult.localOrderId());
            upsertOrderMapping(config, order.getExternalOrderId(), order.getExternalStatus(), mappingSyncStatusForLocalResult(localResult), order.getRawPayload(), localResult.localOrderId());
        }
        return queryResult.orders();
    }

    @Override
    public YyChannelSyncResultVo syncOrders(YyChannelOrderQuery query) {
        if (query == null) {
            query = new YyChannelOrderQuery();
        }
        applyDefaultSyncWindow(query);

        LifeConfig config = resolveConfig(query);
        YyChannelSyncResultVo result = new YyChannelSyncResultVo();
        result.setChannelType(channelType());
        result.setSyncStatus("SYNCING");
        result.setMessage("同步中");

        int total = 0;
        int created = 0;
        int updated = 0;
        int failed = 0;
        String lastLogId = "";
        int pageNum = query.getPageNum() == null || query.getPageNum() < 1 ? 1 : query.getPageNum();
        int pageSize = query.getPageSize() == null || query.getPageSize() < 1 ? 50 : query.getPageSize();
        pageSize = Math.min(pageSize, 100);
        query.setPageSize(pageSize);
        int maxPages = query.getMaxPages() == null || query.getMaxPages() < 1 ? 20 : Math.min(query.getMaxPages(), 20);
        int maxTotal = query.getMaxTotal() == null || query.getMaxTotal() < 1 ? pageSize * maxPages : Math.min(query.getMaxTotal(), pageSize * maxPages);
        boolean hitSafetyLimit = false;
        String safetyLimitMessage = "";

        for (int pageIndex = 0; pageIndex < maxPages && total < maxTotal; pageIndex++) {
            query.setPageNum(pageNum + pageIndex);
            ExternalOrderQueryResult queryResult = queryExternalOrders(config, query);
            YyChannelApiResultVo apiResult = queryResult.apiResult();
            lastLogId = firstNotBlank(extractLogId(apiResult.getRawResponse()), lastLogId);
            if (!Boolean.TRUE.equals(apiResult.getSuccess())) {
                result.setSyncStatus("FAILED");
                result.setTotal(total);
                result.setCreated(created);
                result.setUpdated(updated);
                result.setFailed(failed + 1);
                result.setLastLogId(lastLogId);
                result.setMessage(firstNotBlank(apiResult.getMessage(), "同步失败，请检查抖音订单查询权限"));
                return result;
            }

            List<YyChannelOrderVo> orders = queryResult.orders();
            int remaining = maxTotal - total;
            List<YyChannelOrderVo> ordersToSync = orders.size() > remaining ? orders.subList(0, remaining) : orders;
            if (orders.size() > remaining) {
                hitSafetyLimit = true;
                safetyLimitMessage = "达到订单总数安全上限 maxTotal=" + maxTotal;
            }
            total += ordersToSync.size();
            for (YyChannelOrderVo order : ordersToSync) {
                String localStatus = mapLocalStatus(order.getExternalStatus());
                if (!shouldSyncLocalOrder(localStatus)) {
                    failed++;
                    upsertOrderMapping(config, order.getExternalOrderId(), order.getExternalStatus(), "UNKNOWN", order.getRawPayload());
                    continue;
                }
                LocalOrderUpsertResult localResult = upsertLocalOrder(
                    config,
                    order.getExternalOrderId(),
                    localStatus,
                    config == null ? null : config.storeId(),
                    order.getCustomerName(),
                    order.getCustomerPhone(),
                    "抖音来客订单自动同步",
                    order.getAmount(),
                    "",
                    "",
                    null,
                    BigDecimal.ZERO,
                    order.getRawPayload()
                );
                order.setLocalOrderId(localResult.localOrderId());
                upsertOrderMapping(config, order.getExternalOrderId(), order.getExternalStatus(), mappingSyncStatusForLocalResult(localResult), order.getRawPayload(), localResult.localOrderId());
                if (localResult.created()) {
                    created++;
                } else if (localResult.localOrderId() != null) {
                    updated++;
                } else {
                    failed++;
                }
            }

            if (hitSafetyLimit) {
                break;
            }
            if (pageIndex + 1 >= maxPages && orders.size() >= pageSize) {
                hitSafetyLimit = true;
                safetyLimitMessage = "达到翻页安全上限 maxPages=" + maxPages;
                break;
            }
            if (orders.size() < pageSize) {
                break;
            }
        }

        result.setSyncStatus(hitSafetyLimit ? "SUSPICIOUS" : failed > 0 ? "PARTIAL" : "SYNCED");
        result.setTotal(total);
        result.setCreated(created);
        result.setUpdated(updated);
        result.setFailed(failed);
        result.setLastLogId(lastLogId);
        result.setMessage(hitSafetyLimit
            ? "同步已停止：" + firstNotBlank(safetyLimitMessage, "达到安全上限") + "，请检查查询时间范围或抖音订单查询返回"
            : failed > 0 ? "同步完成，部分订单未入本地库" : "同步完成");
        return result;
    }

    @Override
    public YyChannelSyncResultVo backfillLocalOrders(YyChannelOrderQuery query) {
        if (query == null) {
            query = new YyChannelOrderQuery();
        }
        int maxTotal = query.getMaxTotal() == null || query.getMaxTotal() < 1 ? 500 : Math.min(query.getMaxTotal(), 5000);
        LambdaQueryWrapper<YyChannelOrderMapping> mappingQuery = Wrappers.<YyChannelOrderMapping>lambdaQuery()
            .eq(YyChannelOrderMapping::getChannelType, CHANNEL_TYPE)
            .isNotNull(YyChannelOrderMapping::getRawPayload)
            .orderByDesc(YyChannelOrderMapping::getId)
            .last("limit " + maxTotal);
        if (StringUtils.isNotBlank(query.getOrderId())) {
            mappingQuery.eq(YyChannelOrderMapping::getExternalOrderId, query.getOrderId());
        } else if (StringUtils.isNotBlank(query.getOutOrderNo())) {
            mappingQuery.eq(YyChannelOrderMapping::getExternalOrderId, query.getOutOrderNo());
        }

        List<YyChannelOrderMapping> mappings = channelOrderMappingMapper.selectList(mappingQuery);
        YyChannelSyncResultVo result = new YyChannelSyncResultVo();
        result.setChannelType(CHANNEL_TYPE);
        result.setSyncStatus("SYNCING");
        result.setTotal(mappings.size());

        int updated = 0;
        int failed = 0;
        for (YyChannelOrderMapping mapping : mappings) {
            BackfillResult backfillResult = backfillLocalOrderFromMapping(mapping);
            if (backfillResult.updated()) {
                updated++;
            } else if (backfillResult.failed()) {
                failed++;
            }
        }

        result.setUpdated(updated);
        result.setFailed(failed);
        result.setSyncStatus("SYNCED");
        result.setMessage("已扫描 " + mappings.size() + " 条映射，更新 " + updated + " 条，失败 " + failed + " 条");
        recordBackfillLog(result);
        return result;
    }

    @Override
    public YyChannelOrderVo orderDetail(String externalOrderId) {
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        if (looksLikeOrderId(externalOrderId)) {
            query.setOrderId(externalOrderId);
        } else {
            query.setOutOrderNo(externalOrderId);
        }
        List<YyChannelOrderVo> orders = searchList(query);
        if (orders.isEmpty()) {
            return fallbackOrder("未查询到订单", "", query);
        }
        return orders.get(0);
    }

    @Override
    public YyChannelOrderVo bindOrder(YyChannelOrderQuery query) {
        if (query == null) {
            query = new YyChannelOrderQuery();
        }
        if (StringUtils.isBlank(query.getOrderId()) && StringUtils.isBlank(query.getOutOrderNo())) {
            return fallbackOrder("绑定抖音官方订单需要 orderId 或 outOrderNo", "", query);
        }
        if (!isPhoneLast4(query.getPhoneLast4())) {
            return fallbackOrder("绑定抖音官方订单需要手机号后四位", "", query);
        }

        LifeConfig config = resolveConfig(query);
        ExternalOrderQueryResult queryResult = queryExternalOrders(config, query);
        if (queryResult.orders().isEmpty()) {
            if (Boolean.TRUE.equals(queryResult.apiResult().getSuccess())) {
                return fallbackOrder("未查询到抖音官方订单", "", query);
            }
            return fallbackOrder(queryResult.apiResult().getMessage(), queryResult.apiResult().getRawResponse(), query);
        }

        YyChannelOrderVo order = selectBindableOrder(queryResult.orders(), query);
        if (order == null) {
            return fallbackOrder("抖音订单查询结果不唯一，无法安全绑定", "", query);
        }
        if (!matchesPhoneLast4(order.getCustomerPhone(), query.getPhoneLast4())) {
            return fallbackOrder("手机号后四位不匹配，无法绑定该抖音订单", "", query);
        }

        String localStatus = mapLocalStatus(order.getExternalStatus());
        if (!shouldSyncLocalOrder(localStatus)) {
            return fallbackOrder("订单状态暂不允许绑定: " + order.getExternalStatus(), "", query);
        }

        LocalOrderUpsertResult localResult = upsertLocalOrder(
            config,
            order.getExternalOrderId(),
            localStatus,
            config == null ? null : config.storeId(),
            order.getCustomerName(),
            order.getCustomerPhone(),
            "抖音来客订单号绑定同步",
            order.getAmount(),
            "",
            "",
            null,
            BigDecimal.ZERO,
            order.getRawPayload()
        );
        order.setLocalOrderId(localResult.localOrderId());
        String mappingSyncStatus = mappingSyncStatusForLocalResult(localResult);
        order.setSyncStatus(mappingSyncStatus);
        upsertOrderMapping(config, order.getExternalOrderId(), order.getExternalStatus(), mappingSyncStatus, order.getRawPayload(), localResult.localOrderId());
        return order;
    }

    @Override
    public YyChannelApiResultVo confirmOrder(YyChannelOrderQuery query) {
        LifeConfig config = resolveConfig(query);
        YyChannelApiResultVo missing = validateConfig(
            ORDER_CONFIRM_API,
            config,
            List.of("client_key", "client_secret", "account_id")
        );
        if (missing != null) {
            return missing;
        }

        String bookId = firstNotBlank(query == null ? null : query.getBookId(), query == null ? null : query.getOrderId());
        if (StringUtils.isBlank(bookId)) {
            YyChannelApiResultVo result = missingResult(ORDER_CONFIRM_API);
            result.setMessage("综合预约确认需要 bookId 或 orderId");
            return result;
        }

        Integer confirmResult = query == null ? null : query.getConfirmResult();
        if (confirmResult == null) {
            YyChannelApiResultVo result = missingResult(ORDER_CONFIRM_API);
            result.setMessage("综合预约确认需要 confirmResult，1=Accept，2=Reject");
            return result;
        }
        if (confirmResult == 1 && query.getFulfilType() == null) {
            YyChannelApiResultVo result = missingResult(ORDER_CONFIRM_API);
            result.setMessage("确认接单时需要 fulfilType");
            return result;
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("book_id", bookId);
        body.put("confirm_result", confirmResult);
        if (confirmResult == 1 && query.getFulfilType() != null) {
            body.put("fulfil_type", query.getFulfilType());
        }
        if (StringUtils.isNotBlank(query.getMerchantNotes())) {
            body.put("merchant_notes", query.getMerchantNotes());
        }
        if (StringUtils.isNotBlank(query.getReason())) {
            body.put("reason", query.getReason());
        }
        if (StringUtils.isNotBlank(query.getRejectCode())) {
            Integer rejectCode = parseOptionalInt(query.getRejectCode());
            if (rejectCode != null) {
                body.put("reject_code", rejectCode);
            }
        }

        String clientAccessToken = requireClientAccessToken(config);
        if (StringUtils.isBlank(clientAccessToken)) {
            YyChannelApiResultVo result = missingResult(ORDER_CONFIRM_API);
            result.setMessage("client_token 未返回 client_access_token，请检查生活服务应用 client_key/client_secret 和权限");
            recordSyncLog(config, ORDER_CONFIRM_API, result, 0L, null);
            return result;
        }

        long start = System.nanoTime();
        YyChannelApiResultVo apiResult = client().confirmComprehensiveOrder(
            clientAccessToken,
            config.accountId(),
            body
        );
        apiResult.setChannelType(channelType());
        recordSyncLog(config, ORDER_CONFIRM_API, apiResult, Duration.ofNanos(System.nanoTime() - start).toMillis(), extractLogId(apiResult.getRawResponse()));

        String mappedStatus = apiResult.getSuccess() ? (confirmResult == 1 ? "CONFIRMED" : "REJECTED") : "FAILED";
        upsertOrderMapping(config, bookId, mappedStatus, Boolean.TRUE.equals(apiResult.getSuccess()) ? "SYNCED" : "FAILED", apiResult.getRawResponse());
        return apiResult;
    }

    @Override
    public YyChannelApiResultVo verifyOrder(YyChannelOrderQuery query) {
        LifeConfig config = resolveConfig(query);
        YyChannelApiResultVo missing = validateConfig(
            ORDER_VERIFY_API,
            config,
            List.of("client_key", "client_secret", "account_id")
        );
        if (missing != null) {
            return missing;
        }

        String poiId = firstNotBlank(
            query == null ? null : query.getPoiId(),
            prop("yy.douyin.life.poi-id", "DOUYIN_LIFE_POI_ID"),
            prop("yy.douyin.life.store-id", "DOUYIN_LIFE_STORE_ID")
        );
        List<String> codes = splitCsv(query == null ? null : query.getCodes());
        String verifyToken = query == null ? null : query.getVerifyToken();
        if (StringUtils.isBlank(poiId)) {
            YyChannelApiResultVo result = missingResult(ORDER_VERIFY_API);
            result.setMessage("生活服务整单核销需要 poiId，可使用测试 POI");
            return result;
        }
        if (codes.isEmpty() && StringUtils.isBlank(verifyToken)) {
            YyChannelApiResultVo result = missingResult(ORDER_VERIFY_API);
            result.setMessage("生活服务整单核销需要 codes 或 verifyToken");
            return result;
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("poi_id", poiId);
        body.put("account_id", config.accountId());
        if (!codes.isEmpty()) {
            body.put("codes", codes);
        }
        String orderId = query == null ? null : query.getOrderId();
        if (StringUtils.isNotBlank(orderId)) {
            body.put("order_id", orderId);
        }
        if (!codes.isEmpty() && StringUtils.isBlank(verifyToken) && StringUtils.isBlank(orderId)) {
            YyChannelApiResultVo result = missingResult(ORDER_VERIFY_API);
            result.setMessage("三方码整单核销需要 orderId，用于提交 order_id 并生成幂等 verify_token");
            return result;
        }
        body.put("verify_token", firstNotBlank(verifyToken, generatedVerifyToken(config.accountId(), poiId, orderId, codes)));
        Map<String, Object> verifyExtra = new LinkedHashMap<>();
        verifyExtra.put("total_verify", query == null || query.getTotalVerify() == null || Boolean.TRUE.equals(query.getTotalVerify()));
        body.put("verify_extra", verifyExtra);

        String clientAccessToken = requireClientAccessToken(config);
        if (StringUtils.isBlank(clientAccessToken)) {
            YyChannelApiResultVo result = missingResult(ORDER_VERIFY_API);
            result.setMessage("client_token 未返回 client_access_token，请检查生活服务应用 client_key/client_secret 和权限");
            recordSyncLog(config, ORDER_VERIFY_API, result, 0L, null);
            return result;
        }

        long start = System.nanoTime();
        YyChannelApiResultVo apiResult = client().verifyCertificate(
            clientAccessToken,
            config.accountId(),
            body
        );
        apiResult.setChannelType(channelType());
        recordSyncLog(config, ORDER_VERIFY_API, apiResult, Duration.ofNanos(System.nanoTime() - start).toMillis(), extractLogId(apiResult.getRawResponse()));
        return apiResult;
    }

    @Override
    public YyChannelApiResultVo upsertReservationInventorySku(YyChannelInventoryBo bo) {
        LifeConfig config = resolveConfig(bo);
        YyChannelApiResultVo missing = validateInventoryConfig(INVENTORY_SKU_UPSERT_API, config);
        if (missing != null) {
            return missing;
        }
        if (StringUtils.isBlank(resolvePoiId(bo)) || StringUtils.isBlank(resolveSkuId(bo))) {
            YyChannelApiResultVo result = missingResult(INVENTORY_SKU_UPSERT_API);
            result.setMessage("创建/更新库存 SKU 需要 poiId 和 skuId/skuOutId");
            return result;
        }
        return callInventoryApi(config, bo, INVENTORY_SKU_UPSERT_API, buildInventorySkuBody(bo), false);
    }

    @Override
    public YyChannelApiResultVo saveReservationRealtimeStock(YyChannelInventoryBo bo) {
        LifeConfig config = resolveConfig(bo);
        YyChannelApiResultVo missing = validateInventoryConfig(RECEPTION_STOCK_SAVE_API, config);
        if (missing != null) {
            return missing;
        }
        if (StringUtils.isBlank(resolvePoiId(bo)) || StringUtils.isBlank(resolveSkuId(bo))
            || StringUtils.isBlank(bo == null ? null : bo.getDate())
            || StringUtils.isBlank(bo == null ? null : bo.getStartTime())
            || StringUtils.isBlank(bo == null ? null : bo.getEndTime())
            || bo == null || bo.getAvailableStock() == null) {
            YyChannelApiResultVo result = missingResult(RECEPTION_STOCK_SAVE_API);
            result.setMessage("保存实时库存需要 poiId、skuId/skuOutId、date、startTime、endTime、availableStock");
            return result;
        }
        return callInventoryApi(config, bo, RECEPTION_STOCK_SAVE_API, buildRealtimeStockBody(bo), true);
    }

    @Override
    public YyChannelApiResultVo triggerReservationStockUpdate(YyChannelInventoryBo bo) {
        LifeConfig config = resolveConfig(bo);
        YyChannelApiResultVo missing = validateInventoryConfig(RECEPTION_STOCK_TRIGGER_API, config);
        if (missing != null) {
            return missing;
        }
        if (StringUtils.isBlank(resolvePoiId(bo)) || StringUtils.isBlank(resolveSkuId(bo))) {
            YyChannelApiResultVo result = missingResult(RECEPTION_STOCK_TRIGGER_API);
            result.setMessage("库存更新通知需要 poiId 和 skuId/skuOutId");
            return result;
        }
        return callInventoryApi(config, bo, RECEPTION_STOCK_TRIGGER_API, buildStockTriggerBody(bo), false);
    }

    @Override
    public YyChannelApiResultVo saveReservationTimeStock(YyChannelInventoryBo bo) {
        LifeConfig config = resolveConfig(bo);
        YyChannelApiResultVo missing = validateInventoryConfig(TIME_STOCK_SAVE_API, config);
        if (missing != null) {
            return missing;
        }
        if (StringUtils.isBlank(resolvePoiId(bo))) {
            YyChannelApiResultVo result = missingResult(TIME_STOCK_SAVE_API);
            result.setMessage("保存时段库存需要 poiId，复杂结构可通过 rawPayload 透传");
            return result;
        }
        return callInventoryApi(config, bo, TIME_STOCK_SAVE_API, buildTimeStockBody(config, bo), true);
    }

    @Override
    public YyChannelApiResultVo getReservationTimeStock(YyChannelInventoryBo bo) {
        LifeConfig config = resolveConfig(bo);
        YyChannelApiResultVo missing = validateInventoryConfig(TIME_STOCK_GET_API, config);
        if (missing != null) {
            return missing;
        }
        String poiId = resolvePoiId(bo);
        if (StringUtils.isBlank(poiId)) {
            YyChannelApiResultVo result = missingResult(TIME_STOCK_GET_API);
            result.setMessage("查询时段库存需要 poiId");
            return result;
        }
        String clientAccessToken = requireClientAccessToken(config);
        if (StringUtils.isBlank(clientAccessToken)) {
            YyChannelApiResultVo result = missingResult(TIME_STOCK_GET_API);
            result.setMessage("client_token 未返回 client_access_token，请检查生活服务应用 client_key/client_secret 和权限");
            recordSyncLog(config, TIME_STOCK_GET_API, result, 0L, null);
            return result;
        }

        long start = System.nanoTime();
        YyChannelApiResultVo apiResult = client().getReservationTimeStock(
            clientAccessToken,
            config.accountId(),
            poiId,
            bo != null && Boolean.TRUE.equals(bo.getUseTestDataHeader())
        );
        apiResult.setChannelType(channelType());
        String logId = extractLogId(apiResult.getRawResponse());
        apiResult.setLogId(logId);
        recordSyncLog(config, TIME_STOCK_GET_API, apiResult, Duration.ofNanos(System.nanoTime() - start).toMillis(), logId);
        return apiResult;
    }

    public Object handleOpenPlatformWebhook(String payload, Map<String, String> headers) {
        return handleOpenPlatformWebhook(payload, headers, "");
    }

    public Object handleOpenPlatformWebhook(String payload, Map<String, String> headers, String rawQuery) {
        Object challenge = extractChallenge(payload);
        if (hasChallengeValue(challenge)) {
            return Map.of("challenge", challenge);
        }
        return handleLifeSpi("life_event_webhook", payload, headers, rawQuery);
    }

    public Map<String, Object> handleLifeSpi(String apiName, String payload, Map<String, String> headers) {
        return handleLifeSpi(apiName, payload, headers, "");
    }

    public Map<String, Object> handleLifeSpi(String apiName, String payload, Map<String, String> headers, String rawQuery) {
        String requestId = headerValue(headers, "X-Bytedance-Logid");
        String normalizedApiName = StringUtils.isNotBlank(apiName) ? apiName : "life_spi";
        String normalizedApiKey = normalizedApiName.replace('_', '-').toLowerCase(Locale.ROOT);
        boolean shouldSyncOrder = isInboundOrderSyncEvent(normalizedApiKey) || isInboundOrderSyncPayload(payload);
        String externalOrderId = shouldSyncOrder ? extractExternalOrderId(payload) : "";
        SpiSignatureCheck signatureCheck = verifySpiSignature(payload, headers, rawQuery, resolveConfig((YyChannelOrderQuery) null));
        if (!signatureCheck.valid()) {
            receiveInboxEvent(normalizedApiName, externalOrderId, requestId, payload, false, signatureCheck.message());
            recordSpiLog(normalizedApiName, requestId, payload, false, signatureCheck.message());
            return genericSpiFailure(signatureCheck.message());
        }
        YyChannelEventInboxVo inbox = null;
        if (shouldSyncOrder) {
            inbox = receiveInboxEvent(normalizedApiName, externalOrderId, requestId, payload, true, "");
            if (isDuplicateInboxEvent(inbox)) {
                recordSpiLog(normalizedApiName, requestId, payload, true, "duplicate event skipped");
                return genericSpiSuccess(normalizedApiName, payload);
            }
            try {
                YyChannelWebhookResultVo webhookResult = handleWebhook(payload);
                if (webhookResult != null && Boolean.FALSE.equals(webhookResult.getProcessed())) {
                    markInboxFailed(inbox, webhookResult.getMessage());
                } else {
                    markInboxProcessed(inbox, "processed by handleWebhook");
                }
            } catch (RuntimeException ex) {
                markInboxFailed(inbox, ex.getMessage());
                throw ex;
            }
        }
        recordSpiLog(normalizedApiName, requestId, payload, true, "");
        if (normalizedApiKey.contains("refund-apply")) {
            return refundApplySpiResponse(payload);
        }
        return genericSpiSuccess(normalizedApiName, payload);
    }

    private YyChannelEventInboxVo receiveInboxEvent(
        String eventType,
        String externalOrderId,
        String requestId,
        String payload,
        boolean signatureValid,
        String errorMessage
    ) {
        if (eventInboxService == null) {
            return null;
        }
        return eventInboxService.receiveEvent(
            channelType(),
            eventType,
            externalOrderId,
            requestId,
            payload,
            signatureValid,
            firstNotBlank(errorMessage, "")
        );
    }

    private static boolean isDuplicateInboxEvent(YyChannelEventInboxVo inbox) {
        return inbox != null && "DUPLICATE".equalsIgnoreCase(inbox.getProcessStatus());
    }

    private void markInboxProcessed(YyChannelEventInboxVo inbox, String remark) {
        if (eventInboxService != null && inbox != null && inbox.getId() != null) {
            eventInboxService.markProcessed(inbox.getId(), remark);
        }
    }

    private void markInboxFailed(YyChannelEventInboxVo inbox, String errorMessage) {
        if (eventInboxService != null && inbox != null && inbox.getId() != null) {
            eventInboxService.markFailed(inbox.getId(), firstNotBlank(errorMessage, "订单事件处理失败"));
        }
    }

    private static String extractExternalOrderId(String payload) {
        if (StringUtils.isBlank(payload)) {
            return "";
        }
        try {
            JsonNode root = OBJECT_MAPPER.readTree(payload);
            return firstText(root, "order_id", "orderId", "out_order_no", "outOrderNo", "book_id", "bookId");
        } catch (Exception ignored) {
            return "";
        }
    }

    public Map<String, Object> issueTripartiteCode(String payload, Map<String, String> headers) {
        return issueTripartiteCode(payload, headers, "");
    }

    public Map<String, Object> issueTripartiteCode(String payload, Map<String, String> headers, String rawQuery) {
        String requestId = headerValue(headers, "X-Bytedance-Logid");
        String headerClientKey = headerValue(headers, "x-life-clientkey");
        LifeConfig config = resolveConfig((YyChannelOrderQuery) null);
        SpiSignatureCheck signatureCheck = verifySpiSignature(payload, headers, rawQuery, config);
        if (!signatureCheck.valid()) {
            recordSpiLog(TRIPARTITE_CODE_CREATE_API, requestId, payload, false, signatureCheck.message());
            return tripartiteCodeFailure(9999, signatureCheck.message());
        }
        if (StringUtils.isNotBlank(config.clientKey())
            && StringUtils.isNotBlank(headerClientKey)
            && !config.clientKey().equals(headerClientKey)) {
            String message = "x-life-clientkey 与当前 DOUYIN_LIFE client_key 不匹配";
            recordSpiLog(TRIPARTITE_CODE_CREATE_API, requestId, payload, false, message);
            return tripartiteCodeFailure(9999, message);
        }

        try {
            JsonNode root = StringUtils.isBlank(payload) ? OBJECT_MAPPER.createObjectNode() : OBJECT_MAPPER.readTree(payload);
            String orderId = firstNotBlank(firstText(root, "order_id", "orderId"), "UNKNOWN_ORDER");
            String skuId = firstNotBlank(firstText(root, "sku_id", "skuId"), "UNKNOWN_SKU");
            String thirdSkuId = firstText(root, "third_sku_id", "thirdSkuId");
            String thirdOrderId = firstText(root, "third_order_id", "thirdOrderId");
            int count = parsePositiveInt(firstText(root, "count", "copies"), 1, 50);

            List<Map<String, String>> certificates = new ArrayList<>();
            List<String> codes = new ArrayList<>();
            for (int i = 1; i <= count; i++) {
                Map<String, String> certificate = new LinkedHashMap<>();
                String code = certificateCode(orderId, skuId, i);
                certificate.put("certificate_id", certificateId(orderId, skuId, i));
                certificate.put("code", code);
                certificates.add(certificate);
                codes.add(code);
            }

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("error_code", 0);
            data.put("description", "success");
            data.put("result", 1);
            data.put("code_type", 1);
            data.put("third_order_id", firstNotBlank(thirdOrderId, "YY" + orderId));
            if (StringUtils.isNotBlank(thirdSkuId)) {
                data.put("third_sku_id", thirdSkuId);
            }
            data.put("codes", codes);
            data.put("certificates", certificates);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("data", data);
            String responsePayload = OBJECT_MAPPER.writeValueAsString(response);
            upsertOrderMapping(config, orderId, "TRIPARTITE_CODE_ISSUED", "SYNCED", responsePayload);
            recordSpiLog(TRIPARTITE_CODE_CREATE_API, requestId, payload, true, "");
            return response;
        } catch (Exception ex) {
            recordSpiLog(TRIPARTITE_CODE_CREATE_API, requestId, payload, false, ex.getMessage());
            return tripartiteCodeFailure(9999, "发券 SPI payload 解析失败: " + ex.getMessage());
        }
    }

    @Override
    public YyChannelWebhookResultVo handleWebhook(String payload) {
        YyChannelWebhookResultVo result = new YyChannelWebhookResultVo();
        result.setChannelType(channelType());
        result.setRequiredPermission("market.service.user");

        if (payload == null || payload.isBlank()) {
            result.setEventName("order_payment_notice");
            result.setProcessed(false);
            result.setMessage("抖音生活服务 webhook payload 为空");
            result.setRawPayload("");
            return result;
        }

        try {
            JsonNode root = OBJECT_MAPPER.readTree(payload);
            String safePayload = redactSensitivePayload(payload);
            String eventName = firstText(root, "event", "event_type", "eventType", "msg_type", "type", "notify_type");
            String eventStatus = firstText(root, "order_status", "orderStatus", "status", "status_code", "state", "event_status", "action");
            String externalOrderId = firstText(root, "order_id", "orderId", "out_order_no", "outOrderNo", "book_id", "bookId");
            Long payloadStoreId = parseLong(firstText(root, "store_id", "storeId", "shop_id", "shopId", "poi_id", "poiId"));
            LifeConfig config = withStoreFallback(resolveConfig(queryWithStore(payloadStoreId)), payloadStoreId);
            String localStatus = mapLocalStatus(eventStatus);

            result.setEventName(StringUtils.isNotBlank(eventName) ? eventName : "order_payment_notice");
            result.setEventStatus(eventStatus);
            result.setExternalOrderId(externalOrderId);
            result.setLocalStatus(localStatus);
            result.setProcessed(StringUtils.isNotBlank(eventName));
            result.setMessage("已接收抖音生活服务事件，后续会写入订单映射和同步日志");
            result.setRawPayload(safePayload);

            if (StringUtils.isNotBlank(externalOrderId)) {
                LocalOrderUpsertResult localResult = upsertLocalOrder(
                    config,
                    externalOrderId,
                    localStatus,
                    config == null ? payloadStoreId : config.storeId(),
                    firstText(root, "buyer_name", "customer_name", "receiver_name", "contact_name", "nickname", "name"),
                    firstText(root, "mobile", "phone", "receiver_phone", "customer_phone", "buyer_phone"),
                    "抖音来客 webhook 自动同步",
                    parseAmount(firstText(root, "pay_amount", "amount", "pay_price", "payPrice")),
                    firstText(root, "book_id", "bookId"),
                    firstText(root, "certificate_code", "certificateCode", "certificate_no", "certificateNo", "code"),
                    extractOrderSlotSpec(root),
                    extractRefundAmount(root),
                    safePayload
                );
                Long localOrderId = localResult == null ? null : localResult.localOrderId();
                upsertOrderMapping(config, externalOrderId, eventStatus, mappingSyncStatusForLocalResult(localResult), safePayload, localOrderId);
                if (localOrderId == null) {
                    result.setProcessed(false);
                    result.setMessage("抖音生活服务 webhook 本地订单落库失败");
                } else {
                    result.setProcessed(true);
                    result.setMessage("抖音生活服务 webhook 本地订单已同步");
                }
            }
            recordWebhookLog(
                externalOrderId,
                eventName,
                safePayload,
                Boolean.TRUE.equals(result.getProcessed()),
                Boolean.TRUE.equals(result.getProcessed()) ? null : result.getMessage()
            );
        } catch (Exception ex) {
            result.setEventName("order_payment_notice");
            result.setProcessed(false);
            result.setMessage("抖音生活服务 webhook payload 解析失败: " + ex.getMessage());
            result.setRawPayload(redactSensitivePayload(payload));
            recordWebhookLog(null, "order_payment_notice", payload, false, ex.getMessage());
        }
        return result;
    }

    private YyChannelOrderQuery queryWithStore(Long storeId) {
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setStoreId(storeId);
        return query;
    }

    private LifeConfig withStoreFallback(LifeConfig config, Long payloadStoreId) {
        Long storeId = firstNonNull(payloadStoreId, config == null ? null : config.storeId(), firstStoreId());
        if (config == null) {
            return new LifeConfig("", "", "", storeId);
        }
        if (config.storeId() != null || storeId == null) {
            return config;
        }
        return new LifeConfig(config.clientKey(), config.clientSecret(), config.accountId(), storeId);
    }

    private Long firstStoreId() {
        YyStore store = storeMapper.selectOne(Wrappers.<YyStore>lambdaQuery()
            .orderByAsc(YyStore::getSort)
            .orderByAsc(YyStore::getId)
            .last("limit 1"));
        return store == null ? null : store.getId();
    }

    private DouyinOpenApiClient client() {
        DouyinOpenApiClient existing = openApiClient;
        if (existing != null) {
            return existing;
        }
        synchronized (this) {
            if (openApiClient == null) {
                openApiClient = new DouyinOpenApiClient(OBJECT_MAPPER, resolveBaseUrl());
            }
            return openApiClient;
        }
    }

    private String resolveBaseUrl() {
        String configured = prop("yy.douyin.life.base-url", "DOUYIN_LIFE_BASE_URL");
        if (StringUtils.isNotBlank(configured)) {
            return configured;
        }
        String fallback = prop("yy.douyin.base-url", "DOUYIN_BASE_URL");
        return StringUtils.isNotBlank(fallback) ? fallback : DouyinOpenApiClient.DEFAULT_BASE_URL;
    }

    private LifeConfig resolveConfig(YyChannelOrderQuery query) {
        YyChannelAccount account = findAccount(query == null ? null : query.getStoreId());
        return new LifeConfig(
            firstNotBlank(prop("yy.douyin.life.client-key", "DOUYIN_LIFE_CLIENT_KEY"), account == null ? null : account.getAppKey()),
            firstNotBlank(prop("yy.douyin.life.client-secret", "DOUYIN_LIFE_CLIENT_SECRET"), account == null ? null : account.getAppSecretEnc()),
            firstNotBlank(query == null ? null : query.getAccountId(), prop("yy.douyin.life.account-id", "DOUYIN_LIFE_ACCOUNT_ID")),
            firstNonNull(query == null ? null : query.getStoreId(), account == null ? null : account.getStoreId())
        );
    }

    private LifeConfig resolveConfig(YyChannelInventoryBo bo) {
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        if (bo != null) {
            query.setStoreId(bo.getStoreId());
            query.setAccountId(bo.getAccountId());
        }
        return resolveConfig(query);
    }

    private YyChannelAccount findAccount(Long storeId) {
        if (storeId != null) {
            YyChannelAccount account = channelAccountMapper.selectOne(Wrappers.<YyChannelAccount>lambdaQuery()
                .eq(YyChannelAccount::getChannelType, CHANNEL_TYPE)
                .eq(YyChannelAccount::getStoreId, storeId)
                .orderByDesc(YyChannelAccount::getId)
                .last("limit 1"));
            if (account != null) {
                return account;
            }
        }
        return channelAccountMapper.selectOne(Wrappers.<YyChannelAccount>lambdaQuery()
            .eq(YyChannelAccount::getChannelType, CHANNEL_TYPE)
            .orderByDesc(YyChannelAccount::getId)
            .last("limit 1"));
    }

    private YyChannelApiResultVo validateInventoryConfig(String apiName, LifeConfig config) {
        return validateConfig(apiName, config, List.of("client_key", "client_secret", "account_id"));
    }

    private YyChannelApiResultVo callInventoryApi(
        LifeConfig config,
        YyChannelInventoryBo bo,
        String apiName,
        Map<String, Object> defaultBody,
        boolean persistSlot
    ) {
        String clientAccessToken = requireClientAccessToken(config);
        if (StringUtils.isBlank(clientAccessToken)) {
            YyChannelApiResultVo result = missingResult(apiName);
            result.setMessage("client_token 未返回 client_access_token，请检查生活服务应用 client_key/client_secret 和权限");
            recordSyncLog(config, apiName, result, 0L, null);
            return result;
        }

        Map<String, Object> body = bodyFromRawPayload(bo, defaultBody);
        boolean useTestDataHeader = bo != null && Boolean.TRUE.equals(bo.getUseTestDataHeader());
        long start = System.nanoTime();
        YyChannelApiResultVo apiResult = switch (apiName) {
            case INVENTORY_SKU_UPSERT_API -> client().upsertReservationInventorySku(clientAccessToken, config.accountId(), body, useTestDataHeader);
            case RECEPTION_STOCK_SAVE_API -> client().saveReservationRealtimeStock(clientAccessToken, config.accountId(), body, useTestDataHeader);
            case RECEPTION_STOCK_TRIGGER_API -> client().triggerReservationStockUpdate(clientAccessToken, config.accountId(), body, useTestDataHeader);
            case TIME_STOCK_SAVE_API -> client().saveReservationTimeStock(clientAccessToken, config.accountId(), body, useTestDataHeader);
            default -> {
                YyChannelApiResultVo result = missingResult(apiName);
                result.setMessage("未知库存接口: " + apiName);
                yield result;
            }
        };
        apiResult.setChannelType(channelType());
        String logId = extractLogId(apiResult.getRawResponse());
        apiResult.setLogId(logId);
        recordSyncLog(config, apiName, apiResult, Duration.ofNanos(System.nanoTime() - start).toMillis(), logId);
        if (persistSlot) {
            upsertInventorySlot(config, bo, body, apiResult, logId);
            upsertUnifiedBookingSlotInventory(config, bo, apiResult, logId);
        }
        return apiResult;
    }

    private Map<String, Object> bodyFromRawPayload(YyChannelInventoryBo bo, Map<String, Object> defaultBody) {
        if (bo != null && bo.getRawPayload() != null && !bo.getRawPayload().isEmpty()) {
            return new LinkedHashMap<>(bo.getRawPayload());
        }
        return defaultBody == null ? new LinkedHashMap<>() : defaultBody;
    }

    private Map<String, Object> buildInventorySkuBody(YyChannelInventoryBo bo) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("poi_id", resolvePoiId(bo));
        body.put("time_slot", bo == null || bo.getTimeSlot() == null ? 30 : bo.getTimeSlot());
        Map<String, Object> sku = new LinkedHashMap<>();
        putObject(sku, "sku_id", bo == null ? null : bo.getSkuId());
        putObject(sku, "sku_out_id", bo == null ? null : bo.getSkuOutId());
        putObject(sku, "sku_name", firstNotBlank(bo == null ? null : bo.getSkuName(), "证件照预约"));
        sku.put("sku_operate_type", bo == null || bo.getSkuOperateType() == null ? 1 : bo.getSkuOperateType());
        body.put("sku_info_list", List.of(sku));
        return body;
    }

    private Map<String, Object> buildRealtimeStockBody(YyChannelInventoryBo bo) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("poi_id", resolvePoiId(bo));
        Map<String, Object> slot = new LinkedHashMap<>();
        slot.put("date", bo.getDate());
        slot.put("start_time", bo.getStartTime());
        slot.put("end_time", bo.getEndTime());
        slot.put("available_stock", bo.getAvailableStock());
        Map<String, Object> sku = new LinkedHashMap<>();
        putObject(sku, "sku_id", bo.getSkuId());
        putObject(sku, "sku_out_id", bo.getSkuOutId());
        sku.put("real_time_stock_list", List.of(slot));
        body.put("sku_real_time_stock_list", List.of(sku));
        return body;
    }

    private Map<String, Object> buildStockTriggerBody(YyChannelInventoryBo bo) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("poi_id", resolvePoiId(bo));
        putObject(body, "start_date", firstNotBlank(bo == null ? null : bo.getStartDate(), bo == null ? null : bo.getDate()));
        putObject(body, "end_date", firstNotBlank(bo == null ? null : bo.getEndDate(), bo == null ? null : bo.getDate()));
        Map<String, Object> sku = new LinkedHashMap<>();
        putObject(sku, "sku_id", bo == null ? null : bo.getSkuId());
        putObject(sku, "sku_out_id", bo == null ? null : bo.getSkuOutId());
        body.put("sku_info_struct_list", List.of(sku));
        return body;
    }

    private Map<String, Object> buildTimeStockBody(LifeConfig config, YyChannelInventoryBo bo) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("account_id", config.accountId());
        body.put("poi_id", resolvePoiId(bo));
        String roomId = firstNotBlank(
            bo == null ? null : bo.getReceptionUnitId(),
            bo == null ? null : bo.getSkuId()
        );
        if (StringUtils.isBlank(roomId)) {
            return body;
        }
        String date = firstNotBlank(bo == null ? null : bo.getDate(), bo == null ? null : bo.getStartDate());
        String startDate = firstNotBlank(bo == null ? null : bo.getStartDate(), date);
        String endDate = firstNotBlank(bo == null ? null : bo.getEndDate(), date);
        Map<String, Object> timeRule = new LinkedHashMap<>();
        timeRule.put("rule_type", 1);
        if (StringUtils.isNotBlank(startDate) && StringUtils.isNotBlank(endDate)) {
            timeRule.put("date_range", List.of(startDate, endDate));
        }
        putObject(timeRule, "week_range", weekValue(date));
        if (StringUtils.isNotBlank(bo == null ? null : bo.getStartTime()) && StringUtils.isNotBlank(bo == null ? null : bo.getEndTime())) {
            timeRule.put("time_range", List.of(bo.getStartTime(), bo.getEndTime()));
        }
        putObject(timeRule, "stock", bo.getAvailableStock());
        Map<String, Object> roomRule = new LinkedHashMap<>();
        roomRule.put("room_id", numericOrText(roomId));
        roomRule.put("time_rules", List.of(timeRule));
        body.put("room_time_rules", List.of(roomRule));
        return body;
    }

    private Integer weekValue(String date) {
        if (StringUtils.isBlank(date)) {
            return 1;
        }
        try {
            return LocalDate.parse(date).getDayOfWeek().getValue();
        } catch (Exception ignored) {
            return 1;
        }
    }

    private Object numericOrText(String value) {
        if (StringUtils.isBlank(value)) {
            return value;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ignored) {
            return value;
        }
    }

    private void upsertInventorySlot(
        LifeConfig config,
        YyChannelInventoryBo bo,
        Map<String, Object> body,
        YyChannelApiResultVo apiResult,
        String logId
    ) {
        if (bo == null || StringUtils.isBlank(resolvePoiId(bo)) || StringUtils.isBlank(resolveSkuId(bo))
            || StringUtils.isBlank(bo.getDate()) || StringUtils.isBlank(bo.getStartTime()) || StringUtils.isBlank(bo.getEndTime())) {
            return;
        }
        YyChannelInventorySlot entity = channelInventorySlotMapper.selectOne(inventorySlotQuery(
            resolvePoiId(bo),
            bo.getSkuId(),
            bo.getSkuOutId(),
            bo.getDate(),
            bo.getStartTime(),
            bo.getEndTime()
        ).last("limit 1"));
        boolean isNew = entity == null;
        if (entity == null) {
            entity = new YyChannelInventorySlot();
            entity.setId(nextLongId());
            entity.setChannelType(CHANNEL_TYPE);
        }
        entity.setStoreId(config == null ? null : config.storeId());
        entity.setAccountId(config == null ? "" : config.accountId());
        entity.setPoiId(resolvePoiId(bo));
        entity.setSkuId(firstNotBlank(bo.getSkuId(), ""));
        entity.setSkuOutId(firstNotBlank(bo.getSkuOutId(), ""));
        entity.setBizDate(bo.getDate());
        entity.setStartTime(bo.getStartTime());
        entity.setEndTime(bo.getEndTime());
        entity.setAvailableStock(bo.getAvailableStock());
        entity.setSyncStatus(Boolean.TRUE.equals(apiResult.getSuccess()) ? "SYNCED" : "FAILED");
        entity.setLastLogId(firstNotBlank(logId, ""));
        entity.setRawPayload(limitText(redactSensitivePayload(toJson(body)), 2000));
        if (isNew) {
            channelInventorySlotMapper.insert(entity);
        } else {
            channelInventorySlotMapper.updateById(entity);
        }
    }

    private void upsertUnifiedBookingSlotInventory(
        LifeConfig config,
        YyChannelInventoryBo bo,
        YyChannelApiResultVo apiResult,
        String logId
    ) {
        if (bookingSlotInventoryMapper == null || bo == null || apiResult == null
            || !Boolean.TRUE.equals(apiResult.getSuccess())) {
            return;
        }
        Long storeId = firstNonNull(bo.getStoreId(), config == null ? null : config.storeId());
        String externalSkuId = resolveSkuId(bo);
        String bizDate = normalizeSlotDate(bo.getDate());
        String startTime = normalizeSlotTime(bo.getStartTime());
        String endTime = normalizeSlotTime(bo.getEndTime());
        Integer capacity = bo.getAvailableStock();
        if (storeId == null || StringUtils.isBlank(externalSkuId) || StringUtils.isBlank(bizDate)
            || StringUtils.isBlank(startTime) || StringUtils.isBlank(endTime) || capacity == null) {
            return;
        }

        YyBookingSlotInventory entity = bookingSlotInventoryMapper.selectOne(Wrappers.<YyBookingSlotInventory>lambdaQuery()
            .eq(YyBookingSlotInventory::getStoreId, storeId)
            .eq(YyBookingSlotInventory::getExternalSkuId, externalSkuId)
            .eq(YyBookingSlotInventory::getBizDate, bizDate)
            .eq(YyBookingSlotInventory::getStartTime, startTime)
            .eq(YyBookingSlotInventory::getEndTime, endTime)
            .eq(YyBookingSlotInventory::getDelFlag, "0")
            .orderByDesc(YyBookingSlotInventory::getId)
            .last("limit 1"));
        boolean isNew = entity == null;
        if (entity == null) {
            entity = new YyBookingSlotInventory();
            entity.setId(nextLongId());
            entity.setStoreId(storeId);
            entity.setExternalSkuId(externalSkuId);
            entity.setBizDate(bizDate);
            entity.setStartTime(startTime);
            entity.setEndTime(endTime);
            entity.setPaidCount(0);
            entity.setConflictCount(0);
            entity.setVersion(0);
            entity.setDelFlag("0");
        }

        entity.setCapacity(Math.max(capacity, 0));
        entity.setStatus("ACTIVE");
        entity.setRemark(limitText("DOUYIN_LIFE 库存同步，poi="
            + firstNotBlank(resolvePoiId(bo), "")
            + "，logid=" + firstNotBlank(logId, ""), 500));
        if (isNew) {
            bookingSlotInventoryMapper.insert(entity);
        } else {
            bookingSlotInventoryMapper.updateById(entity);
        }
    }

    private String resolvePoiId(YyChannelInventoryBo bo) {
        return firstNotBlank(
            bo == null ? null : bo.getPoiId(),
            prop("yy.douyin.life.poi-id", "DOUYIN_LIFE_POI_ID"),
            prop("yy.douyin.life.store-id", "DOUYIN_LIFE_STORE_ID")
        );
    }

    private String resolveSkuId(YyChannelInventoryBo bo) {
        return firstNotBlank(bo == null ? null : bo.getSkuId(), bo == null ? null : bo.getSkuOutId());
    }

    private void putObject(Map<String, Object> body, String key, Object value) {
        if (value instanceof String text) {
            if (StringUtils.isNotBlank(text)) {
                body.put(key, text);
            }
            return;
        }
        if (value != null) {
            body.put(key, value);
        }
    }

    private LambdaQueryWrapper<YyChannelInventorySlot> inventorySlotQuery(
        String poiId,
        String skuId,
        String skuOutId,
        String date,
        String startTime,
        String endTime
    ) {
        LambdaQueryWrapper<YyChannelInventorySlot> wrapper = Wrappers.<YyChannelInventorySlot>lambdaQuery()
            .eq(YyChannelInventorySlot::getChannelType, CHANNEL_TYPE)
            .eq(YyChannelInventorySlot::getPoiId, poiId)
            .eq(YyChannelInventorySlot::getBizDate, date)
            .eq(YyChannelInventorySlot::getStartTime, startTime)
            .eq(YyChannelInventorySlot::getEndTime, endTime);
        boolean hasSkuId = StringUtils.isNotBlank(skuId);
        boolean hasSkuOutId = StringUtils.isNotBlank(skuOutId);
        if (hasSkuId && hasSkuOutId) {
            wrapper.and(nested -> nested
                .eq(YyChannelInventorySlot::getSkuId, skuId)
                .or()
                .eq(YyChannelInventorySlot::getSkuOutId, skuOutId));
        } else if (hasSkuId) {
            wrapper.eq(YyChannelInventorySlot::getSkuId, skuId);
        } else if (hasSkuOutId) {
            wrapper.eq(YyChannelInventorySlot::getSkuOutId, skuOutId);
        }
        return wrapper;
    }

    private YyChannelApiResultVo validateConfig(String apiName, LifeConfig config, List<String> requiredFields) {
        YyChannelApiResultVo result = missingResult(apiName);
        for (String field : requiredFields) {
            if (StringUtils.isBlank(config.value(field))) {
                result.getMissingConfig().add(field);
            }
        }
        if (result.getMissingConfig().isEmpty()) {
            return null;
        }
        result.setMessage("抖音生活服务参数未配置完整: " + String.join(", ", result.getMissingConfig()));
        result.setRequestSummary("配置来源优先级：请求参数 -> 环境变量/配置文件 -> yy_channel_account；client_secret/access_token 不回显");
        return result;
    }

    private YyChannelApiResultVo missingResult(String apiName) {
        YyChannelApiResultVo result = new YyChannelApiResultVo();
        result.setChannelType(channelType());
        result.setApiName(apiName);
        result.setSuccess(false);
        result.setEndpoint(resolveBaseUrl() + switch (apiName) {
            case "client_token" -> DouyinOpenApiClient.CLIENT_TOKEN_PATH;
            case ORDER_QUERY_API -> DouyinOpenApiClient.LIFE_ORDER_QUERY_PATH;
            case ORDER_CONFIRM_API -> DouyinOpenApiClient.LIFE_ORDER_CONFIRM_PATH;
            case ORDER_VERIFY_API -> DouyinOpenApiClient.LIFE_CERTIFICATE_VERIFY_PATH;
            case INVENTORY_SKU_UPSERT_API -> DouyinOpenApiClient.LIFE_INVENTORY_SKU_UPSERT_PATH;
            case RECEPTION_STOCK_SAVE_API -> DouyinOpenApiClient.LIFE_REALTIME_STOCK_SAVE_PATH;
            case RECEPTION_STOCK_TRIGGER_API -> DouyinOpenApiClient.LIFE_STOCK_UPDATE_TRIGGER_PATH;
            case TIME_STOCK_SAVE_API -> DouyinOpenApiClient.LIFE_TIME_STOCK_SAVE_PATH;
            case TIME_STOCK_GET_API -> DouyinOpenApiClient.LIFE_TIME_STOCK_GET_PATH;
            default -> "";
        });
        return result;
    }

    private String requireClientAccessToken(LifeConfig config) {
        YyChannelApiResultVo tokenResult = client().clientToken(config.clientKey(), config.clientSecret());
        String clientAccessToken = client().extractClientAccessToken(tokenResult.getRawResponse());
        return StringUtils.isBlank(clientAccessToken) ? "" : clientAccessToken;
    }

    private boolean hasAnyQueryFilter(YyChannelOrderQuery query) {
        return StringUtils.isNotBlank(query.getOrderId())
            || StringUtils.isNotBlank(query.getOutOrderNo())
            || StringUtils.isNotBlank(query.getOpenId())
            || StringUtils.isNotBlank(query.getOrderStatus())
            || StringUtils.isNotBlank(query.getStartTime())
            || StringUtils.isNotBlank(query.getEndTime());
    }

    private Map<String, String> buildQueryParams(YyChannelOrderQuery query) {
        Map<String, String> params = new LinkedHashMap<>();
        putParam(params, "order_id", query.getOrderId());
        putParam(params, "out_order_no", query.getOutOrderNo());
        putParam(params, "open_id", query.getOpenId());
        putParam(params, "order_status", query.getOrderStatus());
        putParam(params, "create_order_start_time", douyinOrderQueryTime(query.getStartTime()));
        putParam(params, "create_order_end_time", douyinOrderQueryTime(query.getEndTime()));
        params.put("page_num", String.valueOf(query.getPageNum() == null || query.getPageNum() < 1 ? 1 : query.getPageNum()));
        params.put("page_size", String.valueOf(query.getPageSize() == null || query.getPageSize() < 1 ? 10 : query.getPageSize()));
        return params;
    }

    private ExternalOrderQueryResult queryExternalOrders(LifeConfig config, YyChannelOrderQuery query) {
        YyChannelApiResultVo missing = validateConfig(
            ORDER_QUERY_API,
            config,
            List.of("client_key", "client_secret", "account_id")
        );
        if (missing != null) {
            return new ExternalOrderQueryResult(missing, List.of());
        }
        if (query == null || !hasAnyQueryFilter(query)) {
            YyChannelApiResultVo result = missingResult(ORDER_QUERY_API);
            result.setMessage("生活服务订单查询至少需要 orderId/outOrderNo/openId/orderStatus/startTime/endTime 之一");
            return new ExternalOrderQueryResult(result, List.of());
        }

        String clientAccessToken = requireClientAccessToken(config);
        if (StringUtils.isBlank(clientAccessToken)) {
            YyChannelApiResultVo result = missingResult(ORDER_QUERY_API);
            result.setMessage("client_token 未返回 client_access_token，请检查生活服务应用 client_key/client_secret 和权限");
            recordSyncLog(config, ORDER_QUERY_API, result, 0L, null);
            return new ExternalOrderQueryResult(result, List.of());
        }

        long start = System.nanoTime();
        YyChannelApiResultVo apiResult = client().queryLocalLifeOrder(
            clientAccessToken,
            config.accountId(),
            buildQueryParams(query),
            Boolean.TRUE.equals(query.getUseTestDataHeader())
        );
        apiResult.setChannelType(channelType());
        recordSyncLog(config, ORDER_QUERY_API, apiResult, Duration.ofNanos(System.nanoTime() - start).toMillis(), extractLogId(apiResult.getRawResponse()));
        return new ExternalOrderQueryResult(apiResult, extractOrders(apiResult.getRawResponse()));
    }

    private YyChannelOrderVo selectBindableOrder(List<YyChannelOrderVo> orders, YyChannelOrderQuery query) {
        if (orders == null || orders.isEmpty()) {
            return null;
        }
        String expectedOrderId = firstNotBlank(query.getOrderId(), query.getOutOrderNo());
        if (StringUtils.isNotBlank(expectedOrderId)) {
            List<YyChannelOrderVo> matched = orders.stream()
                .filter(order -> Objects.equals(order.getExternalOrderId(), expectedOrderId))
                .toList();
            if (matched.size() == 1) {
                return matched.get(0);
            }
        }
        return orders.size() == 1 ? orders.get(0) : null;
    }

    private static boolean isPhoneLast4(String phoneLast4) {
        return StringUtils.isNotBlank(phoneLast4) && phoneLast4.matches("\\d{4}");
    }

    private static boolean matchesPhoneLast4(String phone, String phoneLast4) {
        if (!isPhoneLast4(phoneLast4)) {
            return false;
        }
        String digits = phone == null ? "" : phone.replaceAll("\\D", "");
        return digits.length() >= 4 && digits.endsWith(phoneLast4);
    }

    private void putParam(Map<String, String> params, String key, String value) {
        if (StringUtils.isNotBlank(value)) {
            params.put(key, value);
        }
    }

    private String douyinOrderQueryTime(String value) {
        if (StringUtils.isBlank(value)) {
            return "";
        }
        String text = value.trim();
        if (text.matches("\\d{13}")) {
            try {
                return String.valueOf(Long.parseLong(text) / 1000L);
            } catch (Exception ignored) {
                return text;
            }
        }
        if (text.matches("\\d{10}")) {
            return text;
        }
        try {
            LocalDateTime dateTime = LocalDateTime.parse(text, DATE_TIME_FORMATTER);
            return String.valueOf(dateTime.atZone(ZoneId.systemDefault()).toEpochSecond());
        } catch (Exception ignored) {
            return text;
        }
    }

    private List<YyChannelOrderVo> extractOrders(String rawResponse) {
        List<YyChannelOrderVo> orders = new ArrayList<>();
        if (StringUtils.isBlank(rawResponse)) {
            return orders;
        }
        try {
            JsonNode root = OBJECT_MAPPER.readTree(rawResponse);
            JsonNode ordersNode = findArrayNode(root, "orders", "order_list", "list", "items", "records");
            if (ordersNode == null && root.isArray()) {
                ordersNode = root;
            }
            if (ordersNode == null) {
                JsonNode dataNode = root.findValue("data");
                if (dataNode != null && dataNode.isObject()) {
                    JsonNode nestedOrders = findArrayNode(dataNode, "orders", "order_list", "list", "items", "records");
                    if (nestedOrders != null) {
                        ordersNode = nestedOrders;
                    }
                }
            }
            if (ordersNode == null) {
                return orders;
            }
            if (ordersNode.isArray()) {
                for (JsonNode orderNode : ordersNode) {
                    orders.add(toOrderVo(orderNode, rawResponse));
                }
                return orders;
            }
            orders.add(toOrderVo(ordersNode, rawResponse));
        } catch (Exception ignored) {
            // 解析失败时返回空列表，由调用方按原始响应展示。
        }
        return orders;
    }

    private JsonNode findArrayNode(JsonNode node, String... fieldNames) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isObject()) {
            for (String fieldName : fieldNames) {
                JsonNode value = node.get(fieldName);
                if (value != null && value.isArray()) {
                    return value;
                }
            }
            for (JsonNode child : node) {
                JsonNode nested = findArrayNode(child, fieldNames);
                if (nested != null) {
                    return nested;
                }
            }
        } else if (node.isArray()) {
            return node;
        }
        return null;
    }

    private YyChannelOrderVo toOrderVo(JsonNode orderNode, String rawPayload) {
        YyChannelOrderVo order = new YyChannelOrderVo();
        String externalOrderId = firstText(orderNode, "order_id", "orderId", "out_order_no", "outOrderNo", "book_id", "bookId");
        String externalStatus = firstText(orderNode, "order_status", "orderStatus", "status", "status_code", "state");
        order.setChannelType(channelType());
        order.setExternalOrderId(StringUtils.isNotBlank(externalOrderId) ? externalOrderId : "DY-LIFE-ORDER");
        order.setExternalStatus(StringUtils.isNotBlank(externalStatus) ? externalStatus : "UNKNOWN");
        order.setCustomerName(firstText(orderNode, "buyer_name", "customer_name", "receiver_name", "contact_name", "nickname"));
        order.setCustomerPhone(firstText(orderNode, "encrypt_mobile", "mobile", "phone", "receiver_phone"));
        order.setAmount(parseAmount(firstText(orderNode, "pay_amount", "amount", "pay_price", "payPrice")));
        order.setSyncStatus("SYNCED");
        String orderPayload = orderNode.toString().isBlank() ? rawPayload : orderNode.toString();
        order.setRawPayload(redactSensitivePayload(orderPayload));
        order.setLocalOrderId(resolveLocalOrderId(order.getExternalOrderId()));
        return order;
    }

    private Long resolveLocalOrderId(String externalOrderId) {
        if (StringUtils.isBlank(externalOrderId)) {
            return null;
        }
        YyChannelOrderMapping mapping = channelOrderMappingMapper.selectOne(Wrappers.<YyChannelOrderMapping>lambdaQuery()
            .eq(YyChannelOrderMapping::getChannelType, CHANNEL_TYPE)
            .eq(YyChannelOrderMapping::getExternalOrderId, externalOrderId)
            .orderByDesc(YyChannelOrderMapping::getId)
            .last("limit 1"));
        return mapping == null ? null : mapping.getOrderId();
    }

    private YyChannelOrderVo fallbackOrder(String message, String rawPayload, YyChannelOrderQuery query) {
        YyChannelOrderVo order = new YyChannelOrderVo();
        order.setChannelType(channelType());
        order.setExternalOrderId(firstNotBlank(query == null ? null : query.getOrderId(), query == null ? null : query.getOutOrderNo(), "DY-LIFE-MOCK"));
        order.setExternalStatus("UNKNOWN");
        order.setCustomerName("抖音生活服务");
        order.setCustomerPhone("");
        order.setAmount(BigDecimal.ZERO);
        order.setSyncStatus("FAILED");
        order.setRawPayload(redactSensitivePayload(StringUtils.isNotBlank(rawPayload) ? rawPayload : message));
        return order;
    }

    private void upsertOrderMapping(LifeConfig config, String externalOrderId, String externalStatus, String syncStatus, String rawPayload) {
        upsertOrderMapping(config, externalOrderId, externalStatus, syncStatus, rawPayload, null);
    }

    private void upsertOrderMapping(LifeConfig config, String externalOrderId, String externalStatus, String syncStatus, String rawPayload, Long localOrderId) {
        if (StringUtils.isBlank(externalOrderId)) {
            return;
        }
        YyChannelOrderMapping entity = channelOrderMappingMapper.selectOne(Wrappers.<YyChannelOrderMapping>lambdaQuery()
            .eq(YyChannelOrderMapping::getChannelType, CHANNEL_TYPE)
            .eq(YyChannelOrderMapping::getExternalOrderId, externalOrderId)
            .orderByDesc(YyChannelOrderMapping::getId)
            .last("limit 1"));
        boolean isNew = entity == null;
        if (entity == null) {
            entity = new YyChannelOrderMapping();
            entity.setId(nextLongId());
            entity.setChannelType(CHANNEL_TYPE);
            entity.setExternalOrderId(externalOrderId);
            entity.setStoreId(config == null ? null : config.storeId());
        }
        if (localOrderId != null) {
            entity.setOrderId(localOrderId);
        }
        entity.setExternalStatus(externalStatus);
        entity.setSyncStatus(syncStatus);
        entity.setRawPayload(redactSensitivePayload(rawPayload));
        if (isNew) {
            channelOrderMappingMapper.insert(entity);
        } else {
            channelOrderMappingMapper.updateById(entity);
        }
    }

    private String mappingSyncStatusForLocalResult(LocalOrderUpsertResult localResult) {
        return localResult != null && localResult.localOrderId() != null ? "SYNCED" : "FAILED_LOCAL";
    }

    private BackfillResult backfillLocalOrderFromMapping(YyChannelOrderMapping mapping) {
        if (mapping == null || StringUtils.isBlank(mapping.getRawPayload())) {
            return BackfillResult.skippedResult();
        }
        Long orderId = mapping.getOrderId();
        YyOrder entity = orderId == null ? null : orderMapper.selectById(orderId);
        if (entity == null && StringUtils.isNotBlank(mapping.getExternalOrderId())) {
            entity = orderMapper.selectOne(Wrappers.<YyOrder>lambdaQuery()
                .eq(YyOrder::getSource, CHANNEL_TYPE)
                .eq(YyOrder::getExternalOrderId, mapping.getExternalOrderId())
                .orderByDesc(YyOrder::getId)
                .last("limit 1"));
        }
        if (entity == null) {
            return BackfillResult.failedResult();
        }

        OrderExternalSpec externalSpec = extractOrderExternalSpec(mapping.getRawPayload());
        OrderSlotSpec slotSpec = externalSpec.slotSpec();
        boolean changed = false;
        if (StringUtils.isNotBlank(externalSpec.externalPoiId()) && StringUtils.isBlank(entity.getExternalPoiId())) {
            entity.setExternalPoiId(externalSpec.externalPoiId());
            changed = true;
        }
        if (StringUtils.isNotBlank(externalSpec.externalSkuId()) && StringUtils.isBlank(entity.getExternalSkuId())) {
            entity.setExternalSkuId(externalSpec.externalSkuId());
            changed = true;
        }
        if (slotSpec != null) {
            changed = applyMissingOrderSlotSpec(entity, slotSpec) || changed;
        }

        String externalPoiId = firstNotBlank(entity.getExternalPoiId(), externalSpec.externalPoiId());
        String externalSkuId = firstNotBlank(entity.getExternalSkuId(), slotSpec == null ? null : slotSpec.externalSkuId(), externalSpec.externalSkuId());
        if (storeResolver != null) {
            IDouyinLifeStoreResolver.StoreResolution resolution = storeResolver.resolveStore(externalPoiId, externalSkuId, CHANNEL_TYPE);
            if (resolution.result() == IDouyinLifeStoreResolver.ResolutionResult.HIT) {
                if (resolution.storeId() != null && !Objects.equals(entity.getStoreId(), resolution.storeId())) {
                    entity.setStoreId(resolution.storeId());
                    changed = true;
                }
                if ("NEED_MAPPING".equals(entity.getInventoryStatus())) {
                    entity.setInventoryStatus("");
                    entity.setConflictReason("");
                    changed = true;
                }
            } else if (StringUtils.isNotBlank(externalPoiId)) {
                String reason = "DOUYIN_LIFE POI/SKU 映射缺失，保留原门店: " + firstNotBlank(resolution.message(), "");
                if (!"NEED_MAPPING".equals(entity.getInventoryStatus()) || !Objects.equals(entity.getConflictReason(), reason)) {
                    entity.setInventoryStatus("NEED_MAPPING");
                    entity.setConflictReason(reason);
                    changed = true;
                }
            }
        }

        if (!changed) {
            confirmBackfilledPaidInventoryIfPossible(entity);
            return BackfillResult.skippedResult();
        }
        boolean updated = orderMapper.updateById(entity) > 0;
        if (!updated) {
            return BackfillResult.failedResult();
        }
        confirmBackfilledPaidInventoryIfPossible(entity);
        return BackfillResult.updatedResult();
    }

    private boolean applyMissingOrderSlotSpec(YyOrder entity, OrderSlotSpec slotSpec) {
        boolean changed = false;
        if (entity == null || slotSpec == null) {
            return false;
        }
        if (StringUtils.isNotBlank(slotSpec.slotDate()) && StringUtils.isBlank(entity.getSlotDate())) {
            entity.setSlotDate(slotSpec.slotDate());
            changed = true;
        }
        if (StringUtils.isNotBlank(slotSpec.startTime()) && StringUtils.isBlank(entity.getSlotStartTime())) {
            entity.setSlotStartTime(slotSpec.startTime());
            changed = true;
        }
        if (StringUtils.isNotBlank(slotSpec.endTime()) && StringUtils.isBlank(entity.getSlotEndTime())) {
            entity.setSlotEndTime(slotSpec.endTime());
            changed = true;
        }
        if (StringUtils.isNotBlank(slotSpec.externalSkuId()) && StringUtils.isBlank(entity.getExternalSkuId())) {
            entity.setExternalSkuId(slotSpec.externalSkuId());
            changed = true;
        }
        if (entity.getArrivalTime() == null
            && StringUtils.isNotBlank(entity.getSlotDate())
            && StringUtils.isNotBlank(entity.getSlotStartTime())) {
            Date arrivalTime = parseSlotArrivalTime(entity.getSlotDate(), entity.getSlotStartTime());
            if (arrivalTime != null) {
                entity.setArrivalTime(arrivalTime);
                changed = true;
            }
        }
        return changed;
    }

    private void recordBackfillLog(YyChannelSyncResultVo result) {
        YyChannelSyncLog log = new YyChannelSyncLog();
        log.setId(nextLongId());
        log.setChannelType(CHANNEL_TYPE);
        log.setApiName("life_order_field_backfill");
        log.setRequestId(firstNotBlank(result == null ? null : result.getLastLogId(), ""));
        log.setSuccess(result != null && "SYNCED".equals(result.getSyncStatus()) ? "1" : "0");
        log.setErrorMessage(result == null ? "" : limitText(result.getMessage(), 500));
        log.setRetryable("0");
        channelSyncLogMapper.insert(log);
    }

    private LocalOrderUpsertResult upsertLocalOrder(
        LifeConfig config,
        String externalOrderId,
        String localStatus,
        Long storeId,
        String customerName,
        String customerPhone,
        String remark,
        BigDecimal spend
    ) {
        return upsertLocalOrder(config, externalOrderId, localStatus, storeId, customerName, customerPhone, remark, spend, "", "", null, BigDecimal.ZERO, null);
    }

    private LocalOrderUpsertResult upsertLocalOrder(
        LifeConfig config,
        String externalOrderId,
        String localStatus,
        Long storeId,
        String customerName,
        String customerPhone,
        String remark,
        BigDecimal spend,
        String bookId,
        String certificateCode
    ) {
        return upsertLocalOrder(config, externalOrderId, localStatus, storeId, customerName, customerPhone, remark, spend, bookId, certificateCode, null, BigDecimal.ZERO, null);
    }

    private LocalOrderUpsertResult upsertLocalOrder(
        LifeConfig config,
        String externalOrderId,
        String localStatus,
        Long storeId,
        String customerName,
        String customerPhone,
        String remark,
        BigDecimal spend,
        String bookId,
        String certificateCode,
        OrderSlotSpec slotSpec
    ) {
        return upsertLocalOrder(config, externalOrderId, localStatus, storeId, customerName, customerPhone, remark, spend, bookId, certificateCode, slotSpec, BigDecimal.ZERO, null);
    }

    private LocalOrderUpsertResult upsertLocalOrder(
        LifeConfig config,
        String externalOrderId,
        String localStatus,
        Long storeId,
        String customerName,
        String customerPhone,
        String remark,
        BigDecimal spend,
        String bookId,
        String certificateCode,
        OrderSlotSpec slotSpec,
        BigDecimal refundAmount
    ) {
        return upsertLocalOrder(config, externalOrderId, localStatus, storeId, customerName, customerPhone, remark, spend, bookId, certificateCode, slotSpec, refundAmount, null);
    }

    private LocalOrderUpsertResult upsertLocalOrder(
        LifeConfig config,
        String externalOrderId,
        String localStatus,
        Long storeId,
        String customerName,
        String customerPhone,
        String remark,
        BigDecimal spend,
        String bookId,
        String certificateCode,
        OrderSlotSpec slotSpec,
        BigDecimal refundAmount,
        String rawPayload
    ) {
        if (StringUtils.isBlank(externalOrderId) || !shouldSyncLocalOrder(localStatus)) {
            return new LocalOrderUpsertResult(null, false);
        }

        YyOrder entity = orderMapper.selectOne(Wrappers.<YyOrder>lambdaQuery()
            .eq(YyOrder::getSource, CHANNEL_TYPE)
            .eq(YyOrder::getExternalOrderId, externalOrderId)
            .orderByDesc(YyOrder::getId)
            .last("limit 1"));

        customerName = firstNotBlank(customerName, "抖音来客客户");
        customerPhone = firstNotBlank(customerPhone, "");

        OrderExternalSpec externalSpec = extractOrderExternalSpec(rawPayload);
        if (slotSpec == null && externalSpec.slotSpec() != null) {
            slotSpec = externalSpec.slotSpec();
        } else if (slotSpec != null && externalSpec.slotSpec() != null) {
            slotSpec = mergeOrderSlotSpec(slotSpec, externalSpec.slotSpec());
        }

        // Try resolver for DOUYIN_LIFE order store mapping
        Long resolvedStoreId = null;
        boolean resolverFailed = false;
        String resolverMessage = null;
        if (storeResolver != null && "DOUYIN_LIFE".equals(CHANNEL_TYPE)) {
            String externalPoiId = externalSpec.externalPoiId();
            String externalSkuId = firstNotBlank(slotSpec == null ? null : slotSpec.externalSkuId(), externalSpec.externalSkuId(), "");
            IDouyinLifeStoreResolver.StoreResolution resolution = storeResolver.resolveStore(
                externalPoiId, externalSkuId, CHANNEL_TYPE
            );
            if (resolution.result() == IDouyinLifeStoreResolver.ResolutionResult.HIT) {
                resolvedStoreId = resolution.storeId();
            } else {
                resolverFailed = true;
                resolverMessage = resolution.message();
            }
        }

        Long localStoreId = firstNonNull(resolvedStoreId, storeId,
            config == null ? null : config.storeId(),
            entity == null ? null : entity.getStoreId(),
            firstStoreId());
        Long amountCent = amountToCent(spend);
        Long refundAmountCent = amountToCent(refundAmount);
        String payStatus = mapPayStatus(localStatus);
        if (localStoreId == null) {
            return new LocalOrderUpsertResult(null, false);
        }

        if (entity == null) {
            entity = new YyOrder();
            entity.setId(nextLongId());
            entity.setOrderNo("DYL-" + externalOrderId);
            entity.setStoreId(localStoreId);
            entity.setCustomerName(customerName);
            entity.setCustomerPhone(customerPhone);
            entity.setSource(CHANNEL_TYPE);
            entity.setChannelType(CHANNEL_TYPE);
            entity.setBookingMethod("CHANNEL");
            entity.setOrderTime(new Date());
            entity.setStatus(localStatus);
            entity.setPayStatus(payStatus);
            entity.setTotalAmountCent(amountCent);
            entity.setPaidAmountCent("PAID".equals(payStatus) ? amountCent : 0L);
            applyRefundState(entity, localStatus, refundAmountCent);
            if ("PAID".equals(payStatus)) {
                entity.setPaidTime(new Date());
            }
            entity.setExternalOrderId(externalOrderId);
            applyOrderExternalSpec(entity, externalSpec);
            applyOrderSlotSpec(entity, slotSpec);
            entity.setRemark(StringUtils.isNotBlank(remark) ? remark : "抖音来客自动同步");
            if (resolverFailed) {
                entity.setInventoryStatus("NEED_MAPPING");
                entity.setConflictReason("DOUYIN_LIFE POI/SKU 映射缺失，已归入默认门店: " + firstNotBlank(resolverMessage, ""));
            }
            orderMapper.insert(entity);
            upsertCustomer(customerName, customerPhone, spend, remark);
            upsertPhotoAlbumPlaceholder(entity, externalOrderId, bookId, certificateCode);
            confirmPaidInventoryIfPossible(entity, payStatus);
            return new LocalOrderUpsertResult(entity.getId(), true);
        }

        entity.setStatus(localStatus);
        entity.setChannelType(firstNotBlank(entity.getChannelType(), CHANNEL_TYPE));
        entity.setPayStatus(payStatus);
        applyRefundState(entity, localStatus, refundAmountCent);
        if (amountCent > 0) {
            entity.setTotalAmountCent(amountCent);
            if ("PAID".equals(payStatus)) {
                entity.setPaidAmountCent(amountCent);
            }
        }
        if ("PAID".equals(payStatus) && entity.getPaidTime() == null) {
            entity.setPaidTime(new Date());
        }
        if (resolvedStoreId != null && !Objects.equals(entity.getStoreId(), resolvedStoreId)) {
            entity.setStoreId(resolvedStoreId);
        } else if (entity.getStoreId() == null) {
            entity.setStoreId(localStoreId);
        }
        if (resolvedStoreId != null && "NEED_MAPPING".equals(entity.getInventoryStatus())) {
            entity.setInventoryStatus("");
            entity.setConflictReason("");
        } else if (resolverFailed) {
            entity.setInventoryStatus("NEED_MAPPING");
            entity.setConflictReason("DOUYIN_LIFE POI/SKU 映射缺失，已归入默认门店: " + firstNotBlank(resolverMessage, ""));
        }
        if (StringUtils.isBlank(entity.getCustomerName())) {
            entity.setCustomerName(customerName);
        }
        if (StringUtils.isBlank(entity.getCustomerPhone())) {
            entity.setCustomerPhone(customerPhone);
        }
        if (StringUtils.isBlank(entity.getBookingMethod())) {
            entity.setBookingMethod("CHANNEL");
        }
        applyOrderExternalSpec(entity, externalSpec);
        applyOrderSlotSpec(entity, slotSpec);
        if (StringUtils.isBlank(entity.getRemark())) {
            entity.setRemark(StringUtils.isNotBlank(remark) ? remark : "抖音来客自动同步");
        }
        orderMapper.updateById(entity);
        upsertCustomer(customerName, customerPhone, spend, remark);
        upsertPhotoAlbumPlaceholder(entity, externalOrderId, bookId, certificateCode);
        confirmPaidInventoryIfPossible(entity, payStatus);
        return new LocalOrderUpsertResult(entity.getId(), false);
    }

    private void applyRefundState(YyOrder entity, String localStatus, Long refundAmountCent) {
        if (entity == null || !isRefundLocalStatus(localStatus)) {
            return;
        }
        entity.setRefundStatus(localStatus);
        if (refundAmountCent != null && refundAmountCent > 0) {
            entity.setRefundAmountCent(refundAmountCent);
        }
    }

    private void applyOrderSlotSpec(YyOrder entity, OrderSlotSpec slotSpec) {
        if (entity == null || slotSpec == null) {
            return;
        }
        if (StringUtils.isNotBlank(slotSpec.slotDate())) {
            entity.setSlotDate(slotSpec.slotDate());
        }
        if (StringUtils.isNotBlank(slotSpec.startTime())) {
            entity.setSlotStartTime(slotSpec.startTime());
        }
        if (StringUtils.isNotBlank(slotSpec.endTime())) {
            entity.setSlotEndTime(slotSpec.endTime());
        }
        if (StringUtils.isNotBlank(slotSpec.externalSkuId()) && StringUtils.isBlank(entity.getExternalSkuId())) {
            entity.setExternalSkuId(slotSpec.externalSkuId());
        }
        if (entity.getArrivalTime() == null
            && StringUtils.isNotBlank(slotSpec.slotDate())
            && StringUtils.isNotBlank(slotSpec.startTime())) {
            Date arrivalTime = parseSlotArrivalTime(slotSpec.slotDate(), slotSpec.startTime());
            if (arrivalTime != null) {
                entity.setArrivalTime(arrivalTime);
            }
        }
    }

    private void applyOrderExternalSpec(YyOrder entity, OrderExternalSpec externalSpec) {
        if (entity == null || externalSpec == null) {
            return;
        }
        if (StringUtils.isNotBlank(externalSpec.externalPoiId())
            && StringUtils.isBlank(entity.getExternalPoiId())) {
            entity.setExternalPoiId(externalSpec.externalPoiId());
        }
        if (StringUtils.isNotBlank(externalSpec.externalSkuId())
            && StringUtils.isBlank(entity.getExternalSkuId())) {
            entity.setExternalSkuId(externalSpec.externalSkuId());
        }
    }

    private void confirmPaidInventoryIfPossible(YyOrder entity, String payStatus) {
        if (!"PAID".equals(payStatus) || bookingSlotInventoryService == null || entity == null) {
            return;
        }
        if ("NEED_MAPPING".equals(entity.getInventoryStatus())) {
            return;
        }
        if (entity.getInventorySlotId() == null && !hasCompleteSlotIdentity(entity)) {
            return;
        }
        bookingSlotInventoryService.confirmPaidOrderSlot(entity);
    }

    private void confirmBackfilledPaidInventoryIfPossible(YyOrder entity) {
        if (entity == null) {
            return;
        }
        String payStatus = firstNotBlank(entity.getPayStatus(), mapPayStatus(entity.getStatus()));
        confirmPaidInventoryIfPossible(entity, payStatus);
    }

    private boolean hasCompleteSlotIdentity(YyOrder entity) {
        return entity.getStoreId() != null
            && (entity.getServiceGroupId() != null || StringUtils.isNotBlank(entity.getExternalSkuId()))
            && StringUtils.isNotBlank(entity.getSlotDate())
            && StringUtils.isNotBlank(entity.getSlotStartTime())
            && StringUtils.isNotBlank(entity.getSlotEndTime());
    }

    private OrderSlotSpec extractOrderSlotSpec(JsonNode root) {
        if (root == null) {
            return null;
        }
        String slotDate = firstText(root,
            "slot_date", "slotDate", "biz_date", "bizDate", "date", "booking_date", "bookingDate", "reserve_date", "reserveDate");
        String startTime = firstText(root,
            "slot_start_time", "slotStartTime",
            "start_time", "startTime",
            "booking_start_time", "bookingStartTime",
            "booking_start_timestamp", "bookingStartTimestamp",
            "reserve_start_time", "reserveStartTime",
            "reserve_start_timestamp", "reserveStartTimestamp",
            "reservation_start_time", "reservationStartTime",
            "reservation_start_timestamp", "reservationStartTimestamp");
        String endTime = firstText(root,
            "slot_end_time", "slotEndTime",
            "end_time", "endTime",
            "booking_end_time", "bookingEndTime",
            "booking_end_timestamp", "bookingEndTimestamp",
            "reserve_end_time", "reserveEndTime",
            "reserve_end_timestamp", "reserveEndTimestamp",
            "reservation_end_time", "reservationEndTime",
            "reservation_end_timestamp", "reservationEndTimestamp");
        String externalSkuId = firstText(root, "sku_id", "skuId", "sku_out_id", "skuOutId", "external_sku_id", "externalSkuId");
        List<String> timeRange = firstTextArray(root, "time_range", "timeRange", "reserve_time_range", "reserveTimeRange", "booking_time_range", "bookingTimeRange");
        if (StringUtils.isBlank(startTime) && !timeRange.isEmpty()) {
            startTime = timeRange.get(0);
        }
        if (StringUtils.isBlank(endTime) && timeRange.size() > 1) {
            endTime = timeRange.get(1);
        }
        if (StringUtils.isBlank(slotDate)) {
            slotDate = firstDateFromTimestamp(startTime, endTime);
        }
        slotDate = normalizeSlotDate(slotDate);
        startTime = normalizeSlotTime(startTime);
        endTime = normalizeSlotTime(endTime);
        if (StringUtils.isBlank(slotDate) && StringUtils.isBlank(startTime)
            && StringUtils.isBlank(endTime) && StringUtils.isBlank(externalSkuId)) {
            return null;
        }
        return new OrderSlotSpec(slotDate, startTime, endTime, externalSkuId);
    }

    private OrderSlotSpec mergeOrderSlotSpec(OrderSlotSpec primary, OrderSlotSpec fallback) {
        if (primary == null) {
            return fallback;
        }
        if (fallback == null) {
            return primary;
        }
        return new OrderSlotSpec(
            firstNotBlank(primary.slotDate(), fallback.slotDate()),
            firstNotBlank(primary.startTime(), fallback.startTime()),
            firstNotBlank(primary.endTime(), fallback.endTime()),
            firstNotBlank(primary.externalSkuId(), fallback.externalSkuId())
        );
    }

    private OrderExternalSpec extractOrderExternalSpec(String rawPayload) {
        if (StringUtils.isBlank(rawPayload)) {
            return new OrderExternalSpec("", "", null);
        }
        try {
            JsonNode root = unwrapFirstOrderNode(OBJECT_MAPPER.readTree(rawPayload));
            String externalPoiId = firstText(root,
                "poi_id", "poiId",
                "intention_poi_id", "intentionPoiId",
                "shop_id", "shopId",
                "external_poi_id", "externalPoiId"
            );
            String externalSkuId = firstText(root,
                "sku_id", "skuId", "sku_out_id", "skuOutId",
                "external_sku_id", "externalSkuId",
                "third_sku_id", "thirdSkuId",
                "source_sku_id", "sourceSkuId",
                "out_source_sku_id", "outSourceSkuId"
            );
            return new OrderExternalSpec(
                firstNotBlank(externalPoiId, ""),
                firstNotBlank(externalSkuId, ""),
                extractOrderSlotSpec(root)
            );
        } catch (Exception e) {
            return new OrderExternalSpec("", "", null);
        }
    }

    private JsonNode unwrapFirstOrderNode(JsonNode root) {
        if (root == null || root.isNull()) {
            return root;
        }
        JsonNode data = root.get("data");
        if (data != null && data.isObject()) {
            JsonNode orders = data.get("orders");
            if (orders != null && orders.isArray() && orders.size() > 0) {
                return orders.get(0);
            }
        }
        JsonNode orders = root.get("orders");
        if (orders != null && orders.isArray() && orders.size() > 0) {
            return orders.get(0);
        }
        return root;
    }

    private static BigDecimal extractRefundAmount(JsonNode root) {
        if (root == null) {
            return BigDecimal.ZERO;
        }
        return parseAmount(firstText(
            root,
            "refund_amount", "refundAmount",
            "refund_fee", "refundFee",
            "refund_price", "refundPrice",
            "after_sale_amount", "afterSaleAmount"
        ));
    }

    private String normalizeSlotDate(String value) {
        if (StringUtils.isBlank(value)) {
            return "";
        }
        String text = value.trim();
        String timestampDate = dateFromEpochText(text);
        if (StringUtils.isNotBlank(timestampDate)) {
            return timestampDate;
        }
        if (text.length() >= 10) {
            return text.substring(0, 10);
        }
        return text;
    }

    private String normalizeSlotTime(String value) {
        if (StringUtils.isBlank(value)) {
            return "";
        }
        String text = value.trim();
        String timestampTime = timeFromEpochText(text);
        if (StringUtils.isNotBlank(timestampTime)) {
            return timestampTime;
        }
        int tIndex = text.indexOf('T');
        if (tIndex >= 0 && text.length() >= tIndex + 6) {
            return text.substring(tIndex + 1, tIndex + 6);
        }
        int spaceIndex = text.indexOf(' ');
        if (spaceIndex >= 0 && text.length() >= spaceIndex + 6) {
            return text.substring(spaceIndex + 1, spaceIndex + 6);
        }
        if (text.length() >= 5) {
            return text.substring(0, 5);
        }
        return text;
    }

    private String firstDateFromTimestamp(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            String date = dateFromEpochText(value);
            if (StringUtils.isNotBlank(date)) {
                return date;
            }
        }
        return "";
    }

    private String dateFromEpochText(String value) {
        LocalDateTime dateTime = localDateTimeFromEpochText(value);
        return dateTime == null ? "" : SLOT_DATE_FORMATTER.format(dateTime);
    }

    private String timeFromEpochText(String value) {
        LocalDateTime dateTime = localDateTimeFromEpochText(value);
        return dateTime == null ? "" : SLOT_TIME_FORMATTER.format(dateTime);
    }

    private LocalDateTime localDateTimeFromEpochText(String value) {
        if (StringUtils.isBlank(value)) {
            return null;
        }
        String text = value.trim();
        if (!text.matches("\\d{10,13}")) {
            return null;
        }
        try {
            long epoch = Long.parseLong(text);
            long epochMillis = text.length() <= 10 ? epoch * 1000L : epoch;
            return LocalDateTime.ofInstant(Instant.ofEpochMilli(epochMillis), ZoneId.systemDefault());
        } catch (Exception ignored) {
            return null;
        }
    }

    private Date parseSlotArrivalTime(String slotDate, String startTime) {
        try {
            String normalizedDate = normalizeSlotDate(slotDate);
            String normalizedStart = normalizeSlotTime(startTime);
            if (StringUtils.isBlank(normalizedDate) || StringUtils.isBlank(normalizedStart)) {
                return null;
            }
            LocalDateTime dateTime = LocalDateTime.parse(normalizedDate + " " + normalizedStart + ":00", DATE_TIME_FORMATTER);
            return Date.from(dateTime.atZone(ZoneId.systemDefault()).toInstant());
        } catch (Exception ignored) {
            return null;
        }
    }

    private void upsertPhotoAlbumPlaceholder(YyOrder order, String externalOrderId, String bookId, String certificateCode) {
        if (order == null || order.getId() == null || StringUtils.isBlank(externalOrderId)) {
            return;
        }
        if (order.getStoreId() == null || StringUtils.isBlank(order.getCustomerPhone())) {
            return;
        }

        YyPhotoAlbum album = photoAlbumMapper.selectOne(Wrappers.<YyPhotoAlbum>lambdaQuery()
            .eq(YyPhotoAlbum::getChannelType, CHANNEL_TYPE)
            .eq(YyPhotoAlbum::getDouyinOrderId, externalOrderId)
            .eq(YyPhotoAlbum::getDelFlag, "0")
            .orderByDesc(YyPhotoAlbum::getId)
            .last("limit 1"));
        boolean isNew = album == null;
        if (album == null) {
            album = new YyPhotoAlbum();
            album.setId(nextLongId());
            album.setChannelType(CHANNEL_TYPE);
            album.setStatus("ACTIVE");
            album.setSelectionStatus("WAITING");
            album.setDouyinOrderId(externalOrderId);
            album.setPublicToken("dy-life-" + stableUuid(externalOrderId));
            album.setAccessCode("PICK-" + shortStableCode(externalOrderId));
            album.setExpireTime(new Date(System.currentTimeMillis() + Duration.ofDays(30).toMillis()));
            album.setDelFlag("0");
            album.setRemark("抖音来客订单自动创建相册占位，等待上传客片");
        }

        album.setStoreId(firstNonNull(album.getStoreId(), order.getStoreId()));
        album.setOrderId(firstNonNull(album.getOrderId(), order.getId()));
        album.setAlbumName(firstNotBlank(album.getAlbumName(), buildPhotoAlbumName(order)));
        album.setCustomerName(firstNotBlank(album.getCustomerName(), order.getCustomerName()));
        album.setCustomerPhone(firstNotBlank(album.getCustomerPhone(), order.getCustomerPhone()));
        if (StringUtils.isNotBlank(bookId)) {
            album.setBookId(bookId);
        }
        if (StringUtils.isNotBlank(certificateCode)) {
            album.setCertificateCode(certificateCode);
        }

        if (isNew) {
            photoAlbumMapper.insert(album);
        } else {
            photoAlbumMapper.updateById(album);
        }
    }

    private String buildPhotoAlbumName(YyOrder order) {
        String customerName = firstNotBlank(order.getCustomerName(), "抖音来客客户");
        return customerName + "的抖音订单取片相册";
    }

    private String shortStableCode(String seed) {
        String compact = stableUuid(seed).replace("-", "").toUpperCase(Locale.ROOT);
        return compact.length() <= 8 ? compact : compact.substring(0, 8);
    }

    private void applyDefaultSyncWindow(YyChannelOrderQuery query) {
        if (query.getPageSize() == null || query.getPageSize() < 1) {
            query.setPageSize(50);
        }
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime effectiveEnd = parseDateTime(query.getEndTime(), now);
        if (StringUtils.isBlank(query.getStartTime())) {
            query.setStartTime(effectiveEnd.minusHours(24).format(DATE_TIME_FORMATTER));
        }
        if (StringUtils.isBlank(query.getEndTime())) {
            query.setEndTime(now.format(DATE_TIME_FORMATTER));
        }
    }

    private LocalDateTime parseDateTime(String value, LocalDateTime fallback) {
        if (StringUtils.isBlank(value)) {
            return fallback;
        }
        try {
            return LocalDateTime.parse(value, DATE_TIME_FORMATTER);
        } catch (Exception ignored) {
            return fallback;
        }
    }

    private void upsertCustomer(String customerName, String customerPhone, BigDecimal spend, String remark) {
        if (customerService == null || StringUtils.isBlank(customerPhone)) {
            return;
        }
        customerService.upsertByMobile(customerName, customerPhone, CHANNEL_TYPE, spend, new Date(), remark);
    }

    private void recordSyncLog(LifeConfig config, String apiName, YyChannelApiResultVo result, Long durationMs, String requestId) {
        YyChannelSyncLog log = new YyChannelSyncLog();
        log.setId(nextLongId());
        log.setStoreId(config == null ? null : config.storeId());
        log.setChannelType(CHANNEL_TYPE);
        log.setApiName(apiName);
        log.setRequestId(StringUtils.isNotBlank(requestId) ? requestId : "");
        log.setSuccess(Boolean.TRUE.equals(result.getSuccess()) ? "1" : "0");
        log.setErrorMessage(limitText(StringUtils.isNotBlank(result.getMessage()) ? result.getMessage() : "", 480));
        log.setDurationMs(durationMs == null ? 0L : durationMs);
        log.setRetryable(Boolean.TRUE.equals(result.getSuccess()) ? "0" : "1");
        channelSyncLogMapper.insert(log);
    }

    private void recordWebhookLog(String externalOrderId, String eventName, String payload, boolean success, String errorMessage) {
        YyChannelSyncLog log = new YyChannelSyncLog();
        log.setId(nextLongId());
        log.setChannelType(CHANNEL_TYPE);
        log.setApiName(StringUtils.isNotBlank(eventName) ? eventName : "order_payment_notice");
        log.setRequestId(StringUtils.isNotBlank(externalOrderId) ? externalOrderId : "");
        log.setSuccess(success ? "1" : "0");
        log.setErrorMessage(limitText(StringUtils.isNotBlank(errorMessage) ? errorMessage : "", 480));
        log.setDurationMs(0L);
        log.setRetryable(success ? "0" : "1");
        log.setRemark(limitText(StringUtils.isNotBlank(payload) ? redactSensitivePayload(payload) : "", 480));
        channelSyncLogMapper.insert(log);
    }

    private void recordSpiLog(String apiName, String requestId, String payload, boolean success, String errorMessage) {
        YyChannelSyncLog log = new YyChannelSyncLog();
        log.setId(nextLongId());
        log.setChannelType(CHANNEL_TYPE);
        log.setApiName(apiName);
        log.setRequestId(StringUtils.isNotBlank(requestId) ? requestId : "");
        log.setSuccess(success ? "1" : "0");
        log.setErrorMessage(limitText(StringUtils.isNotBlank(errorMessage) ? errorMessage : "", 480));
        log.setDurationMs(0L);
        log.setRetryable(success ? "0" : "1");
        log.setRemark(limitText(StringUtils.isNotBlank(payload) ? redactSensitivePayload(payload) : "", 480));
        channelSyncLogMapper.insert(log);
    }

    private Map<String, Object> genericSpiSuccess(String apiName, String payload) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("error_code", 0);
        data.put("description", "success");
        data.put("result", 1);
        try {
            JsonNode root = StringUtils.isBlank(payload) ? null : OBJECT_MAPPER.readTree(payload);
            if (apiName.contains("order-create") || apiName.contains("order_create")) {
                appendReservationOrderCreateData(data, root, payload);
            }
            if (apiName.contains("order-query") || apiName.contains("order_query")) {
                data.put("order_id", firstNotBlank(firstText(root, "order_id", "orderId"), ""));
                data.put("third_order_id", firstNotBlank(firstText(root, "third_order_id", "thirdOrderId"), ""));
                data.put("order_status", firstNotBlank(firstText(root, "order_status", "orderStatus", "status"), "UNKNOWN"));
            }
            if (apiName.contains("stock-query") || apiName.contains("stock_query")) {
                appendStockQueryData(data, root);
            }
        } catch (Exception ignored) {
            // 回调落库优先，未知字段不阻塞平台重试。
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("data", data);
        return response;
    }

    private Map<String, Object> refundApplySpiResponse(String payload) {
        String mode = firstNotBlank(
            prop("yy.douyin.life.refund-apply-mode", "DOUYIN_LIFE_REFUND_APPLY_MODE"),
            prop("yy.douyin.life.refund-mode", "DOUYIN_LIFE_REFUND_MODE"),
            "processing"
        ).trim().toLowerCase(Locale.ROOT);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("error_code", 0);
        switch (mode) {
            case "agree", "allow", "allowed", "success" -> {
                data.put("description", "success");
                data.put("result", 1);
            }
            case "reject", "refuse", "deny", "denied" -> appendRefundRejectData(data, payload);
            default -> {
                data.put("description", "退款申请已接收，等待服务商审核回调");
                data.put("result", 0);
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("data", data);
        return response;
    }

    private void appendRefundRejectData(Map<String, Object> data, String payload) {
        String reason = firstNotBlank(
            prop("yy.douyin.life.refund-reject-reason", "DOUYIN_LIFE_REFUND_REJECT_REASON"),
            "服务商侧已发码或已核销，暂不支持退款"
        );
        data.put("description", reason);
        data.put("result", 2);
        data.put("reason", reason);

        try {
            JsonNode root = StringUtils.isBlank(payload) ? null : OBJECT_MAPPER.readTree(payload);
            List<Map<String, Object>> certificates = buildRefundRejectCertificates(root);
            if (!certificates.isEmpty()) {
                data.put("certificate", certificates);
                data.put("certificates", certificates);
                List<String> codes = certificates.stream()
                    .map(item -> String.valueOf(item.get("code")))
                    .filter(StringUtils::isNotBlank)
                    .toList();
                if (!codes.isEmpty()) {
                    data.put("codes", codes);
                }
                List<String> vouchers = certificates.stream()
                    .map(item -> String.valueOf(item.get("voucher")))
                    .filter(StringUtils::isNotBlank)
                    .toList();
                if (!vouchers.isEmpty()) {
                    data.put("vouchers", vouchers);
                }
            }
        } catch (Exception ignored) {
            // 拒绝原因优先返回，券码补充失败时不阻塞记录日志。
        }
    }

    private List<Map<String, Object>> buildRefundRejectCertificates(JsonNode root) {
        if (root == null || root.isNull()) {
            return List.of();
        }
        String orderId = firstText(root, "order_id", "orderId");
        List<JsonNode> sourceCertificates = refundCertificateNodes(root);
        if (sourceCertificates.isEmpty()) {
            String certificateId = firstText(root, "certificate_id", "certificateId");
            if (StringUtils.isBlank(certificateId)) {
                return List.of();
            }
            sourceCertificates = List.of(root);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        int index = 1;
        for (JsonNode source : sourceCertificates) {
            String certificateId = firstText(source, "certificate_id", "certificateId");
            if (StringUtils.isBlank(certificateId)) {
                index++;
                continue;
            }
            String code = firstNotBlank(
                firstText(source, "code"),
                certificateCode(firstNotBlank(orderId, "refund"), certificateId, index)
            );
            Map<String, Object> certificate = new LinkedHashMap<>();
            certificate.put("certificate_id", certificateId);
            certificate.put("code", code);
            String voucher = firstText(source, "voucher");
            if (StringUtils.isNotBlank(voucher)) {
                certificate.put("voucher", voucher);
            }
            result.add(certificate);
            index++;
        }
        return result;
    }

    private List<JsonNode> refundCertificateNodes(JsonNode root) {
        for (String fieldName : List.of("certificates", "certificate", "certificateList")) {
            JsonNode node = root.get(fieldName);
            if (node != null && node.isArray()) {
                List<JsonNode> result = new ArrayList<>();
                for (JsonNode item : node) {
                    result.add(item);
                }
                return result;
            }
        }
        return List.of();
    }

    private void appendReservationOrderCreateData(Map<String, Object> data, JsonNode root, String payload) {
        String bookId = firstNotBlank(
            firstText(root, "book_id", "bookId"),
            firstText(root, "order_id", "orderId"),
            numericDigest("book|" + firstNotBlank(payload, ""), 18)
        );
        String outBookId = firstNotBlank(
            firstText(root, "out_book_id", "outBookId"),
            "YYB-" + bookId
        );
        data.put("book_id", bookId);
        data.put("out_book_id", outBookId);

        Map<String, Object> confirmInfo = new LinkedHashMap<>();
        confirmInfo.put("confirm_mode", parsePositiveInt(firstText(root, "confirm_mode", "confirmMode"), 1, 9));
        confirmInfo.put("confirm_result", parsePositiveInt(firstText(root, "confirm_result", "confirmResult"), 1, 9));
        confirmInfo.put("fulfil_type", parsePositiveInt(firstText(root, "fulfil_type", "fulfilType"), 1, 9));
        confirmInfo.put("hotel_confirm_number", outBookId);
        data.put("confirm_info", confirmInfo);
    }

    private void appendStockQueryData(Map<String, Object> data, JsonNode root) {
        int stock = resolveStockForSpi(root);
        data.put("stock", stock);
        data.put("available_stock", stock);
        data.put("available", stock > 0);

        List<String> dates = resolveStockQueryDates(root);
        List<JsonNode> skuNodes = stockQuerySkuNodes(root);
        List<Map<String, Object>> skuInfoList = new ArrayList<>();
        List<Map<String, Object>> flatStockList = new ArrayList<>();
        String poiId = firstText(root, "poi_id", "poiId");
        String startTime = firstNotBlank(firstText(root, "start_time", "startTime"), "10:00");
        String endTime = firstNotBlank(firstText(root, "end_time", "endTime"), "10:30");

        for (JsonNode skuNode : skuNodes) {
            String skuId = firstText(skuNode, "sku_id", "skuId");
            String skuOutId = firstText(skuNode, "sku_out_id", "skuOutId", "third_sku_id", "thirdSkuId");
            Map<String, Object> skuInfo = new LinkedHashMap<>();
            putObject(skuInfo, "sku_id", skuId);
            putObject(skuInfo, "sku_out_id", skuOutId);
            List<Map<String, Object>> stockItems = new ArrayList<>();
            for (String date : dates) {
                Map<String, Object> stockItem = buildStockQueryItem(poiId, skuId, skuOutId, date, startTime, endTime, stock);
                stockItems.add(stockItem);
                flatStockList.add(stockItem);
            }
            skuInfo.put("stock_info_list", stockItems);
            skuInfo.put("stock_list", stockItems);
            skuInfoList.add(skuInfo);
        }

        if (!skuInfoList.isEmpty()) {
            data.put("sku_info_list", skuInfoList);
        }
        if (!flatStockList.isEmpty()) {
            data.put("stock_info_list", flatStockList);
            data.put("stock_list", flatStockList);
            data.put("reception_stock_list", flatStockList);
        }
    }

    private List<JsonNode> stockQuerySkuNodes(JsonNode root) {
        if (root != null && root.has("sku_info_list") && root.get("sku_info_list").isArray()) {
            List<JsonNode> nodes = new ArrayList<>();
            for (JsonNode item : root.get("sku_info_list")) {
                nodes.add(item);
            }
            return nodes;
        }
        return root == null ? Collections.emptyList() : List.of(root);
    }

    private List<String> resolveStockQueryDates(JsonNode root) {
        String date = firstText(root, "date", "biz_date", "bizDate", "booking_date", "bookingDate");
        if (StringUtils.isNotBlank(date)) {
            return List.of(date);
        }
        String startDate = firstText(root, "start_date", "startDate");
        String endDate = firstText(root, "end_date", "endDate");
        try {
            LocalDate start = StringUtils.isBlank(startDate) ? LocalDate.now() : LocalDate.parse(startDate);
            LocalDate end = StringUtils.isBlank(endDate) ? start : LocalDate.parse(endDate);
            if (end.isBefore(start)) {
                end = start;
            }
            List<String> dates = new ArrayList<>();
            LocalDate cursor = start;
            while (!cursor.isAfter(end) && dates.size() < 31) {
                dates.add(cursor.toString());
                cursor = cursor.plusDays(1);
            }
            return dates;
        } catch (Exception ignored) {
            return List.of(LocalDate.now().toString());
        }
    }

    private Map<String, Object> buildStockQueryItem(String poiId, String skuId, String skuOutId, String date, String startTime, String endTime, int stock) {
        Map<String, Object> item = new LinkedHashMap<>();
        putObject(item, "poi_id", poiId);
        putObject(item, "sku_id", skuId);
        putObject(item, "sku_out_id", skuOutId);
        item.put("date", date);
        item.put("start_time", startTime);
        item.put("end_time", endTime);
        item.put("time_range", List.of(startTime, endTime));
        item.put("stock", stock);
        item.put("available_stock", stock);
        item.put("available", stock > 0);
        return item;
    }

    private int resolveStockForSpi(JsonNode root) {
        String poiId = firstText(root, "poi_id", "poiId");
        String skuId = firstText(root, "sku_id", "skuId");
        String skuOutId = firstText(root, "sku_out_id", "skuOutId", "third_sku_id", "thirdSkuId");
        String date = firstText(root, "date", "biz_date", "bizDate", "booking_date", "bookingDate");
        String startTime = firstText(root, "start_time", "startTime");
        String endTime = firstText(root, "end_time", "endTime");
        Integer unifiedStock = resolveUnifiedBookingStockForSpi(root, poiId, skuId, skuOutId, date, startTime, endTime);
        if (unifiedStock != null) {
            return unifiedStock;
        }
        if (StringUtils.isNotBlank(poiId) && (StringUtils.isNotBlank(skuId) || StringUtils.isNotBlank(skuOutId))
            && StringUtils.isNotBlank(date) && StringUtils.isNotBlank(startTime) && StringUtils.isNotBlank(endTime)) {
            YyChannelInventorySlot slot = channelInventorySlotMapper.selectOne(
                inventorySlotQuery(poiId, skuId, skuOutId, date, startTime, endTime).last("limit 1")
            );
            if (slot != null && slot.getAvailableStock() != null) {
                return Math.max(slot.getAvailableStock(), 0);
            }
        }
        return parsePositiveInt(prop("yy.douyin.life.default-stock", "DOUYIN_LIFE_DEFAULT_STOCK"), 9999, 999999);
    }

    private Integer resolveUnifiedBookingStockForSpi(
        JsonNode root,
        String poiId,
        String skuId,
        String skuOutId,
        String date,
        String startTime,
        String endTime
    ) {
        if (bookingSlotInventoryMapper == null || StringUtils.isBlank(date)
            || StringUtils.isBlank(startTime) || StringUtils.isBlank(endTime)
            || (StringUtils.isBlank(skuId) && StringUtils.isBlank(skuOutId))) {
            return null;
        }
        Long storeId = parseLong(firstText(root, "store_id", "storeId", "shop_id", "shopId"));
        if (storeId == null) {
            storeId = resolveStoreIdFromChannelInventorySlot(poiId, skuId, skuOutId, date, startTime, endTime);
        }

        LambdaQueryWrapper<YyBookingSlotInventory> wrapper = Wrappers.<YyBookingSlotInventory>lambdaQuery()
            .eq(storeId != null, YyBookingSlotInventory::getStoreId, storeId)
            .eq(YyBookingSlotInventory::getBizDate, date)
            .eq(YyBookingSlotInventory::getStartTime, startTime)
            .eq(YyBookingSlotInventory::getEndTime, endTime)
            .eq(YyBookingSlotInventory::getStatus, "ACTIVE")
            .eq(YyBookingSlotInventory::getDelFlag, "0")
            .orderByDesc(YyBookingSlotInventory::getId)
            .last("limit 1");
        if (StringUtils.isNotBlank(skuId) && StringUtils.isNotBlank(skuOutId)) {
            wrapper.and(w -> w.eq(YyBookingSlotInventory::getExternalSkuId, skuId)
                .or()
                .eq(YyBookingSlotInventory::getExternalSkuId, skuOutId));
        } else {
            wrapper.eq(YyBookingSlotInventory::getExternalSkuId, firstNotBlank(skuId, skuOutId));
        }

        YyBookingSlotInventory slot = bookingSlotInventoryMapper.selectOne(wrapper);
        if (slot == null || slot.getCapacity() == null) {
            return null;
        }
        int capacity = Math.max(slot.getCapacity(), 0);
        int paidCount = Math.max(Objects.requireNonNullElse(slot.getPaidCount(), 0), 0);
        return Math.max(capacity - paidCount, 0);
    }

    private Long resolveStoreIdFromChannelInventorySlot(
        String poiId,
        String skuId,
        String skuOutId,
        String date,
        String startTime,
        String endTime
    ) {
        if (StringUtils.isBlank(poiId) || (StringUtils.isBlank(skuId) && StringUtils.isBlank(skuOutId))
            || StringUtils.isBlank(date) || StringUtils.isBlank(startTime) || StringUtils.isBlank(endTime)) {
            return null;
        }
        YyChannelInventorySlot slot = channelInventorySlotMapper.selectOne(
            inventorySlotQuery(poiId, skuId, skuOutId, date, startTime, endTime).last("limit 1")
        );
        return slot == null ? null : slot.getStoreId();
    }

    private Map<String, Object> genericSpiFailure(String message) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("error_code", 9999);
        data.put("description", message);
        data.put("result", 2);
        data.put("fail_reason", "SIGNATURE_INVALID");
        data.put("fail_reason_desc", message);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("data", data);
        return response;
    }

    private Map<String, Object> tripartiteCodeFailure(int errorCode, String message) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("error_code", errorCode);
        data.put("description", message);
        data.put("result", 2);
        data.put("fail_reason", "SYSTEM_ERROR");
        data.put("fail_reason_desc", message);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("data", data);
        return response;
    }

    private Long nextLongId() {
        return identifierGenerator.nextId(null).longValue();
    }

    private static String redactSensitivePayload(String payload) {
        if (StringUtils.isBlank(payload)) {
            return "";
        }
        try {
            JsonNode root = OBJECT_MAPPER.readTree(payload);
            redactSensitiveNode(root);
            return OBJECT_MAPPER.writeValueAsString(root);
        } catch (Exception ignored) {
            return payload.replaceAll(
                "(?i)(\"(?:client_secret|client_access_token|access_token|refresh_token|open_id|openid|mobile|phone|encrypt_mobile|receiver_phone)\"\\s*:\\s*\")[^\"]+(\")",
                "$1***$2"
            );
        }
    }

    private static String toJson(Object value) {
        if (value == null) {
            return "";
        }
        try {
            return OBJECT_MAPPER.writeValueAsString(value);
        } catch (Exception ignored) {
            return String.valueOf(value);
        }
    }

    private static String limitText(String value, int maxLength) {
        if (StringUtils.isBlank(value) || value.length() <= maxLength) {
            return StringUtils.isBlank(value) ? "" : value;
        }
        return value.substring(0, maxLength);
    }

    private static void redactSensitiveNode(JsonNode node) {
        if (node == null || node.isNull()) {
            return;
        }
        if (node instanceof ObjectNode objectNode) {
            List<String> fieldNames = new ArrayList<>();
            objectNode.fieldNames().forEachRemaining(fieldNames::add);
            for (String fieldName : fieldNames) {
                JsonNode value = objectNode.get(fieldName);
                if (isSensitiveField(fieldName)) {
                    objectNode.put(fieldName, "***");
                } else {
                    redactSensitiveNode(value);
                }
            }
            return;
        }
        if (node instanceof ArrayNode arrayNode) {
            arrayNode.forEach(DouyinLifeChannelAdapter::redactSensitiveNode);
        }
    }

    private static boolean isSensitiveField(String fieldName) {
        if (StringUtils.isBlank(fieldName)) {
            return false;
        }
        String normalized = fieldName.replace("_", "").replace("-", "").toLowerCase(Locale.ROOT);
        return normalized.endsWith("token")
            || normalized.equals("clientsecret")
            || normalized.equals("openid")
            || normalized.equals("mobile")
            || normalized.equals("phone")
            || normalized.equals("encryptmobile")
            || normalized.equals("receiverphone")
            || normalized.equals("customerphone")
            || normalized.equals("customermobile")
            || normalized.equals("buyerphone");
    }

    private static BigDecimal parseAmount(String value) {
        if (StringUtils.isBlank(value)) {
            return BigDecimal.ZERO;
        }
        try {
            return new BigDecimal(value);
        } catch (Exception ignored) {
            return BigDecimal.ZERO;
        }
    }

    private static Long amountToCent(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return 0L;
        }
        return amount.movePointRight(2).setScale(0, RoundingMode.HALF_UP).longValue();
    }

    private static int parsePositiveInt(String value, int defaultValue, int maxValue) {
        if (StringUtils.isBlank(value)) {
            return defaultValue;
        }
        try {
            int parsed = Integer.parseInt(value);
            if (parsed < 1) {
                return defaultValue;
            }
            return Math.min(parsed, maxValue);
        } catch (Exception ignored) {
            return defaultValue;
        }
    }

    private static Integer parseOptionalInt(String value) {
        if (StringUtils.isBlank(value)) {
            return null;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (Exception ignored) {
            return null;
        }
    }

    private static List<String> splitCsv(String value) {
        if (StringUtils.isBlank(value)) {
            return List.of();
        }
        List<String> values = new ArrayList<>();
        for (String item : value.split(",")) {
            if (StringUtils.isNotBlank(item)) {
                values.add(item.trim());
            }
        }
        return values;
    }

    private static Object extractChallenge(String payload) {
        if (StringUtils.isBlank(payload)) {
            return null;
        }
        try {
            JsonNode root = OBJECT_MAPPER.readTree(payload);
            JsonNode challenge = firstValueNode(root, "CHALLENGE", "challenge");
            if (challenge == null) {
                challenge = firstValueNode(parseJsonObjectText(firstText(root, "content", "Content", "data", "Data")), "CHALLENGE", "challenge");
            }
            return jsonScalarValue(challenge);
        } catch (Exception ignored) {
            return null;
        }
    }

    private static boolean hasChallengeValue(Object value) {
        return value != null && (!(value instanceof CharSequence text) || StringUtils.isNotBlank(text));
    }

    private static JsonNode parseJsonObjectText(String value) {
        if (StringUtils.isBlank(value)) {
            return null;
        }
        try {
            JsonNode node = OBJECT_MAPPER.readTree(value);
            return node != null && node.isObject() ? node : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    private static JsonNode firstValueNode(JsonNode node, String... fieldNames) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isObject()) {
            for (String fieldName : fieldNames) {
                JsonNode value = node.get(fieldName);
                if (value != null && value.isValueNode() && !value.isNull()) {
                    return value;
                }
            }
            for (JsonNode child : node) {
                JsonNode value = firstValueNode(child, fieldNames);
                if (value != null) {
                    return value;
                }
            }
        }
        if (node.isArray()) {
            for (JsonNode item : node) {
                JsonNode value = firstValueNode(item, fieldNames);
                if (value != null) {
                    return value;
                }
            }
        }
        return null;
    }

    private static Object jsonScalarValue(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isTextual()) {
            return node.asText();
        }
        if (node.isNumber()) {
            return node.numberValue();
        }
        if (node.isBoolean()) {
            return node.asBoolean();
        }
        return node.asText();
    }

    private static String headerValue(Map<String, String> headers, String expectedName) {
        if (headers == null || headers.isEmpty() || StringUtils.isBlank(expectedName)) {
            return "";
        }
        for (Map.Entry<String, String> entry : headers.entrySet()) {
            if (entry.getKey() != null && expectedName.equalsIgnoreCase(entry.getKey())) {
                return entry.getValue();
            }
        }
        return "";
    }

    private SpiSignatureCheck verifySpiSignature(String payload, Map<String, String> headers, String rawQuery, LifeConfig config) {
        String providedSign = headerValue(headers, "x-life-sign");
        boolean requireSignature = Boolean.parseBoolean(firstNotBlank(
            prop("yy.douyin.life.require-signature", "DOUYIN_LIFE_REQUIRE_SIGNATURE"),
            "false"
        ));
        if (StringUtils.isBlank(providedSign)) {
            return requireSignature
                ? SpiSignatureCheck.fail("缺少 x-life-sign，无法通过抖音生活服务 SPI 验签")
                : SpiSignatureCheck.ok();
        }
        if (config == null || StringUtils.isBlank(config.clientSecret())) {
            return SpiSignatureCheck.fail("无法验签，未配置 DOUYIN_LIFE client_secret");
        }
        String expectedSign = computeLifeSpiSignature(config.clientSecret(), rawQuery, payload);
        if (!providedSign.trim().equalsIgnoreCase(expectedSign)) {
            return SpiSignatureCheck.fail("x-life-sign 验签失败");
        }
        return SpiSignatureCheck.ok();
    }

    private static String computeLifeSpiSignature(String clientSecret, String rawQuery, String payload) {
        String signSource = buildLifeSpiSignSource(clientSecret, rawQuery, payload);
        return sha256HexLower(signSource);
    }

    private static String buildLifeSpiSignSource(String clientSecret, String rawQuery, String payload) {
        List<String> parts = new ArrayList<>();
        parts.add(firstNotBlank(clientSecret, ""));
        Map<String, List<String>> query = parseRawQuery(rawQuery);
        List<String> keys = new ArrayList<>(query.keySet());
        Collections.sort(keys);
        for (String key : keys) {
            if ("sign".equalsIgnoreCase(key)) {
                continue;
            }
            List<String> values = new ArrayList<>(query.getOrDefault(key, List.of("")));
            if (values.isEmpty()) {
                values.add("");
            }
            Collections.sort(values);
            for (String value : values) {
                parts.add(key + "=" + firstNotBlank(value, ""));
            }
        }
        if (StringUtils.isNotBlank(payload)) {
            parts.add("http_body=" + payload);
        }
        return String.join("&", parts);
    }

    private static Map<String, List<String>> parseRawQuery(String rawQuery) {
        Map<String, List<String>> result = new LinkedHashMap<>();
        if (StringUtils.isBlank(rawQuery)) {
            return result;
        }
        String decoded = URLDecoder.decode(rawQuery, StandardCharsets.UTF_8);
        for (String pair : decoded.split("&")) {
            if (StringUtils.isBlank(pair)) {
                continue;
            }
            int index = pair.indexOf('=');
            String key = index >= 0 ? pair.substring(0, index) : pair;
            String value = index >= 0 ? pair.substring(index + 1) : "";
            result.computeIfAbsent(key, ignored -> new ArrayList<>()).add(value);
        }
        return result;
    }

    private static String certificateId(String orderId, String skuId, int index) {
        return numericDigest("cert|" + orderId + "|" + skuId + "|" + index, 18);
    }

    private static String certificateCode(String orderId, String skuId, int index) {
        return numericDigest("code|" + orderId + "|" + skuId + "|" + index, 12);
    }

    private static String generatedVerifyToken(String accountId, String poiId, String orderId, List<String> codes) {
        String seed = String.join(":", CHANNEL_TYPE, firstNotBlank(accountId), firstNotBlank(poiId),
            firstNotBlank(orderId), String.join(",", codes == null ? List.of() : codes));
        return UUID.nameUUIDFromBytes(seed.getBytes(StandardCharsets.UTF_8)).toString();
    }

    private static String stableUuid(String seed) {
        return UUID.nameUUIDFromBytes(firstNotBlank(seed, CHANNEL_TYPE).getBytes(StandardCharsets.UTF_8)).toString();
    }

    private static String numericDigest(String value, int length) {
        String hex = sha256Hex(value);
        StringBuilder digits = new StringBuilder(length);
        for (int i = 0; digits.length() < length && i < hex.length(); i++) {
            int digit = Character.digit(hex.charAt(i), 16);
            if (digit >= 0) {
                digits.append(digit % 10);
            }
        }
        while (digits.length() < length) {
            digits.append('0');
        }
        return digits.toString();
    }

    private static String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8))).toUpperCase(Locale.ROOT);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 不可用", ex);
        }
    }

    private static String sha256HexLower(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8))).toLowerCase(Locale.ROOT);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 不可用", ex);
        }
    }

    private static String mapLocalStatus(String eventStatus) {
        if (StringUtils.isBlank(eventStatus)) {
            return "UNKNOWN";
        }
        String normalizedStatus = eventStatus.trim().toUpperCase(Locale.ROOT).replace('-', '_');
        return switch (normalizedStatus) {
            case "1", "101", "201", "PAY_SUCCESS", "PAID", "PAYED",
                "WAIT_USE", "UNUSED", "TO_USE", "TO_BE_USED", "WAIT_SERVICE", "WAITING_SERVICE", "待服务" -> "PENDING";
            case "2", "202", "ACCEPTED", "CONFIRMED",
                "RESERVED", "BOOKED", "BOOKING_SUCCESS", "RESERVE_SUCCESS", "ACCEPT_SUCCESS", "CONFIRM_SUCCESS", "已确认" -> "CONFIRMED";
            case "3", "203", "IMPLEMENT_CONFIRMED", "SERVING",
                "IN_SERVICE", "SERVICE_START", "SERVICE_STARTED", "SERVICE_PROCESSING", "FULFIL_PROCESSING", "服务中", "拍摄中" -> "SERVING";
            case "4", "204", "USER_CONFIRMED", "COMPLETED", "FINISHED",
                "DONE", "FINISH", "SERVICE_FINISHED", "SERVICE_COMPLETED",
                "VERIFY", "VERIFY_SUCCESS", "VERIFIED", "USED", "CERTIFICATE_USED", "FULFIL_SUCCESS", "FULFILLED", "已完成", "选片中" -> "COMPLETED";
            case "5", "205", "CANCELLED", "CANCELED", "CANCEL", "CANCEL_SUCCESS", "ORDER_CANCELLED", "已取消" -> "CANCELLED";
            case "REFUND", "REFUND_SUCCESS", "REFUND_FINISHED", "REFUNDED" -> "REFUNDED";
            case "PARTIAL_REFUND", "PARTIAL_REFUND_SUCCESS", "PARTIAL_REFUNDED" -> "PARTIAL_REFUNDED";
            default -> eventStatus;
        };
    }

    private static String mapPayStatus(String localStatus) {
        return switch (firstNotBlank(localStatus, "")) {
            case "PENDING", "CONFIRMED", "SERVING", "COMPLETED" -> "PAID";
            case "CANCELLED" -> "CLOSED";
            case "REFUNDED" -> "REFUNDED";
            case "PARTIAL_REFUNDED" -> "PARTIAL_REFUNDED";
            default -> "UNKNOWN";
        };
    }

    private static boolean shouldSyncLocalOrder(String localStatus) {
        return switch (localStatus) {
            case "PENDING", "CONFIRMED", "SERVING", "COMPLETED", "CANCELLED", "REFUNDED", "PARTIAL_REFUNDED" -> true;
            default -> false;
        };
    }

    private static boolean isRefundLocalStatus(String localStatus) {
        return "REFUNDED".equals(localStatus) || "PARTIAL_REFUNDED".equals(localStatus);
    }

    private static boolean isInboundOrderSyncEvent(String normalizedApiKey) {
        if (StringUtils.isBlank(normalizedApiKey)) {
            return false;
        }
        return normalizedApiKey.contains("order-create")
            || normalizedApiKey.contains("pay-notify")
            || normalizedApiKey.contains("refund-notify")
            || normalizedApiKey.contains("refund-notice");
    }

    private static boolean isInboundOrderSyncPayload(String payload) {
        if (StringUtils.isBlank(payload)) {
            return false;
        }
        try {
            JsonNode root = OBJECT_MAPPER.readTree(payload);
            String externalOrderId = firstText(root, "order_id", "orderId", "out_order_no", "outOrderNo", "book_id", "bookId");
            String eventStatus = firstNotBlank(
                firstText(root, "order_status", "orderStatus", "status", "status_code", "state", "event_status", "action"),
                firstText(parseJsonObjectText(firstText(root, "content", "Content", "data", "Data")),
                    "order_status", "orderStatus", "status", "status_code", "state", "event_status", "action")
            );
            if (StringUtils.isBlank(externalOrderId)) {
                externalOrderId = firstText(parseJsonObjectText(firstText(root, "content", "Content", "data", "Data")),
                    "order_id", "orderId", "out_order_no", "outOrderNo", "book_id", "bookId");
            }
            return StringUtils.isNotBlank(externalOrderId) && shouldSyncLocalOrder(mapLocalStatus(eventStatus));
        } catch (Exception ignored) {
            return false;
        }
    }

    private static Long parseLong(String value) {
        if (StringUtils.isBlank(value)) {
            return null;
        }
        try {
            return Long.valueOf(value);
        } catch (Exception ignored) {
            return null;
        }
    }

    private static Long firstNonNull(Long... values) {
        if (values == null) {
            return null;
        }
        for (Long value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private static boolean looksLikeOrderId(String externalOrderId) {
        return StringUtils.isNotBlank(externalOrderId) && externalOrderId.chars().allMatch(Character::isDigit);
    }

    private static String firstText(JsonNode node, String... fieldNames) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isTextual()) {
            JsonNode parsed = parseJsonObjectText(node.asText());
            return parsed == null ? null : firstText(parsed, fieldNames);
        }
        if (node.isObject()) {
            for (String fieldName : fieldNames) {
                JsonNode value = node.get(fieldName);
                if (value != null && value.isValueNode()) {
                    return value.asText();
                }
            }
            for (JsonNode child : node) {
                String value = firstText(child, fieldNames);
                if (value != null) {
                    return value;
                }
            }
        }
        if (node.isArray()) {
            for (JsonNode item : node) {
                String value = firstText(item, fieldNames);
                if (value != null) {
                    return value;
                }
            }
        }
        return null;
    }

    private static List<String> firstTextArray(JsonNode node, String... fieldNames) {
        if (node == null || node.isNull()) {
            return Collections.emptyList();
        }
        if (node.isTextual()) {
            JsonNode parsed = parseJsonObjectText(node.asText());
            return parsed == null ? Collections.emptyList() : firstTextArray(parsed, fieldNames);
        }
        if (node.isObject()) {
            for (String fieldName : fieldNames) {
                JsonNode value = node.get(fieldName);
                if (value != null && value.isArray()) {
                    List<String> values = new ArrayList<>();
                    for (JsonNode item : value) {
                        if (item != null && item.isValueNode()) {
                            values.add(item.asText());
                        }
                    }
                    if (!values.isEmpty()) {
                        return values;
                    }
                }
            }
            for (JsonNode child : node) {
                List<String> values = firstTextArray(child, fieldNames);
                if (!values.isEmpty()) {
                    return values;
                }
            }
        }
        if (node.isArray()) {
            for (JsonNode item : node) {
                List<String> values = firstTextArray(item, fieldNames);
                if (!values.isEmpty()) {
                    return values;
                }
            }
        }
        return Collections.emptyList();
    }

    private String extractLogId(String rawResponse) {
        if (StringUtils.isBlank(rawResponse)) {
            return "";
        }
        try {
            JsonNode root = OBJECT_MAPPER.readTree(rawResponse);
            String logId = firstText(root, "logid", "log_id");
            return logId == null ? "" : logId;
        } catch (Exception ignored) {
            return "";
        }
    }

    private String prop(String propertyKey, String envKey) {
        String propertyValue = environment.getProperty(propertyKey);
        return StringUtils.isNotBlank(propertyValue) ? propertyValue : System.getenv(envKey);
    }

    private static String firstNotBlank(String... values) {
        for (String value : values) {
            if (StringUtils.isNotBlank(value)) {
                return value;
            }
        }
        return "";
    }

    private record LifeConfig(String clientKey, String clientSecret, String accountId, Long storeId) {
        private String value(String field) {
            return switch (field) {
                case "client_key" -> clientKey;
                case "client_secret" -> clientSecret;
                case "account_id" -> accountId;
                case "store_id" -> storeId == null ? "" : String.valueOf(storeId);
                default -> "";
            };
        }
    }

    private record ExternalOrderQueryResult(YyChannelApiResultVo apiResult, List<YyChannelOrderVo> orders) {
    }

    private record LocalOrderUpsertResult(Long localOrderId, boolean created) {
    }

    private record BackfillResult(boolean updated, boolean failed) {
        private static BackfillResult updatedResult() {
            return new BackfillResult(true, false);
        }

        private static BackfillResult failedResult() {
            return new BackfillResult(false, true);
        }

        private static BackfillResult skippedResult() {
            return new BackfillResult(false, false);
        }
    }

    private record OrderSlotSpec(String slotDate, String startTime, String endTime, String externalSkuId) {
    }

    private record OrderExternalSpec(String externalPoiId, String externalSkuId, OrderSlotSpec slotSpec) {
    }

    private record SpiSignatureCheck(boolean valid, String message) {
        private static SpiSignatureCheck ok() {
            return new SpiSignatureCheck(true, "");
        }

        private static SpiSignatureCheck fail(String message) {
            return new SpiSignatureCheck(false, message);
        }
    }
}
