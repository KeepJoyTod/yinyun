package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.yy.domain.YyServiceGroup;
import org.dromara.yy.domain.bo.YyServiceGroupBo;
import org.dromara.yy.domain.vo.YyServiceGroupVo;
import org.dromara.yy.mapper.YyServiceGroupMapper;
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
class YyServiceGroupServiceImplTest {

    @Mock
    private YyServiceGroupMapper mapper;

    @Test
    void queryListShouldKeepStoreStatusAndNameInsideMapperWrapper() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyServiceGroup.class);
        when(mapper.selectVoList(any(Wrapper.class))).thenReturn(List.of(new YyServiceGroupVo()));

        YyServiceGroupBo bo = new YyServiceGroupBo();
        bo.setStoreId(1001L);
        bo.setGroupName("Portrait");
        bo.setStatus("ACTIVE");

        service().queryList(bo);

        ArgumentCaptor<Wrapper<YyServiceGroup>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(mapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();

        assertContainsAny(sqlSegment, "store_id", "storeId");
        assertContainsAny(sqlSegment, "group_name", "groupName");
        assertTrue(sqlSegment.contains("status"));
    }

    @Test
    void insertByBoShouldMapPayloadAndReturnCreatedId() {
        when(mapper.insert(any(YyServiceGroup.class))).thenAnswer(invocation -> {
            YyServiceGroup entity = invocation.getArgument(0);
            entity.setId(2001L);
            return 1;
        });

        YyServiceGroupBo bo = payload();

        assertTrue(service().insertByBo(bo));
        assertEquals(2001L, bo.getId());

        ArgumentCaptor<YyServiceGroup> captor = ArgumentCaptor.forClass(YyServiceGroup.class);
        verify(mapper).insert(captor.capture());
        YyServiceGroup inserted = captor.getValue();
        assertEquals(1001L, inserted.getStoreId());
        assertEquals("portrait", inserted.getGroupCode());
        assertEquals(3, inserted.getCapacity());
        assertEquals(60, inserted.getDurationMinutes());
        assertEquals("VERTICAL", inserted.getServiceMode());
    }

    @Test
    void insertByBoShouldRejectUnsupportedServiceMode() {
        YyServiceGroupBo bo = payload();
        bo.setServiceMode("timeline");

        assertThrows(ServiceException.class, () -> service().insertByBo(bo));
    }

    @Test
    void deleteShouldValidateRequestedIdsBeforeMapperDelete() {
        when(mapper.selectByIds(List.of(1L, 2L))).thenReturn(List.of(new YyServiceGroup()));

        assertThrows(ServiceException.class, () -> service().deleteWithValidByIds(List.of(1L, 2L), true));
    }

    private YyServiceGroupServiceImpl service() {
        return new YyServiceGroupServiceImpl(mapper);
    }

    private YyServiceGroupBo payload() {
        YyServiceGroupBo bo = new YyServiceGroupBo();
        bo.setStoreId(1001L);
        bo.setGroupCode("portrait");
        bo.setGroupName("Portrait");
        bo.setCapacity(3);
        bo.setDurationMinutes(60);
        bo.setServiceMode("VERTICAL");
        bo.setStatus("ACTIVE");
        bo.setSort(10);
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
