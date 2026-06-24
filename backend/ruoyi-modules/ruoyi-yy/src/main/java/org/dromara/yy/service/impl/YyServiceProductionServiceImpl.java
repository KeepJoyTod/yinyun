package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.incrementer.IdentifierGenerator;
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
import org.dromara.yy.domain.bo.*;
import org.dromara.yy.domain.vo.*;
import org.dromara.yy.mapper.*;
import org.dromara.yy.service.IYyServiceProductionService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 服务生产模块 Service 实现。
 */
@RequiredArgsConstructor
@Service
public class YyServiceProductionServiceImpl implements IYyServiceProductionService {

    private static final String STATUS_WAIT_ASSIGN = "WAIT_ASSIGN";
    private static final String STATUS_WAIT_ACCEPTANCE = "WAIT_ACCEPTANCE";
    private static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    private static final String STATUS_WAIT_REVIEW = "WAIT_REVIEW";
    private static final String STATUS_COMPLETED = "COMPLETED";
    private static final String STATUS_BLOCKED = "BLOCKED";
    private static final String ACCEPTANCE_PENDING = "PENDING";
    private static final String ACCEPTANCE_ACCEPTED = "ACCEPTED";
    private static final String POLICY_CODE_DEFAULT = "DEFAULT";

    private final YyRetouchTaskMapper retouchTaskMapper;
    private final YyRetouchProviderMapper retouchProviderMapper;
    private final YyCollaborationPolicyMapper collaborationPolicyMapper;
    private final YyServiceLicenseBindingMapper serviceLicenseBindingMapper;
    private final YyPhotoAlbumMapper photoAlbumMapper;
    private final YyPhotoAssetMapper photoAssetMapper;
    private final YyOrderMapper orderMapper;
    private final YyStoreMapper storeMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;
    private final IdentifierGenerator identifierGenerator;

    @Override
    public TableDataInfo<YyRetouchTaskVo> queryRetouchTaskPageList(YyRetouchTaskQueryBo bo, PageQuery pageQuery) {
        syncDerivedRetouchTasks(resolveRequestedStoreIds(bo == null ? null : bo.getStoreId()));
        LambdaQueryWrapper<YyRetouchTask> lqw = buildRetouchTaskQuery(bo);
        Page<YyRetouchTaskVo> result = retouchTaskMapper.selectVoPage(pageQuery.build(), lqw);
        List<YyRetouchTaskVo> rows = enrichRetouchTasks(result.getRecords());
        result.setRecords(rows);
        return TableDataInfo.build(result);
    }

    @Override
    public YyRetouchTaskVo updateRetouchTask(Long id, YyRetouchTaskActionBo bo) {
        YyRetouchTask task = requireRetouchTask(id);
        YyRetouchTaskActionBo safeBo = bo == null ? new YyRetouchTaskActionBo() : bo;

        if (safeBo.getProviderId() != null) {
            YyRetouchProvider provider = retouchProviderMapper.selectById(safeBo.getProviderId());
            if (provider == null || !"0".equals(StringUtils.defaultIfBlank(provider.getDelFlag(), "0"))) {
                throw new ServiceException("未找到可用的修图服务商");
            }
            task.setProviderId(provider.getId());
            task.setProviderName(provider.getProviderName());
            if (STATUS_WAIT_ASSIGN.equals(task.getStatus()) || STATUS_BLOCKED.equals(task.getStatus())) {
                task.setStatus(STATUS_WAIT_ACCEPTANCE);
            }
        }
        if (safeBo.getQuoteAmountCent() != null) {
            task.setQuoteAmountCent(Math.max(0L, safeBo.getQuoteAmountCent()));
        }
        if (safeBo.getDueTime() != null) {
            task.setDueTime(safeBo.getDueTime());
        }
        if (StringUtils.isNotBlank(safeBo.getBlockReason())) {
            task.setBlockReason(safeBo.getBlockReason());
        }
        if (StringUtils.isNotBlank(safeBo.getAcceptanceStatus())) {
            task.setAcceptanceStatus(StringUtils.upperCase(safeBo.getAcceptanceStatus()));
        }
        if (StringUtils.isNotBlank(safeBo.getStatus())) {
            String status = StringUtils.upperCase(safeBo.getStatus());
            task.setStatus(status);
            if (STATUS_IN_PROGRESS.equals(status) && task.getSubmittedTime() == null) {
                task.setSubmittedTime(new Date());
            }
            if (STATUS_COMPLETED.equals(status)) {
                task.setCompletedTime(new Date());
                task.setAcceptanceStatus(ACCEPTANCE_ACCEPTED);
                task.setBlockReason("");
            }
            if (STATUS_BLOCKED.equals(status) && StringUtils.isBlank(task.getBlockReason())) {
                task.setBlockReason("等待人工排障");
            }
        }
        task.setRemark(appendRemark(task.getRemark(), safeBo.getRemark()));
        retouchTaskMapper.updateById(task);
        return enrichRetouchTask(retouchTaskMapper.selectVoById(task.getId()));
    }

    @Override
    public List<YyRetouchProviderVo> queryRetouchProviders(YyRetouchProviderQueryBo bo) {
        LambdaQueryWrapper<YyRetouchProvider> lqw = Wrappers.lambdaQuery();
        if (bo != null) {
            lqw.and(StringUtils.isNotBlank(bo.getKeyword()), wrapper -> wrapper
                .like(YyRetouchProvider::getProviderName, bo.getKeyword())
                .or()
                .like(YyRetouchProvider::getContactName, bo.getKeyword())
                .or()
                .like(YyRetouchProvider::getContactPhone, bo.getKeyword())
                .or()
                .like(YyRetouchProvider::getProviderCode, bo.getKeyword()));
            lqw.eq(StringUtils.isNotBlank(bo.getApplicationStatus()), YyRetouchProvider::getApplicationStatus, bo.getApplicationStatus());
            lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyRetouchProvider::getStatus, bo.getStatus());
        }
        lqw.orderByAsc(YyRetouchProvider::getProviderName);
        List<YyRetouchProviderVo> providers = retouchProviderMapper.selectVoList(lqw);
        Set<Long> requestedStores = resolveRequestedStoreIds(null);
        if (requestedStores.isEmpty()) {
            return providers;
        }
        return providers.stream()
            .filter(item -> hasStoreIntersection(item.getSupportedStoreIds(), requestedStores))
            .toList();
    }

    @Override
    public YyRetouchProviderVo saveRetouchProvider(YyRetouchProviderBo bo) {
        YyRetouchProvider entity = BeanUtil.toBean(bo, YyRetouchProvider.class);
        normalizeRetouchProvider(entity);
        if (entity.getId() == null) {
            entity.setId(nextLongId());
            retouchProviderMapper.insert(entity);
            return retouchProviderMapper.selectVoById(entity.getId());
        }
        YyRetouchProvider existing = retouchProviderMapper.selectById(entity.getId());
        if (existing == null) {
            throw new ServiceException("未找到待更新的修图服务商");
        }
        retouchProviderMapper.updateById(entity);
        return retouchProviderMapper.selectVoById(entity.getId());
    }

    @Override
    public YyCollaborationPolicyVo queryCollaborationPolicy() {
        YyCollaborationPolicy entity = collaborationPolicyMapper.selectOne(Wrappers.<YyCollaborationPolicy>lambdaQuery()
            .eq(YyCollaborationPolicy::getPolicyCode, POLICY_CODE_DEFAULT)
            .last("limit 1"));
        if (entity == null) {
            return defaultCollaborationPolicy();
        }
        return BeanUtil.toBean(entity, YyCollaborationPolicyVo.class);
    }

    @Override
    public YyCollaborationPolicyVo saveCollaborationPolicy(YyCollaborationPolicyBo bo) {
        YyCollaborationPolicy entity = BeanUtil.toBean(bo, YyCollaborationPolicy.class);
        entity.setPolicyCode(StringUtils.defaultIfBlank(entity.getPolicyCode(), POLICY_CODE_DEFAULT));
        entity.setReviewFlowEnabled(normalizeSwitch(entity.getReviewFlowEnabled(), "1"));
        entity.setTransferEnabled(normalizeSwitch(entity.getTransferEnabled(), "1"));
        entity.setGenderMakeupEnabled(normalizeSwitch(entity.getGenderMakeupEnabled(), "0"));
        entity.setProductInfoMaskMode(StringUtils.defaultIfBlank(entity.getProductInfoMaskMode(), "MASK_PHOTO_ONLY"));
        entity.setFallbackAction(StringUtils.defaultIfBlank(entity.getFallbackAction(), "RETURN_TO_STORE"));
        entity.setAutoDispatchMode(StringUtils.defaultIfBlank(entity.getAutoDispatchMode(), "STORE_ONLY"));
        entity.setEnabledStoreIds(normalizeStoreIdsCsv(entity.getEnabledStoreIds()));
        entity.setFemaleMakeupRatio(entity.getFemaleMakeupRatio() == null ? new BigDecimal("1.5") : entity.getFemaleMakeupRatio());
        YyCollaborationPolicy existing = collaborationPolicyMapper.selectOne(Wrappers.<YyCollaborationPolicy>lambdaQuery()
            .eq(YyCollaborationPolicy::getPolicyCode, entity.getPolicyCode())
            .last("limit 1"));
        if (existing == null) {
            entity.setId(nextLongId());
            collaborationPolicyMapper.insert(entity);
            return BeanUtil.toBean(entity, YyCollaborationPolicyVo.class);
        }
        entity.setId(existing.getId());
        collaborationPolicyMapper.updateById(entity);
        return BeanUtil.toBean(collaborationPolicyMapper.selectById(entity.getId()), YyCollaborationPolicyVo.class);
    }

    @Override
    public List<YyServiceLicenseBindingVo> queryLicenseBindings(Long storeId) {
        List<YyServiceLicenseBindingVo> rows = serviceLicenseBindingMapper.selectVoList(Wrappers.<YyServiceLicenseBinding>lambdaQuery()
            .orderByAsc(YyServiceLicenseBinding::getExpireTime)
            .orderByAsc(YyServiceLicenseBinding::getId));
        Set<Long> requestedStores = resolveRequestedStoreIds(storeId);
        if (requestedStores.isEmpty()) {
            return rows;
        }
        return rows.stream()
            .filter(item -> hasStoreIntersection(item.getBoundStoreIds(), requestedStores))
            .toList();
    }

    @Override
    public YyServiceLicenseBindingVo saveLicenseBinding(YyServiceLicenseBindingBo bo) {
        YyServiceLicenseBinding entity = BeanUtil.toBean(bo, YyServiceLicenseBinding.class);
        entity.setLicenseKey(StringUtils.trimToEmpty(entity.getLicenseKey()));
        entity.setPlanName(StringUtils.defaultIfBlank(entity.getPlanName(), "协作套件许可证"));
        entity.setStatus(StringUtils.defaultIfBlank(entity.getStatus(), "ACTIVE"));
        entity.setRenewAction(StringUtils.defaultIfBlank(entity.getRenewAction(), "RENEW"));
        entity.setBoundStoreIds(normalizeStoreIdsCsv(entity.getBoundStoreIds()));
        entity.setSeatCount(entity.getSeatCount() == null ? countCsvItems(entity.getBoundStoreIds()) : entity.getSeatCount());
        if (entity.getActivatedTime() == null) {
            entity.setActivatedTime(new Date());
        }
        YyServiceLicenseBinding existing = null;
        if (entity.getId() != null) {
            existing = serviceLicenseBindingMapper.selectById(entity.getId());
        }
        if (existing == null) {
            existing = serviceLicenseBindingMapper.selectOne(Wrappers.<YyServiceLicenseBinding>lambdaQuery()
                .eq(YyServiceLicenseBinding::getLicenseKey, entity.getLicenseKey())
                .last("limit 1"));
        }
        if (existing == null) {
            entity.setId(nextLongId());
            serviceLicenseBindingMapper.insert(entity);
            return serviceLicenseBindingMapper.selectVoById(entity.getId());
        }
        entity.setId(existing.getId());
        serviceLicenseBindingMapper.updateById(entity);
        return serviceLicenseBindingMapper.selectVoById(entity.getId());
    }

    private LambdaQueryWrapper<YyRetouchTask> buildRetouchTaskQuery(YyRetouchTaskQueryBo bo) {
        LambdaQueryWrapper<YyRetouchTask> lqw = Wrappers.lambdaQuery();
        Set<Long> allowedStoreIds = resolveRequestedStoreIds(bo == null ? null : bo.getStoreId());
        if (allowedStoreIds.isEmpty()) {
            lqw.apply("1 = 0");
            return lqw;
        }
        lqw.in(YyRetouchTask::getStoreId, allowedStoreIds);
        if (bo != null) {
            lqw.eq(bo.getProviderId() != null, YyRetouchTask::getProviderId, bo.getProviderId());
            lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyRetouchTask::getStatus, StringUtils.upperCase(bo.getStatus()));
            lqw.and(StringUtils.isNotBlank(bo.getKeyword()), wrapper -> wrapper
                .like(YyRetouchTask::getTaskNo, bo.getKeyword())
                .or()
                .like(YyRetouchTask::getCustomerName, bo.getKeyword())
                .or()
                .like(YyRetouchTask::getServiceName, bo.getKeyword())
                .or()
                .like(YyRetouchTask::getProviderName, bo.getKeyword()));
        }
        lqw.orderByAsc(YyRetouchTask::getStatus);
        lqw.orderByAsc(YyRetouchTask::getDueTime);
        lqw.orderByDesc(YyRetouchTask::getId);
        return lqw;
    }

    private List<YyRetouchTaskVo> enrichRetouchTasks(List<YyRetouchTaskVo> rows) {
        return rows.stream().map(this::enrichRetouchTask).toList();
    }

    private YyRetouchTaskVo enrichRetouchTask(YyRetouchTaskVo row) {
        if (row == null) {
            return null;
        }
        if (row.getStoreId() != null) {
            YyStore store = storeMapper.selectById(row.getStoreId());
            row.setStoreName(store == null ? "" : store.getStoreName());
        }
        if (row.getOrderId() != null) {
            YyOrder order = orderMapper.selectById(row.getOrderId());
            if (order != null) {
                row.setOrderNo(StringUtils.defaultIfBlank(row.getOrderNo(), order.getOrderNo()));
            }
        }
        if (row.getAlbumId() != null) {
            YyPhotoAlbum album = photoAlbumMapper.selectById(row.getAlbumId());
            if (album != null) {
                row.setAlbumName(StringUtils.defaultIfBlank(row.getAlbumName(), album.getAlbumName()));
            }
        }
        return row;
    }

    private void normalizeRetouchProvider(YyRetouchProvider entity) {
        entity.setProviderCode(StringUtils.trimToEmpty(entity.getProviderCode()));
        entity.setProviderName(StringUtils.trimToEmpty(entity.getProviderName()));
        entity.setSupportedStoreIds(normalizeStoreIdsCsv(entity.getSupportedStoreIds()));
        entity.setServiceScope(StringUtils.defaultIfBlank(entity.getServiceScope(), "证件照,写真,精修客片"));
        entity.setQuoteMode(StringUtils.defaultIfBlank(entity.getQuoteMode(), "PER_PHOTO"));
        entity.setSettlementMode(StringUtils.defaultIfBlank(entity.getSettlementMode(), "MONTHLY"));
        entity.setApplicationStatus(StringUtils.defaultIfBlank(entity.getApplicationStatus(), "PENDING"));
        entity.setStatus(StringUtils.defaultIfBlank(entity.getStatus(), "ACTIVE"));
        entity.setRatingScore(entity.getRatingScore() == null ? 5 : entity.getRatingScore());
        entity.setSlaHours(entity.getSlaHours() == null ? 24 : entity.getSlaHours());
    }

    private YyCollaborationPolicyVo defaultCollaborationPolicy() {
        YyCollaborationPolicyVo vo = new YyCollaborationPolicyVo();
        vo.setPolicyCode(POLICY_CODE_DEFAULT);
        vo.setReviewFlowEnabled("1");
        vo.setProductInfoMaskMode("MASK_PHOTO_ONLY");
        vo.setFallbackAction("RETURN_TO_STORE");
        vo.setTransferEnabled("1");
        vo.setAutoDispatchMode("STORE_ONLY");
        vo.setGenderMakeupEnabled("0");
        vo.setFemaleMakeupRatio(new BigDecimal("1.5"));
        vo.setEnabledStoreIds("");
        vo.setRemark("默认协作策略：门店可自行派单，中央修图仅作为增强能力。");
        return vo;
    }

    private void syncDerivedRetouchTasks(Set<Long> allowedStoreIds) {
        if (allowedStoreIds.isEmpty()) {
            return;
        }
        List<YyPhotoAlbum> albums = photoAlbumMapper.selectList(Wrappers.<YyPhotoAlbum>lambdaQuery()
            .in(YyPhotoAlbum::getStoreId, allowedStoreIds)
            .eq(YyPhotoAlbum::getSelectionStatus, "CONFIRMED")
            .ne(YyPhotoAlbum::getStatus, "DELIVERED"));
        if (albums.isEmpty()) {
            return;
        }
        Map<Long, YyRetouchTask> existingByAlbumId = retouchTaskMapper.selectList(Wrappers.<YyRetouchTask>lambdaQuery()
                .in(YyRetouchTask::getAlbumId, albums.stream().map(YyPhotoAlbum::getId).toList()))
            .stream()
            .filter(task -> task.getAlbumId() != null)
            .collect(Collectors.toMap(YyRetouchTask::getAlbumId, item -> item, (left, right) -> right));
        for (YyPhotoAlbum album : albums) {
            YyRetouchTask task = existingByAlbumId.get(album.getId());
            if (task != null) {
                continue;
            }
            YyOrder order = album.getOrderId() == null ? null : orderMapper.selectById(album.getOrderId());
            YyRetouchTask created = new YyRetouchTask();
            created.setId(nextLongId());
            created.setStoreId(album.getStoreId());
            created.setOrderId(album.getOrderId());
            created.setAlbumId(album.getId());
            created.setTaskNo(buildRetouchTaskNo(album));
            created.setStatus(STATUS_WAIT_ASSIGN);
            created.setAcceptanceStatus(ACCEPTANCE_PENDING);
            created.setQuoteAmountCent(estimateQuoteAmountCent(album.getId()));
            created.setDueTime(new Date(System.currentTimeMillis() + Duration.ofHours(48).toMillis()));
            created.setSourceStage(StringUtils.defaultIfBlank(album.getSelectionStatus(), "CONFIRMED"));
            created.setCustomerName(StringUtils.defaultIfBlank(album.getCustomerName(), order == null ? "" : order.getCustomerName()));
            created.setServiceName(StringUtils.defaultIfBlank(album.getAlbumName(), order == null ? "" : order.getOrderNo()));
            created.setProviderName("");
            created.setBlockReason("");
            created.setRemark("由已确认相册自动派生三方修图任务");
            retouchTaskMapper.insert(created);
        }
    }

    private Long estimateQuoteAmountCent(Long albumId) {
        long selectedCount = photoAssetMapper.selectCount(Wrappers.<YyPhotoAsset>lambdaQuery()
            .eq(YyPhotoAsset::getAlbumId, albumId)
            .eq(YyPhotoAsset::getIsSelected, "1"));
        return Math.max(1L, selectedCount) * 1500L;
    }

    private String buildRetouchTaskNo(YyPhotoAlbum album) {
        return "RT-" + album.getId();
    }

    private YyRetouchTask requireRetouchTask(Long id) {
        YyRetouchTask task = retouchTaskMapper.selectById(id);
        if (task == null) {
            throw new ServiceException("未找到修图任务");
        }
        if (!canAccessStore(task.getStoreId())) {
            throw new ServiceException("您没有当前任务的访问权限");
        }
        return task;
    }

    private Set<Long> resolveRequestedStoreIds(Long requestedStoreId) {
        StoreScope scope = resolveCurrentStoreScope();
        if (!scope.applicable()) {
            if (requestedStoreId == null) {
                return storeMapper.selectList(Wrappers.<YyStore>lambdaQuery().select(YyStore::getId))
                    .stream()
                    .map(YyStore::getId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toCollection(LinkedHashSet::new));
            }
            return Set.of(requestedStoreId);
        }
        if (scope.globalScope()) {
            if (requestedStoreId == null) {
                return storeMapper.selectList(Wrappers.<YyStore>lambdaQuery().select(YyStore::getId))
                    .stream()
                    .map(YyStore::getId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toCollection(LinkedHashSet::new));
            }
            return Set.of(requestedStoreId);
        }
        if (requestedStoreId == null) {
            return scope.storeIds();
        }
        return scope.storeIds().contains(requestedStoreId) ? Set.of(requestedStoreId) : Set.of();
    }

    private boolean hasStoreIntersection(String csvStoreIds, Set<Long> scopedStoreIds) {
        if (scopedStoreIds.isEmpty()) {
            return true;
        }
        Set<Long> ids = parseStoreIds(csvStoreIds);
        return ids.isEmpty() || ids.stream().anyMatch(scopedStoreIds::contains);
    }

    private Set<Long> parseStoreIds(String csvStoreIds) {
        if (StringUtils.isBlank(csvStoreIds)) {
            return Set.of();
        }
        LinkedHashSet<Long> result = new LinkedHashSet<>();
        for (String item : StringUtils.split(csvStoreIds, ',')) {
            if (StringUtils.isBlank(item)) {
                continue;
            }
            try {
                result.add(Long.parseLong(item.trim()));
            } catch (NumberFormatException ignored) {
                // ignore invalid value
            }
        }
        return Set.copyOf(result);
    }

    private String normalizeStoreIdsCsv(String csvStoreIds) {
        if (StringUtils.isBlank(csvStoreIds)) {
            return "";
        }
        return parseStoreIds(csvStoreIds).stream()
            .sorted()
            .map(String::valueOf)
            .collect(Collectors.joining(","));
    }

    private int countCsvItems(String csvStoreIds) {
        return Math.max(1, parseStoreIds(csvStoreIds).size());
    }

    private String appendRemark(String currentRemark, String actionRemark) {
        if (StringUtils.isBlank(actionRemark)) {
            return StringUtils.defaultString(currentRemark);
        }
        String prefix = StringUtils.isBlank(currentRemark) ? "" : currentRemark + "\n";
        return prefix + new Date() + " " + actionRemark.trim();
    }

    private String normalizeSwitch(String value, String defaultValue) {
        String normalized = StringUtils.trimToEmpty(value);
        if ("1".equals(normalized) || "0".equals(normalized)) {
            return normalized;
        }
        return defaultValue;
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

    private Long nextLongId() {
        return identifierGenerator.nextId(null).longValue();
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
