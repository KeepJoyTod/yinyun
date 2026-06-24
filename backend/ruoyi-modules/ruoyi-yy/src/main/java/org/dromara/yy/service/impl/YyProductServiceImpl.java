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
import org.dromara.yy.domain.YyProduct;
import org.dromara.yy.domain.bo.YyProductBo;
import org.dromara.yy.domain.vo.YyProductVo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyProductMapper;
import org.dromara.yy.service.IYyProductService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * 影约云产品Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyProductServiceImpl implements IYyProductService {

    private final YyProductMapper baseMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;

    @Override
    public YyProductVo queryById(Long id) {
        YyProductVo vo = baseMapper.selectVoById(id);
        if (vo != null && !canAccessStore(vo.getStoreId())) {
            return null;
        }
        return vo;
    }

    @Override
    public TableDataInfo<YyProductVo> queryPageList(YyProductBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyProduct> lqw = buildQueryWrapper(bo);
        Page<YyProductVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyProductVo> queryList(YyProductBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    private LambdaQueryWrapper<YyProduct> buildQueryWrapper(YyProductBo bo) {
        LambdaQueryWrapper<YyProduct> lqw = Wrappers.lambdaQuery();
        if (bo == null) {
            applyStoreScope(lqw, null);
            lqw.orderByAsc(YyProduct::getSort);
            lqw.orderByAsc(YyProduct::getId);
            return lqw;
        }
        applyStoreScope(lqw, bo.getStoreId());
        lqw.eq(StringUtils.isNotBlank(bo.getProductType()), YyProduct::getProductType, bo.getProductType());
        lqw.like(StringUtils.isNotBlank(bo.getProductName()), YyProduct::getProductName, bo.getProductName());
        lqw.like(StringUtils.isNotBlank(bo.getAlbumProductName()), YyProduct::getAlbumProductName, bo.getAlbumProductName());
        lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyProduct::getStatus, bo.getStatus());
        lqw.orderByAsc(YyProduct::getSort);
        lqw.orderByAsc(YyProduct::getId);
        return lqw;
    }

    @Override
    public Boolean insertByBo(YyProductBo bo) {
        YyProduct add = BeanUtil.toBean(bo, YyProduct.class);
        validEntityBeforeSave(add);
        requireStoreAccess(add.getStoreId(), "无权新增该门店产品");
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyProductBo bo) {
        if (bo == null || bo.getId() == null) {
            throw new ServiceException("产品ID不能为空");
        }
        YyProduct existing = baseMapper.selectById(bo.getId());
        if (existing == null) {
            throw new ServiceException("产品不存在");
        }
        requireStoreAccess(existing.getStoreId(), "无权修改该门店产品");
        YyProduct update = BeanUtil.toBean(bo, YyProduct.class);
        if (update.getStoreId() == null) {
            update.setStoreId(existing.getStoreId());
        }
        validEntityBeforeSave(update);
        requireStoreAccess(update.getStoreId(), "无权修改该门店产品");
        return baseMapper.updateById(update) > 0;
    }

    private void validEntityBeforeSave(YyProduct entity) {
        // 预留唯一性、渠道授权、订单状态流转等业务校验。
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyProduct> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size() || list.stream().anyMatch(product -> !canAccessStore(product.getStoreId()))) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }

    private void applyStoreScope(LambdaQueryWrapper<YyProduct> lqw, Long requestedStoreId) {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (!storeScope.applicable() || storeScope.globalScope()) {
            lqw.eq(requestedStoreId != null, YyProduct::getStoreId, requestedStoreId);
            return;
        }

        Set<Long> scopedStoreIds = storeScope.storeIds();
        if (scopedStoreIds.isEmpty()) {
            lqw.apply("1 = 0");
            return;
        }
        if (requestedStoreId == null) {
            lqw.in(YyProduct::getStoreId, scopedStoreIds);
            return;
        }
        if (scopedStoreIds.contains(requestedStoreId)) {
            lqw.eq(YyProduct::getStoreId, requestedStoreId);
            return;
        }
        lqw.apply("1 = 0");
    }

    private void requireStoreAccess(Long storeId, String message) {
        if (!canAccessStore(storeId)) {
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
