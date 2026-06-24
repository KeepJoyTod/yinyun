package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyMerchantMicroPage;
import org.dromara.yy.domain.bo.YyMerchantMicroPageBo;
import org.dromara.yy.domain.vo.YyMerchantMicroPageVo;
import org.dromara.yy.mapper.YyMerchantMicroPageMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

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
class YyMerchantMicroPageServiceImplTest {

    @Mock
    private YyMerchantMicroPageMapper mapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void queryListShouldNotBeUnscopedForNormalEmployeeWhenStoreIdMissing() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyMerchantMicroPage.class);
        when(mapper.selectVoList(any(Wrapper.class))).thenReturn(new java.util.ArrayList<>(List.of(new YyMerchantMicroPageVo())));

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);

            service().queryList(new YyMerchantMicroPageBo());
        }

        ArgumentCaptor<Wrapper<YyMerchantMicroPage>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(mapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();

        assertContainsAny(sqlSegment, "store_id", "storeId", "1 = 0", "1=0");
    }

    @Test
    void insertShouldDefaultDraftAndNormalizeConfig() {
        when(mapper.insert(any(YyMerchantMicroPage.class))).thenAnswer(invocation -> {
            YyMerchantMicroPage entity = invocation.getArgument(0);
            entity.setId(1001L);
            return 1;
        });
        when(mapper.selectCount(any())).thenReturn(0L);

        YyMerchantMicroPageBo bo = new YyMerchantMicroPageBo();
        bo.setPageTitle("Campaign Page");
        bo.setConfigJson("""
            {"components":[
              {"type":"title","title":"Title","props":{"text":"New Launch"}},
              {"type":"image","title":"Image","props":{"url":"https://cdn.example/a.png","height":280}}
            ]}
            """);

        service().insertByBo(bo);

        ArgumentCaptor<YyMerchantMicroPage> captor = ArgumentCaptor.forClass(YyMerchantMicroPage.class);
        verify(mapper).insert(captor.capture());
        YyMerchantMicroPage inserted = captor.getValue();
        assertEquals(0L, inserted.getStoreId());
        assertEquals("DRAFT", inserted.getStatus());
        assertEquals("COMPONENT", inserted.getEditMode());
        assertNotNull(inserted.getLinkKey());
        assertTrue(inserted.getConfigJson().contains("\"components\""));
    }

    @Test
    void insertShouldRejectUnsupportedComponentType() {
        YyMerchantMicroPageBo bo = new YyMerchantMicroPageBo();
        bo.setPageTitle("Invalid");
        bo.setConfigJson("{\"components\":[{\"type\":\"video\",\"title\":\"Video\"}]}");

        assertThrows(ServiceException.class, () -> service().insertByBo(bo));
    }

    @Test
    void publishShouldSnapshotDraftConfig() {
        YyMerchantMicroPage existing = page("mp-publish");
        existing.setStatus("DRAFT");
        when(mapper.selectById(2001L)).thenReturn(existing);
        when(mapper.updateById(any(YyMerchantMicroPage.class))).thenReturn(1);

        service().publish(2001L);

        ArgumentCaptor<YyMerchantMicroPage> captor = ArgumentCaptor.forClass(YyMerchantMicroPage.class);
        verify(mapper).updateById(captor.capture());
        YyMerchantMicroPage update = captor.getValue();
        assertEquals("PUBLISHED", update.getStatus());
        assertEquals("mp-publish", update.getLinkKey());
        assertNotNull(update.getPublishedAt());
        assertTrue(update.getPublishedConfigJson().contains("\"components\""));
    }

    @Test
    void publicPageShouldRejectDraft() {
        YyMerchantMicroPage draft = page("mp-draft");
        draft.setStatus("DRAFT");
        when(mapper.selectOne(any())).thenReturn(draft);

        assertThrows(ServiceException.class, () -> service().publicPage("mp-draft"));
    }

    @Test
    void deleteShouldValidateIds() {
        when(mapper.selectByIds(List.of(1L, 2L))).thenReturn(List.of(new YyMerchantMicroPage()));

        assertThrows(ServiceException.class, () -> service().deleteWithValidByIds(List.of(1L, 2L), true));
    }

    private YyMerchantMicroPageServiceImpl service() {
        return new YyMerchantMicroPageServiceImpl(mapper, objectMapper);
    }

    private YyMerchantMicroPage page(String linkKey) {
        YyMerchantMicroPage page = new YyMerchantMicroPage();
        page.setId(2001L);
        page.setStoreId(0L);
        page.setPageTitle("Landing");
        page.setEditMode("COMPONENT");
        page.setStatus("PUBLISHED");
        page.setLinkKey(linkKey);
        page.setBackgroundColor("#FBF8F2");
        page.setConfigJson("""
            {"components":[
              {"type":"title","title":"Title","props":{"text":"New Launch"}},
              {"type":"store","title":"Store","props":{"showPhone":true,"showAddress":true}}
            ]}
            """);
        page.setPublishedConfigJson(page.getConfigJson());
        return page;
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
