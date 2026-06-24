package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.AbstractWrapper;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.encrypt.core.EncryptContext;
import org.dromara.common.encrypt.core.EncryptorManager;
import org.dromara.common.encrypt.enumd.AlgorithmType;
import org.dromara.common.encrypt.enumd.EncodeType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyPhotoAccessLog;
import org.dromara.yy.domain.bo.YyPhotoAccessLogBo;
import org.dromara.yy.domain.vo.YyPhotoAccessLogVo;
import org.dromara.yy.mapper.YyPhotoAccessLogMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyPhotoAccessLogServiceImplTest {

    @Mock
    private YyPhotoAccessLogMapper baseMapper;

    @Test
    void queryListShouldNotBeUnscopedForNormalEmployeeWhenStoreIdMissing() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyPhotoAccessLog.class);
        YyPhotoAccessLogServiceImpl service = new YyPhotoAccessLogServiceImpl(baseMapper);
        when(baseMapper.selectVoList(any(Wrapper.class))).thenReturn(List.of(new YyPhotoAccessLogVo()));

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);

            service.queryList(new YyPhotoAccessLogBo());
        }

        ArgumentCaptor<Wrapper<YyPhotoAccessLog>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(baseMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();

        assertContainsAny(sqlSegment, "store_id", "storeId", "1 = 0", "1=0");
    }

    @Test
    void queryPageListShouldUseAuditFilters() {
        YyPhotoAccessLogServiceImpl service = new YyPhotoAccessLogServiceImpl(baseMapper);
        YyPhotoAccessLogBo bo = new YyPhotoAccessLogBo();
        bo.setAlbumId(903001L);
        bo.setAssetId(904001L);
        bo.setCustomerPhone("13800003333");
        bo.setPlatform("H5");
        bo.setAction("PREVIEW");
        bo.setSuccess("1");
        Page<YyPhotoAccessLogVo> page = new Page<>();
        page.setRecords(java.util.List.of(new YyPhotoAccessLogVo()));
        when(baseMapper.selectVoPage(any(Page.class), any(Wrapper.class))).thenReturn(page);

        TableDataInfo<YyPhotoAccessLogVo> result = service.queryPageList(bo, new PageQuery(1, 10));

        assertEquals(1, result.getRows().size());
        ArgumentCaptor<Wrapper<YyPhotoAccessLog>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(baseMapper).selectVoPage(any(Page.class), captor.capture());
    }

    @Test
    void queryPageListShouldMatchPlainAndEncryptedCustomerPhone() {
        YyPhotoAccessLogServiceImpl service = new YyPhotoAccessLogServiceImpl(baseMapper);
        YyPhotoAccessLogBo bo = new YyPhotoAccessLogBo();
        bo.setCustomerPhone("13800003333");
        Page<YyPhotoAccessLogVo> page = new Page<>();
        when(baseMapper.selectVoPage(any(Page.class), any(Wrapper.class))).thenReturn(page);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyPhotoAccessLog.class);

        service.queryPageList(bo, new PageQuery(1, 10));

        ArgumentCaptor<Wrapper<YyPhotoAccessLog>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(baseMapper).selectVoPage(any(Page.class), captor.capture());
        Wrapper<YyPhotoAccessLog> wrapper = captor.getValue();
        AbstractWrapper<YyPhotoAccessLog, ?, ?> abstractWrapper = assertInstanceOf(AbstractWrapper.class, wrapper);
        wrapper.getSqlSegment();
        String paramValues = abstractWrapper.getParamNameValuePairs().values().toString();
        assertTrue(paramValues.contains("13800003333"), paramValues);
        assertTrue(paramValues.contains("ENC_"), paramValues);
        assertTrue(paramValues.contains(encryptPhone("13800003333")), paramValues);
    }

    private static String encryptPhone(String phone) {
        EncryptContext context = new EncryptContext();
        context.setAlgorithm(AlgorithmType.AES);
        context.setEncode(EncodeType.BASE64);
        context.setPassword("change-16-bytes!");
        return new EncryptorManager().encrypt(phone, context);
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
