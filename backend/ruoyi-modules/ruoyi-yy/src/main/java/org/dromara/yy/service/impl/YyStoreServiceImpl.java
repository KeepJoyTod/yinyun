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
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.domain.bo.YyStoreBo;
import org.dromara.yy.domain.vo.YyStoreVo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.dromara.yy.service.IYyStoreService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * 影约云门店Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyStoreServiceImpl implements IYyStoreService {

    private final YyStoreMapper baseMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;

    @Override
    public YyStoreVo queryById(Long id) {
        YyStoreVo vo = baseMapper.selectVoById(id);
        if (vo != null && !canAccessStore(vo.getId())) {
            return null;
        }
        return vo;
    }

    @Override
    public TableDataInfo<YyStoreVo> queryPageList(YyStoreBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyStore> lqw = buildQueryWrapper(bo);
        Page<YyStoreVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyStoreVo> queryList(YyStoreBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    private LambdaQueryWrapper<YyStore> buildQueryWrapper(YyStoreBo bo) {
        LambdaQueryWrapper<YyStore> lqw = Wrappers.lambdaQuery();
        applyStoreScope(lqw);
        if (bo == null) {
            lqw.orderByAsc(YyStore::getSort);
            lqw.orderByAsc(YyStore::getId);
            return lqw;
        }
        lqw.eq(StringUtils.isNotBlank(bo.getStoreCode()), YyStore::getStoreCode, bo.getStoreCode());
        lqw.like(StringUtils.isNotBlank(bo.getStoreName()), YyStore::getStoreName, bo.getStoreName());
        lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyStore::getStatus, bo.getStatus());
        lqw.like(StringUtils.isNotBlank(bo.getAddress()), YyStore::getAddress, bo.getAddress());
        lqw.orderByAsc(YyStore::getSort);
        lqw.orderByAsc(YyStore::getId);
        return lqw;
    }

    @Override
    public Boolean insertByBo(YyStoreBo bo) {
        requireGlobalStoreManagement("无权新增门店");
        YyStore add = BeanUtil.toBean(bo, YyStore.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyStoreBo bo) {
        if (bo == null || bo.getId() == null) {
            throw new ServiceException("门店ID不能为空");
        }
        YyStore existing = baseMapper.selectById(bo.getId());
        if (existing == null) {
            throw new ServiceException("门店不存在");
        }
        requireStoreAccess(existing.getId(), "无权修改该门店");
        YyStore update = BeanUtil.toBean(bo, YyStore.class);
        validEntityBeforeSave(update);
        requireStoreAccess(update.getId(), "无权修改该门店");
        return baseMapper.updateById(update) > 0;
    }

    private void validEntityBeforeSave(YyStore entity) {
        // 预留唯一性、渠道授权、订单状态流转等业务校验。
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyStore> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size() || list.stream().anyMatch(store -> !canAccessStore(store.getId()))) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }

    private void applyStoreScope(LambdaQueryWrapper<YyStore> lqw) {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (!storeScope.applicable() || storeScope.globalScope()) {
            return;
        }

        Set<Long> scopedStoreIds = storeScope.storeIds();
        if (scopedStoreIds.isEmpty()) {
            lqw.apply("1 = 0");
            return;
        }
        lqw.in(YyStore::getId, scopedStoreIds);
    }

    private void requireStoreAccess(Long storeId, String message) {
        if (!canAccessStore(storeId)) {
            throw new ServiceException(message);
        }
    }

    private void requireGlobalStoreManagement(String message) {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (storeScope.applicable() && !storeScope.globalScope()) {
            throw new ServiceException(message);
        }
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
