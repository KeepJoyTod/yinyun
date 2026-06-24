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
import org.dromara.yy.domain.YyScheduleRule;
import org.dromara.yy.domain.bo.YyScheduleRuleBo;
import org.dromara.yy.domain.vo.YyScheduleRuleVo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyScheduleRuleMapper;
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
@Tag("dev")
class YyScheduleRuleServiceImplTest {

    @Mock
    private YyScheduleRuleMapper scheduleRuleMapper;

    @Mock
    private YyEmployeeMapper employeeMapper;

    @Mock
    private YyEmployeeStoreMapper employeeStoreMapper;

    @InjectMocks
    private YyScheduleRuleServiceImpl service;

    @Test
    void queryListShouldScopeNormalEmployeeToBoundStoresWhenStoreIdMissing() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyScheduleRule.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(2063173289800183809L);
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyEmployeeStore secondary = employeeStore(employee.getId(), 900000000000000200L);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(secondary));
        when(scheduleRuleMapper.selectVoList(any())).thenReturn(List.of(new YyScheduleRuleVo()));

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::getLoginUser).thenReturn(loginUser);

            service.queryList(new YyScheduleRuleBo());
        }

        ArgumentCaptor<Wrapper<YyScheduleRule>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(scheduleRuleMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();
        Map<String, Object> params = ((LambdaQueryWrapper<YyScheduleRule>) captor.getValue()).getParamNameValuePairs();

        assertContainsAny(sqlSegment, "store_id", "storeId");
        assertTrue(params.containsValue(900000000000000200L), () -> "SQL params should include employee bound store: " + params);
    }

    @Test
    void queryListShouldReturnEmptyScopeWhenNormalEmployeeRequestsOtherStore() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyScheduleRule.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(2063173289800183809L);
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyEmployeeStore ownStore = employeeStore(employee.getId(), 900000000000000100L);
        YyScheduleRuleBo bo = new YyScheduleRuleBo();
        bo.setStoreId(900000000000000999L);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(ownStore));
        when(scheduleRuleMapper.selectVoList(any())).thenReturn(List.of());

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::getLoginUser).thenReturn(loginUser);

            service.queryList(bo);
        }

        ArgumentCaptor<Wrapper<YyScheduleRule>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(scheduleRuleMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();

        assertTrue(sqlSegment.contains("1 = 0") || sqlSegment.contains("1=0"),
            () -> "SQL segment should force empty result for out-of-scope store: " + sqlSegment);
    }

    @Test
    void insertShouldRejectNormalEmployeeOutsideStoreScope() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(2063173289800183809L);
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyEmployeeStore ownStore = employeeStore(employee.getId(), 900000000000000100L);
        YyScheduleRuleBo bo = scheduleRuleBo(900000000000000999L);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(ownStore));

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::getLoginUser).thenReturn(loginUser);

            assertThrows(ServiceException.class, () -> service.insertByBo(bo));
        }

        verify(scheduleRuleMapper, never()).insert(any(YyScheduleRule.class));
    }

    @Test
    void updateShouldRejectNormalEmployeeOutsideStoreScope() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(2063173289800183809L);
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyEmployeeStore ownStore = employeeStore(employee.getId(), 900000000000000100L);
        YyScheduleRule existing = scheduleRule(880001L, 900000000000000999L);
        YyScheduleRuleBo bo = scheduleRuleBo(900000000000000999L);
        bo.setId(existing.getId());
        when(scheduleRuleMapper.selectById(existing.getId())).thenReturn(existing);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(ownStore));

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::getLoginUser).thenReturn(loginUser);

            assertThrows(ServiceException.class, () -> service.updateByBo(bo));
        }

        verify(scheduleRuleMapper, never()).updateById(any(YyScheduleRule.class));
    }

    @Test
    void updateShouldRejectWhenExistingRuleIsOutsideStoreScopeEvenIfPayloadStoreIsInScope() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(2063173289800183809L);
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyEmployeeStore ownStore = employeeStore(employee.getId(), 900000000000000100L);
        YyScheduleRule existing = scheduleRule(880001L, 900000000000000999L);
        YyScheduleRuleBo bo = scheduleRuleBo(900000000000000100L);
        bo.setId(existing.getId());
        when(scheduleRuleMapper.selectById(existing.getId())).thenReturn(existing);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(ownStore));

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::getLoginUser).thenReturn(loginUser);

            assertThrows(ServiceException.class, () -> service.updateByBo(bo));
        }

        verify(scheduleRuleMapper, never()).updateById(any(YyScheduleRule.class));
    }

    @Test
    void deleteShouldRejectNormalEmployeeOutsideStoreScope() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(2063173289800183809L);
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyEmployeeStore ownStore = employeeStore(employee.getId(), 900000000000000100L);
        YyScheduleRule existing = scheduleRule(880001L, 900000000000000999L);
        when(scheduleRuleMapper.selectByIds(List.of(existing.getId()))).thenReturn(List.of(existing));
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(ownStore));

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::getLoginUser).thenReturn(loginUser);

            assertThrows(ServiceException.class, () -> service.deleteWithValidByIds(List.of(existing.getId()), true));
        }

        verify(scheduleRuleMapper, never()).deleteByIds(any());
    }

    private static YyScheduleRuleBo scheduleRuleBo(Long storeId) {
        YyScheduleRuleBo bo = new YyScheduleRuleBo();
        bo.setStoreId(storeId);
        bo.setServiceGroupId(700001L);
        bo.setWeekday(1);
        bo.setStartTime("10:00");
        bo.setEndTime("10:30");
        bo.setCapacity(1);
        bo.setEnabled("1");
        return bo;
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

    private static YyScheduleRule scheduleRule(Long id, Long storeId) {
        YyScheduleRule rule = new YyScheduleRule();
        rule.setId(id);
        rule.setStoreId(storeId);
        rule.setServiceGroupId(700001L);
        rule.setWeekday(1);
        rule.setStartTime("10:00");
        rule.setEndTime("10:30");
        rule.setCapacity(1);
        rule.setEnabled("1");
        return rule;
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
