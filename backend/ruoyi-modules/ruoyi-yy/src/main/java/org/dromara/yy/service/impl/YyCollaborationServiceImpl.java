package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.incrementer.IdentifierGenerator;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.*;
import org.dromara.yy.domain.bo.*;
import org.dromara.yy.domain.vo.*;
import org.dromara.yy.mapper.*;
import org.dromara.yy.service.IYyCollaborationService;
import org.dromara.yy.service.IYyServiceProductionService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class YyCollaborationServiceImpl implements IYyCollaborationService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String TYPE_POSITION = "POSITION";
    private static final String TYPE_COMMON = "COMMON";
    private static final String TYPE_RETOUCH_CENTER = "RETOUCH_CENTER";

    private final YyCollaborationSettingMapper collaborationSettingMapper;
    private final YyProductCollaborationConfigMapper productCollaborationConfigMapper;
    private final YyProductMapper productMapper;
    private final YyStoreMapper storeMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;
    private final IYyServiceProductionService yyServiceProductionService;
    private final IdentifierGenerator identifierGenerator;
    private final ObjectMapper objectMapper;

    @Override
    public YyCollaborationSettingVo querySetting(String settingType) {
        String normalizedType = normalizeSettingType(settingType);
        YyCollaborationSetting entity = findSettingEntity(normalizedType);
        if (entity != null) {
            return BeanUtil.toBean(entity, YyCollaborationSettingVo.class);
        }
        return buildDerivedSetting(normalizedType);
    }

    @Override
    public YyCollaborationSettingVo saveSetting(YyCollaborationSettingBo bo) {
        String normalizedType = normalizeSettingType(bo.getSettingType());
        YyCollaborationSetting existing = findSettingEntity(normalizedType);
        YyCollaborationSetting entity = existing == null ? new YyCollaborationSetting() : existing;
        if (entity.getId() == null) {
            entity.setId(nextLongId());
        }
        entity.setSettingType(normalizedType);
        entity.setStatus(StringUtils.defaultIfBlank(bo.getStatus(), STATUS_ACTIVE));
        entity.setConfigJson(StringUtils.defaultIfBlank(bo.getConfigJson(), ""));
        entity.setRemark(StringUtils.defaultIfBlank(bo.getRemark(), ""));
        if (existing == null) {
            collaborationSettingMapper.insert(entity);
        } else {
            collaborationSettingMapper.updateById(entity);
        }
        syncPolicyIfNeeded(normalizedType, entity.getConfigJson());
        return BeanUtil.toBean(collaborationSettingMapper.selectById(entity.getId()), YyCollaborationSettingVo.class);
    }

    @Override
    public List<YyProductCollaborationConfigVo> queryProductConfigs() {
        LambdaQueryWrapper<YyProductCollaborationConfig> lqw = Wrappers.lambdaQuery();
        applyStoreScope(lqw, YyProductCollaborationConfig::getStoreId, null);
        lqw.orderByAsc(YyProductCollaborationConfig::getStoreId);
        lqw.orderByAsc(YyProductCollaborationConfig::getId);
        return productCollaborationConfigMapper.selectVoList(lqw);
    }

    @Override
    public YyProductCollaborationConfigVo saveProductConfig(Long productId, YyProductCollaborationConfigBo bo) {
        if (productId == null) {
            throw new ServiceException("productId不能为空");
        }
        YyProduct product = productMapper.selectById(productId);
        if (product == null) {
            throw new ServiceException("产品不存在");
        }
        requireStoreAccess(product.getStoreId(), "无权修改该门店产品协作配置");
        YyProductCollaborationConfig existing = productCollaborationConfigMapper.selectOne(Wrappers.<YyProductCollaborationConfig>lambdaQuery()
            .eq(YyProductCollaborationConfig::getProductId, productId)
            .last("limit 1"));
        YyProductCollaborationConfig entity = existing == null ? new YyProductCollaborationConfig() : existing;
        if (entity.getId() == null) {
            entity.setId(nextLongId());
        }
        entity.setProductId(productId);
        entity.setStoreId(product.getStoreId());
        entity.setWorkflowJson(StringUtils.defaultIfBlank(bo.getWorkflowJson(), "{\"stageCodes\":[\"RECEPTION\",\"PHOTOGRAPHY\",\"RETOUCH\",\"PICKUP\"]}"));
        entity.setNeedMakeup(normalizeSwitch(bo.getNeedMakeup(), false));
        entity.setNeedPhotography(normalizeSwitch(bo.getNeedPhotography(), true));
        entity.setNeedRetouch(normalizeSwitch(bo.getNeedRetouch(), false));
        entity.setNeedReview(normalizeSwitch(bo.getNeedReview(), false));
        entity.setNeedSelectionReview(normalizeSwitch(bo.getNeedSelectionReview(), false));
        entity.setNeedPickup(normalizeSwitch(bo.getNeedPickup(), true));
        entity.setMakeupCount(bo.getMakeupCount() == null ? 0 : Math.max(0, bo.getMakeupCount()));
        entity.setDeliverWithinHours(bo.getDeliverWithinHours() == null ? 48 : Math.max(1, bo.getDeliverWithinHours()));
        entity.setStatus(StringUtils.defaultIfBlank(bo.getStatus(), STATUS_ACTIVE));
        entity.setRemark(StringUtils.defaultIfBlank(bo.getRemark(), ""));
        if (existing == null) {
            productCollaborationConfigMapper.insert(entity);
        } else {
            productCollaborationConfigMapper.updateById(entity);
        }
        return productCollaborationConfigMapper.selectVoById(entity.getId());
    }

    @Override
    public List<YyCollaborationLicenseVo> queryLicenses(Long storeId) {
        return yyServiceProductionService.queryLicenseBindings(storeId).stream()
            .map(this::mapLicense)
            .toList();
    }

    @Override
    public YyCollaborationLicenseVo saveLicense(YyCollaborationLicenseBo bo) {
        YyServiceLicenseBindingVo existing = findLicenseEntity(bo.getId(), bo.getLicenseKey());
        YyServiceLicenseBindingBo payload = new YyServiceLicenseBindingBo();
        payload.setId(existing == null ? bo.getId() : existing.getId());
        payload.setLicenseKey(StringUtils.trimToEmpty(bo.getLicenseKey()));
        payload.setPlanName(StringUtils.defaultIfBlank(bo.getLicenseName(), "内部协作许可证"));
        payload.setStatus(resolveLicenseStatus(bo));
        payload.setActivatedTime(parseDate(bo.getValidFrom(), existing == null ? null : existing.getActivatedTime()));
        payload.setExpireTime(parseDate(bo.getValidTo(), existing == null ? null : existing.getExpireTime()));
        payload.setSeatCount(bo.getSeatCount());
        payload.setRenewAction(existing == null ? "RENEW" : existing.getRenewAction());
        payload.setBoundStoreIds(existing == null ? "" : StringUtils.defaultIfBlank(existing.getBoundStoreIds(), ""));
        payload.setRemark(StringUtils.defaultIfBlank(bo.getRemark(), existing == null ? "" : existing.getRemark()));
        return mapLicense(yyServiceProductionService.saveLicenseBinding(payload));
    }

    @Override
    public YyCollaborationLicenseVo bindLicenseStore(Long licenseId, YyCollaborationLicenseBindStoreBo bo) {
        requireStoreAccess(bo.getStoreId(), "无权绑定该门店");
        YyServiceLicenseBindingVo existing = requireLicense(licenseId);
        LinkedHashSet<Long> nextStoreIds = new LinkedHashSet<>(parseStoreIds(existing.getBoundStoreIds()));
        nextStoreIds.add(bo.getStoreId());
        return mapLicense(yyServiceProductionService.saveLicenseBinding(buildLicenseUpdate(existing, nextStoreIds, bo.getRemark())));
    }

    @Override
    public YyCollaborationLicenseVo unbindLicenseStore(Long licenseId, Long storeId) {
        requireStoreAccess(storeId, "无权解绑该门店");
        YyServiceLicenseBindingVo existing = requireLicense(licenseId);
        LinkedHashSet<Long> nextStoreIds = new LinkedHashSet<>(parseStoreIds(existing.getBoundStoreIds()));
        nextStoreIds.remove(storeId);
        return mapLicense(yyServiceProductionService.saveLicenseBinding(buildLicenseUpdate(existing, nextStoreIds, existing.getRemark())));
    }

    private YyCollaborationSetting findSettingEntity(String settingType) {
        return collaborationSettingMapper.selectOne(Wrappers.<YyCollaborationSetting>lambdaQuery()
            .eq(YyCollaborationSetting::getSettingType, settingType)
            .last("limit 1"));
    }

    private YyCollaborationSettingVo buildDerivedSetting(String settingType) {
        YyCollaborationSettingVo vo = new YyCollaborationSettingVo();
        vo.setSettingType(settingType);
        vo.setStatus(STATUS_ACTIVE);
        vo.setRemark("");
        vo.setConfigJson(switch (settingType) {
            case TYPE_COMMON -> buildCommonConfigJson(yyServiceProductionService.queryCollaborationPolicy());
            case TYPE_RETOUCH_CENTER -> buildRetouchConfigJson(yyServiceProductionService.queryCollaborationPolicy());
            default -> "";
        });
        return vo;
    }

    private void syncPolicyIfNeeded(String settingType, String configJson) {
        if (!TYPE_COMMON.equals(settingType) && !TYPE_RETOUCH_CENTER.equals(settingType)) {
            return;
        }
        YyCollaborationPolicyVo current = yyServiceProductionService.queryCollaborationPolicy();
        YyCollaborationPolicyBo payload = new YyCollaborationPolicyBo();
        payload.setId(current.getId());
        payload.setPolicyCode(StringUtils.defaultIfBlank(current.getPolicyCode(), "DEFAULT"));
        payload.setReviewFlowEnabled(current.getReviewFlowEnabled());
        payload.setProductInfoMaskMode(current.getProductInfoMaskMode());
        payload.setEnabledStoreIds(StringUtils.defaultIfBlank(current.getEnabledStoreIds(), ""));
        payload.setFallbackAction(StringUtils.defaultIfBlank(current.getFallbackAction(), "RETURN_TO_STORE"));
        payload.setTransferEnabled(current.getTransferEnabled());
        payload.setAutoDispatchMode(StringUtils.defaultIfBlank(current.getAutoDispatchMode(), "STORE_ONLY"));
        payload.setGenderMakeupEnabled(current.getGenderMakeupEnabled());
        payload.setFemaleMakeupRatio(current.getFemaleMakeupRatio());
        payload.setRemark(current.getRemark());

        JsonNode root = parseJsonNode(configJson);
        if (TYPE_COMMON.equals(settingType)) {
            payload.setEnabledStoreIds(joinStoreIds(readStringArray(root, "enabledStoreIds")));
            payload.setAutoDispatchMode(readBoolean(root, "autoDispatchOnArrival", false) ? "ARRIVAL_AUTO_DISPATCH" : "STORE_ONLY");
            payload.setGenderMakeupEnabled(readBoolean(root, "genderMakeupSplit", false) ? "1" : "0");
            payload.setFemaleMakeupRatio(readDecimal(root, List.of("femaleMakeupRatio", "maleMakeupRatio"), new BigDecimal("1.5")));
        } else {
            payload.setReviewFlowEnabled(readBoolean(root, "reviewFlowEnabled", true) ? "1" : "0");
            payload.setProductInfoMaskMode(switch (readText(root, "hideProductInfoMode", "PHOTO_ONLY")) {
                case "ALL" -> "MASK_ALL";
                case "NONE" -> "NONE";
                default -> "MASK_PHOTO_ONLY";
            });
            payload.setTransferEnabled(readBoolean(root, "dispatchTransferEnabled", true) ? "1" : "0");
        }
        yyServiceProductionService.saveCollaborationPolicy(payload);
    }

    private String buildCommonConfigJson(YyCollaborationPolicyVo policy) {
        Map<String, Object> payload = new LinkedHashMap<>();
        List<String> enabledStoreIds = parseStoreIds(StringUtils.defaultIfBlank(policy.getEnabledStoreIds(), ""))
            .stream()
            .map(String::valueOf)
            .toList();
        payload.put("autoCompleteAfterAllWorkOrders", true);
        payload.put("autoDispatchOnArrival", "ARRIVAL_AUTO_DISPATCH".equalsIgnoreCase(policy.getAutoDispatchMode()));
        payload.put("enabledStoreMode", enabledStoreIds.isEmpty() ? "ALL" : "PARTIAL");
        payload.put("enabledStoreIds", enabledStoreIds);
        payload.put("genderMakeupSplit", "1".equals(policy.getGenderMakeupEnabled()));
        payload.put("maleMakeupRatio", policy.getFemaleMakeupRatio() == null ? 1.5 : policy.getFemaleMakeupRatio());
        return writeJson(payload);
    }

    private String buildRetouchConfigJson(YyCollaborationPolicyVo policy) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("reviewFlowEnabled", !"0".equals(policy.getReviewFlowEnabled()));
        payload.put("hideProductInfoMode", switch (StringUtils.defaultIfBlank(policy.getProductInfoMaskMode(), "MASK_PHOTO_ONLY")) {
            case "MASK_ALL" -> "ALL";
            case "NONE" -> "NONE";
            default -> "PHOTO_ONLY";
        });
        payload.put("dispatchTransferEnabled", !"0".equals(policy.getTransferEnabled()));
        payload.put("sameStoreOnly", false);
        return writeJson(payload);
    }

    private YyCollaborationLicenseVo mapLicense(YyServiceLicenseBindingVo source) {
        YyCollaborationLicenseVo vo = new YyCollaborationLicenseVo();
        vo.setId(source.getId());
        vo.setLicenseKey(source.getLicenseKey());
        vo.setLicenseName(StringUtils.defaultIfBlank(source.getPlanName(), "内部协作许可证"));
        vo.setAuthStatus(StringUtils.defaultIfBlank(source.getStatus(), STATUS_ACTIVE));
        vo.setEnabled(isDisabledStatus(source.getStatus()) ? "0" : "1");
        vo.setValidFrom(source.getActivatedTime());
        vo.setValidTo(source.getExpireTime());
        vo.setSeatCount(source.getSeatCount());
        vo.setRemark(StringUtils.defaultIfBlank(source.getRemark(), ""));
        vo.setCreateTime(source.getCreateTime());
        vo.setUpdateTime(source.getUpdateTime());

        Map<Long, String> storeNames = listStoreNames(parseStoreIds(source.getBoundStoreIds()));
        List<YyCollaborationLicenseStoreBindingVo> boundStores = new ArrayList<>();
        for (Long storeId : parseStoreIds(source.getBoundStoreIds())) {
            YyCollaborationLicenseStoreBindingVo binding = new YyCollaborationLicenseStoreBindingVo();
            binding.setId(source.getId());
            binding.setLicenseId(source.getId());
            binding.setStoreId(storeId);
            binding.setStoreName(storeNames.getOrDefault(storeId, ""));
            binding.setBindStatus("BOUND");
            binding.setBoundAt(source.getActivatedTime());
            binding.setRemark(source.getRemark());
            boundStores.add(binding);
        }
        vo.setBoundStores(boundStores);
        return vo;
    }

    private YyServiceLicenseBindingBo buildLicenseUpdate(YyServiceLicenseBindingVo existing, LinkedHashSet<Long> nextStoreIds, String remark) {
        YyServiceLicenseBindingBo payload = new YyServiceLicenseBindingBo();
        payload.setId(existing.getId());
        payload.setLicenseKey(existing.getLicenseKey());
        payload.setPlanName(existing.getPlanName());
        payload.setStatus(existing.getStatus());
        payload.setExpireTime(existing.getExpireTime());
        payload.setBoundStoreIds(joinStoreIds(nextStoreIds.stream().map(String::valueOf).toList()));
        payload.setSeatCount(Math.max(existing.getSeatCount() == null ? 0 : existing.getSeatCount(), nextStoreIds.size()));
        payload.setActivatedTime(existing.getActivatedTime());
        payload.setRenewAction(existing.getRenewAction());
        payload.setRemark(StringUtils.defaultIfBlank(remark, existing.getRemark()));
        return payload;
    }

    private YyServiceLicenseBindingVo requireLicense(Long licenseId) {
        return yyServiceProductionService.queryLicenseBindings(null).stream()
            .filter(item -> Objects.equals(item.getId(), licenseId))
            .findFirst()
            .orElseThrow(() -> new ServiceException("许可证不存在"));
    }

    private YyServiceLicenseBindingVo findLicenseEntity(Long licenseId, String licenseKey) {
        return yyServiceProductionService.queryLicenseBindings(null).stream()
            .filter(item -> (licenseId != null && Objects.equals(item.getId(), licenseId))
                || (StringUtils.isNotBlank(licenseKey) && licenseKey.equals(item.getLicenseKey())))
            .findFirst()
            .orElse(null);
    }

    private String resolveLicenseStatus(YyCollaborationLicenseBo bo) {
        if ("0".equals(StringUtils.defaultIfBlank(bo.getEnabled(), "1"))) {
            return "DISABLED";
        }
        return StringUtils.defaultIfBlank(bo.getAuthStatus(), STATUS_ACTIVE);
    }

    private boolean isDisabledStatus(String status) {
        return "DISABLED".equalsIgnoreCase(StringUtils.defaultIfBlank(status, ""));
    }

    private Date parseDate(String value, Date fallback) {
        if (StringUtils.isBlank(value)) {
            return fallback;
        }
        LocalDate date = LocalDate.parse(value.trim());
        return Date.from(date.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    private JsonNode parseJsonNode(String value) {
        try {
            return objectMapper.readTree(StringUtils.defaultIfBlank(value, "{}"));
        } catch (JsonProcessingException exception) {
            throw new ServiceException("协作配置JSON格式不正确");
        }
    }

    private String writeJson(Map<String, Object> value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new ServiceException("协作配置序列化失败");
        }
    }

    private boolean readBoolean(JsonNode root, String fieldName, boolean fallback) {
        JsonNode value = root.path(fieldName);
        return value.isMissingNode() || value.isNull() ? fallback : value.asBoolean(fallback);
    }

    private BigDecimal readDecimal(JsonNode root, List<String> fieldNames, BigDecimal fallback) {
        for (String fieldName : fieldNames) {
            JsonNode value = root.path(fieldName);
            if (!value.isMissingNode() && !value.isNull() && StringUtils.isNotBlank(value.asText())) {
                return new BigDecimal(value.asText());
            }
        }
        return fallback;
    }

    private String readText(JsonNode root, String fieldName, String fallback) {
        JsonNode value = root.path(fieldName);
        return value.isMissingNode() || value.isNull() ? fallback : StringUtils.defaultIfBlank(value.asText(), fallback);
    }

    private List<String> readStringArray(JsonNode root, String fieldName) {
        JsonNode value = root.path(fieldName);
        if (!value.isArray()) {
            return List.of();
        }
        List<String> results = new ArrayList<>();
        for (JsonNode item : value) {
            if (StringUtils.isNotBlank(item.asText())) {
                results.add(item.asText().trim());
            }
        }
        return results;
    }

    private String joinStoreIds(List<String> storeIds) {
        return storeIds.stream()
            .map(String::trim)
            .filter(StringUtils::isNotBlank)
            .distinct()
            .collect(Collectors.joining(","));
    }

    private LinkedHashSet<Long> parseStoreIds(String csvStoreIds) {
        LinkedHashSet<Long> results = new LinkedHashSet<>();
        if (StringUtils.isBlank(csvStoreIds)) {
            return results;
        }
        for (String item : csvStoreIds.split(",")) {
            if (StringUtils.isBlank(item)) {
                continue;
            }
            try {
                results.add(Long.parseLong(item.trim()));
            } catch (NumberFormatException ignore) {
                // ignore bad fragments
            }
        }
        return results;
    }

    private Map<Long, String> listStoreNames(Set<Long> storeIds) {
        if (storeIds.isEmpty()) {
            return Map.of();
        }
        return storeMapper.selectList(Wrappers.<YyStore>lambdaQuery()
                .in(YyStore::getId, storeIds)
                .select(YyStore::getId, YyStore::getStoreName))
            .stream()
            .collect(Collectors.toMap(YyStore::getId, item -> StringUtils.defaultIfBlank(item.getStoreName(), ""), (left, right) -> right, LinkedHashMap::new));
    }

    private String normalizeSettingType(String settingType) {
        String normalized = StringUtils.upperCase(StringUtils.trimToEmpty(settingType));
        if (!Set.of(TYPE_POSITION, TYPE_COMMON, TYPE_RETOUCH_CENTER).contains(normalized)) {
            throw new ServiceException("不支持的协作设置类型");
        }
        return normalized;
    }

    private String normalizeSwitch(Boolean value, boolean defaultEnabled) {
        return Boolean.TRUE.equals(value) || (value == null && defaultEnabled) ? "1" : "0";
    }

    private Long nextLongId() {
        return ((Number) identifierGenerator.nextId(null)).longValue();
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

    private <T> void applyStoreScope(LambdaQueryWrapper<T> wrapper, SFunction<T, Long> column, Long requestedStoreId) {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (!storeScope.applicable() || storeScope.globalScope()) {
            wrapper.eq(requestedStoreId != null, column, requestedStoreId);
            return;
        }
        Set<Long> scopedStoreIds = storeScope.storeIds();
        if (scopedStoreIds.isEmpty()) {
            wrapper.apply("1 = 0");
            return;
        }
        if (requestedStoreId == null) {
            wrapper.in(column, scopedStoreIds);
            return;
        }
        if (scopedStoreIds.contains(requestedStoreId)) {
            wrapper.eq(column, requestedStoreId);
            return;
        }
        wrapper.apply("1 = 0");
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
