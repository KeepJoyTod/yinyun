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
import org.dromara.yy.domain.YyWorkOrder;
import org.dromara.yy.domain.YyWorkOrderEvent;
import org.dromara.yy.domain.bo.YyWorkOrderBo;
import org.dromara.yy.domain.vo.YyWorkOrderEventVo;
import org.dromara.yy.domain.vo.YyWorkOrderVo;
import org.dromara.yy.mapper.YyWorkOrderEventMapper;
import org.dromara.yy.mapper.YyWorkOrderMapper;
import org.dromara.yy.service.IYyWorkOrderService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * 工单Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyWorkOrderServiceImpl implements IYyWorkOrderService {

    private final YyWorkOrderMapper baseMapper;
    private final YyWorkOrderEventMapper eventMapper;
    private static final Map<String, Set<String>> STATUS_TRANSITIONS = Map.of(
        "PENDING", Set.of("IN_PROGRESS", "BLOCKED", "CANCELLED"),
        "IN_PROGRESS", Set.of("COMPLETED", "BLOCKED", "CANCELLED"),
        "BLOCKED", Set.of("IN_PROGRESS", "CANCELLED"),
        "COMPLETED", Set.of(),
        "CANCELLED", Set.of()
    );

    @Override
    public TableDataInfo<YyWorkOrderVo> queryPageList(YyWorkOrderBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyWorkOrder> lqw = buildQueryWrapper(bo);
        Page<YyWorkOrderVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public YyWorkOrderVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public List<YyWorkOrderVo> queryList(YyWorkOrderBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    @Override
    public List<YyWorkOrderEventVo> queryEventList(Long workOrderId) {
        LambdaQueryWrapper<YyWorkOrderEvent> lqw = Wrappers.lambdaQuery();
        lqw.eq(YyWorkOrderEvent::getWorkOrderId, workOrderId);
        lqw.orderByDesc(YyWorkOrderEvent::getCreateTime);
        lqw.orderByDesc(YyWorkOrderEvent::getId);
        return eventMapper.selectVoList(lqw);
    }

    private LambdaQueryWrapper<YyWorkOrder> buildQueryWrapper(YyWorkOrderBo bo) {
        LambdaQueryWrapper<YyWorkOrder> lqw = Wrappers.lambdaQuery();
        lqw.like(StringUtils.isNotBlank(bo.getOrderNo()), YyWorkOrder::getOrderNo, bo.getOrderNo());
        lqw.eq(bo.getStoreId() != null, YyWorkOrder::getStoreId, bo.getStoreId());
        lqw.eq(bo.getOrderId() != null, YyWorkOrder::getOrderId, bo.getOrderId());
        lqw.eq(StringUtils.isNotBlank(bo.getOrderType()), YyWorkOrder::getOrderType, bo.getOrderType());
        lqw.eq(StringUtils.isNotBlank(bo.getStageCode()), YyWorkOrder::getStageCode, bo.getStageCode());
        lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyWorkOrder::getStatus, bo.getStatus());
        lqw.eq(StringUtils.isNotBlank(bo.getPriority()), YyWorkOrder::getPriority, bo.getPriority());
        lqw.eq(bo.getHandlerId() != null, YyWorkOrder::getHandlerId, bo.getHandlerId());
        lqw.like(StringUtils.isNotBlank(bo.getHandlerName()), YyWorkOrder::getHandlerName, bo.getHandlerName());
        lqw.orderByAsc(YyWorkOrder::getDueTime);
        lqw.orderByDesc(YyWorkOrder::getCreateTime);
        lqw.orderByDesc(YyWorkOrder::getId);
        return lqw;
    }

    @Override
    public Boolean insertByBo(YyWorkOrderBo bo) {
        YyWorkOrder add = BeanUtil.toBean(bo, YyWorkOrder.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyWorkOrderBo bo) {
        YyWorkOrder update = BeanUtil.toBean(bo, YyWorkOrder.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    @Override
    public YyWorkOrderVo transitionStatus(Long id, String expectedStatus, String targetStatus, String remark) {
        YyWorkOrder current = baseMapper.selectById(id);
        if (current == null) {
            throw new ServiceException("工单不存在");
        }
        String currentStatus = normalizeStatus(current.getStatus(), "PENDING");
        String expected = normalizeStatus(expectedStatus, "");
        if (StringUtils.isNotBlank(expected) && !StringUtils.equals(currentStatus, expected)) {
            throw new ServiceException("工单状态已变化，请刷新后重试");
        }
        String nextStatus = normalizeStatus(targetStatus, "");
        if (!canTransition(currentStatus, nextStatus)) {
            throw new ServiceException("Invalid work order status transition: " + currentStatus + " -> " + nextStatus);
        }
        current.setStatus(nextStatus);
        if (baseMapper.updateById(current) <= 0) {
            throw new ServiceException("工单状态更新失败");
        }

        YyWorkOrderEvent event = new YyWorkOrderEvent();
        event.setWorkOrderId(id);
        event.setEventType("TRANSITION");
        event.setEventDetail("{\"fromStatus\":\"" + escapeJson(currentStatus) + "\",\"toStatus\":\"" + escapeJson(nextStatus) + "\"}");
        event.setRemark(remark);
        eventMapper.insert(event);

        return baseMapper.selectVoById(id);
    }

    private void validEntityBeforeSave(YyWorkOrder entity) {
        entity.setOrderType(StringUtils.blankToDefault(entity.getOrderType(), "OTHER"));
        entity.setStageCode(StringUtils.blankToDefault(entity.getStageCode(), resolveDefaultStageCode(entity.getOrderType())));
        entity.setStatus(StringUtils.blankToDefault(entity.getStatus(), "PENDING"));
        entity.setPriority(StringUtils.blankToDefault(entity.getPriority(), "MEDIUM"));
    }

    private String normalizeStatus(String status, String fallback) {
        return StringUtils.blankToDefault(status, fallback).trim().toUpperCase(Locale.ROOT);
    }

    private boolean canTransition(String currentStatus, String nextStatus) {
        return STATUS_TRANSITIONS.getOrDefault(currentStatus, Set.of()).contains(nextStatus);
    }

    private String resolveDefaultStageCode(String orderType) {
        String normalized = StringUtils.blankToDefault(orderType, "OTHER").trim().toUpperCase();
        if (normalized.contains("MAKEUP")) {
            return "MAKEUP";
        }
        if (normalized.contains("RETOUCH")) {
            return "RETOUCH";
        }
        if (normalized.contains("REVIEW") && !normalized.contains("SELECTION")) {
            return "REVIEW";
        }
        if (normalized.contains("SELECTION")) {
            return "SELECTION_REVIEW";
        }
        if (normalized.contains("DELIVERY") || normalized.contains("PICKUP")) {
            return "PICKUP";
        }
        if (normalized.contains("PHOTO") || normalized.contains("SHOOT") || normalized.contains("UPLOAD")) {
            return "PHOTOGRAPHY";
        }
        return "RECEPTION";
    }

    private String escapeJson(String value) {
        return StringUtils.blankToDefault(value, "").replace("\\", "\\\\").replace("\"", "\\\"");
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyWorkOrder> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size()) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }
}
