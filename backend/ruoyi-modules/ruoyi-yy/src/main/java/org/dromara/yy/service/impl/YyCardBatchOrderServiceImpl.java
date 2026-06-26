package org.dromara.yy.service.impl;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyRiskApproval;
import org.dromara.yy.domain.bo.YyCardBatchOrderCreateBo;
import org.dromara.yy.domain.bo.YyCardBatchOrderQueryBo;
import org.dromara.yy.domain.vo.YyCardBatchOrderVo;
import org.dromara.yy.domain.vo.YyRiskApprovalVo;
import org.dromara.yy.mapper.YyRiskApprovalMapper;
import org.dromara.yy.service.IYyCardBatchOrderService;
import org.dromara.yy.service.IYyRiskApprovalService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class YyCardBatchOrderServiceImpl implements IYyCardBatchOrderService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final String DEFAULT_CARD_TYPE = "TIMES_CARD";
    private static final String DEFAULT_TARGET_AUDIENCE = "现有会员";
    private static final String DEFAULT_CHANNEL_POLICY = "审批通过后人工执行";
    private static final String EXECUTION_MODE_SCAFFOLD = "RISK_APPROVAL_SCAFFOLD";

    private final YyRiskApprovalMapper riskApprovalMapper;
    private final IYyRiskApprovalService riskApprovalService;

    @Override
    public List<YyCardBatchOrderVo> listCardBatchOrders(YyCardBatchOrderQueryBo bo) {
        YyCardBatchOrderQueryBo query = safeQuery(bo);
        return riskApprovalMapper.selectVoList(Wrappers.<YyRiskApproval>lambdaQuery()
                .eq(YyRiskApproval::getBusinessType, IYyRiskApprovalService.BUSINESS_CARD_BATCH_ORDER_APPLY)
                .eq(query.getStoreId() != null, YyRiskApproval::getStoreId, query.getStoreId())
                .eq(StringUtils.isNotBlank(query.getStatus()), YyRiskApproval::getStatus, StringUtils.trim(query.getStatus()))
                .and(StringUtils.isNotBlank(query.getKeyword()), wrapper -> wrapper
                    .like(YyRiskApproval::getTitle, StringUtils.trim(query.getKeyword()))
                    .or()
                    .like(YyRiskApproval::getBusinessNo, StringUtils.trim(query.getKeyword()))
                    .or()
                    .like(YyRiskApproval::getReason, StringUtils.trim(query.getKeyword())))
                .orderByDesc(YyRiskApproval::getCreateTime)
                .orderByDesc(YyRiskApproval::getId)
                .last("limit " + normalizeLimit(query.getLimit())))
            .stream()
            .map(this::mapApproval)
            .toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyCardBatchOrderVo createCardBatchOrder(YyCardBatchOrderCreateBo bo) {
        if (bo == null) {
            throw new ServiceException("card batch order payload is required");
        }
        int batchCount = normalizePositive(bo.getBatchCount(), 1, 500);
        int targetCustomerCount = normalizePositive(bo.getTargetCustomerCount(), batchCount, 5000);
        long unitPriceCent = normalizeAmount(bo.getUnitPriceCent());
        long estimatedTotalCent = batchCount * unitPriceCent;
        String batchNo = buildNo("CBO");
        String cardName = StringUtils.trim(bo.getCardName());
        String title = StringUtils.defaultIfBlank(
            StringUtils.trim(bo.getBatchTitle()),
            "批量开卡申请 - " + cardName + " x" + batchCount
        );
        String reason = StringUtils.defaultIfBlank(
            StringUtils.trim(bo.getReason()),
            "批量开卡属于高风险动作，需审批后执行"
        );

        YyRiskApprovalVo approval = riskApprovalService.createPending(new IYyRiskApprovalService.CreateRiskApprovalCommand(
            bo.getStoreId(),
            IYyRiskApprovalService.BUSINESS_CARD_BATCH_ORDER_APPLY,
            null,
            batchNo,
            title,
            reason,
            writePayload(bo, batchNo, batchCount, targetCustomerCount, unitPriceCent, estimatedTotalCent)
        ));
        return mapApproval(approval);
    }

    private String writePayload(
        YyCardBatchOrderCreateBo bo,
        String batchNo,
        int batchCount,
        int targetCustomerCount,
        long unitPriceCent,
        long estimatedTotalCent
    ) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("batchNo", batchNo);
        payload.put("cardName", StringUtils.trim(bo.getCardName()));
        payload.put("cardType", StringUtils.defaultIfBlank(StringUtils.trim(bo.getCardType()), DEFAULT_CARD_TYPE));
        payload.put("batchCount", batchCount);
        payload.put("targetCustomerCount", targetCustomerCount);
        payload.put("unitPriceCent", unitPriceCent);
        payload.put("estimatedTotalCent", estimatedTotalCent);
        payload.put("targetAudience", StringUtils.defaultIfBlank(StringUtils.trim(bo.getTargetAudience()), DEFAULT_TARGET_AUDIENCE));
        payload.put("channelPolicy", StringUtils.defaultIfBlank(StringUtils.trim(bo.getChannelPolicy()), DEFAULT_CHANNEL_POLICY));
        payload.put("remark", StringUtils.trimToEmpty(bo.getRemark()));
        payload.put("executionMode", EXECUTION_MODE_SCAFFOLD);
        try {
            return OBJECT_MAPPER.writeValueAsString(payload);
        } catch (Exception exception) {
            throw new ServiceException("批量开卡脚手架载荷序列化失败");
        }
    }

    private YyCardBatchOrderVo mapApproval(YyRiskApprovalVo approval) {
        JsonNode payload = readPayload(approval.getPayloadJson());
        YyCardBatchOrderVo vo = new YyCardBatchOrderVo();
        vo.setId(approval.getId());
        vo.setStoreId(approval.getStoreId());
        vo.setBatchNo(readText(payload, "batchNo", approval.getBusinessNo()));
        vo.setTitle(StringUtils.defaultString(approval.getTitle()));
        vo.setStatus(StringUtils.defaultString(approval.getStatus()));
        vo.setReason(StringUtils.defaultString(approval.getReason()));
        vo.setCardName(readText(payload, "cardName", ""));
        vo.setCardType(readText(payload, "cardType", DEFAULT_CARD_TYPE));
        vo.setBatchCount(readInt(payload, "batchCount", 0));
        vo.setTargetCustomerCount(readInt(payload, "targetCustomerCount", 0));
        vo.setUnitPriceCent(readLong(payload, "unitPriceCent", 0L));
        vo.setEstimatedTotalCent(readLong(payload, "estimatedTotalCent", 0L));
        vo.setTargetAudience(readText(payload, "targetAudience", DEFAULT_TARGET_AUDIENCE));
        vo.setChannelPolicy(readText(payload, "channelPolicy", DEFAULT_CHANNEL_POLICY));
        vo.setRemark(readText(payload, "remark", ""));
        vo.setPayloadJson(StringUtils.defaultString(approval.getPayloadJson()));
        vo.setApplicantName(StringUtils.defaultString(approval.getApplicantName()));
        vo.setApproverName(StringUtils.defaultString(approval.getApproverName()));
        vo.setApproveTime(formatDateTime(approval.getApproveTime()));
        vo.setResultSummary(StringUtils.defaultString(approval.getResultSummary()));
        vo.setCreateTime(formatDateTime(approval.getCreateTime()));
        vo.setExecutionMode(readText(payload, "executionMode", EXECUTION_MODE_SCAFFOLD));
        return vo;
    }

    private static JsonNode readPayload(String payloadJson) {
        if (StringUtils.isBlank(payloadJson)) {
            return OBJECT_MAPPER.createObjectNode();
        }
        try {
            return OBJECT_MAPPER.readTree(payloadJson);
        } catch (Exception ignored) {
            return OBJECT_MAPPER.createObjectNode();
        }
    }

    private static String readText(JsonNode payload, String fieldName, String fallback) {
        JsonNode node = payload.get(fieldName);
        return node == null || node.isNull() ? fallback : StringUtils.defaultIfBlank(node.asText(), fallback);
    }

    private static Integer readInt(JsonNode payload, String fieldName, Integer fallback) {
        JsonNode node = payload.get(fieldName);
        return node == null || node.isNull() ? fallback : node.asInt(fallback);
    }

    private static Long readLong(JsonNode payload, String fieldName, Long fallback) {
        JsonNode node = payload.get(fieldName);
        return node == null || node.isNull() ? fallback : node.asLong(fallback);
    }

    private static int normalizePositive(Integer value, int fallback, int maxValue) {
        if (value == null || value <= 0) {
            return fallback;
        }
        return Math.min(value, maxValue);
    }

    private static long normalizeAmount(Long value) {
        return value == null ? 0L : Math.max(0L, value);
    }

    private static int normalizeLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return 20;
        }
        return Math.min(limit, 100);
    }

    private static String buildNo(String prefix) {
        return prefix + "-" + DateUtil.format(new java.util.Date(), "yyyyMMddHHmmss") + "-" + IdWorker.getIdStr();
    }

    private static String formatDateTime(java.util.Date value) {
        return value == null ? "" : DateUtil.formatDateTime(value);
    }

    private static YyCardBatchOrderQueryBo safeQuery(YyCardBatchOrderQueryBo bo) {
        return bo == null ? new YyCardBatchOrderQueryBo() : bo;
    }
}
