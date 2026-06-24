package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.common.tenant.helper.TenantHelper;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyMerchantMicroPage;
import org.dromara.yy.domain.bo.YyMerchantMicroPageBo;
import org.dromara.yy.domain.vo.YyMerchantMicroPagePublicVo;
import org.dromara.yy.domain.vo.YyMerchantMicroPageVo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyMerchantMicroPageMapper;
import org.dromara.yy.service.IYyMerchantMicroPageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
public class YyMerchantMicroPageServiceImpl implements IYyMerchantMicroPageService {

    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_PUBLISHED = "PUBLISHED";
    private static final String STATUS_OFFLINE = "OFFLINE";
    private static final String EDIT_MODE_COMPONENT = "COMPONENT";
    private static final Long TENANT_SCOPE_STORE_ID = 0L;
    private static final String CLIENT_DEFAULT_TENANT_ID = "000000";
    private static final Set<String> PAGE_STATUSES = Set.of(STATUS_DRAFT, STATUS_PUBLISHED, STATUS_OFFLINE);
    private static final Set<String> EDIT_MODES = Set.of(EDIT_MODE_COMPONENT);
    private static final Set<String> COMPONENT_TYPES = Set.of(
        "image", "masonry", "title", "textnav", "store", "spacer", "divider"
    );

    private final YyMerchantMicroPageMapper baseMapper;
    private final ObjectMapper objectMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;

    @Autowired
    public YyMerchantMicroPageServiceImpl(
        YyMerchantMicroPageMapper baseMapper,
        ObjectMapper objectMapper,
        YyEmployeeMapper employeeMapper,
        YyEmployeeStoreMapper employeeStoreMapper
    ) {
        this.baseMapper = baseMapper;
        this.objectMapper = objectMapper;
        this.employeeMapper = employeeMapper;
        this.employeeStoreMapper = employeeStoreMapper;
    }

    YyMerchantMicroPageServiceImpl(YyMerchantMicroPageMapper baseMapper, ObjectMapper objectMapper) {
        this(baseMapper, objectMapper, null, null);
    }

    @Override
    public YyMerchantMicroPageVo queryById(Long id) {
        YyMerchantMicroPageVo vo = baseMapper.selectVoById(id);
        if (vo != null && !canAccessStore(vo.getStoreId())) {
            return null;
        }
        return vo == null ? null : ensureDefaults(vo);
    }

    @Override
    public TableDataInfo<YyMerchantMicroPageVo> queryPageList(YyMerchantMicroPageBo bo, PageQuery pageQuery) {
        Page<YyMerchantMicroPageVo> result = baseMapper.selectVoPage(pageQuery.build(), buildQueryWrapper(bo));
        result.getRecords().replaceAll(this::ensureDefaults);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyMerchantMicroPageVo> queryList(YyMerchantMicroPageBo bo) {
        List<YyMerchantMicroPageVo> list = baseMapper.selectVoList(buildQueryWrapper(bo));
        list.replaceAll(this::ensureDefaults);
        return list;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean insertByBo(YyMerchantMicroPageBo bo) {
        YyMerchantMicroPage add = BeanUtil.toBean(bo, YyMerchantMicroPage.class);
        prepareForSave(add, null);
        requireStoreAccess(add.getStoreId(), "No permission to create this micro page");
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
            bo.setStatus(add.getStatus());
            bo.setLinkKey(add.getLinkKey());
            bo.setPublishedAt(add.getPublishedAt());
        }
        return flag;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateByBo(YyMerchantMicroPageBo bo) {
        YyMerchantMicroPage existing = baseMapper.selectById(bo.getId());
        if (existing == null) {
            throw new ServiceException("Micro page does not exist");
        }
        requireStoreAccess(existing.getStoreId(), "No permission to update this micro page");

        YyMerchantMicroPage update = BeanUtil.toBean(bo, YyMerchantMicroPage.class);
        if (StringUtils.isBlank(update.getStatus())) {
            update.setStatus(existing.getStatus());
        }
        if (StringUtils.isBlank(update.getLinkKey())) {
            update.setLinkKey(existing.getLinkKey());
        }
        if (update.getPublishedAt() == null) {
            update.setPublishedAt(existing.getPublishedAt());
        }
        if (StringUtils.isBlank(update.getPublishedConfigJson())) {
            update.setPublishedConfigJson(existing.getPublishedConfigJson());
        }

        prepareForSave(update, existing);
        requireStoreAccess(update.getStoreId(), "No permission to update this micro page");
        return baseMapper.updateById(update) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyMerchantMicroPageVo publish(Long id) {
        YyMerchantMicroPage existing = requirePage(id);

        YyMerchantMicroPage update = new YyMerchantMicroPage();
        update.setId(id);
        update.setStatus(STATUS_PUBLISHED);
        update.setPublishedAt(new Date());
        update.setLinkKey(StringUtils.blankToDefault(existing.getLinkKey(), generateUniqueLinkKey()));
        update.setConfigJson(normalizeConfigJson(existing.getConfigJson()));
        update.setPublishedConfigJson(normalizeConfigJson(existing.getConfigJson()));

        if (baseMapper.updateById(update) <= 0) {
            throw new ServiceException("Failed to publish micro page");
        }
        return queryById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyMerchantMicroPageVo offline(Long id) {
        requirePage(id);

        YyMerchantMicroPage update = new YyMerchantMicroPage();
        update.setId(id);
        update.setStatus(STATUS_OFFLINE);
        if (baseMapper.updateById(update) <= 0) {
            throw new ServiceException("Failed to offline micro page");
        }
        return queryById(id);
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyMerchantMicroPage> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size() || list.stream().anyMatch(page -> !canAccessStore(page.getStoreId()))) {
                throw new ServiceException("No permission to delete these micro pages");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }

    @Override
    public YyMerchantMicroPagePublicVo publicPage(String idOrKey) {
        return TenantHelper.dynamic(CLIENT_DEFAULT_TENANT_ID, () -> doPublicPage(idOrKey));
    }

    private YyMerchantMicroPagePublicVo doPublicPage(String idOrKey) {
        YyMerchantMicroPage page = requirePublishedPage(idOrKey);
        YyMerchantMicroPagePublicVo vo = new YyMerchantMicroPagePublicVo();
        vo.setId(page.getId());
        vo.setStoreId(page.getStoreId());
        vo.setPageTitle(page.getPageTitle());
        vo.setPageDesc(page.getPageDesc());
        vo.setCoverUrl(page.getCoverUrl());
        vo.setBackgroundColor(page.getBackgroundColor());
        vo.setEditMode(page.getEditMode());
        vo.setStatus(page.getStatus());
        vo.setConfigJson(StringUtils.blankToDefault(page.getPublishedConfigJson(), page.getConfigJson()));
        vo.setLinkKey(page.getLinkKey());
        vo.setPublishedAt(page.getPublishedAt());
        return vo;
    }

    private void prepareForSave(YyMerchantMicroPage entity, YyMerchantMicroPage existing) {
        if ((entity.getStoreId() == null || entity.getStoreId() < 0) && existing != null && existing.getStoreId() != null) {
            entity.setStoreId(existing.getStoreId());
        } else {
            entity.setStoreId(entity.getStoreId() == null || entity.getStoreId() < 0 ? TENANT_SCOPE_STORE_ID : entity.getStoreId());
        }
        entity.setPageTitle(StringUtils.substring(StringUtils.trimToEmpty(entity.getPageTitle()), 0, 120));
        if (StringUtils.isBlank(entity.getPageTitle())) {
            throw new ServiceException("pageTitle is required");
        }

        entity.setPageDesc(StringUtils.substring(StringUtils.trimToEmpty(entity.getPageDesc()), 0, 500));
        entity.setCoverUrl(StringUtils.substring(StringUtils.trimToEmpty(entity.getCoverUrl()), 0, 500));
        entity.setBackgroundColor(normalizeBackgroundColor(entity.getBackgroundColor()));
        entity.setEditMode(normalizeEditMode(entity.getEditMode()));
        entity.setConfigJson(normalizeConfigJson(entity.getConfigJson()));
        entity.setStatus(normalizeStatus(entity.getStatus(), STATUS_DRAFT));

        if (StringUtils.isBlank(entity.getLinkKey())) {
            entity.setLinkKey(existing == null ? generateUniqueLinkKey() : existing.getLinkKey());
        }

        if (STATUS_PUBLISHED.equals(entity.getStatus())) {
            if (entity.getPublishedAt() == null) {
                entity.setPublishedAt(new Date());
            }
            entity.setPublishedConfigJson(StringUtils.blankToDefault(entity.getPublishedConfigJson(), entity.getConfigJson()));
        } else if (existing == null) {
            entity.setPublishedAt(null);
            entity.setPublishedConfigJson(null);
        } else if (StringUtils.isBlank(entity.getPublishedConfigJson())) {
            entity.setPublishedConfigJson(existing.getPublishedConfigJson());
        }

        entity.setRemark(StringUtils.substring(StringUtils.trimToEmpty(entity.getRemark()), 0, 500));
    }

    private LambdaQueryWrapper<YyMerchantMicroPage> buildQueryWrapper(YyMerchantMicroPageBo bo) {
        LambdaQueryWrapper<YyMerchantMicroPage> lqw = Wrappers.lambdaQuery();
        if (bo == null) {
            applyStoreScope(lqw, null);
            lqw.orderByDesc(YyMerchantMicroPage::getPublishedAt);
            lqw.orderByDesc(YyMerchantMicroPage::getUpdateTime);
            lqw.orderByDesc(YyMerchantMicroPage::getId);
            return lqw;
        }
        applyStoreScope(lqw, bo.getStoreId());
        lqw.like(StringUtils.isNotBlank(bo.getPageTitle()), YyMerchantMicroPage::getPageTitle, bo.getPageTitle());
        lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyMerchantMicroPage::getStatus, normalizeStatus(bo.getStatus(), null));
        lqw.eq(StringUtils.isNotBlank(bo.getLinkKey()), YyMerchantMicroPage::getLinkKey, StringUtils.trimToEmpty(bo.getLinkKey()));
        lqw.orderByDesc(YyMerchantMicroPage::getPublishedAt);
        lqw.orderByDesc(YyMerchantMicroPage::getUpdateTime);
        lqw.orderByDesc(YyMerchantMicroPage::getId);
        return lqw;
    }

    private YyMerchantMicroPageVo ensureDefaults(YyMerchantMicroPageVo vo) {
        if (StringUtils.isBlank(vo.getStatus())) {
            vo.setStatus(STATUS_DRAFT);
        }
        if (StringUtils.isBlank(vo.getEditMode())) {
            vo.setEditMode(EDIT_MODE_COMPONENT);
        }
        if (StringUtils.isBlank(vo.getBackgroundColor())) {
            vo.setBackgroundColor("#FBF8F2");
        }
        if (StringUtils.isBlank(vo.getConfigJson())) {
            vo.setConfigJson(defaultConfigJson());
        }
        return vo;
    }

    private YyMerchantMicroPage requirePage(Long id) {
        YyMerchantMicroPage page = baseMapper.selectById(id);
        if (page == null) {
            throw new ServiceException("Micro page does not exist");
        }
        requireStoreAccess(page.getStoreId(), "No permission to operate this micro page");
        return page;
    }

    private YyMerchantMicroPage requirePublishedPage(String idOrKey) {
        String normalized = StringUtils.trimToEmpty(idOrKey);
        if (StringUtils.isBlank(normalized)) {
            throw new ServiceException("Micro page does not exist");
        }

        LambdaQueryWrapper<YyMerchantMicroPage> wrapper = Wrappers.lambdaQuery();
        if (normalized.matches("\\d+")) {
            wrapper.eq(YyMerchantMicroPage::getId, Long.parseLong(normalized));
        } else {
            wrapper.eq(YyMerchantMicroPage::getLinkKey, normalized);
        }

        YyMerchantMicroPage page = baseMapper.selectOne(wrapper);
        if (page == null || !STATUS_PUBLISHED.equals(page.getStatus())) {
            throw new ServiceException("Micro page does not exist or is not published");
        }
        return page;
    }

    private String normalizeStatus(String rawStatus, String defaultStatus) {
        String status = StringUtils.blankToDefault(rawStatus, defaultStatus);
        if (StringUtils.isBlank(status)) {
            return status;
        }
        status = status.trim().toUpperCase(Locale.ROOT);
        if (!PAGE_STATUSES.contains(status)) {
            throw new ServiceException("Unsupported micro page status: " + status);
        }
        return status;
    }

    private String normalizeEditMode(String rawEditMode) {
        String editMode = StringUtils.blankToDefault(rawEditMode, EDIT_MODE_COMPONENT);
        editMode = editMode.trim().toUpperCase(Locale.ROOT);
        if (!EDIT_MODES.contains(editMode)) {
            throw new ServiceException("Unsupported micro page edit mode: " + editMode);
        }
        return editMode;
    }

    private String normalizeBackgroundColor(String backgroundColor) {
        String value = StringUtils.blankToDefault(backgroundColor, "#FBF8F2").trim();
        if (!value.matches("#[0-9a-fA-F]{6}")) {
            throw new ServiceException("backgroundColor is invalid");
        }
        return value.toUpperCase(Locale.ROOT);
    }

    private String normalizeConfigJson(String configJson) {
        String source = StringUtils.trimToEmpty(configJson);
        if (StringUtils.isBlank(source)) {
            source = defaultConfigJson();
        }
        try {
            JsonNode root = objectMapper.readTree(source);
            JsonNode componentsNode = root.isArray() ? root : root.path("components");
            if (!componentsNode.isArray()) {
                throw new ServiceException("configJson is invalid");
            }

            List<Map<String, Object>> components = new ArrayList<>();
            int index = 1;
            for (JsonNode item : componentsNode) {
                components.add(normalizeComponent(item, index));
                index += 1;
            }

            Map<String, Object> normalized = new LinkedHashMap<>();
            normalized.put("components", components);
            return objectMapper.writeValueAsString(normalized);
        } catch (ServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ServiceException("configJson is invalid");
        }
    }

    private Map<String, Object> normalizeComponent(JsonNode node, int defaultSort) {
        String type = text(node, "type").toLowerCase(Locale.ROOT);
        if (StringUtils.isBlank(type) || !COMPONENT_TYPES.contains(type)) {
            throw new ServiceException("Unsupported component type: " + type);
        }

        Map<String, Object> component = new LinkedHashMap<>();
        component.put("id", StringUtils.substring(StringUtils.blankToDefault(text(node, "id"), type + "-" + defaultSort), 0, 64));
        component.put("type", type);
        component.put("title", StringUtils.substring(StringUtils.blankToDefault(text(node, "title"), type), 0, 80));
        component.put("sort", readSort(node.path("sort"), defaultSort));
        component.put("props", normalizeProps(node.path("props"), type));
        return component;
    }

    private Map<String, Object> normalizeProps(JsonNode propsNode, String type) {
        Map<String, Object> props = new LinkedHashMap<>();
        if (propsNode != null && propsNode.isObject()) {
            propsNode.fields().forEachRemaining(entry -> props.put(entry.getKey(), readValue(entry.getValue())));
        }

        if (props.isEmpty()) {
            props.putAll(defaultProps(type));
            return props;
        }

        if ("title".equals(type)) {
            props.put("text", StringUtils.substring(stringValue(props.get("text"), "Page Title"), 0, 120));
            props.put("align", StringUtils.blankToDefault(stringValue(props.get("align"), "left"), "left"));
        } else if ("image".equals(type)) {
            props.put("url", StringUtils.substring(stringValue(props.get("url"), ""), 0, 500));
            props.put("mode", StringUtils.blankToDefault(stringValue(props.get("mode"), "cover"), "cover"));
            props.put("height", readNumber(props.get("height"), 320));
        } else if ("masonry".equals(type)) {
            props.put("items", normalizeCardItems(props.get("items"), "Block"));
        } else if ("textnav".equals(type)) {
            props.put("items", normalizeNavItems(props.get("items")));
        } else if ("store".equals(type)) {
            props.put("showPhone", readBoolean(props.get("showPhone"), true));
            props.put("showAddress", readBoolean(props.get("showAddress"), true));
        } else if ("spacer".equals(type)) {
            props.put("height", readNumber(props.get("height"), 16));
        } else if ("divider".equals(type)) {
            props.put("style", StringUtils.blankToDefault(stringValue(props.get("style"), "solid"), "solid"));
        }
        return props;
    }

    private List<Map<String, Object>> normalizeCardItems(Object value, String fallbackPrefix) {
        List<Map<String, Object>> items = new ArrayList<>();
        if (value instanceof Collection<?> collection) {
            int index = 1;
            for (Object item : collection) {
                items.add(normalizeCardItem(item, fallbackPrefix + " " + index));
                index += 1;
            }
        }
        if (items.isEmpty()) {
            items.add(normalizeCardItem(Map.of(), fallbackPrefix + " 1"));
        }
        return items;
    }

    private List<Map<String, Object>> normalizeNavItems(Object value) {
        List<Map<String, Object>> items = new ArrayList<>();
        if (value instanceof Collection<?> collection) {
            int index = 1;
            for (Object item : collection) {
                items.add(normalizeNavItem(item, "Nav " + index));
                index += 1;
            }
        }
        if (items.isEmpty()) {
            items.add(normalizeNavItem(Map.of(), "Nav 1"));
        }
        return items;
    }

    private Map<String, Object> normalizeCardItem(Object value, String fallbackTitle) {
        Map<String, Object> item = new LinkedHashMap<>();
        if (value instanceof Map<?, ?> map) {
            Object title = map.containsKey("title") ? map.get("title") : fallbackTitle;
            item.put("title", StringUtils.substring(stringValue(title, fallbackTitle), 0, 80));
            item.put("image", StringUtils.substring(stringValue(map.get("image"), ""), 0, 500));
            item.put("link", StringUtils.substring(stringValue(map.get("link"), ""), 0, 500));
        } else {
            item.put("title", fallbackTitle);
            item.put("image", "");
            item.put("link", "");
        }
        return item;
    }

    private Map<String, Object> normalizeNavItem(Object value, String fallbackLabel) {
        Map<String, Object> item = new LinkedHashMap<>();
        if (value instanceof Map<?, ?> map) {
            Object label = map.containsKey("label") ? map.get("label") : map.get("title");
            item.put("label", StringUtils.substring(stringValue(label, fallbackLabel), 0, 80));
            item.put("link", StringUtils.substring(stringValue(map.get("link"), ""), 0, 500));
            item.put("icon", StringUtils.substring(stringValue(map.get("icon"), "link"), 0, 40));
        } else {
            item.put("label", fallbackLabel);
            item.put("link", "");
            item.put("icon", "link");
        }
        return item;
    }

    private Object readValue(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isBoolean()) {
            return node.asBoolean();
        }
        if (node.isIntegralNumber()) {
            return node.asLong();
        }
        if (node.isNumber()) {
            return node.asDouble();
        }
        if (node.isArray()) {
            List<Object> values = new ArrayList<>();
            for (JsonNode item : node) {
                values.add(readValue(item));
            }
            return values;
        }
        if (node.isObject()) {
            Map<String, Object> values = new LinkedHashMap<>();
            node.fields().forEachRemaining(entry -> values.put(entry.getKey(), readValue(entry.getValue())));
            return values;
        }
        return StringUtils.trimToEmpty(node.asText(""));
    }

    private Map<String, Object> defaultProps(String type) {
        return switch (type) {
            case "title" -> Map.of("text", "Page Title", "align", "left");
            case "image" -> Map.of("url", "", "mode", "cover", "height", 320);
            case "masonry" -> Map.of("items", List.of(Map.of("title", "Block 1", "image", "", "link", "")));
            case "textnav" -> Map.of("items", List.of(Map.of("label", "Nav 1", "link", "", "icon", "link")));
            case "store" -> Map.of("showPhone", true, "showAddress", true);
            case "spacer" -> Map.of("height", 16);
            case "divider" -> Map.of("style", "solid");
            default -> Map.of();
        };
    }

    private int readSort(JsonNode sortNode, int defaultSort) {
        if (sortNode == null || sortNode.isMissingNode() || !sortNode.canConvertToInt()) {
            return defaultSort;
        }
        return Math.max(1, sortNode.asInt(defaultSort));
    }

    private long readNumber(Object value, long defaultValue) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (Exception ex) {
            return defaultValue;
        }
    }

    private boolean readBoolean(Object value, boolean defaultValue) {
        if (value instanceof Boolean bool) {
            return bool;
        }
        if (value == null) {
            return defaultValue;
        }
        return Boolean.parseBoolean(String.valueOf(value));
    }

    private String text(JsonNode node, String key) {
        JsonNode value = node.path(key);
        return value.isMissingNode() || value.isNull() ? "" : StringUtils.trimToEmpty(value.asText(""));
    }

    private String stringValue(Object value, String defaultValue) {
        String text = value == null ? "" : String.valueOf(value);
        return StringUtils.isBlank(text) || "null".equalsIgnoreCase(text) ? defaultValue : text;
    }

    private String defaultConfigJson() {
        try {
            return objectMapper.writeValueAsString(Map.of("components", buildDefaultComponents()));
        } catch (JsonProcessingException ex) {
            return "{\"components\":[]}";
        }
    }

    private List<Map<String, Object>> buildDefaultComponents() {
        List<Map<String, Object>> components = new ArrayList<>();
        components.add(component("title", "Hero Title", Map.of("text", "Spring Campaign", "align", "left"), 1));
        components.add(component("image", "Hero Image", Map.of("url", "", "height", 320, "mode", "cover"), 2));
        components.add(component("textnav", "Quick Links", Map.of(
            "items", List.of(
                Map.of("label", "Book", "link", "", "icon", "calendar"),
                Map.of("label", "Visit", "link", "", "icon", "map")
            )
        ), 3));
        components.add(component("store", "Store Info", Map.of("showPhone", true, "showAddress", true), 4));
        components.add(component("masonry", "Highlights", Map.of(
            "items", List.of(
                Map.of("title", "Offer", "image", "", "link", ""),
                Map.of("title", "Product", "image", "", "link", "")
            )
        ), 5));
        components.add(component("spacer", "Spacer", Map.of("height", 16), 6));
        components.add(component("divider", "Divider", Map.of("style", "solid"), 7));
        return components;
    }

    private Map<String, Object> component(String type, String title, Map<String, Object> props, int sort) {
        Map<String, Object> component = new LinkedHashMap<>();
        component.put("id", type + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        component.put("type", type);
        component.put("title", title);
        component.put("sort", sort);
        component.put("props", props);
        return component;
    }

    private String generateUniqueLinkKey() {
        for (int i = 0; i < 5; i += 1) {
            String linkKey = "mp" + UUID.randomUUID().toString().replace("-", "").substring(0, 18);
            Long count = baseMapper.selectCount(Wrappers.<YyMerchantMicroPage>lambdaQuery().eq(YyMerchantMicroPage::getLinkKey, linkKey));
            if (count == null || count == 0) {
                return linkKey;
            }
        }
        return "mp" + UUID.randomUUID().toString().replace("-", "");
    }

    private void applyStoreScope(LambdaQueryWrapper<YyMerchantMicroPage> lqw, Long requestedStoreId) {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (!storeScope.applicable() || storeScope.globalScope()) {
            lqw.eq(requestedStoreId != null, YyMerchantMicroPage::getStoreId, requestedStoreId);
            return;
        }

        Set<Long> scopedStoreIds = storeScope.storeIds();
        if (scopedStoreIds.isEmpty()) {
            lqw.apply("1 = 0");
            return;
        }
        if (requestedStoreId == null) {
            lqw.in(YyMerchantMicroPage::getStoreId, scopedStoreIds);
            return;
        }
        if (scopedStoreIds.contains(requestedStoreId)) {
            lqw.eq(YyMerchantMicroPage::getStoreId, requestedStoreId);
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
