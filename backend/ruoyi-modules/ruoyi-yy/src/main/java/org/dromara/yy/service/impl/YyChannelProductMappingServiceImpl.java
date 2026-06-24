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
import org.dromara.yy.domain.YyChannelProductMapping;
import org.dromara.yy.domain.bo.YyChannelProductMappingBo;
import org.dromara.yy.domain.vo.ClientDouyinLifeOrderEntryVo;
import org.dromara.yy.domain.vo.YyChannelProductMappingVo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyChannelProductMappingMapper;
import org.dromara.yy.service.IYyChannelProductMappingService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * 影约云渠道商品映射Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyChannelProductMappingServiceImpl implements IYyChannelProductMappingService {

    private final YyChannelProductMappingMapper baseMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;

    @Override
    public YyChannelProductMappingVo queryById(Long id) {
        YyChannelProductMappingVo vo = baseMapper.selectVoById(id);
        if (vo != null && !canAccessStore(vo.getStoreId())) {
            return null;
        }
        return vo;
    }

    @Override
    public TableDataInfo<YyChannelProductMappingVo> queryPageList(YyChannelProductMappingBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyChannelProductMapping> lqw = buildQueryWrapper(bo);
        Page<YyChannelProductMappingVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyChannelProductMappingVo> queryList(YyChannelProductMappingBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    @Override
    public List<ClientDouyinLifeOrderEntryVo> queryPublicDouyinLifeOrderEntries(Long storeId) {
        YyChannelProductMappingBo bo = new YyChannelProductMappingBo();
        bo.setChannelType("DOUYIN_LIFE");
        bo.setStoreId(storeId);
        return queryList(bo).stream()
            .filter(Objects::nonNull)
            .filter(this::hasPublicLanding)
            .filter(this::isPublicMappingStatus)
            .map(this::toPublicEntry)
            .toList();
    }

    private LambdaQueryWrapper<YyChannelProductMapping> buildQueryWrapper(YyChannelProductMappingBo bo) {
        LambdaQueryWrapper<YyChannelProductMapping> lqw = Wrappers.lambdaQuery();
        if (bo == null) {
            applyStoreScope(lqw, null);
            lqw.orderByDesc(YyChannelProductMapping::getId);
            return lqw;
        }
        applyStoreScope(lqw, bo.getStoreId());
        lqw.eq(bo.getProductId() != null, YyChannelProductMapping::getProductId, bo.getProductId());
        lqw.eq(StringUtils.isNotBlank(bo.getChannelType()), YyChannelProductMapping::getChannelType, bo.getChannelType());
        lqw.like(StringUtils.isNotBlank(bo.getExternalProductId()), YyChannelProductMapping::getExternalProductId, bo.getExternalProductId());
        lqw.like(StringUtils.isNotBlank(bo.getExternalSkuId()), YyChannelProductMapping::getExternalSkuId, bo.getExternalSkuId());
        lqw.like(StringUtils.isNotBlank(bo.getExternalPoiId()), YyChannelProductMapping::getExternalPoiId, bo.getExternalPoiId());
        lqw.like(StringUtils.isNotBlank(bo.getLandingUrl()), YyChannelProductMapping::getLandingUrl, bo.getLandingUrl());
        lqw.like(StringUtils.isNotBlank(bo.getLandingPath()), YyChannelProductMapping::getLandingPath, bo.getLandingPath());
        lqw.like(StringUtils.isNotBlank(bo.getExternalName()), YyChannelProductMapping::getExternalName, bo.getExternalName());
        lqw.eq(StringUtils.isNotBlank(bo.getMappingStatus()), YyChannelProductMapping::getMappingStatus, bo.getMappingStatus());
        lqw.orderByDesc(YyChannelProductMapping::getId);
        return lqw;
    }

    @Override
    public Boolean insertByBo(YyChannelProductMappingBo bo) {
        YyChannelProductMapping add = BeanUtil.toBean(bo, YyChannelProductMapping.class);
        validEntityBeforeSave(add);
        requireStoreAccess(add.getStoreId(), "无权新增该门店渠道商品映射");
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyChannelProductMappingBo bo) {
        if (bo == null || bo.getId() == null) {
            throw new ServiceException("渠道商品映射ID不能为空");
        }
        YyChannelProductMapping existing = baseMapper.selectById(bo.getId());
        if (existing == null) {
            throw new ServiceException("渠道商品映射不存在");
        }
        requireStoreAccess(existing.getStoreId(), "无权修改该门店渠道商品映射");
        YyChannelProductMapping update = BeanUtil.toBean(bo, YyChannelProductMapping.class);
        if (update.getStoreId() == null) {
            update.setStoreId(existing.getStoreId());
        }
        validEntityBeforeSave(update);
        requireStoreAccess(update.getStoreId(), "无权修改该门店渠道商品映射");
        return baseMapper.updateById(update) > 0;
    }

    private void validEntityBeforeSave(YyChannelProductMapping entity) {
        // 预留唯一性、渠道授权、订单状态流转等业务校验。
    }

    private boolean hasPublicLanding(YyChannelProductMappingVo vo) {
        return StringUtils.isNotBlank(vo.getLandingUrl()) || StringUtils.isNotBlank(vo.getLandingPath());
    }

    private boolean isPublicMappingStatus(YyChannelProductMappingVo vo) {
        String status = vo.getMappingStatus();
        if (StringUtils.isBlank(status)) {
            return true;
        }
        return StringUtils.equalsAnyIgnoreCase(status, "ACTIVE", "MAPPED", "ENABLED");
    }

    private ClientDouyinLifeOrderEntryVo toPublicEntry(YyChannelProductMappingVo vo) {
        ClientDouyinLifeOrderEntryVo entry = new ClientDouyinLifeOrderEntryVo();
        entry.setEntryId(stringId(vo.getId()));
        entry.setStoreId(stringId(vo.getStoreId()));
        entry.setProductId(stringId(vo.getProductId()));
        entry.setChannelType("DOUYIN_LIFE");
        entry.setTitle(StringUtils.firstNonBlank(vo.getExternalName(), vo.getExternalProductId(), "抖音来客套餐"));
        entry.setExternalProductId(vo.getExternalProductId());
        entry.setExternalSkuId(vo.getExternalSkuId());
        entry.setExternalPoiId(vo.getExternalPoiId());
        entry.setLandingUrl(vo.getLandingUrl());
        entry.setLandingPath(vo.getLandingPath());
        return entry;
    }

    private String stringId(Long id) {
        return id == null ? null : String.valueOf(id);
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyChannelProductMapping> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size() || list.stream().anyMatch(mapping -> !canAccessStore(mapping.getStoreId()))) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }

    private void applyStoreScope(LambdaQueryWrapper<YyChannelProductMapping> lqw, Long requestedStoreId) {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (!storeScope.applicable() || storeScope.globalScope()) {
            lqw.eq(requestedStoreId != null, YyChannelProductMapping::getStoreId, requestedStoreId);
            return;
        }

        Set<Long> scopedStoreIds = storeScope.storeIds();
        if (scopedStoreIds.isEmpty()) {
            lqw.apply("1 = 0");
            return;
        }
        if (requestedStoreId == null) {
            lqw.in(YyChannelProductMapping::getStoreId, scopedStoreIds);
            return;
        }
        if (scopedStoreIds.contains(requestedStoreId)) {
            lqw.eq(YyChannelProductMapping::getStoreId, requestedStoreId);
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
