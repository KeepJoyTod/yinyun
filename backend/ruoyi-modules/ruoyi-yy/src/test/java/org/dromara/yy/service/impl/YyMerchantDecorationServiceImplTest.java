package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.yy.domain.YyMerchantDecoration;
import org.dromara.yy.domain.bo.YyMerchantDecorationBo;
import org.dromara.yy.domain.vo.YyMerchantDecorationVo;
import org.dromara.yy.mapper.YyMerchantDecorationMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyMerchantDecorationServiceImplTest {

    @Mock
    private YyMerchantDecorationMapper mapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void getCurrentShouldReturnDefaultDraftWhenMissing() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyMerchantDecoration.class);
        when(mapper.selectOne(any())).thenReturn(null);

        YyMerchantDecorationVo vo = service().getCurrent(0L, "WECHAT");

        assertEquals(0L, vo.getStoreId());
        assertEquals("WECHAT", vo.getChannelType());
        assertEquals("DRAFT", vo.getStatus());
        assertTrue(vo.getConfigJson().contains("\"bookingFlow\""));
    }

    @Test
    void saveDraftShouldInsertWhenScopeMissing() {
        when(mapper.selectOne(any())).thenReturn(null);
        when(mapper.insert(any(YyMerchantDecoration.class))).thenAnswer(invocation -> {
            YyMerchantDecoration entity = invocation.getArgument(0);
            entity.setId(3001L);
            return 1;
        });

        YyMerchantDecorationVo vo = service().saveDraft(payload());

        assertEquals("DRAFT", vo.getStatus());
        assertNotNull(vo.getId());
        ArgumentCaptor<YyMerchantDecoration> captor = ArgumentCaptor.forClass(YyMerchantDecoration.class);
        verify(mapper).insert(captor.capture());
        assertEquals("WECHAT", captor.getValue().getChannelType());
    }

    @Test
    void publishShouldSnapshotPublishedConfig() {
        YyMerchantDecoration existing = new YyMerchantDecoration();
        existing.setId(3002L);
        existing.setStoreId(0L);
        existing.setChannelType("WECHAT");
        existing.setPreviewToken("dec-preview");
        when(mapper.selectOne(any())).thenReturn(existing);
        when(mapper.updateById(any(YyMerchantDecoration.class))).thenReturn(1);
        when(mapper.selectOne(any())).thenReturn(existing);

        service().publish(payload());

        ArgumentCaptor<YyMerchantDecoration> captor = ArgumentCaptor.forClass(YyMerchantDecoration.class);
        verify(mapper).updateById(captor.capture());
        YyMerchantDecoration update = captor.getValue();
        assertEquals("PUBLISHED", update.getStatus());
        assertNotNull(update.getPublishedAt());
        assertEquals(update.getConfigJson(), update.getPublishedConfigJson());
    }

    @Test
    void saveDraftShouldRejectInvalidJson() {
        YyMerchantDecorationBo bo = payload();
        bo.setConfigJson("{bad-json");

        assertThrows(ServiceException.class, () -> service().saveDraft(bo));
    }

    private YyMerchantDecorationServiceImpl service() {
        return new YyMerchantDecorationServiceImpl(mapper, objectMapper);
    }

    private YyMerchantDecorationBo payload() {
        YyMerchantDecorationBo bo = new YyMerchantDecorationBo();
        bo.setStoreId(0L);
        bo.setChannelType("WECHAT");
        bo.setConfigJson("""
            {"theme":{"brandName":"一悦照相馆","themeColor":"#F58235","shareTitle":"一悦照相馆预约","shareDesc":"证件照预约","shareIconUrl":""},"bookingFlow":{"home":{"currentHomepage":"DEFAULT","homepageTitle":"一悦照相馆预约"},"appointment":{"forceFollowWechat":false,"guideImageUrl":""},"category":{"showProductCategories":false},"product":{"listStyle":"grid","showRelatedProducts":false,"hotKeywords":""},"customer":{"needEmail":false,"needBirthday":false,"needIdCard":false,"needRemark":false,"remarkRequired":false,"remarkPlaceholder":"","customFields":[]},"confirm":{"orderNotice":"disabled","couponNotice":"disabled","serviceAgreement":false,"agreementMode":"modal","agreementContent":""}},"profileMenus":[],"bottomMenus":[],"watermark":{"enabled":false,"imageUrl":"","previewBackground":"light"},"platform":{"wechatMenuTemplates":[],"activeTemplate":"","syncStatus":"未同步"},"wechatMiniProgram":{"appId":"","callbackUrl":"","enabled":"","sdkStatus":"","miniProgramPath":""}}
            """);
        return bo;
    }
}
