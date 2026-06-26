package org.dromara.yy.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyScheduleExceptionRule;
import org.dromara.yy.domain.bo.YyBookingSlotInventoryBo;
import org.dromara.yy.domain.bo.YyScheduleGovernanceBo;
import org.dromara.yy.domain.vo.YyBookingSlotInventoryVo;
import org.dromara.yy.domain.vo.YyRiskApprovalVo;
import org.dromara.yy.domain.vo.YyScheduleGovernancePreviewVo;
import org.dromara.yy.mapper.YyScheduleExceptionRuleMapper;
import org.dromara.yy.service.IYyBookingSlotInventoryService;
import org.dromara.yy.service.IYyRiskApprovalService;
import org.dromara.yy.service.IYyScheduleGovernanceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class YyScheduleGovernanceServiceImpl implements IYyScheduleGovernanceService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final String ACTION_CLOSE = "CLOSE";
    private static final String ACTION_REOPEN = "REOPEN";
    private static final String ACTION_CAPACITY_OVERRIDE = "CAPACITY_OVERRIDE";
    private static final String SLOT_STATUS_ACTIVE = "ACTIVE";
    private static final String SLOT_STATUS_CLOSED = "CLOSED";
    private static final String RULE_STATUS_ACTIVE = "ACTIVE";
    private static final String RULE_STATUS_PENDING_APPROVAL = "PENDING_APPROVAL";

    private final IYyBookingSlotInventoryService bookingSlotInventoryService;
    private final YyScheduleExceptionRuleMapper scheduleExceptionRuleMapper;
    private final IYyRiskApprovalService riskApprovalService;

    @Override
    public YyScheduleGovernancePreviewVo preview(YyScheduleGovernanceBo bo) {
        validateBo(bo);
        List<YyBookingSlotInventoryVo> slots = findSlots(bo);
        return buildPreview(bo, slots, null, "preview");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyScheduleGovernancePreviewVo apply(YyScheduleGovernanceBo bo) {
        validateBo(bo);
        List<YyBookingSlotInventoryVo> slots = findSlots(bo);
        YyScheduleGovernancePreviewVo preview = buildPreview(bo, slots, null, "preview");
        validateCapacityOverride(bo, slots);

        if (Boolean.TRUE.equals(preview.getApprovalRequired())) {
            YyScheduleExceptionRule rule = insertExceptionRule(bo, RULE_STATUS_PENDING_APPROVAL, null);
            YyRiskApprovalVo approval = riskApprovalService.createPending(new IYyRiskApprovalService.CreateRiskApprovalCommand(
                bo.getStoreId(),
                IYyRiskApprovalService.BUSINESS_SLOT_CLOSE_WITH_PAID_ORDER,
                rule.getId(),
                String.valueOf(rule.getId()),
                "Schedule close requires approval",
                StringUtils.defaultIfBlank(bo.getReason(), "schedule governance"),
                toJson(Map.of(
                    "ruleId", rule.getId(),
                    "storeId", bo.getStoreId(),
                    "serviceGroupId", bo.getServiceGroupId() == null ? 0L : bo.getServiceGroupId(),
                    "beginBizDate", bo.getBeginBizDate(),
                    "endBizDate", bo.getEndBizDate(),
                    "startTime", bo.getStartTime(),
                    "endTime", bo.getEndTime(),
                    "actionType", bo.getActionType()
                ))
            ));
            rule.setApprovalId(approval.getId());
            scheduleExceptionRuleMapper.updateById(rule);
            return buildPreview(bo, slots, approval, "approval_required");
        }

        insertExceptionRule(bo, RULE_STATUS_ACTIVE, null);
        for (YyBookingSlotInventoryVo slot : slots) {
            YyBookingSlotInventoryBo update = new YyBookingSlotInventoryBo();
            update.setId(slot.getId());
            update.setCapacity(resolveNextCapacity(bo, slot));
            update.setStatus(resolveNextStatus(bo, slot));
            update.setRemark(StringUtils.defaultIfBlank(bo.getReason(), slot.getRemark()));
            bookingSlotInventoryService.updateByBo(update);
        }
        return buildPreview(bo, findSlots(bo), null, "applied");
    }

    private List<YyBookingSlotInventoryVo> findSlots(YyScheduleGovernanceBo bo) {
        YyBookingSlotInventoryBo query = new YyBookingSlotInventoryBo();
        query.setStoreId(bo.getStoreId());
        query.setServiceGroupId(bo.getServiceGroupId());
        query.setBeginBizDate(bo.getBeginBizDate());
        query.setEndBizDate(bo.getEndBizDate());
        query.setStartTime(bo.getStartTime());
        query.setEndTime(bo.getEndTime());
        return bookingSlotInventoryService.queryList(query);
    }

    private YyScheduleGovernancePreviewVo buildPreview(
        YyScheduleGovernanceBo bo,
        List<YyBookingSlotInventoryVo> slots,
        YyRiskApprovalVo approval,
        String message
    ) {
        int paidSlotCount = 0;
        int conflictSlotCount = 0;
        for (YyBookingSlotInventoryVo slot : slots) {
            if (defaultInt(slot.getPaidCount()) > 0) {
                paidSlotCount++;
            }
            if (defaultInt(slot.getConflictCount()) > 0) {
                conflictSlotCount++;
            }
        }
        YyScheduleGovernancePreviewVo vo = new YyScheduleGovernancePreviewVo();
        vo.setAffectedSlotCount(slots.size());
        vo.setPaidSlotCount(paidSlotCount);
        vo.setConflictSlotCount(conflictSlotCount);
        vo.setApprovalRequired(ACTION_CLOSE.equals(normalizeAction(bo.getActionType())) && paidSlotCount > 0);
        vo.setMessage(message);
        vo.setApproval(approval);
        vo.setSlots(slots);
        return vo;
    }

    private YyScheduleExceptionRule insertExceptionRule(YyScheduleGovernanceBo bo, String status, Long approvalId) {
        YyScheduleExceptionRule rule = new YyScheduleExceptionRule();
        rule.setStoreId(bo.getStoreId());
        rule.setServiceGroupId(bo.getServiceGroupId());
        rule.setStartDate(bo.getBeginBizDate());
        rule.setEndDate(bo.getEndBizDate());
        rule.setStartTime(bo.getStartTime());
        rule.setEndTime(bo.getEndTime());
        rule.setActionType(normalizeAction(bo.getActionType()));
        rule.setCapacity(bo.getCapacity());
        rule.setReason(StringUtils.trimToEmpty(bo.getReason()));
        rule.setStatus(status);
        rule.setApprovalId(approvalId);
        scheduleExceptionRuleMapper.insert(rule);
        return rule;
    }

    private void validateBo(YyScheduleGovernanceBo bo) {
        if (bo == null) {
            throw new ServiceException("schedule governance payload is required");
        }
        String action = normalizeAction(bo.getActionType());
        if (!List.of(ACTION_CLOSE, ACTION_REOPEN, ACTION_CAPACITY_OVERRIDE).contains(action)) {
            throw new ServiceException("unsupported schedule governance action");
        }
        if (ACTION_CAPACITY_OVERRIDE.equals(action) && bo.getCapacity() == null) {
            throw new ServiceException("capacity is required");
        }
    }

    private void validateCapacityOverride(YyScheduleGovernanceBo bo, List<YyBookingSlotInventoryVo> slots) {
        if (!ACTION_CAPACITY_OVERRIDE.equals(normalizeAction(bo.getActionType()))) {
            return;
        }
        for (YyBookingSlotInventoryVo slot : slots) {
            if (bo.getCapacity() < defaultInt(slot.getPaidCount())) {
                throw new ServiceException("capacity cannot be lower than paid count");
            }
        }
    }

    private Integer resolveNextCapacity(YyScheduleGovernanceBo bo, YyBookingSlotInventoryVo slot) {
        return ACTION_CAPACITY_OVERRIDE.equals(normalizeAction(bo.getActionType()))
            ? bo.getCapacity()
            : slot.getCapacity();
    }

    private String resolveNextStatus(YyScheduleGovernanceBo bo, YyBookingSlotInventoryVo slot) {
        return switch (normalizeAction(bo.getActionType())) {
            case ACTION_CLOSE -> SLOT_STATUS_CLOSED;
            case ACTION_REOPEN, ACTION_CAPACITY_OVERRIDE -> SLOT_STATUS_ACTIVE;
            default -> StringUtils.defaultIfBlank(slot.getStatus(), SLOT_STATUS_ACTIVE);
        };
    }

    private static String normalizeAction(String actionType) {
        return StringUtils.trimToEmpty(actionType).toUpperCase();
    }

    private static int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private static String toJson(Object value) {
        try {
            return OBJECT_MAPPER.writeValueAsString(value);
        } catch (Exception ignored) {
            return "{}";
        }
    }
}
