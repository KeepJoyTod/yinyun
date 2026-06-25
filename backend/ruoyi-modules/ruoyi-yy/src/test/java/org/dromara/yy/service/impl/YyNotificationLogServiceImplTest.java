package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.yy.domain.YyNotificationLog;
import org.dromara.yy.domain.bo.YyNotificationLogBo;
import org.dromara.yy.domain.vo.YyNotificationLogVo;
import org.dromara.yy.mapper.YyNotificationLogMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyNotificationLogServiceImplTest {

    @Mock
    private YyNotificationLogMapper mapper;

    @Test
    void queryListShouldKeepStoreOrderChannelAndStatusFiltersInMapperWrapper() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyNotificationLog.class);
        when(mapper.selectVoList(any(Wrapper.class))).thenReturn(List.of(new YyNotificationLogVo()));

        YyNotificationLogBo bo = new YyNotificationLogBo();
        bo.setStoreId(1001L);
        bo.setOrderId(2001L);
        bo.setChannelType("SMS");
        bo.setSendStatus("FAIL");

        service().queryList(bo);

        ArgumentCaptor<Wrapper<YyNotificationLog>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(mapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();

        assertContainsAny(sqlSegment, "store_id", "storeId");
        assertContainsAny(sqlSegment, "order_id", "orderId");
        assertContainsAny(sqlSegment, "channel_type", "channelType");
        assertContainsAny(sqlSegment, "send_status", "sendStatus");
    }

    @Test
    void deleteShouldValidateRequestedIdsBeforeMapperDelete() {
        when(mapper.selectByIds(List.of(1L, 2L))).thenReturn(List.of(new YyNotificationLog()));

        assertThrows(ServiceException.class, () -> service().deleteWithValidByIds(List.of(1L, 2L), true));
    }

    private YyNotificationLogServiceImpl service() {
        return new YyNotificationLogServiceImpl(mapper);
    }

    private static void assertContainsAny(String actual, String... expectedItems) {
        for (String expected : expectedItems) {
            if (actual.contains(expected)) {
                return;
            }
        }
        throw new AssertionError("Expected SQL segment to contain any of " + List.of(expectedItems) + ", actual: " + actual);
    }
}
