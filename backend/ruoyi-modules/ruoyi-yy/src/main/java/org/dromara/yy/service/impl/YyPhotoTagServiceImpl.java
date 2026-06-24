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
import org.dromara.yy.domain.YyPhotoAssetTag;
import org.dromara.yy.domain.YyPhotoTag;
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.domain.bo.YyPhotoTagBo;
import org.dromara.yy.domain.vo.YyPhotoTagVo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyPhotoAssetTagMapper;
import org.dromara.yy.mapper.YyPhotoTagMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.dromara.yy.service.IYyPhotoTagService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Resource tag service implementation.
 */
@RequiredArgsConstructor
@Service
public class YyPhotoTagServiceImpl implements IYyPhotoTagService {

    private final YyPhotoTagMapper baseMapper;
    private final YyPhotoAssetTagMapper assetTagMapper;
    private final YyStoreMapper storeMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;

    @Override
    public TableDataInfo<YyPhotoTagVo> queryPageList(YyPhotoTagBo bo, PageQuery pageQuery) {
        Page<YyPhotoTagVo> result = baseMapper.selectVoPage(pageQuery.build(), buildQueryWrapper(bo));
        enrichTagRows(result.getRecords());
        return TableDataInfo.build(result);
    }

    @Override
    public Boolean insertByBo(YyPhotoTagBo bo) {
        if (bo == null || bo.getStoreId() == null) {
            throw new ServiceException("Store id cannot be empty");
        }
        requireStoreAccess(bo.getStoreId(), "No permission to create resource tag in this store");
        validTagName(bo.getStoreId(), bo.getTagName(), null);
        YyPhotoTag add = BeanUtil.toBean(bo, YyPhotoTag.class);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyPhotoTagBo bo) {
        if (bo == null || bo.getId() == null) {
            throw new ServiceException("Tag id cannot be empty");
        }
        YyPhotoTag existing = baseMapper.selectById(bo.getId());
        if (existing == null || "1".equals(existing.getDelFlag())) {
            throw new ServiceException("Resource tag does not exist");
        }
        if (bo.getStoreId() == null) {
            throw new ServiceException("Store id cannot be empty");
        }
        requireStoreAccess(existing.getStoreId(), "No permission to update this resource tag");
        Long storeId = bo.getStoreId();
        requireStoreAccess(storeId, "No permission to update this resource tag");
        validTagName(storeId, bo.getTagName(), bo.getId());
        YyPhotoTag update = BeanUtil.toBean(bo, YyPhotoTag.class);
        update.setStoreId(storeId);
        return baseMapper.updateById(update) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyPhotoTag> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size() || list.stream().anyMatch(tag -> !canAccessStore(tag.getStoreId()))) {
                throw new ServiceException("No permission to delete selected resource tags");
            }
        }
        assetTagMapper.delete(Wrappers.<YyPhotoAssetTag>lambdaQuery().in(YyPhotoAssetTag::getTagId, ids));
        return baseMapper.deleteByIds(ids) > 0;
    }

    private LambdaQueryWrapper<YyPhotoTag> buildQueryWrapper(YyPhotoTagBo bo) {
        LambdaQueryWrapper<YyPhotoTag> lqw = Wrappers.lambdaQuery();
        if (bo != null) {
            lqw.eq(bo.getStoreId() != null, YyPhotoTag::getStoreId, bo.getStoreId());
            lqw.like(StringUtils.isNotBlank(bo.getKeyword()), YyPhotoTag::getTagName, bo.getKeyword());
            lqw.like(StringUtils.isNotBlank(bo.getTagName()), YyPhotoTag::getTagName, bo.getTagName());
        }
        applyStoreScope(lqw);
        lqw.orderByDesc(YyPhotoTag::getCreateTime);
        lqw.orderByAsc(YyPhotoTag::getId);
        return lqw;
    }

    private void enrichTagRows(List<YyPhotoTagVo> rows) {
        if (rows.isEmpty()) {
            return;
        }
        Set<Long> tagIds = rows.stream().map(YyPhotoTagVo::getId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> storeIds = rows.stream().map(YyPhotoTagVo::getStoreId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<Long, Long> counts = assetTagMapper.selectList(Wrappers.<YyPhotoAssetTag>lambdaQuery().in(YyPhotoAssetTag::getTagId, tagIds)).stream()
            .collect(Collectors.groupingBy(YyPhotoAssetTag::getTagId, LinkedHashMap::new, Collectors.counting()));
        Map<Long, String> storeNameMap = storeIds.isEmpty() ? Map.of() : storeMapper.selectByIds(storeIds).stream()
            .collect(Collectors.toMap(YyStore::getId, YyStore::getStoreName, (left, right) -> left));
        for (YyPhotoTagVo row : rows) {
            row.setResourceCount(counts.getOrDefault(row.getId(), 0L));
            row.setStoreName(storeNameMap.getOrDefault(row.getStoreId(), ""));
        }
    }

    private void validTagName(Long storeId, String tagName, Long currentId) {
        if (StringUtils.isBlank(tagName)) {
            throw new ServiceException("Tag name cannot be empty");
        }
        LambdaQueryWrapper<YyPhotoTag> lqw = Wrappers.lambdaQuery();
        lqw.eq(YyPhotoTag::getStoreId, storeId);
        lqw.eq(YyPhotoTag::getTagName, tagName.trim());
        lqw.ne(currentId != null, YyPhotoTag::getId, currentId);
        if (baseMapper.selectCount(lqw) > 0) {
            throw new ServiceException("Duplicate tag name under the same store");
        }
    }

    private void applyStoreScope(LambdaQueryWrapper<YyPhotoTag> lqw) {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (!storeScope.applicable() || storeScope.globalScope()) {
            return;
        }
        if (storeScope.storeIds().isEmpty()) {
            lqw.apply("1 = 0");
            return;
        }
        lqw.in(YyPhotoTag::getStoreId, storeScope.storeIds());
    }

    private void requireStoreAccess(Long storeId, String message) {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (!storeScope.applicable() || storeScope.globalScope()) {
            return;
        }
        if (storeId == null || !storeScope.storeIds().contains(storeId)) {
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
