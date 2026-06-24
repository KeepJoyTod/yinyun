package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyMicroForm;
import org.dromara.yy.domain.YyMicroFormSubmission;
import org.dromara.yy.domain.bo.ClientMicroFormSubmitRequest;
import org.dromara.yy.domain.bo.YyMicroFormBo;
import org.dromara.yy.domain.vo.ClientMicroFormSubmitVo;
import org.dromara.yy.domain.vo.YyMicroFormVo;
import org.dromara.yy.mapper.YyMicroFormMapper;
import org.dromara.yy.mapper.YyMicroFormSubmissionMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyMicroFormServiceImplTest {

    @Mock
    private YyMicroFormMapper formMapper;

    @Mock
    private YyMicroFormSubmissionMapper submissionMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void queryListShouldNotBeUnscopedForNormalEmployeeWhenStoreIdMissing() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyMicroForm.class);
        when(formMapper.selectVoList(any(Wrapper.class))).thenReturn(List.of(new YyMicroFormVo()));

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);

            service().queryList(new YyMicroFormBo());
        }

        ArgumentCaptor<Wrapper<YyMicroForm>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(formMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();

        assertContainsAny(sqlSegment, "store_id", "storeId", "1 = 0", "1=0");
    }

    @Test
    void insertShouldNormalizeSchemaAndKeepDraftByDefault() {
        when(formMapper.selectCount(any())).thenReturn(0L);
        when(formMapper.insert(any(YyMicroForm.class))).thenAnswer(invocation -> {
            YyMicroForm entity = invocation.getArgument(0);
            entity.setId(1001L);
            return 1;
        });

        YyMicroFormBo bo = new YyMicroFormBo();
        bo.setFormName("Wedding lead form");
        bo.setSchemaJson("""
            {"fields":[
              {"id":"phone","label":"Phone","type":"text","required":true,"sort":2},
              {"id":"name","label":"Name","type":"text","required":true,"sort":1},
              {"id":"style","label":"Style","type":"checkbox","options":["Indoor","Outdoor"],"sort":3}
            ]}
            """);

        service().insertByBo(bo);

        ArgumentCaptor<YyMicroForm> captor = ArgumentCaptor.forClass(YyMicroForm.class);
        verify(formMapper).insert(captor.capture());
        YyMicroForm inserted = captor.getValue();
        assertEquals(0L, inserted.getStoreId());
        assertEquals("DRAFT", inserted.getStatus());
        assertNotNull(inserted.getLinkKey());
        assertTrue(inserted.getSchemaJson().contains("\"fields\""));
        assertTrue(inserted.getSchemaJson().indexOf("\"id\":\"name\"") < inserted.getSchemaJson().indexOf("\"id\":\"phone\""));
    }

    @Test
    void insertShouldRejectUnsupportedFieldType() {
        YyMicroFormBo bo = new YyMicroFormBo();
        bo.setFormName("Invalid form");
        bo.setSchemaJson("{\"fields\":[{\"id\":\"upload\",\"label\":\"Upload\",\"type\":\"file\"}]}");

        assertThrows(ServiceException.class, () -> service().insertByBo(bo));
    }

    @Test
    void publishShouldSetPublishedStatusAndTimestamp() {
        YyMicroForm existing = publishedCapableForm("mf-publish");
        existing.setStatus("DRAFT");
        when(formMapper.selectById(2001L)).thenReturn(existing);
        when(formMapper.updateById(any(YyMicroForm.class))).thenReturn(1);

        service().publish(2001L);

        ArgumentCaptor<YyMicroForm> captor = ArgumentCaptor.forClass(YyMicroForm.class);
        verify(formMapper).updateById(captor.capture());
        YyMicroForm update = captor.getValue();
        assertEquals(2001L, update.getId());
        assertEquals("PUBLISHED", update.getStatus());
        assertNotNull(update.getPublishedAt());
        assertEquals("mf-publish", update.getLinkKey());
        assertTrue(update.getSchemaJson().contains("\"fields\""));
    }

    @Test
    void publicFormShouldRejectUnpublishedForm() {
        YyMicroForm draft = publishedCapableForm("mf-draft");
        draft.setStatus("DRAFT");
        when(formMapper.selectOne(any())).thenReturn(draft);

        assertThrows(ServiceException.class, () -> service().publicForm("mf-draft"));
    }

    @Test
    void submitPublicFormShouldRequireRequiredAnswers() {
        YyMicroForm form = publishedCapableForm("mf-required");
        when(formMapper.selectOne(any())).thenReturn(form);

        ClientMicroFormSubmitRequest request = new ClientMicroFormSubmitRequest();
        request.setAnswers(Map.of("name", "Ada"));

        assertThrows(ServiceException.class, () -> service().submitPublicForm("mf-required", request));
    }

    @Test
    void submitPublicFormShouldStoreAnswersSnapshot() {
        YyMicroForm form = publishedCapableForm("mf-submit");
        when(formMapper.selectOne(any())).thenReturn(form);
        when(submissionMapper.insert(any(YyMicroFormSubmission.class))).thenAnswer(invocation -> {
            YyMicroFormSubmission entity = invocation.getArgument(0);
            entity.setId(3001L);
            return 1;
        });

        Map<String, Object> answers = new LinkedHashMap<>();
        answers.put("name", "Ada");
        answers.put("phone", "13800003333");
        answers.put("style", "Indoor");
        ClientMicroFormSubmitRequest request = new ClientMicroFormSubmitRequest();
        request.setAnswers(answers);

        ClientMicroFormSubmitVo result = service().submitPublicForm("mf-submit", request);

        assertEquals(3001L, result.getSubmissionId());
        ArgumentCaptor<YyMicroFormSubmission> captor = ArgumentCaptor.forClass(YyMicroFormSubmission.class);
        verify(submissionMapper).insert(captor.capture());
        YyMicroFormSubmission inserted = captor.getValue();
        assertEquals(2001L, inserted.getFormId());
        assertEquals("Lead form", inserted.getFormNameSnapshot());
        assertEquals("Ada", inserted.getCustomerName());
        assertEquals("13800003333", inserted.getCustomerPhone());
        assertEquals("PENDING", inserted.getFollowStatus());
        assertEquals(null, inserted.getOrderId());
    }

    private YyMicroFormServiceImpl service() {
        return new YyMicroFormServiceImpl(formMapper, submissionMapper, objectMapper);
    }

    private YyMicroForm publishedCapableForm(String linkKey) {
        YyMicroForm form = new YyMicroForm();
        form.setId(2001L);
        form.setStoreId(0L);
        form.setFormName("Lead form");
        form.setStatus("PUBLISHED");
        form.setLinkKey(linkKey);
        form.setSchemaJson("""
            {"fields":[
              {"id":"name","label":"Name","type":"text","required":true,"sort":1},
              {"id":"phone","label":"Phone","type":"text","required":true,"sort":2},
              {"id":"style","label":"Style","type":"radio","options":["Indoor","Outdoor"],"sort":3}
            ]}
            """);
        return form;
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
