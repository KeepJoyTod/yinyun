package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyPhotoAsset;
import org.dromara.yy.domain.bo.YyPhotoAssetBo;
import org.dromara.yy.domain.vo.YyPhotoAssetVo;
import org.dromara.yy.mapper.YyPhotoAssetMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyPhotoAssetServiceImplTest {

    @Mock
    private YyPhotoAssetMapper baseMapper;

    @InjectMocks
    private YyPhotoAssetServiceImpl service;

    @Test
    void queryListShouldNotBeUnscopedForNormalEmployeeWhenStoreIdMissing() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyPhotoAsset.class);
        when(baseMapper.selectVoList(any(Wrapper.class))).thenReturn(List.of(new YyPhotoAssetVo()));

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);

            service.queryList(new YyPhotoAssetBo());
        }

        ArgumentCaptor<Wrapper<YyPhotoAsset>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(baseMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();

        assertContainsAny(sqlSegment, "store_id", "storeId", "1 = 0", "1=0");
    }

    @Test
    void insertByBoShouldRequireObjectKey() {
        YyPhotoAssetBo bo = validBo();
        bo.setObjectKey("");

        ServiceException exception = assertThrows(ServiceException.class, () -> service.insertByBo(bo));

        assertEquals("OSS对象Key不能为空", exception.getMessage());
        verify(baseMapper, never()).insert(any(YyPhotoAsset.class));
    }

    @Test
    void insertByBoShouldRejectDuplicateObjectKeyInSameAlbum() {
        YyPhotoAssetBo bo = validBo();
        when(baseMapper.selectCount(any(Wrapper.class))).thenReturn(1L);

        ServiceException exception = assertThrows(ServiceException.class, () -> service.insertByBo(bo));

        assertEquals("该相册已存在相同OSS对象Key的底片", exception.getMessage());
        verify(baseMapper, never()).insert(any(YyPhotoAsset.class));
    }

    @Test
    void insertByBoShouldPersistAssetWhenObjectKeyIsUnique() {
        YyPhotoAssetBo bo = validBo();
        when(baseMapper.selectCount(any(Wrapper.class))).thenReturn(0L);
        when(baseMapper.insert(any(YyPhotoAsset.class))).thenAnswer(invocation -> {
            YyPhotoAsset entity = invocation.getArgument(0);
            entity.setId(2063173289800183809L);
            return 1;
        });

        assertTrue(service.insertByBo(bo));
        assertEquals(2063173289800183809L, bo.getId());

        ArgumentCaptor<YyPhotoAsset> captor = ArgumentCaptor.forClass(YyPhotoAsset.class);
        verify(baseMapper).insert(captor.capture());
        assertEquals("photos/wang/02.png", captor.getValue().getObjectKey());
    }

    private static YyPhotoAssetBo validBo() {
        YyPhotoAssetBo bo = new YyPhotoAssetBo();
        bo.setStoreId(900002L);
        bo.setAlbumId(903001L);
        bo.setFileName("02.png");
        bo.setFileUrl("https://oss.example/photos/wang/02.png");
        bo.setObjectKey("photos/wang/02.png");
        bo.setVisible("1");
        bo.setIsSelected("0");
        bo.setSort(1);
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
