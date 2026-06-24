package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.date.DateUtil;
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
import org.dromara.yy.domain.*;
import org.dromara.yy.domain.bo.YyPhotoAssetBatchUpdateBo;
import org.dromara.yy.domain.bo.YyPhotoAssetBo;
import org.dromara.yy.domain.vo.YyPhotoAssetVo;
import org.dromara.yy.domain.vo.YyPhotoResourceRowVo;
import org.dromara.yy.domain.vo.YyPhotoTagVo;
import org.dromara.yy.mapper.*;
import org.dromara.yy.service.IYyPhotoAssetService;
import org.dromara.yy.service.YyPhotoAssetUrlSigner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 褰辩害浜戝簳鐗嘢ervice涓氬姟灞傚鐞?
 */
@RequiredArgsConstructor
@Service
public class YyPhotoAssetServiceImpl implements IYyPhotoAssetService {

    private static final long RESOURCE_SIGN_TTL_SECONDS = 600L;

    private final YyPhotoAssetMapper baseMapper;
    private final YyPhotoAlbumMapper albumMapper;
    private final YyOrderMapper orderMapper;
    private final YyProductMapper productMapper;
    private final YyPhotoTagMapper tagMapper;
    private final YyPhotoAssetTagMapper assetTagMapper;
    private final YyStoreMapper storeMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;
    private final YyPhotoAssetUrlSigner photoAssetUrlSigner;

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

    @Override
    public TableDataInfo<YyPhotoResourceRowVo> queryResourcePageList(YyPhotoAssetBo bo, PageQuery pageQuery) {
        Page<YyPhotoAsset> result = baseMapper.selectPage(pageQuery.build(), buildQueryWrapper(bo));
        List<YyPhotoResourceRowVo> rows = buildResourceRows(result.getRecords());
        Page<YyPhotoResourceRowVo> page = new Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        page.setRecords(rows);
        return TableDataInfo.build(page);
    }

    @Override
    public Boolean insertByBo(YyPhotoAssetBo bo) {
        YyPhotoAsset add = BeanUtil.toBean(bo, YyPhotoAsset.class);
        if (!canAccessStore(add.getStoreId())) {
            throw new ServiceException("鏃犳潈鎿嶄綔璇ラ棬搴楀簳鐗?");
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
            throw new ServiceException("搴曠墖ID涓嶈兘涓虹┖");
        }
        YyPhotoAsset existing = baseMapper.selectById(bo.getId());
        if (existing == null || "1".equals(existing.getDelFlag())) {
            throw new ServiceException("搴曠墖涓嶅瓨鍦?");
        }
        if (!canAccessStore(existing.getStoreId())) {
            throw new ServiceException("鏃犳潈鎿嶄綔璇ラ棬搴楀簳鐗?");
        }
        YyPhotoAsset update = BeanUtil.toBean(bo, YyPhotoAsset.class);
        if (update.getStoreId() == null) update.setStoreId(existing.getStoreId());
        if (!canAccessStore(update.getStoreId())) {
            throw new ServiceException("鏃犳潈鎿嶄綔璇ラ棬搴楀簳鐗?");
        }
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean batchUpdateResources(YyPhotoAssetBatchUpdateBo bo) {
        List<YyPhotoAsset> assets = baseMapper.selectByIds(bo.getAssetIds());
        if (assets.size() != bo.getAssetIds().size()) {
            throw new ServiceException("閮ㄥ垎璧勬簮涓嶅瓨鍦?");
        }
        if (assets.stream().anyMatch(asset -> !canAccessStore(asset.getStoreId()))) {
            throw new ServiceException("鎮ㄦ病鏈夋搷浣滆繖浜涜祫婧愮殑鏉冮檺");
        }

        List<YyPhotoAsset> updates = new ArrayList<>();
        for (YyPhotoAsset asset : assets) {
            YyPhotoAsset update = new YyPhotoAsset();
            update.setId(asset.getId());
            boolean changed = false;
            if (StringUtils.isNotBlank(bo.getAssetType())) {
                update.setAssetType(bo.getAssetType());
                changed = true;
            }
            if (bo.getRating() != null) {
                update.setRating(bo.getRating());
                changed = true;
            }
            if (bo.getVisible() != null) {
                update.setVisible(Boolean.TRUE.equals(bo.getVisible()) ? "1" : "0");
                changed = true;
            }
            if (changed) {
                updates.add(update);
            }
        }
        if (!updates.isEmpty()) {
            baseMapper.updateBatchById(updates);
        }

        applyTagUpdates(bo, assets);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyPhotoAsset> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size() || list.stream().anyMatch(asset -> !canAccessStore(asset.getStoreId()))) {
                throw new ServiceException("鎮ㄦ病鏈夊垹闄ゆ潈闄?");
            }
        }
        assetTagMapper.delete(Wrappers.<YyPhotoAssetTag>lambdaQuery().in(YyPhotoAssetTag::getAssetId, ids));
        return baseMapper.deleteByIds(ids) > 0;
    }

    private LambdaQueryWrapper<YyPhotoAsset> buildQueryWrapper(YyPhotoAssetBo bo) {
        LambdaQueryWrapper<YyPhotoAsset> lqw = Wrappers.lambdaQuery();
        if (bo == null) {
            applyStoreScope(lqw, null);
            applyOrder(lqw);
            return lqw;
        }
        lqw.eq(bo.getStoreId() != null, YyPhotoAsset::getStoreId, bo.getStoreId());
        lqw.eq(bo.getAlbumId() != null, YyPhotoAsset::getAlbumId, bo.getAlbumId());
        if (bo.getOrderId() != null) {
            applyAlbumIdFilter(lqw, resolveAlbumIdsByOrderId(bo.getOrderId(), bo.getStoreId()));
        }
        if (bo.getProductId() != null) {
            applyAlbumIdFilter(lqw, resolveAlbumIdsByProductId(bo.getProductId(), bo.getStoreId()));
        }
        lqw.like(StringUtils.isNotBlank(bo.getFileName()), YyPhotoAsset::getFileName, bo.getFileName());
        lqw.eq(StringUtils.isNotBlank(bo.getIsSelected()), YyPhotoAsset::getIsSelected, bo.getIsSelected());
        lqw.eq(StringUtils.isNotBlank(bo.getVisible()), YyPhotoAsset::getVisible, bo.getVisible());
        lqw.eq(StringUtils.isNotBlank(bo.getAssetType()), YyPhotoAsset::getAssetType, bo.getAssetType());
        lqw.eq(bo.getRating() != null, YyPhotoAsset::getRating, bo.getRating());
        lqw.eq(bo.getUploaderId() != null, YyPhotoAsset::getCreateBy, bo.getUploaderId());
        if (StringUtils.isNotBlank(bo.getUploaderKeyword())) {
            applyUploaderFilter(lqw, resolveUploaderUserIds(bo.getUploaderKeyword(), bo.getStoreId()));
        }
        lqw.ge(bo.getBeginUploadTime() != null, YyPhotoAsset::getCreateTime, bo.getBeginUploadTime());
        lqw.lt(bo.getEndUploadTime() != null, YyPhotoAsset::getCreateTime, DateUtil.offsetDay(bo.getEndUploadTime(), 1));

        if (StringUtils.isNotBlank(bo.getKeyword())) {
            String keyword = bo.getKeyword().trim();
            Set<Long> matchedAlbumIds = resolveMatchedAlbumIds(keyword, bo.getStoreId());
            lqw.and(wrapper -> {
                wrapper.like(YyPhotoAsset::getFileName, keyword);
                if (!matchedAlbumIds.isEmpty()) {
                    wrapper.or().in(YyPhotoAsset::getAlbumId, matchedAlbumIds);
                }
            });
        }

        Set<Long> assetIdsByTags = resolveAssetIdsByTags(bo.getTagIds());
        if (StringUtils.isNotBlank(bo.getTagIds())) {
            if (assetIdsByTags.isEmpty()) {
                lqw.apply("1 = 0");
            } else {
                lqw.in(YyPhotoAsset::getId, assetIdsByTags);
            }
        }

        applyStoreScope(lqw, bo.getStoreId());
        applyOrder(lqw);
        return lqw;
    }

    private void applyOrder(LambdaQueryWrapper<YyPhotoAsset> lqw) {
        lqw.orderByDesc(YyPhotoAsset::getCreateTime);
        lqw.orderByAsc(YyPhotoAsset::getSort);
        lqw.orderByAsc(YyPhotoAsset::getId);
    }

    private Set<Long> resolveMatchedAlbumIds(String keyword, Long requestedStoreId) {
        if (StringUtils.isBlank(keyword)) {
            return Set.of();
        }
        LambdaQueryWrapper<YyPhotoAlbum> wrapper = Wrappers.lambdaQuery();
        wrapper.and(item -> item
            .like(YyPhotoAlbum::getAlbumName, keyword)
            .or().like(YyPhotoAlbum::getCustomerName, keyword)
            .or().like(YyPhotoAlbum::getCustomerPhone, keyword));
        Long keywordId = parseLongOrNull(keyword);
        if (keywordId != null) {
            wrapper.or(item -> item.eq(YyPhotoAlbum::getOrderId, keywordId).or().eq(YyPhotoAlbum::getId, keywordId));
        }
        applyAlbumStoreScope(wrapper, requestedStoreId);
        return albumMapper.selectList(wrapper).stream()
            .map(YyPhotoAlbum::getId)
            .filter(Objects::nonNull)
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<Long> resolveAlbumIdsByOrderId(Long orderId, Long requestedStoreId) {
        if (orderId == null) {
            return Set.of();
        }
        LambdaQueryWrapper<YyPhotoAlbum> wrapper = Wrappers.lambdaQuery();
        wrapper.eq(YyPhotoAlbum::getOrderId, orderId);
        applyAlbumStoreScope(wrapper, requestedStoreId);
        return albumMapper.selectList(wrapper).stream()
            .map(YyPhotoAlbum::getId)
            .filter(Objects::nonNull)
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<Long> resolveAlbumIdsByProductId(Long productId, Long requestedStoreId) {
        if (productId == null) {
            return Set.of();
        }
        String productKey = String.valueOf(productId);
        LambdaQueryWrapper<YyOrder> orderWrapper = Wrappers.lambdaQuery();
        orderWrapper.and(item -> item
            .eq(YyOrder::getExternalSkuId, productKey)
            .or()
            .eq(YyOrder::getExternalProductId, productKey));
        applyOrderStoreScope(orderWrapper, requestedStoreId);
        Set<Long> orderIds = orderMapper.selectList(orderWrapper).stream()
            .map(YyOrder::getId)
            .filter(Objects::nonNull)
            .collect(Collectors.toCollection(LinkedHashSet::new));
        if (orderIds.isEmpty()) {
            return Set.of();
        }
        LambdaQueryWrapper<YyPhotoAlbum> albumWrapper = Wrappers.lambdaQuery();
        albumWrapper.in(YyPhotoAlbum::getOrderId, orderIds);
        applyAlbumStoreScope(albumWrapper, requestedStoreId);
        return albumMapper.selectList(albumWrapper).stream()
            .map(YyPhotoAlbum::getId)
            .filter(Objects::nonNull)
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<Long> resolveUploaderUserIds(String uploaderKeyword, Long requestedStoreId) {
        if (StringUtils.isBlank(uploaderKeyword)) {
            return Set.of();
        }
        String keyword = uploaderKeyword.trim();
        Long uploaderUserId = parseLongOrNull(keyword);
        LambdaQueryWrapper<YyEmployee> wrapper = Wrappers.lambdaQuery();
        wrapper.eq(YyEmployee::getStatus, "0");
        wrapper.and(item -> {
            item.like(YyEmployee::getEmployeeName, keyword)
                .or().like(YyEmployee::getMobile, keyword)
                .or().like(YyEmployee::getEmployeeNo, keyword);
            if (uploaderUserId != null) {
                item.or().eq(YyEmployee::getUserId, uploaderUserId);
            }
        });
        applyEmployeeStoreScope(wrapper, requestedStoreId);
        return employeeMapper.selectList(wrapper).stream()
            .map(YyEmployee::getUserId)
            .filter(Objects::nonNull)
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private void applyAlbumIdFilter(LambdaQueryWrapper<YyPhotoAsset> lqw, Set<Long> albumIds) {
        if (albumIds.isEmpty()) {
            lqw.apply("1 = 0");
            return;
        }
        lqw.in(YyPhotoAsset::getAlbumId, albumIds);
    }

    private void applyUploaderFilter(LambdaQueryWrapper<YyPhotoAsset> lqw, Set<Long> uploaderUserIds) {
        if (uploaderUserIds.isEmpty()) {
            lqw.apply("1 = 0");
            return;
        }
        lqw.in(YyPhotoAsset::getCreateBy, uploaderUserIds);
    }

    private Set<Long> resolveAssetIdsByTags(String tagIdsText) {
        List<Long> requestedTagIds = parseLongList(tagIdsText);
        if (requestedTagIds.isEmpty()) {
            return Set.of();
        }
        List<YyPhotoAssetTag> relations = assetTagMapper.selectList(
            Wrappers.<YyPhotoAssetTag>lambdaQuery().in(YyPhotoAssetTag::getTagId, requestedTagIds));
        Map<Long, Set<Long>> assetTagMap = new LinkedHashMap<>();
        for (YyPhotoAssetTag relation : relations) {
            if (relation.getAssetId() == null || relation.getTagId() == null) continue;
            assetTagMap.computeIfAbsent(relation.getAssetId(), key -> new LinkedHashSet<>()).add(relation.getTagId());
        }
        return assetTagMap.entrySet().stream()
            .filter(entry -> entry.getValue().containsAll(requestedTagIds))
            .map(Map.Entry::getKey)
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private List<YyPhotoResourceRowVo> buildResourceRows(List<YyPhotoAsset> assets) {
        if (assets.isEmpty()) {
            return List.of();
        }
        Set<Long> albumIds = assets.stream().map(YyPhotoAsset::getAlbumId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> storeIds = assets.stream().map(YyPhotoAsset::getStoreId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> assetIds = assets.stream().map(YyPhotoAsset::getId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> uploaderIds = assets.stream().map(YyPhotoAsset::getCreateBy).filter(Objects::nonNull).collect(Collectors.toSet());

        Map<Long, YyPhotoAlbum> albumMap = albumIds.isEmpty() ? Map.of() : albumMapper.selectByIds(albumIds).stream()
            .collect(Collectors.toMap(YyPhotoAlbum::getId, item -> item, (left, right) -> left));
        Map<Long, YyStore> storeMap = storeIds.isEmpty() ? Map.of() : storeMapper.selectByIds(storeIds).stream()
            .collect(Collectors.toMap(YyStore::getId, item -> item, (left, right) -> left));
        Set<Long> orderIds = albumMap.values().stream().map(YyPhotoAlbum::getOrderId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<Long, YyOrder> orderMap = orderIds.isEmpty() ? Map.of() : orderMapper.selectByIds(orderIds).stream()
            .collect(Collectors.toMap(YyOrder::getId, item -> item, (left, right) -> left));
        Set<Long> productIds = orderMap.values().stream()
            .map(this::resolveProductIdFromOrder)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
        Map<Long, YyProduct> productMap = productIds.isEmpty() ? Map.of() : productMapper.selectByIds(productIds).stream()
            .collect(Collectors.toMap(YyProduct::getId, item -> item, (left, right) -> left));
        Map<Long, YyEmployee> employeeByUserId = uploaderIds.isEmpty() ? Map.of() : employeeMapper.selectList(
            Wrappers.<YyEmployee>lambdaQuery()
                .in(YyEmployee::getUserId, uploaderIds)
                .eq(YyEmployee::getStatus, "0"))
            .stream()
            .filter(item -> item.getUserId() != null)
            .collect(Collectors.toMap(YyEmployee::getUserId, item -> item, (left, right) -> left));
        List<YyPhotoAssetTag> relations = assetIds.isEmpty() ? List.of() : assetTagMapper.selectList(
            Wrappers.<YyPhotoAssetTag>lambdaQuery().in(YyPhotoAssetTag::getAssetId, assetIds));
        Set<Long> tagIds = relations.stream().map(YyPhotoAssetTag::getTagId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<Long, YyPhotoTag> tagMap = tagIds.isEmpty() ? Map.of() : tagMapper.selectByIds(tagIds).stream()
            .collect(Collectors.toMap(YyPhotoTag::getId, item -> item, (left, right) -> left));

        Map<Long, List<YyPhotoTagVo>> tagRowsByAssetId = new LinkedHashMap<>();
        for (YyPhotoAssetTag relation : relations) {
            if (relation.getAssetId() == null || relation.getTagId() == null) continue;
            YyPhotoTag tag = tagMap.get(relation.getTagId());
            if (tag == null) continue;
            YyPhotoTagVo tagVo = new YyPhotoTagVo();
            tagVo.setId(tag.getId());
            tagVo.setStoreId(tag.getStoreId());
            tagVo.setStoreName(resolveStoreName(storeMap.get(tag.getStoreId())));
            tagVo.setTagName(tag.getTagName());
            tagRowsByAssetId.computeIfAbsent(relation.getAssetId(), key -> new ArrayList<>()).add(tagVo);
        }

        List<YyPhotoResourceRowVo> rows = new ArrayList<>(assets.size());
        for (YyPhotoAsset asset : assets) {
            YyPhotoAlbum album = albumMap.get(asset.getAlbumId());
            YyOrder order = album == null ? null : orderMap.get(album.getOrderId());
            Long productId = resolveProductIdFromOrder(order);
            YyProduct product = productId == null ? null : productMap.get(productId);
            YyEmployee uploader = employeeByUserId.get(asset.getCreateBy());
            YyPhotoResourceRowVo row = new YyPhotoResourceRowVo();
            row.setAssetId(asset.getId());
            row.setAlbumId(asset.getAlbumId());
            row.setStoreId(asset.getStoreId());
            row.setStoreName(resolveStoreName(storeMap.get(asset.getStoreId())));
            row.setOrderId(album == null ? null : album.getOrderId());
            row.setProductId(productId);
            row.setProductName(product == null ? "" : StringUtils.defaultString(product.getProductName()));
            row.setFileName(asset.getFileName());
            String previewUrl = resolveSignedAssetUrl(resolveObjectKey(asset), "resource-preview", asset.getFileUrl());
            row.setFileUrl(previewUrl);
            row.setThumbnailUrl(resolveSignedAssetUrl(resolveThumbnailObjectKey(asset), "resource-thumbnail", previewUrl));
            row.setAssetType(asset.getAssetType());
            row.setRating(asset.getRating() == null ? 0 : asset.getRating());
            row.setVisible(asset.getVisible());
            row.setFileSizeBytes(asset.getFileSizeBytes() == null ? 0L : asset.getFileSizeBytes());
            row.setTagList(tagRowsByAssetId.getOrDefault(asset.getId(), List.of()));
            row.setCustomerName(album == null ? "" : album.getCustomerName());
            row.setCustomerPhoneMasked(maskPhone(album == null ? "" : album.getCustomerPhone()));
            row.setAlbumName(album == null ? "" : album.getAlbumName());
            row.setUploadedAt(asset.getCreateTime());
            row.setUploaderId(asset.getCreateBy());
            row.setUploaderName(uploader == null ? "" : StringUtils.defaultString(uploader.getEmployeeName()));
            rows.add(row);
        }
        return rows;
    }

    private String resolveStoreName(YyStore store) {
        return store == null ? "" : StringUtils.defaultString(store.getStoreName());
    }

    private String maskPhone(String phone) {
        String normalized = StringUtils.defaultString(phone).trim();
        if (normalized.length() < 7) {
            return normalized;
        }
        return normalized.substring(0, 3) + "****" + normalized.substring(normalized.length() - 4);
    }

    private String resolveSignedAssetUrl(String objectKey, String usage, String fallbackUrl) {
        if (StringUtils.isBlank(objectKey)) {
            return StringUtils.defaultIfBlank(fallbackUrl, "");
        }
        try {
            return photoAssetUrlSigner.signGetUrl(objectKey, RESOURCE_SIGN_TTL_SECONDS, usage);
        } catch (Exception ignored) {
            return StringUtils.defaultIfBlank(fallbackUrl, "");
        }
    }

    private String resolveThumbnailObjectKey(YyPhotoAsset asset) {
        return StringUtils.defaultIfBlank(asset.getThumbnailObjectKey(), resolveObjectKey(asset));
    }

    private String resolveObjectKey(YyPhotoAsset asset) {
        if (asset == null) {
            return "";
        }
        if (StringUtils.isNotBlank(asset.getObjectKey())) {
            return asset.getObjectKey();
        }
        String fileUrl = StringUtils.trimToEmpty(asset.getFileUrl());
        if (StringUtils.isBlank(fileUrl) || StringUtils.startsWithAny(fileUrl, "http://", "https://")) {
            return "";
        }
        int queryIndex = fileUrl.indexOf('?');
        String withoutQuery = queryIndex >= 0 ? fileUrl.substring(0, queryIndex) : fileUrl;
        return StringUtils.trimToEmpty(withoutQuery);
    }

    private void validEntityBeforeSave(YyPhotoAsset entity) {
        if (StringUtils.isBlank(entity.getObjectKey())) {
            throw new ServiceException("OSS瀵硅薄Key涓嶈兘涓虹┖");
        }
        if (StringUtils.isBlank(entity.getAssetType())) {
            entity.setAssetType("RAW");
        }
        if (entity.getRating() == null) {
            entity.setRating(0);
        }
        if (entity.getFileSizeBytes() == null) {
            entity.setFileSizeBytes(0L);
        }
        LambdaQueryWrapper<YyPhotoAsset> lqw = Wrappers.lambdaQuery();
        lqw.eq(YyPhotoAsset::getAlbumId, entity.getAlbumId());
        lqw.eq(YyPhotoAsset::getObjectKey, entity.getObjectKey());
        lqw.ne(entity.getId() != null, YyPhotoAsset::getId, entity.getId());
        if (baseMapper.selectCount(lqw) > 0) {
            throw new ServiceException("璇ョ浉鍐屽凡瀛樺湪鐩稿悓OSS瀵硅薄Key鐨勫簳鐗?");
        }
    }

    private void applyTagUpdates(YyPhotoAssetBatchUpdateBo bo, List<YyPhotoAsset> assets) {
        List<Long> tagIdsToAdd = bo.getTagIdsToAdd() == null ? List.of() : bo.getTagIdsToAdd().stream().filter(Objects::nonNull).distinct().toList();
        List<Long> tagIdsToRemove = bo.getTagIdsToRemove() == null ? List.of() : bo.getTagIdsToRemove().stream().filter(Objects::nonNull).distinct().toList();
        if (tagIdsToAdd.isEmpty() && tagIdsToRemove.isEmpty()) {
            return;
        }

        Map<Long, YyPhotoTag> validTags = loadValidTagsForMutation(tagIdsToAdd, tagIdsToRemove);
        if (!tagIdsToRemove.isEmpty()) {
            assetTagMapper.delete(Wrappers.<YyPhotoAssetTag>lambdaQuery()
                .in(YyPhotoAssetTag::getAssetId, assets.stream().map(YyPhotoAsset::getId).toList())
                .in(YyPhotoAssetTag::getTagId, tagIdsToRemove));
        }
        if (tagIdsToAdd.isEmpty()) {
            return;
        }

        List<Long> assetIds = assets.stream().map(YyPhotoAsset::getId).toList();
        List<YyPhotoAssetTag> existingRelations = assetTagMapper.selectList(
            Wrappers.<YyPhotoAssetTag>lambdaQuery()
                .in(YyPhotoAssetTag::getAssetId, assetIds)
                .in(YyPhotoAssetTag::getTagId, tagIdsToAdd));
        Set<String> existingKeys = existingRelations.stream()
            .map(item -> item.getAssetId() + ":" + item.getTagId())
            .collect(Collectors.toSet());

        List<YyPhotoAssetTag> adds = new ArrayList<>();
        for (YyPhotoAsset asset : assets) {
            for (Long tagId : tagIdsToAdd) {
                String relationKey = asset.getId() + ":" + tagId;
                if (existingKeys.contains(relationKey)) continue;
                YyPhotoTag tag = validTags.get(tagId);
                if (tag == null) continue;
                YyPhotoAssetTag relation = new YyPhotoAssetTag();
                relation.setAssetId(asset.getId());
                relation.setTagId(tagId);
                relation.setStoreId(asset.getStoreId());
                relation.setRemark("");
                adds.add(relation);
            }
        }
        if (!adds.isEmpty()) {
            assetTagMapper.insertBatch(adds);
        }
    }

    private Map<Long, YyPhotoTag> loadValidTagsForMutation(List<Long> tagIdsToAdd, List<Long> tagIdsToRemove) {
        Set<Long> tagIds = new LinkedHashSet<>();
        tagIds.addAll(tagIdsToAdd);
        tagIds.addAll(tagIdsToRemove);
        if (tagIds.isEmpty()) {
            return Map.of();
        }
        List<YyPhotoTag> tags = tagMapper.selectByIds(tagIds);
        if (tags.size() != tagIds.size()) {
            throw new ServiceException("閮ㄥ垎鏍囩涓嶅瓨鍦?");
        }
        if (tags.stream().anyMatch(tag -> !canAccessStore(tag.getStoreId()))) {
            throw new ServiceException("鎮ㄦ病鏈夋搷浣滆繖浜涙爣绛剧殑鏉冮檺");
        }
        return tags.stream().collect(Collectors.toMap(YyPhotoTag::getId, item -> item, (left, right) -> left));
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

    private void applyAlbumStoreScope(LambdaQueryWrapper<YyPhotoAlbum> lqw, Long requestedStoreId) {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (!storeScope.applicable() || storeScope.globalScope()) {
            lqw.eq(requestedStoreId != null, YyPhotoAlbum::getStoreId, requestedStoreId);
            return;
        }
        Set<Long> scopedStoreIds = storeScope.storeIds();
        if (scopedStoreIds.isEmpty()) {
            lqw.apply("1 = 0");
            return;
        }
        if (requestedStoreId == null) {
            lqw.in(YyPhotoAlbum::getStoreId, scopedStoreIds);
            return;
        }
        if (scopedStoreIds.contains(requestedStoreId)) {
            lqw.eq(YyPhotoAlbum::getStoreId, requestedStoreId);
            return;
        }
        lqw.apply("1 = 0");
    }

    private void applyOrderStoreScope(LambdaQueryWrapper<YyOrder> lqw, Long requestedStoreId) {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (!storeScope.applicable() || storeScope.globalScope()) {
            lqw.eq(requestedStoreId != null, YyOrder::getStoreId, requestedStoreId);
            return;
        }
        Set<Long> scopedStoreIds = storeScope.storeIds();
        if (scopedStoreIds.isEmpty()) {
            lqw.apply("1 = 0");
            return;
        }
        if (requestedStoreId == null) {
            lqw.in(YyOrder::getStoreId, scopedStoreIds);
            return;
        }
        if (scopedStoreIds.contains(requestedStoreId)) {
            lqw.eq(YyOrder::getStoreId, requestedStoreId);
            return;
        }
        lqw.apply("1 = 0");
    }

    private void applyEmployeeStoreScope(LambdaQueryWrapper<YyEmployee> lqw, Long requestedStoreId) {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (!storeScope.applicable() || storeScope.globalScope()) {
            lqw.eq(requestedStoreId != null, YyEmployee::getStoreId, requestedStoreId);
            return;
        }
        Set<Long> scopedStoreIds = storeScope.storeIds();
        if (scopedStoreIds.isEmpty()) {
            lqw.apply("1 = 0");
            return;
        }
        if (requestedStoreId == null) {
            lqw.in(YyEmployee::getStoreId, scopedStoreIds);
            return;
        }
        if (scopedStoreIds.contains(requestedStoreId)) {
            lqw.eq(YyEmployee::getStoreId, requestedStoreId);
            return;
        }
        lqw.apply("1 = 0");
    }

    private Long resolveProductIdFromOrder(YyOrder order) {
        if (order == null) {
            return null;
        }
        String productText = StringUtils.isNotBlank(order.getExternalSkuId())
            ? order.getExternalSkuId()
            : order.getExternalProductId();
        return parseLongOrNull(productText);
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

    private List<Long> parseLongList(String text) {
        if (StringUtils.isBlank(text)) {
            return List.of();
        }
        List<Long> values = new ArrayList<>();
        for (String part : text.split(",")) {
            Long value = parseLongOrNull(part);
            if (value != null) {
                values.add(value);
            }
        }
        return values.stream().distinct().toList();
    }

    private Long parseLongOrNull(String text) {
        if (StringUtils.isBlank(text)) {
            return null;
        }
        try {
            return Long.parseLong(text.trim());
        } catch (NumberFormatException ignored) {
            return null;
        }
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
