package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPhotoAlbum;
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.domain.vo.YyStudioBootstrapVo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyStudioServiceImplTest {

    @Mock
    private YyEmployeeMapper employeeMapper;

    @Mock
    private YyStoreMapper storeMapper;

    @Mock
    private YyOrderMapper orderMapper;

    @Mock
    private YyPhotoAlbumMapper photoAlbumMapper;

    @Mock
    private YyEmployeeStoreMapper employeeStoreMapper;

    @InjectMocks
    private YyStudioServiceImpl service;

    @Test
    void bootstrapShouldScopeEmployeeToOwnStoreAndReturnStringIds() {
        initTableInfo(YyEmployee.class);
        initTableInfo(YyStore.class);
        initTableInfo(YyEmployeeStore.class);
        initTableInfo(YyOrder.class);
        initTableInfo(YyPhotoAlbum.class);

        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(2063173289800183809L);
        loginUser.setUsername("yy-demo");
        loginUser.setNickname("演示店员");
        loginUser.setMenuPermission(Set.of("yy:dashboard:list", "yy:order:list"));
        loginUser.setRolePermission(Set.of("studio_staff"));

        YyEmployee employee = new YyEmployee();
        employee.setId(2063173289800183810L);
        employee.setUserId(loginUser.getUserId());
        employee.setStoreId(7407304729216157722L);
        employee.setEmployeeNo("YY-EMP-001");
        employee.setEmployeeName("演示店员");
        employee.setRoleType("PHOTOGRAPHER");
        employee.setStatus("0");

        YyStore store = new YyStore();
        store.setId(employee.getStoreId());
        store.setStoreCode("YY-SZ-001");
        store.setStoreName("影约云深圳旗舰店");
        store.setStatus("0");

        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of());
        when(storeMapper.selectList(any())).thenReturn(List.of(store));
        when(orderMapper.selectCount(any())).thenReturn(3L, 4L, 2L);
        when(photoAlbumMapper.selectCount(any())).thenReturn(5L);

        YyStudioBootstrapVo result = service.bootstrap(loginUser, false);

        assertFalse(result.getGlobalStoreScope());
        assertEquals("2063173289800183809", result.getIdentity().getUserId());
        assertEquals("2063173289800183810", result.getIdentity().getEmployeeId());
        assertEquals("7407304729216157722", result.getIdentity().getStoreId());
        assertEquals("PHOTOGRAPHER", result.getIdentity().getRoleType());
        assertEquals("7407304729216157722", result.getStores().get(0).getStoreId());
        assertEquals(Set.of("yy:dashboard:list", "yy:order:list"), result.getMenuPermissions());
        assertEquals(Set.of("studio_staff"), result.getRolePermissions());
        assertEquals("ready", result.getFeatureStatuses().get("order-appointment"));
        assertEquals("building", result.getFeatureStatuses().get("collaboration-work-orders"));
        assertEquals(3L, result.getPending().getPendingOrders());
        assertEquals(4L, result.getPending().getTodayArrivals());
        assertEquals(2L, result.getPending().getInventoryConflicts());
        assertEquals(5L, result.getPending().getActiveSelections());
    }

    @Test
    void bootstrapShouldUseEmployeeStoreBindingsForMultiStoreScope() {
        initTableInfo(YyEmployee.class);
        initTableInfo(YyStore.class);
        initTableInfo(YyEmployeeStore.class);
        initTableInfo(YyOrder.class);
        initTableInfo(YyPhotoAlbum.class);

        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(2063173289800183809L);
        loginUser.setUsername("yy-manager");
        loginUser.setNickname("多店店长");
        loginUser.setMenuPermission(Set.of("yy:dashboard:list"));
        loginUser.setRolePermission(Set.of("studio_manager"));

        YyEmployee employee = new YyEmployee();
        employee.setId(2063173289800183810L);
        employee.setUserId(loginUser.getUserId());
        employee.setStoreId(7407304729216157000L);
        employee.setEmployeeNo("YY-EMP-002");
        employee.setEmployeeName("多店店长");
        employee.setRoleType("MANAGER");
        employee.setStatus("0");

        YyEmployeeStore primary = new YyEmployeeStore();
        primary.setId(1L);
        primary.setEmployeeId(employee.getId());
        primary.setStoreId(7407304729216157722L);
        primary.setIsPrimary("1");
        primary.setRoleType("MANAGER");
        primary.setSort(1);
        primary.setDelFlag("0");

        YyEmployeeStore secondary = new YyEmployeeStore();
        secondary.setId(2L);
        secondary.setEmployeeId(employee.getId());
        secondary.setStoreId(7407304729216157723L);
        secondary.setIsPrimary("0");
        secondary.setRoleType("STAFF");
        secondary.setSort(2);
        secondary.setDelFlag("0");

        YyStore storeA = new YyStore();
        storeA.setId(primary.getStoreId());
        storeA.setStoreCode("BZ-WANDA");
        storeA.setStoreName("滨州万达店");
        storeA.setStatus("0");

        YyStore storeB = new YyStore();
        storeB.setId(secondary.getStoreId());
        storeB.setStoreCode("BZ-WUYUE");
        storeB.setStoreName("滨州吾悦店");
        storeB.setStatus("0");

        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(primary, secondary));
        when(storeMapper.selectList(any())).thenReturn(List.of(storeA, storeB));
        when(orderMapper.selectCount(any())).thenReturn(3L, 4L, 2L);
        when(photoAlbumMapper.selectCount(any())).thenReturn(5L);

        YyStudioBootstrapVo result = service.bootstrap(loginUser, false);

        assertEquals(2, result.getStores().size());
        assertEquals("7407304729216157722", result.getStores().get(0).getStoreId());
        assertEquals("MANAGER", result.getStores().get(0).getRoleType());
        assertEquals(true, result.getStores().get(0).getPrimary());
        assertEquals("7407304729216157723", result.getStores().get(1).getStoreId());
        assertEquals("STAFF", result.getStores().get(1).getRoleType());
        assertEquals(false, result.getStores().get(1).getPrimary());
    }

    private static void initTableInfo(Class<?> entityType) {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), entityType);
    }
}
