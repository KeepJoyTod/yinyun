package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyScheduleRule;
import org.dromara.yy.domain.bo.YyScheduleRuleBo;
import org.dromara.yy.domain.vo.YyScheduleRuleVo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyScheduleRuleMapper;
import org.dromara.yy.service.IYyScheduleRuleService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * 影约云预约规则Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyScheduleRuleServiceImpl implements IYyScheduleRuleService {

    private final YyScheduleRuleMapper baseMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;

    @Override
    public YyScheduleRuleVo queryById(Long id) {
        YyScheduleRuleVo vo = baseMapper.selectVoById(id);
        if (vo != null && !canAccessStore(vo.getStoreId())) {
            return null;
        }
        return vo;
    }

    @Override
    public TableDataInfo<YyScheduleRuleVo> queryPageList(YyScheduleRuleBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyScheduleRule> lqw = buildQueryWrapper(bo);
        Page<YyScheduleRuleVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyScheduleRuleVo> queryList(YyScheduleRuleBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    private LambdaQueryWrapper<YyScheduleRule> buildQueryWrapper(YyScheduleRuleBo bo) {
        LambdaQueryWrapper<YyScheduleRule> lqw = Wrappers.lambdaQuery();
        lqw.eq(bo.getStoreId() != null, YyScheduleRule::getStoreId, bo.getStoreId());
        lqw.eq(bo.getServiceGroupId() != null, YyScheduleRule::getServiceGroupId, bo.getServiceGroupId());
        lqw.eq(bo.getWeekday() != null, YyScheduleRule::getWeekday, bo.getWeekday());
        lqw.eq(StringUtils.isNotBlank(bo.getStartTime()), YyScheduleRule::getStartTime, bo.getStartTime());
        lqw.eq(StringUtils.isNotBlank(bo.getEndTime()), YyScheduleRule::getEndTime, bo.getEndTime());
        lqw.eq(StringUtils.isNotBlank(bo.getEnabled()), YyScheduleRule::getEnabled, bo.getEnabled());
        applyStoreScope(lqw, bo.getStoreId());
        lqw.orderByAsc(YyScheduleRule::getWeekday);
        lqw.orderByAsc(YyScheduleRule::getStartTime);
        lqw.orderByAsc(YyScheduleRule::getId);
        return lqw;
    }

    @Override
    public Boolean insertByBo(YyScheduleRuleBo bo) {
        YyScheduleRule add = BeanUtil.toBean(bo, YyScheduleRule.class);
        validEntityBeforeSave(add);
        if (!canAccessStore(add.getStoreId())) {
            throw new ServiceException("无权操作该门店预约规则");
        }
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyScheduleRuleBo bo) {
        YyScheduleRule existing = baseMapper.selectById(bo.getId());
        if (existing == null) {
            throw new ServiceException("预约规则不存在");
        }
        if (!canAccessStore(existing.getStoreId())) {
            throw new ServiceException("无权操作该门店预约规则");
        }
        YyScheduleRule update = BeanUtil.toBean(bo, YyScheduleRule.class);
        validEntityBeforeSave(update);
        if (!canAccessStore(update.getStoreId())) {
            throw new ServiceException("无权操作该门店预约规则");
        }
        return baseMapper.updateById(update) > 0;
    }

    private void validEntityBeforeSave(YyScheduleRule entity) {
        // 预留与服务组联动、容量冲突和时间段重叠校验。
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyScheduleRule> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size()) {
                throw new ServiceException("您没有删除权限!");
            }
            if (list.stream().anyMatch(rule -> !canAccessStore(rule.getStoreId()))) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }

    private void applyStoreScope(LambdaQueryWrapper<YyScheduleRule> lqw, Long requestedStoreId) {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (!storeScope.applicable() || storeScope.globalScope()) {
            lqw.eq(requestedStoreId != null, YyScheduleRule::getStoreId, requestedStoreId);
            return;
        }

        Set<Long> scopedStoreIds = storeScope.storeIds();
        if (scopedStoreIds.isEmpty()) {
            lqw.apply("1 = 0");
            return;
        }
        if (requestedStoreId == null) {
            lqw.in(YyScheduleRule::getStoreId, scopedStoreIds);
            return;
        }
        if (scopedStoreIds.contains(requestedStoreId)) {
            lqw.eq(YyScheduleRule::getStoreId, requestedStoreId);
            return;
        }
        lqw.apply("1 = 0");
    }

    private boolean canAccessStore(Long storeId) {
        StoreScope storeScope = resolveCurrentStoreScope();
        return !storeScope.applicable()
            || storeScope.globalScope()
            || (storeId != null && storeScope.storeIds().contains(storeId));
    }

    private StoreScope resolveCurrentStoreScope() {
        if (!LoginHelper.isLogin()) {
            return StoreScope.notApplicable();
        }
        if (LoginHelper.isSuperAdmin() || LoginHelper.isTenantAdmin()) {
            return StoreScope.global();
        }
        LoginUser loginUser = LoginHelper.getLoginUser();
        if (loginUser == null || loginUser.getUserId() == null) {
            return StoreScope.empty();
        }
        YyEmployee employee = employeeMapper.selectOne(Wrappers.lambdaQuery(YyEmployee.class)
            .eq(YyEmployee::getUserId, loginUser.getUserId())
            .eq(YyEmployee::getStatus, "0")
            .last("limit 1"));
        if (employee == null) {
            return StoreScope.empty();
        }
        LinkedHashSet<Long> storeIds = new LinkedHashSet<>();
        if (employee.getId() != null) {
            List<YyEmployeeStore> employeeStores = employeeStoreMapper.selectList(
                Wrappers.<YyEmployeeStore>lambdaQuery()
                    .eq(YyEmployeeStore::getEmployeeId, employee.getId())
                    .eq(YyEmployeeStore::getDelFlag, "0")
                    .orderByAsc(YyEmployeeStore::getSort)
                    .orderByAsc(YyEmployeeStore::getId));
            employeeStores.stream()
                .map(YyEmployeeStore::getStoreId)
                .filter(Objects::nonNull)
                .forEach(storeIds::add);
        }
        if (storeIds.isEmpty() && employee.getStoreId() != null) {
            storeIds.add(employee.getStoreId());
        }
        return StoreScope.limited(storeIds);
    }

    private record StoreScope(boolean applicable, boolean globalScope, Set<Long> storeIds) {
        private static StoreScope notApplicable() {
            return new StoreScope(false, false, Set.of());
        }

        private static StoreScope global() {
            return new StoreScope(true, true, Set.of());
        }

        private static StoreScope empty() {
            return new StoreScope(true, false, Set.of());
        }

        private static StoreScope limited(Collection<Long> storeIds) {
            return new StoreScope(true, false, Set.copyOf(storeIds));
        }
    }
}
