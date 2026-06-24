package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyChannelProductMapping;
import org.dromara.yy.domain.bo.YyChannelProductMappingBo;
import org.dromara.yy.domain.vo.ClientDouyinLifeOrderEntryVo;
import org.dromara.yy.domain.vo.YyChannelProductMappingVo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyChannelProductMappingMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class YyChannelProductMappingServiceImplTest {

    @Mock
    private YyChannelProductMappingMapper mappingMapper;

    @Mock
    private YyEmployeeMapper employeeMapper;

    @Mock
    private YyEmployeeStoreMapper employeeStoreMapper;

    @InjectMocks
    private YyChannelProductMappingServiceImpl service;

    @Tag("dev")
    @Test
    void queryListShouldScopeNormalEmployeeToBoundStoresWhenStoreIdMissing() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyChannelProductMapping.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = loginUser();
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(employeeStore(employee.getId(), 900000000000000200L)));
        when(mappingMapper.selectVoList(any())).thenReturn(List.of());

        try (MockedStatic<LoginHelper> loginHelper = normalEmployeeLogin(loginUser)) {
            service.queryList(new YyChannelProductMappingBo());
        }

        ArgumentCaptor<Wrapper<YyChannelProductMapping>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(mappingMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();
        Map<String, Object> params = ((LambdaQueryWrapper<YyChannelProductMapping>) captor.getValue()).getParamNameValuePairs();

        assertContainsAny(sqlSegment, "store_id", "storeId");
        assertTrue(params.containsValue(900000000000000200L), () -> "SQL params should include employee bound store: " + params);
    }

    @Tag("dev")
    @Test
    void queryListShouldReturnEmptyScopeWhenNormalEmployeeRequestsOtherStore() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyChannelProductMapping.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = loginUser();
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(employeeStore(employee.getId(), 900000000000000100L)));
        when(mappingMapper.selectVoList(any())).thenReturn(List.of());
        YyChannelProductMappingBo bo = new YyChannelProductMappingBo();
        bo.setStoreId(900000000000000999L);

        try (MockedStatic<LoginHelper> loginHelper = normalEmployeeLogin(loginUser)) {
            service.queryList(bo);
        }

        ArgumentCaptor<Wrapper<YyChannelProductMapping>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(mappingMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();
        assertTrue(sqlSegment.contains("1 = 0") || sqlSegment.contains("1=0"),
            () -> "SQL segment should force empty result for out-of-scope store: " + sqlSegment);
    }

    @Tag("dev")
    @Test
    void updateShouldRejectNormalEmployeeOutsideExistingStoreScope() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = loginUser();
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyChannelProductMapping existing = mapping(900001L, 900000000000000999L);
        YyChannelProductMappingBo bo = mappingBo(900000000000000100L);
        bo.setId(existing.getId());
        when(mappingMapper.selectById(existing.getId())).thenReturn(existing);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(employeeStore(employee.getId(), 900000000000000100L)));

        try (MockedStatic<LoginHelper> loginHelper = normalEmployeeLogin(loginUser)) {
            assertThrows(ServiceException.class, () -> service.updateByBo(bo));
        }

        verify(mappingMapper, never()).updateById(any(YyChannelProductMapping.class));
    }

    @Tag("dev")
    @Test
    void deleteShouldRejectNormalEmployeeOutsideStoreScope() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = loginUser();
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyChannelProductMapping existing = mapping(900001L, 900000000000000999L);
        when(mappingMapper.selectByIds(List.of(existing.getId()))).thenReturn(List.of(existing));
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(employeeStore(employee.getId(), 900000000000000100L)));

        try (MockedStatic<LoginHelper> loginHelper = normalEmployeeLogin(loginUser)) {
            assertThrows(ServiceException.class, () -> service.deleteWithValidByIds(List.of(existing.getId()), true));
        }

        verify(mappingMapper, never()).deleteByIds(any());
    }

    @Tag("dev")
    @Test
    void queryListShouldBuildDouyinLifeEntryFilters() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyChannelProductMapping.class);

        YyChannelProductMappingBo bo = new YyChannelProductMappingBo();
        bo.setChannelType("DOUYIN_LIFE");
        bo.setExternalPoiId("poi-001");
        bo.setLandingUrl("https://www.douyin.com/life");
        bo.setLandingPath("pages/life/goods");
        when(mappingMapper.selectVoList(any())).thenReturn(List.of());

        service.queryList(bo);

        ArgumentCaptor<Wrapper<YyChannelProductMapping>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(mappingMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();

        assertContainsAny(sqlSegment, "channel_type", "channelType");
        assertContainsAny(sqlSegment, "external_poi_id", "externalPoiId");
        assertContainsAny(sqlSegment, "landing_url", "landingUrl");
        assertContainsAny(sqlSegment, "landing_path", "landingPath");
    }

    @Tag("dev")
    @Test
    void queryPublicDouyinLifeOrderEntriesShouldExposeOnlyActiveLandingEntries() {
        YyChannelProductMappingVo active = new YyChannelProductMappingVo();
        active.setId(2063173289800183809L);
        active.setStoreId(1001L);
        active.setProductId(2001L);
        active.setChannelType("DOUYIN_LIFE");
        active.setExternalName("证件照精修套餐");
        active.setExternalProductId("life-product-001");
        active.setExternalSkuId("life-sku-001");
        active.setExternalPoiId("poi-001");
        active.setLandingUrl("https://v.douyin.com/order-entry");
        active.setMappingStatus("ACTIVE");

        YyChannelProductMappingVo disabled = new YyChannelProductMappingVo();
        disabled.setId(2L);
        disabled.setChannelType("DOUYIN_LIFE");
        disabled.setExternalName("停用套餐");
        disabled.setLandingUrl("https://v.douyin.com/disabled");
        disabled.setMappingStatus("DISABLED");

        YyChannelProductMappingVo noLanding = new YyChannelProductMappingVo();
        noLanding.setId(3L);
        noLanding.setChannelType("DOUYIN_LIFE");
        noLanding.setExternalName("缺入口套餐");
        noLanding.setMappingStatus("ACTIVE");

        when(mappingMapper.selectVoList(any())).thenReturn(List.of(active, disabled, noLanding));

        List<ClientDouyinLifeOrderEntryVo> entries = service.queryPublicDouyinLifeOrderEntries(1001L);

        assertTrue(entries.size() == 1, () -> "should expose one active entry, actual: " + entries.size());
        ClientDouyinLifeOrderEntryVo entry = entries.get(0);
        assertTrue("2063173289800183809".equals(entry.getEntryId()));
        assertTrue("1001".equals(entry.getStoreId()));
        assertTrue("2001".equals(entry.getProductId()));
        assertTrue("DOUYIN_LIFE".equals(entry.getChannelType()));
        assertTrue("证件照精修套餐".equals(entry.getTitle()));
        assertTrue("life-product-001".equals(entry.getExternalProductId()));
        assertTrue("life-sku-001".equals(entry.getExternalSkuId()));
        assertTrue("poi-001".equals(entry.getExternalPoiId()));
        assertTrue("https://v.douyin.com/order-entry".equals(entry.getLandingUrl()));
        assertTrue(entry.getLandingPath() == null);
    }

    private static void assertContainsAny(String actual, String... expectedItems) {
        for (String expected : expectedItems) {
            if (actual.contains(expected)) {
                return;
            }
        }
        assertTrue(false, () -> "SQL segment should contain one of " + List.of(expectedItems) + ", actual: " + actual);
    }

    private static LoginUser loginUser() {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(2063173289800183809L);
        return loginUser;
    }

    private static MockedStatic<LoginHelper> normalEmployeeLogin(LoginUser loginUser) {
        MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class);
        loginHelper.when(LoginHelper::isLogin).thenReturn(true);
        loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
        loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);
        loginHelper.when(LoginHelper::getLoginUser).thenReturn(loginUser);
        return loginHelper;
    }

    private static YyEmployee employee(Long id, Long userId, Long storeId) {
        YyEmployee employee = new YyEmployee();
        employee.setId(id);
        employee.setUserId(userId);
        employee.setStoreId(storeId);
        employee.setStatus("0");
        return employee;
    }

    private static YyEmployeeStore employeeStore(Long employeeId, Long storeId) {
        YyEmployeeStore employeeStore = new YyEmployeeStore();
        employeeStore.setId(storeId + 10L);
        employeeStore.setEmployeeId(employeeId);
        employeeStore.setStoreId(storeId);
        employeeStore.setDelFlag("0");
        return employeeStore;
    }

    private static YyChannelProductMapping mapping(Long id, Long storeId) {
        YyChannelProductMapping mapping = new YyChannelProductMapping();
        mapping.setId(id);
        mapping.setStoreId(storeId);
        mapping.setProductId(2001L);
        mapping.setChannelType("DOUYIN_LIFE");
        mapping.setExternalProductId("life-product-001");
        mapping.setMappingStatus("ACTIVE");
        return mapping;
    }

    private static YyChannelProductMappingBo mappingBo(Long storeId) {
        YyChannelProductMappingBo bo = new YyChannelProductMappingBo();
        bo.setStoreId(storeId);
        bo.setProductId(2001L);
        bo.setChannelType("DOUYIN_LIFE");
        bo.setExternalProductId("life-product-001");
        bo.setMappingStatus("ACTIVE");
        return bo;
    }
}
