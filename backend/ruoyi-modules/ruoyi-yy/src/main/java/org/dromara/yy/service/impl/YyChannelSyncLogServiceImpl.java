package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.YyChannelSyncLog;
import org.dromara.yy.domain.bo.YyChannelSyncLogBo;
import org.dromara.yy.domain.vo.YyChannelAcceptanceCaseVo;
import org.dromara.yy.domain.vo.YyChannelAutoSyncStatusVo;
import org.dromara.yy.domain.vo.YyChannelSyncLogVo;
import org.dromara.yy.mapper.YyChannelSyncLogMapper;
import org.dromara.yy.service.IYyChannelSyncLogService;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * 影约云渠道同步日志Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyChannelSyncLogServiceImpl implements IYyChannelSyncLogService {

    private final YyChannelSyncLogMapper baseMapper;

    @Override
    public YyChannelSyncLogVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyChannelSyncLogVo> queryPageList(YyChannelSyncLogBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyChannelSyncLog> lqw = buildQueryWrapper(bo);
        Page<YyChannelSyncLogVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyChannelSyncLogVo> queryList(YyChannelSyncLogBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    @Override
    public List<YyChannelAcceptanceCaseVo> queryAcceptanceCases(String channelType) {
        String normalizedChannel = StringUtils.isBlank(channelType) ? "DOUYIN_LIFE" : channelType.toUpperCase(Locale.ROOT);
        YyChannelSyncLogBo bo = new YyChannelSyncLogBo();
        bo.setChannelType(normalizedChannel);
        List<YyChannelSyncLogVo> logs = queryList(bo);
        Map<String, YyChannelSyncLogVo> latestByApiName = new LinkedHashMap<>();
        logs.stream()
            .filter(log -> StringUtils.isNotBlank(log.getApiName()))
            .sorted(Comparator.comparing(YyChannelSyncLogVo::getCreateTime, Comparator.nullsLast(Comparator.reverseOrder())))
            .forEach(log -> latestByApiName.putIfAbsent(log.getApiName(), log));
        return DOUYIN_LIFE_ACCEPTANCE_CASES.stream()
            .map(def -> toAcceptanceCase(def, latestByApiName.get(def.apiName())))
            .toList();
    }

    @Override
    public YyChannelAutoSyncStatusVo queryAutoSyncStatus(String channelType) {
        String normalizedChannel = StringUtils.isBlank(channelType) ? "DOUYIN_LIFE" : channelType.toUpperCase(Locale.ROOT);
        YyChannelSyncLogBo bo = new YyChannelSyncLogBo();
        bo.setChannelType(normalizedChannel);
        bo.setApiName("life_order_auto_sync");
        List<YyChannelSyncLogVo> logs = queryList(bo);

        YyChannelAutoSyncStatusVo status = new YyChannelAutoSyncStatusVo();
        status.setChannelType(normalizedChannel);
        status.setApiName("life_order_auto_sync");
        if (logs.isEmpty()) {
            status.setSyncStatus("WAITING");
            status.setSuccess(false);
            status.setMessage("等待首次自动同步");
            status.setSummary("");
            return status;
        }

        YyChannelSyncLogVo latest = logs.stream()
            .filter(log -> log.getCreateTime() != null)
            .max(Comparator.comparing(YyChannelSyncLogVo::getCreateTime))
            .orElse(logs.get(0));
        status.setLastLogId(latest.getRequestId());
        status.setLastSyncTime(latest.getCreateTime());
        status.setSuccess(isSuccess(latest));
        status.setSummary(firstNotBlank(latest.getRemark(), latest.getErrorMessage(), ""));
        status.setSyncStatus(extractSummaryValue(latest.getRemark(), "status", isSuccess(latest) ? "SYNCED" : "FAILED"));
        status.setMessage(isSuccess(latest) ? "自动同步正常" : firstNotBlank(latest.getErrorMessage(), "自动同步失败"));
        return status;
    }

    private LambdaQueryWrapper<YyChannelSyncLog> buildQueryWrapper(YyChannelSyncLogBo bo) {
        LambdaQueryWrapper<YyChannelSyncLog> lqw = Wrappers.lambdaQuery();
        lqw.eq(bo.getStoreId() != null, YyChannelSyncLog::getStoreId, bo.getStoreId());
        lqw.eq(StringUtils.isNotBlank(bo.getChannelType()), YyChannelSyncLog::getChannelType, bo.getChannelType());
        lqw.like(StringUtils.isNotBlank(bo.getApiName()), YyChannelSyncLog::getApiName, bo.getApiName());
        lqw.like(StringUtils.isNotBlank(bo.getRequestId()), YyChannelSyncLog::getRequestId, bo.getRequestId());
        lqw.eq(StringUtils.isNotBlank(bo.getSuccess()), YyChannelSyncLog::getSuccess, bo.getSuccess());
        lqw.eq(StringUtils.isNotBlank(bo.getRetryable()), YyChannelSyncLog::getRetryable, bo.getRetryable());
        lqw.orderByDesc(YyChannelSyncLog::getCreateTime);
        lqw.orderByDesc(YyChannelSyncLog::getId);
        return lqw;
    }

    private static YyChannelAcceptanceCaseVo toAcceptanceCase(AcceptanceCaseDef def, YyChannelSyncLogVo log) {
        YyChannelAcceptanceCaseVo vo = new YyChannelAcceptanceCaseVo();
        vo.setCaseKey(def.apiName());
        vo.setLabel(def.label());
        vo.setApiName(def.apiName());
        vo.setPublicUrl("https://api.evanshine.me" + def.publicPath());
        vo.setEndpoint(def.localEndpoint());
        vo.setLogidSource(def.logidSource());
        vo.setHint(def.hint());
        if (log == null) {
            vo.setStatus("WAITING");
            vo.setStatusText("等待回调/调用");
            return vo;
        }
        vo.setRequestId(log.getRequestId());
        vo.setSuccess(log.getSuccess());
        vo.setErrorMessage(log.getErrorMessage());
        vo.setCreateTime(log.getCreateTime());
        if (!isSuccess(log)) {
            vo.setStatus("FAILED");
            vo.setStatusText("最近一次失败");
        } else if (StringUtils.isBlank(log.getRequestId())) {
            vo.setStatus("NO_LOGID");
            vo.setStatusText("成功但无 logid");
        } else {
            vo.setStatus("READY");
            vo.setStatusText("可复制");
        }
        return vo;
    }

    private static boolean isSuccess(YyChannelSyncLogVo log) {
        return "1".equals(log.getSuccess()) || "true".equalsIgnoreCase(log.getSuccess());
    }

    private static String extractSummaryValue(String summary, String key, String fallback) {
        if (StringUtils.isBlank(summary) || StringUtils.isBlank(key)) {
            return fallback;
        }
        String prefix = key + "=";
        for (String part : summary.split(",")) {
            String normalized = part.trim();
            if (normalized.startsWith(prefix)) {
                return firstNotBlank(normalized.substring(prefix.length()), fallback);
            }
        }
        return fallback;
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

    private record AcceptanceCaseDef(String label, String apiName, String publicPath, String localEndpoint, String logidSource, String hint) {
    }

    private static final List<AcceptanceCaseDef> DOUYIN_LIFE_ACCEPTANCE_CASES = List.of(
        new AcceptanceCaseDef("事件订阅 Webhook", "life_event_webhook", "/api/douyin/life/webhook", "/api/douyin/life/webhook", "请求/响应 challenge 与事件日志", "开放平台 Webhooks 连接测试和事件订阅。"),
        new AcceptanceCaseDef("三方码发券 SPI", "tripartite_code_create", "/api/douyin/life/tripartite-code/create", "/api/douyin/life/tripartite-code/create", "请求头 X-Bytedance-Logid", "发券验收第 1 步，必须等抖音真实回调。"),
        new AcceptanceCaseDef("退款申请 SPI", "refund_apply", "/api/douyin/life/refund/apply", "/api/douyin/life/refund/apply", "请求头 X-Bytedance-Logid", "同步/异步退款审核请求，拒绝时必须有 reason。"),
        new AcceptanceCaseDef("退款通知 SPI", "refund_notify", "/api/douyin/life/refund/notify", "/api/douyin/life/refund/notify", "请求头 X-Bytedance-Logid", "退款后续状态同步或退款信息同步。"),
        new AcceptanceCaseDef("预约创单 SPI", "reservation_order_create", "/api/douyin/life/reservation/order-create", "/api/douyin/life/reservation/order-create", "请求头 X-Bytedance-Logid", "用户在抖音 App 发起预约后产生。"),
        new AcceptanceCaseDef("预约支付通知 SPI", "reservation_pay_notify", "/api/douyin/life/reservation/pay-notify", "/api/douyin/life/reservation/pay-notify", "请求头 X-Bytedance-Logid", "综合预约订单支付成功通知。"),
        new AcceptanceCaseDef("预约三方订单查询 SPI", "reservation_order_query", "/api/douyin/life/reservation/order-query", "/api/douyin/life/reservation/order-query", "请求头 X-Bytedance-Logid", "抖音查询我方三方订单状态。"),
        new AcceptanceCaseDef("最新预约库存 SPI", "reservation_stock_query", "/api/douyin/life/reservation/stock-query", "/api/douyin/life/reservation/stock-query", "请求头 X-Bytedance-Logid", "抖音拉取最新可约库存。"),
        new AcceptanceCaseDef("券撤销核销 SPI", "voucher_revoke", "/api/douyin/life/voucher/revoke", "/api/douyin/life/voucher/revoke", "请求头 X-Bytedance-Logid", "单券撤销核销通知。"),
        new AcceptanceCaseDef("批量撤销核销 SPI", "voucher_batch_revoke", "/api/douyin/life/voucher/batch-revoke", "/api/douyin/life/voucher/batch-revoke", "请求头 X-Bytedance-Logid", "跨订单批量撤销核销通知。"),
        new AcceptanceCaseDef("三方码订单查询 SPI", "life_order_query", "/api/douyin/life/order/query", "/api/douyin/life/order/query", "请求头 X-Bytedance-Logid", "普通三方码订单查询，不要和预约订单查询混用。"),
        new AcceptanceCaseDef("履约对账同步 SPI", "fulfil_check_info_sync", "/api/douyin/life/fulfil/check-info-sync", "/api/douyin/life/fulfil/check-info-sync", "请求头 X-Bytedance-Logid", "履约/核销对账信息同步。"),
        new AcceptanceCaseDef("预约接拒单 OpenAPI", "life_order_confirm", "/yy/channel/DOUYIN_LIFE/confirm", "/yy/channel/DOUYIN_LIFE/confirm", "OpenAPI 响应 extra.logid", "主动确认接单/拒单后复制响应 logid。"),
        new AcceptanceCaseDef("整单核销 OpenAPI", "life_order_verify", "/yy/channel/DOUYIN_LIFE/verify", "/yy/channel/DOUYIN_LIFE/verify", "OpenAPI 响应 extra.logid", "整单核销成功后复制响应 logid。"),
        new AcceptanceCaseDef("库存 SKU OpenAPI", "life_inventory_sku_upsert", "/yy/channel/DOUYIN_LIFE/reservation/inventory-sku/upsert", "/yy/channel/DOUYIN_LIFE/reservation/inventory-sku/upsert", "OpenAPI 响应 extra.logid", "创建或更新库存 SKU。"),
        new AcceptanceCaseDef("实时库存 OpenAPI", "life_reception_stock_save", "/yy/channel/DOUYIN_LIFE/reservation/stock/save", "/yy/channel/DOUYIN_LIFE/reservation/stock/save", "OpenAPI 响应 extra.logid", "保存实时库存。"),
        new AcceptanceCaseDef("库存通知 OpenAPI", "life_reception_stock_trigger", "/yy/channel/DOUYIN_LIFE/reservation/stock/trigger", "/yy/channel/DOUYIN_LIFE/reservation/stock/trigger", "OpenAPI 响应 extra.logid", "通知抖音拉取库存。"),
        new AcceptanceCaseDef("时段库存 OpenAPI", "life_time_stock_save", "/yy/channel/DOUYIN_LIFE/reservation/time-stock/save", "/yy/channel/DOUYIN_LIFE/reservation/time-stock/save", "OpenAPI 响应 extra.logid", "保存预约时段库存。")
    );

    @Override
    public Boolean insertByBo(YyChannelSyncLogBo bo) {
        YyChannelSyncLog add = BeanUtil.toBean(bo, YyChannelSyncLog.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyChannelSyncLogBo bo) {
        YyChannelSyncLog update = BeanUtil.toBean(bo, YyChannelSyncLog.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    private void validEntityBeforeSave(YyChannelSyncLog entity) {
        // 预留唯一性、渠道授权、订单状态流转等业务校验。
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyChannelSyncLog> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size()) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }
}
