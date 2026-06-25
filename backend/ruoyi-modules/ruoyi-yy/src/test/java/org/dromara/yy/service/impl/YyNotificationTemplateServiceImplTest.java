package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.yy.domain.YyNotificationTemplate;
import org.dromara.yy.domain.bo.YyNotificationTemplateBo;
import org.dromara.yy.domain.vo.YyNotificationTemplateVo;
import org.dromara.yy.mapper.YyNotificationTemplateMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyNotificationTemplateServiceImplTest {

    @Mock
    private YyNotificationTemplateMapper mapper;

    @Test
    void queryListShouldKeepTemplateSceneChannelAndEnabledFiltersInMapperWrapper() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyNotificationTemplate.class);
        when(mapper.selectVoList(any(Wrapper.class))).thenReturn(List.of(new YyNotificationTemplateVo()));

        YyNotificationTemplateBo bo = new YyNotificationTemplateBo();
        bo.setTemplateCode("BOOKING");
        bo.setScene("ORDER_CREATED");
        bo.setChannelType("SMS");
        bo.setEnabled("1");

        service().queryList(bo);

        ArgumentCaptor<Wrapper<YyNotificationTemplate>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(mapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();

        assertContainsAny(sqlSegment, "template_code", "templateCode");
        assertTrue(sqlSegment.contains("scene"));
        assertContainsAny(sqlSegment, "channel_type", "channelType");
        assertTrue(sqlSegment.contains("enabled"));
    }

    @Test
    void insertByBoShouldMapTemplatePayloadAndReturnCreatedId() {
        when(mapper.insert(any(YyNotificationTemplate.class))).thenAnswer(invocation -> {
            YyNotificationTemplate entity = invocation.getArgument(0);
            entity.setId(3001L);
            return 1;
        });

        YyNotificationTemplateBo bo = payload();

        assertTrue(service().insertByBo(bo));
        assertEquals(3001L, bo.getId());

        ArgumentCaptor<YyNotificationTemplate> captor = ArgumentCaptor.forClass(YyNotificationTemplate.class);
        verify(mapper).insert(captor.capture());
        YyNotificationTemplate inserted = captor.getValue();
        assertEquals("BOOKING_CONFIRM", inserted.getTemplateCode());
        assertEquals("ORDER_CREATED", inserted.getScene());
        assertEquals("SMS", inserted.getChannelType());
        assertEquals("1", inserted.getEnabled());
    }

    @Test
    void deleteShouldValidateRequestedIdsBeforeMapperDelete() {
        when(mapper.selectByIds(List.of(1L, 2L))).thenReturn(List.of(new YyNotificationTemplate()));

        assertThrows(ServiceException.class, () -> service().deleteWithValidByIds(List.of(1L, 2L), true));
    }

    private YyNotificationTemplateServiceImpl service() {
        return new YyNotificationTemplateServiceImpl(mapper);
    }

    private YyNotificationTemplateBo payload() {
        YyNotificationTemplateBo bo = new YyNotificationTemplateBo();
        bo.setTemplateCode("BOOKING_CONFIRM");
        bo.setScene("ORDER_CREATED");
        bo.setChannelType("SMS");
        bo.setTitle("Booking confirmed");
        bo.setContent("Your booking is confirmed.");
        bo.setProviderTemplateId("provider-template-id");
        bo.setEnabled("1");
        bo.setRemark("owner contract");
        return bo;
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
