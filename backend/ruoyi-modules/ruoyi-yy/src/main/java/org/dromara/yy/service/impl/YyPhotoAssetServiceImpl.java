package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyPhotoAsset;
import org.dromara.yy.domain.bo.YyPhotoAssetBo;
import org.dromara.yy.domain.vo.YyPhotoAssetVo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyPhotoAssetMapper;
import org.dromara.yy.service.IYyPhotoAssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * 影约云底片Service业务层处理
 */
@Service
public class YyPhotoAssetServiceImpl implements IYyPhotoAssetService {

    private final YyPhotoAssetMapper baseMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;

    @Autowired
    public YyPhotoAssetServiceImpl(
        YyPhotoAssetMapper baseMapper,
        YyEmployeeMapper employeeMapper,
        YyEmployeeStoreMapper employeeStoreMapper
    ) {
        this.baseMapper = baseMapper;
        this.employeeMapper = employeeMapper;
        this.employeeStoreMapper = employeeStoreMapper;
    }

    YyPhotoAssetServiceImpl(YyPhotoAssetMapper baseMapper) {
        this(baseMapper, null, null);
    }

    @Override
    public YyPhotoAssetVo queryById(Long id) {
        YyPhotoAssetVo vo = baseMapper.selectVoById(id);
        if (vo != null && !canAccessStore(vo.getStoreId())) {
            return null;
        }
        return vo;
    }

    @Override
    public TableDataInfo<YyPhotoAssetVo> queryPageList(YyPhotoAssetBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyPhotoAsset> lqw = buildQueryWrapper(bo);
        Page<YyPhotoAssetVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyPhotoAssetVo> queryList(YyPhotoAssetBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    private LambdaQueryWrapper<YyPhotoAsset> buildQueryWrapper(YyPhotoAssetBo bo) {
        LambdaQueryWrapper<YyPhotoAsset> lqw = Wrappers.lambdaQuery();
        if (bo == null) {
            applyStoreScope(lqw, null);
            lqw.orderByAsc(YyPhotoAsset::getSort);
            lqw.orderByAsc(YyPhotoAsset::getId);
            return lqw;
        }
        lqw.eq(bo.getStoreId() != null, YyPhotoAsset::getStoreId, bo.getStoreId());
        lqw.eq(bo.getAlbumId() != null, YyPhotoAsset::getAlbumId, bo.getAlbumId());
        lqw.like(StringUtils.isNotBlank(bo.getFileName()), YyPhotoAsset::getFileName, bo.getFileName());
        lqw.eq(StringUtils.isNotBlank(bo.getIsSelected()), YyPhotoAsset::getIsSelected, bo.getIsSelected());
        lqw.eq(StringUtils.isNotBlank(bo.getVisible()), YyPhotoAsset::getVisible, bo.getVisible());
        applyStoreScope(lqw, bo.getStoreId());
        lqw.orderByAsc(YyPhotoAsset::getSort);
        lqw.orderByAsc(YyPhotoAsset::getId);
        return lqw;
    }

    @Override
    public Boolean insertByBo(YyPhotoAssetBo bo) {
        YyPhotoAsset add = BeanUtil.toBean(bo, YyPhotoAsset.class);
        if (!canAccessStore(add.getStoreId())) {
            throw new ServiceException("无权操作该门店底片");
        }
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyPhotoAssetBo bo) {
        if (bo == null || bo.getId() == null) {
            throw new ServiceException("底片ID不能为空");
        }
        YyPhotoAsset existing = baseMapper.selectById(bo.getId());
        if (existing == null || "1".equals(existing.getDelFlag())) {
            throw new ServiceException("底片不存在");
        }
        if (!canAccessStore(existing.getStoreId()) || !canAccessStore(bo.getStoreId())) {
            throw new ServiceException("无权操作该门店底片");
        }
        YyPhotoAsset update = BeanUtil.toBean(bo, YyPhotoAsset.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    private void validEntityBeforeSave(YyPhotoAsset entity) {
        if (StringUtils.isBlank(entity.getObjectKey())) {
            throw new ServiceException("OSS对象Key不能为空");
        }
        LambdaQueryWrapper<YyPhotoAsset> lqw = Wrappers.lambdaQuery();
        lqw.eq(YyPhotoAsset::getAlbumId, entity.getAlbumId());
        lqw.eq(YyPhotoAsset::getObjectKey, entity.getObjectKey());
        lqw.ne(entity.getId() != null, YyPhotoAsset::getId, entity.getId());
        if (baseMapper.selectCount(lqw) > 0) {
            throw new ServiceException("该相册已存在相同OSS对象Key的底片");
        }
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyPhotoAsset> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size() || list.stream().anyMatch(asset -> !canAccessStore(asset.getStoreId()))) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }

    private void applyStoreScope(LambdaQueryWrapper<YyPhotoAsset> lqw, Long requestedStoreId) {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (!storeScope.applicable() || storeScope.globalScope()) {
            lqw.eq(requestedStoreId != null, YyPhotoAsset::getStoreId, requestedStoreId);
            return;
        }

        Set<Long> scopedStoreIds = storeScope.storeIds();
        if (scopedStoreIds.isEmpty()) {
            lqw.apply("1 = 0");
            return;
        }
        if (requestedStoreId == null) {
            lqw.in(YyPhotoAsset::getStoreId, scopedStoreIds);
            return;
        }
        if (scopedStoreIds.contains(requestedStoreId)) {
            lqw.eq(YyPhotoAsset::getStoreId, requestedStoreId);
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
        if (employeeMapper == null) {
            return StoreScope.empty();
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
        if (employeeStoreMapper != null && employee.getId() != null) {
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
