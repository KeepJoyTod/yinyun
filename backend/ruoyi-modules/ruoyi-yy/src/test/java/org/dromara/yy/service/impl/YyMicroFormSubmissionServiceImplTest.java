package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyMicroFormSubmission;
import org.dromara.yy.domain.bo.YyMicroFormFollowBo;
import org.dromara.yy.domain.bo.YyMicroFormSubmissionBo;
import org.dromara.yy.domain.vo.YyMicroFormSubmissionVo;
import org.dromara.yy.mapper.YyMicroFormSubmissionMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyMicroFormSubmissionServiceImplTest {

    @Mock
    private YyMicroFormSubmissionMapper mapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void queryListShouldNotBeUnscopedForNormalEmployeeWhenFormIdMissing() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyMicroFormSubmission.class);
        when(mapper.selectVoList(any(Wrapper.class))).thenReturn(List.of(new YyMicroFormSubmissionVo()));

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);

            new YyMicroFormSubmissionServiceImpl(mapper, objectMapper).queryList(new YyMicroFormSubmissionBo());
        }

        ArgumentCaptor<Wrapper<YyMicroFormSubmission>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(mapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();

        assertContainsAny(sqlSegment, "form_id", "formId", "1 = 0", "1=0");
    }

    @Test
    void updateFollowShouldOnlyUpdateFollowFieldsAndOptionalOrder() {
        YyMicroFormSubmission existing = new YyMicroFormSubmission();
        existing.setId(5001L);
        existing.setFormId(2001L);
        when(mapper.selectById(5001L)).thenReturn(existing);
        when(mapper.updateById(any(YyMicroFormSubmission.class))).thenReturn(1);

        YyMicroFormFollowBo bo = new YyMicroFormFollowBo();
        bo.setFollowStatus("followed");
        bo.setFollowRemark("Called customer");
        bo.setOrderId(9001L);

        new YyMicroFormSubmissionServiceImpl(mapper, objectMapper).updateFollow(5001L, bo);

        ArgumentCaptor<YyMicroFormSubmission> captor = ArgumentCaptor.forClass(YyMicroFormSubmission.class);
        verify(mapper).updateById(captor.capture());
        YyMicroFormSubmission update = captor.getValue();
        assertEquals(5001L, update.getId());
        assertEquals("FOLLOWED", update.getFollowStatus());
        assertEquals("Called customer", update.getFollowRemark());
        assertEquals(9001L, update.getOrderId());
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
