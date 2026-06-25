package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.AbstractWrapper;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.yy.domain.YyWorkOrder;
import org.dromara.yy.domain.YyWorkOrderEvent;
import org.dromara.yy.domain.bo.YyWorkOrderBo;
import org.dromara.yy.domain.vo.YyWorkOrderVo;
import org.dromara.yy.mapper.YyWorkOrderEventMapper;
import org.dromara.yy.mapper.YyWorkOrderMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyWorkOrderServiceImplTest {

    @Mock
    private YyWorkOrderMapper workOrderMapper;

    @Mock
    private YyWorkOrderEventMapper workOrderEventMapper;

    @Test
    void insertByBoShouldDefaultStageCodeFromOrderType() {
        YyWorkOrderBo bo = new YyWorkOrderBo();
        bo.setOrderNo("WO-20260624-001");
        bo.setOrderType("RETOUCH");
        when(workOrderMapper.insert(any(YyWorkOrder.class))).thenReturn(1);
        YyWorkOrderServiceImpl service = new YyWorkOrderServiceImpl(workOrderMapper, workOrderEventMapper);

        service.insertByBo(bo);

        ArgumentCaptor<YyWorkOrder> captor = ArgumentCaptor.forClass(YyWorkOrder.class);
        verify(workOrderMapper).insert(captor.capture());
        YyWorkOrder saved = captor.getValue();
        assertEquals("RETOUCH", saved.getStageCode());
        assertEquals("PENDING", saved.getStatus());
        assertEquals("MEDIUM", saved.getPriority());
    }

    @Test
    void queryListShouldFilterByStageCode() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyWorkOrder.class);
        YyWorkOrderBo bo = new YyWorkOrderBo();
        bo.setStageCode("SELECTION_REVIEW");
        YyWorkOrderServiceImpl service = new YyWorkOrderServiceImpl(workOrderMapper, workOrderEventMapper);

        service.queryList(bo);

        ArgumentCaptor<Wrapper<YyWorkOrder>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(workOrderMapper).selectVoList(captor.capture());
        captor.getValue().getSqlSegment();
        AbstractWrapper<YyWorkOrder, ?, ?> wrapper = (AbstractWrapper<YyWorkOrder, ?, ?>) captor.getValue();
        List<Object> values = wrapper.getParamNameValuePairs().values().stream().toList();
        assertEquals(List.of("SELECTION_REVIEW"), values);
    }

    @Test
    void transitionStatusShouldUpdateWorkOrderAndPersistAuditEvent() {
        YyWorkOrder current = new YyWorkOrder();
        current.setId(9001L);
        current.setOrderNo("WO-20260615-001");
        current.setStatus("PENDING");
        when(workOrderMapper.selectById(9001L)).thenReturn(current);
        when(workOrderMapper.updateById(any(YyWorkOrder.class))).thenReturn(1);
        when(workOrderEventMapper.insert(any(YyWorkOrderEvent.class))).thenReturn(1);
        YyWorkOrderVo updated = new YyWorkOrderVo();
        updated.setId(9001L);
        updated.setStatus("IN_PROGRESS");
        when(workOrderMapper.selectVoById(9001L)).thenReturn(updated);
        YyWorkOrderServiceImpl service = new YyWorkOrderServiceImpl(workOrderMapper, workOrderEventMapper);

        YyWorkOrderVo result = service.transitionStatus(9001L, "PENDING", "IN_PROGRESS", "开始修图");

        assertEquals("IN_PROGRESS", result.getStatus());
        ArgumentCaptor<YyWorkOrder> orderCaptor = ArgumentCaptor.forClass(YyWorkOrder.class);
        verify(workOrderMapper).updateById(orderCaptor.capture());
        assertEquals("IN_PROGRESS", orderCaptor.getValue().getStatus());
        ArgumentCaptor<YyWorkOrderEvent> eventCaptor = ArgumentCaptor.forClass(YyWorkOrderEvent.class);
        verify(workOrderEventMapper).insert(eventCaptor.capture());
        YyWorkOrderEvent event = eventCaptor.getValue();
        assertEquals(9001L, event.getWorkOrderId());
        assertEquals("TRANSITION", event.getEventType());
        assertEquals("开始修图", event.getRemark());
        assertEquals("{\"fromStatus\":\"PENDING\",\"toStatus\":\"IN_PROGRESS\"}", event.getEventDetail());
    }

    @Test
    void transitionStatusShouldRejectStaleExpectedStatus() {
        YyWorkOrder current = new YyWorkOrder();
        current.setId(9002L);
        current.setStatus("IN_PROGRESS");
        when(workOrderMapper.selectById(9002L)).thenReturn(current);
        YyWorkOrderServiceImpl service = new YyWorkOrderServiceImpl(workOrderMapper, workOrderEventMapper);

        assertThrows(ServiceException.class, () -> service.transitionStatus(9002L, "PENDING", "COMPLETED", "完成"));

        verify(workOrderMapper, never()).updateById(any(YyWorkOrder.class));
        verify(workOrderEventMapper, never()).insert(any(YyWorkOrderEvent.class));
    }

    @Test
    void transitionStatusShouldRejectInvalidStatusJumpWithoutAuditEvent() {
        YyWorkOrder current = new YyWorkOrder();
        current.setId(9004L);
        current.setStatus("PENDING");
        when(workOrderMapper.selectById(9004L)).thenReturn(current);
        YyWorkOrderServiceImpl service = new YyWorkOrderServiceImpl(workOrderMapper, workOrderEventMapper);

        assertThrows(ServiceException.class, () -> service.transitionStatus(9004L, "PENDING", "COMPLETED", "invalid jump"));

        verify(workOrderMapper, never()).updateById(any(YyWorkOrder.class));
        verify(workOrderEventMapper, never()).insert(any(YyWorkOrderEvent.class));
    }

    @Test
    void queryEventListShouldFilterByWorkOrderId() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyWorkOrderEvent.class);
        YyWorkOrderServiceImpl service = new YyWorkOrderServiceImpl(workOrderMapper, workOrderEventMapper);

        service.queryEventList(9003L);

        ArgumentCaptor<Wrapper<YyWorkOrderEvent>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(workOrderEventMapper).selectVoList(captor.capture());
        captor.getValue().getSqlSegment();
        AbstractWrapper<YyWorkOrderEvent, ?, ?> wrapper = (AbstractWrapper<YyWorkOrderEvent, ?, ?>) captor.getValue();
        List<Object> values = wrapper.getParamNameValuePairs().values().stream().toList();
        assertEquals(List.of(9003L), values);
    }
}
