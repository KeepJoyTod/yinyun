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
import org.dromara.yy.domain.YyMicroForm;
import org.dromara.yy.domain.YyMicroFormSubmission;
import org.dromara.yy.domain.bo.ClientMicroFormSubmitRequest;
import org.dromara.yy.domain.bo.YyMicroFormBo;
import org.dromara.yy.domain.vo.ClientMicroFormSubmitVo;
import org.dromara.yy.domain.vo.ClientMicroFormVo;
import org.dromara.yy.domain.vo.YyMicroFormVo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyMicroFormMapper;
import org.dromara.yy.mapper.YyMicroFormSubmissionMapper;
import org.dromara.yy.service.IYyMicroFormService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
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
public class YyMicroFormServiceImpl implements IYyMicroFormService {

    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_PUBLISHED = "PUBLISHED";
    private static final String STATUS_OFFLINE = "OFFLINE";
    private static final String SUBMISSION_PENDING = "PENDING";
    private static final Long TENANT_SCOPE_STORE_ID = 0L;
    private static final int MAX_FIELD_COUNT = 50;
    private static final Set<String> ALLOWED_FIELD_TYPES = Set.of(
        "text", "select", "checkbox", "radio", "textarea", "label", "date"
    );
    private static final Set<String> OPTION_FIELD_TYPES = Set.of("select", "checkbox", "radio");
    private static final Set<String> FORM_STATUSES = Set.of(STATUS_DRAFT, STATUS_PUBLISHED, STATUS_OFFLINE);

    private final YyMicroFormMapper baseMapper;
    private final YyMicroFormSubmissionMapper submissionMapper;
    private final ObjectMapper objectMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;

    @Value("${yy.client-booking.default-tenant-id:000000}")
    private String clientDefaultTenantId = "000000";

    @Autowired
    public YyMicroFormServiceImpl(
        YyMicroFormMapper baseMapper,
        YyMicroFormSubmissionMapper submissionMapper,
        ObjectMapper objectMapper,
        YyEmployeeMapper employeeMapper,
        YyEmployeeStoreMapper employeeStoreMapper
    ) {
        this.baseMapper = baseMapper;
        this.submissionMapper = submissionMapper;
        this.objectMapper = objectMapper;
        this.employeeMapper = employeeMapper;
        this.employeeStoreMapper = employeeStoreMapper;
    }

    YyMicroFormServiceImpl(
        YyMicroFormMapper baseMapper,
        YyMicroFormSubmissionMapper submissionMapper,
        ObjectMapper objectMapper
    ) {
        this(baseMapper, submissionMapper, objectMapper, null, null);
    }

    @Override
    public YyMicroFormVo queryById(Long id) {
        YyMicroFormVo vo = baseMapper.selectVoById(id);
        if (vo != null && !canAccessStore(vo.getStoreId())) {
            return null;
        }
        if (vo != null) {
            fillSubmissionCount(List.of(vo));
        }
        return vo;
    }

    @Override
    public TableDataInfo<YyMicroFormVo> queryPageList(YyMicroFormBo bo, PageQuery pageQuery) {
        Page<YyMicroFormVo> result = baseMapper.selectVoPage(pageQuery.build(), buildQueryWrapper(bo));
        fillSubmissionCount(result.getRecords());
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyMicroFormVo> queryList(YyMicroFormBo bo) {
        List<YyMicroFormVo> list = baseMapper.selectVoList(buildQueryWrapper(bo));
        fillSubmissionCount(list);
        return list;
    }

    private LambdaQueryWrapper<YyMicroForm> buildQueryWrapper(YyMicroFormBo bo) {
        LambdaQueryWrapper<YyMicroForm> lqw = Wrappers.lambdaQuery();
        if (bo == null) {
            applyStoreScope(lqw, null);
            lqw.orderByDesc(YyMicroForm::getPublishedAt);
            lqw.orderByDesc(YyMicroForm::getUpdateTime);
            lqw.orderByDesc(YyMicroForm::getId);
            return lqw;
        }
        applyStoreScope(lqw, bo.getStoreId());
        lqw.like(StringUtils.isNotBlank(bo.getFormName()), YyMicroForm::getFormName, bo.getFormName());
        lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyMicroForm::getStatus, normalizeStatus(bo.getStatus(), null));
        lqw.eq(StringUtils.isNotBlank(bo.getLinkKey()), YyMicroForm::getLinkKey, StringUtils.trimToEmpty(bo.getLinkKey()));
        lqw.orderByDesc(YyMicroForm::getPublishedAt);
        lqw.orderByDesc(YyMicroForm::getUpdateTime);
        lqw.orderByDesc(YyMicroForm::getId);
        return lqw;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean insertByBo(YyMicroFormBo bo) {
        YyMicroForm add = BeanUtil.toBean(bo, YyMicroForm.class);
        prepareForSave(add, null);
        requireStoreAccess(add.getStoreId(), "No permission to create this micro form");
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
    public Boolean updateByBo(YyMicroFormBo bo) {
        YyMicroForm existing = baseMapper.selectById(bo.getId());
        if (existing == null) {
            throw new ServiceException("Micro form does not exist");
        }
        requireStoreAccess(existing.getStoreId(), "No permission to update this micro form");
        YyMicroForm update = BeanUtil.toBean(bo, YyMicroForm.class);
        if (StringUtils.isBlank(update.getStatus())) {
            update.setStatus(existing.getStatus());
        }
        if (StringUtils.isBlank(update.getLinkKey())) {
            update.setLinkKey(existing.getLinkKey());
        }
        if (update.getPublishedAt() == null) {
            update.setPublishedAt(existing.getPublishedAt());
        }
        prepareForSave(update, existing);
        requireStoreAccess(update.getStoreId(), "No permission to update this micro form");
        return baseMapper.updateById(update) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyMicroFormVo publish(Long id) {
        YyMicroForm existing = requireForm(id);
        YyMicroForm update = new YyMicroForm();
        update.setId(id);
        update.setStatus(STATUS_PUBLISHED);
        update.setPublishedAt(new Date());
        update.setLinkKey(StringUtils.blankToDefault(existing.getLinkKey(), generateUniqueLinkKey()));
        update.setSchemaJson(normalizeSchemaJson(existing.getSchemaJson()));
        if (baseMapper.updateById(update) <= 0) {
            throw new ServiceException("Failed to publish micro form");
        }
        return queryById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyMicroFormVo offline(Long id) {
        requireForm(id);
        YyMicroForm update = new YyMicroForm();
        update.setId(id);
        update.setStatus(STATUS_OFFLINE);
        if (baseMapper.updateById(update) <= 0) {
            throw new ServiceException("Failed to offline micro form");
        }
        return queryById(id);
    }

    private void prepareForSave(YyMicroForm entity, YyMicroForm existing) {
        if ((entity.getStoreId() == null || entity.getStoreId() < 0) && existing != null && existing.getStoreId() != null) {
            entity.setStoreId(existing.getStoreId());
        } else {
            entity.setStoreId(entity.getStoreId() == null || entity.getStoreId() < 0 ? TENANT_SCOPE_STORE_ID : entity.getStoreId());
        }
        entity.setFormName(StringUtils.substring(StringUtils.trimToEmpty(entity.getFormName()), 0, 120));
        if (StringUtils.isBlank(entity.getFormName())) {
            throw new ServiceException("formName is required");
        }
        entity.setSchemaJson(normalizeSchemaJson(entity.getSchemaJson()));
        entity.setNotifyUsers(StringUtils.substring(StringUtils.trimToEmpty(entity.getNotifyUsers()), 0, 500));
        entity.setStatus(normalizeStatus(entity.getStatus(), STATUS_DRAFT));
        if (StringUtils.isBlank(entity.getLinkKey())) {
            entity.setLinkKey(generateUniqueLinkKey());
        }
        if (STATUS_PUBLISHED.equals(entity.getStatus())) {
            if (entity.getPublishedAt() == null) {
                entity.setPublishedAt(new Date());
            }
        } else if (existing == null) {
            entity.setPublishedAt(null);
        }
        entity.setRemark(StringUtils.substring(StringUtils.trimToEmpty(entity.getRemark()), 0, 500));
    }

    private String normalizeStatus(String rawStatus, String defaultStatus) {
        String status = StringUtils.blankToDefault(rawStatus, defaultStatus);
        if (StringUtils.isBlank(status)) {
            return status;
        }
        status = status.trim().toUpperCase(Locale.ROOT);
        if (!FORM_STATUSES.contains(status)) {
            throw new ServiceException("Unsupported micro form status: " + status);
        }
        return status;
    }

    private String normalizeSchemaJson(String schemaJson) {
        String source = StringUtils.trimToEmpty(schemaJson);
        if (StringUtils.isBlank(source)) {
            throw new ServiceException("schemaJson is required");
        }
        try {
            JsonNode root = objectMapper.readTree(source);
            JsonNode fieldsNode = root.isArray() ? root : root.path("fields");
            if (!fieldsNode.isArray() || fieldsNode.isEmpty()) {
                throw new ServiceException("At least one field is required");
            }
            if (fieldsNode.size() > MAX_FIELD_COUNT) {
                throw new ServiceException("Too many fields");
            }

            List<Map<String, Object>> fields = new ArrayList<>();
            int index = 1;
            for (JsonNode fieldNode : fieldsNode) {
                fields.add(normalizeField(fieldNode, index));
                index += 1;
            }
            fields.sort(Comparator.comparingInt(field -> (Integer) field.get("sort")));

            Map<String, Object> normalized = new LinkedHashMap<>();
            normalized.put("fields", fields);
            return objectMapper.writeValueAsString(normalized);
        } catch (ServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ServiceException("schemaJson is invalid");
        }
    }

    private Map<String, Object> normalizeField(JsonNode fieldNode, int defaultSort) {
        String id = text(fieldNode, "id");
        String type = text(fieldNode, "type").toLowerCase(Locale.ROOT);
        String label = text(fieldNode, "label");
        if (StringUtils.isBlank(id) || StringUtils.isBlank(type) || StringUtils.isBlank(label)) {
            throw new ServiceException("Field id, type and label are required");
        }
        if (!ALLOWED_FIELD_TYPES.contains(type)) {
            throw new ServiceException("Unsupported field type: " + type);
        }

        Map<String, Object> field = new LinkedHashMap<>();
        field.put("id", StringUtils.substring(id, 0, 64));
        field.put("type", type);
        field.put("label", StringUtils.substring(label, 0, 80));
        field.put("required", fieldNode.path("required").asBoolean(false));
        field.put("placeholder", StringUtils.substring(text(fieldNode, "placeholder"), 0, 120));
        field.put("options", normalizeOptions(fieldNode.path("options"), type));
        field.put("sort", readSort(fieldNode.path("sort"), defaultSort));
        return field;
    }

    private List<String> normalizeOptions(JsonNode optionsNode, String type) {
        List<String> options = new ArrayList<>();
        if (optionsNode.isArray()) {
            for (JsonNode optionNode : optionsNode) {
                String option = StringUtils.substring(StringUtils.trimToEmpty(optionNode.asText("")), 0, 80);
                if (StringUtils.isNotBlank(option)) {
                    options.add(option);
                }
            }
        }
        if (OPTION_FIELD_TYPES.contains(type) && options.isEmpty()) {
            throw new ServiceException("Options are required for choice fields");
        }
        return options;
    }

    private int readSort(JsonNode sortNode, int defaultSort) {
        if (sortNode == null || sortNode.isMissingNode() || !sortNode.canConvertToInt()) {
            return defaultSort;
        }
        return Math.max(1, sortNode.asInt(defaultSort));
    }

    private String text(JsonNode node, String key) {
        JsonNode value = node.path(key);
        return value.isMissingNode() || value.isNull() ? "" : StringUtils.trimToEmpty(value.asText(""));
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyMicroForm> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size() || list.stream().anyMatch(form -> !canAccessStore(form.getStoreId()))) {
                throw new ServiceException("No permission to delete these micro forms");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }

    @Override
    public ClientMicroFormVo publicForm(String idOrKey) {
        return TenantHelper.dynamic(clientDefaultTenantId, () -> doPublicForm(idOrKey));
    }

    private ClientMicroFormVo doPublicForm(String idOrKey) {
        YyMicroForm form = requirePublishedForm(idOrKey);
        ClientMicroFormVo vo = new ClientMicroFormVo();
        vo.setId(form.getId());
        vo.setStoreId(form.getStoreId());
        vo.setFormName(form.getFormName());
        vo.setStatus(form.getStatus());
        vo.setSchemaJson(form.getSchemaJson());
        vo.setLinkKey(form.getLinkKey());
        vo.setPublishedAt(form.getPublishedAt());
        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ClientMicroFormSubmitVo submitPublicForm(String idOrKey, ClientMicroFormSubmitRequest request) {
        return TenantHelper.dynamic(clientDefaultTenantId, () -> doSubmitPublicForm(idOrKey, request));
    }

    private ClientMicroFormSubmitVo doSubmitPublicForm(String idOrKey, ClientMicroFormSubmitRequest request) {
        YyMicroForm form = requirePublishedForm(idOrKey);
        Map<String, Object> answers = normalizeAnswers(request.getAnswers());
        validateRequiredAnswers(form.getSchemaJson(), answers);

        String customerName = firstNotBlank(
            request.getCustomerName(),
            answerText(answers, "customerName"),
            answerText(answers, "name"),
            answerByLabel(form.getSchemaJson(), answers, "\u59d3\u540d")
        );
        String customerPhone = firstNotBlank(
            request.getCustomerPhone(),
            answerText(answers, "customerPhone"),
            answerText(answers, "mobile"),
            answerText(answers, "phone"),
            answerByLabel(form.getSchemaJson(), answers, "\u624b\u673a"),
            answerByLabel(form.getSchemaJson(), answers, "\u7535\u8bdd")
        );

        YyMicroFormSubmission add = new YyMicroFormSubmission();
        add.setTenantId(clientDefaultTenantId);
        add.setFormId(form.getId());
        add.setFormNameSnapshot(form.getFormName());
        add.setCustomerName(StringUtils.substring(StringUtils.trimToEmpty(customerName), 0, 64));
        add.setCustomerPhone(StringUtils.substring(StringUtils.trimToEmpty(customerPhone), 0, 32));
        add.setAnswersJson(toJson(answers));
        add.setSubmittedAt(new Date());
        add.setFollowStatus(SUBMISSION_PENDING);
        add.setFollowRemark("");
        add.setRemark("");

        if (submissionMapper.insert(add) <= 0) {
            throw new ServiceException("Failed to submit micro form");
        }

        ClientMicroFormSubmitVo vo = new ClientMicroFormSubmitVo();
        vo.setSubmissionId(add.getId());
        vo.setStatus(add.getFollowStatus());
        vo.setSubmittedAt(add.getSubmittedAt());
        return vo;
    }

    private YyMicroForm requirePublishedForm(String idOrKey) {
        String normalized = StringUtils.trimToEmpty(idOrKey);
        if (StringUtils.isBlank(normalized)) {
            throw new ServiceException("Micro form does not exist");
        }
        LambdaQueryWrapper<YyMicroForm> wrapper = Wrappers.lambdaQuery();
        if (normalized.matches("\\d+")) {
            wrapper.eq(YyMicroForm::getId, Long.parseLong(normalized));
        } else {
            wrapper.eq(YyMicroForm::getLinkKey, normalized);
        }
        YyMicroForm form = baseMapper.selectOne(wrapper);
        if (form == null || !STATUS_PUBLISHED.equals(form.getStatus())) {
            throw new ServiceException("Micro form does not exist or is not published");
        }
        return form;
    }

    private YyMicroForm requireForm(Long id) {
        YyMicroForm form = baseMapper.selectById(id);
        if (form == null) {
            throw new ServiceException("Micro form does not exist");
        }
        requireStoreAccess(form.getStoreId(), "No permission to operate this micro form");
        return form;
    }

    private Map<String, Object> normalizeAnswers(Map<String, Object> source) {
        Map<String, Object> result = new LinkedHashMap<>();
        if (source == null) {
            return result;
        }
        source.forEach((key, value) -> {
            String normalizedKey = StringUtils.trimToEmpty(key);
            if (StringUtils.isNotBlank(normalizedKey)) {
                result.put(normalizedKey, value);
            }
        });
        return result;
    }

    private void validateRequiredAnswers(String schemaJson, Map<String, Object> answers) {
        try {
            JsonNode fields = objectMapper.readTree(schemaJson).path("fields");
            for (JsonNode field : fields) {
                if (!field.path("required").asBoolean(false) || "label".equals(text(field, "type"))) {
                    continue;
                }
                String id = text(field, "id");
                Object value = answers.get(id);
                if (isBlankAnswer(value)) {
                    throw new ServiceException(text(field, "label") + " is required");
                }
            }
        } catch (ServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ServiceException("Micro form schema is invalid");
        }
    }

    private boolean isBlankAnswer(Object value) {
        if (value == null) {
            return true;
        }
        if (value instanceof String text) {
            return StringUtils.isBlank(text);
        }
        if (value instanceof Collection<?> collection) {
            return collection.isEmpty();
        }
        return false;
    }

    private String answerText(Map<String, Object> answers, String key) {
        Object value = answers.get(key);
        return value == null ? "" : StringUtils.trimToEmpty(String.valueOf(value));
    }

    private String answerByLabel(String schemaJson, Map<String, Object> answers, String labelKeyword) {
        try {
            JsonNode fields = objectMapper.readTree(schemaJson).path("fields");
            for (JsonNode field : fields) {
                String label = text(field, "label");
                if (label.contains(labelKeyword)) {
                    String answer = answerText(answers, text(field, "id"));
                    if (StringUtils.isNotBlank(answer)) {
                        return answer;
                    }
                }
            }
        } catch (Exception ignored) {
            return "";
        }
        return "";
    }

    private String firstNotBlank(String... values) {
        for (String value : values) {
            if (StringUtils.isNotBlank(value)) {
                return StringUtils.trimToEmpty(value);
            }
        }
        return "";
    }

    private String toJson(Map<String, Object> answers) {
        try {
            return objectMapper.writeValueAsString(answers);
        } catch (JsonProcessingException ex) {
            throw new ServiceException("answers is invalid");
        }
    }

    private String generateUniqueLinkKey() {
        for (int i = 0; i < 5; i += 1) {
            String linkKey = "mf" + UUID.randomUUID().toString().replace("-", "").substring(0, 18);
            Long count = baseMapper.selectCount(Wrappers.<YyMicroForm>lambdaQuery().eq(YyMicroForm::getLinkKey, linkKey));
            if (count == null || count == 0) {
                return linkKey;
            }
        }
        return "mf" + UUID.randomUUID().toString().replace("-", "");
    }

    private void fillSubmissionCount(List<YyMicroFormVo> forms) {
        if (forms == null || forms.isEmpty()) {
            return;
        }
        for (YyMicroFormVo form : forms) {
            if (form == null || form.getId() == null) {
                continue;
            }
            Long count = submissionMapper.selectCount(
                Wrappers.<YyMicroFormSubmission>lambdaQuery().eq(YyMicroFormSubmission::getFormId, form.getId())
            );
            form.setSubmissionCount(count == null ? 0L : count);
        }
    }

    private void applyStoreScope(LambdaQueryWrapper<YyMicroForm> lqw, Long requestedStoreId) {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (!storeScope.applicable() || storeScope.globalScope()) {
            lqw.eq(requestedStoreId != null, YyMicroForm::getStoreId, requestedStoreId);
            return;
        }

        Set<Long> scopedStoreIds = storeScope.storeIds();
        if (scopedStoreIds.isEmpty()) {
            lqw.apply("1 = 0");
            return;
        }
        if (requestedStoreId == null) {
            lqw.in(YyMicroForm::getStoreId, scopedStoreIds);
            return;
        }
        if (scopedStoreIds.contains(requestedStoreId)) {
            lqw.eq(YyMicroForm::getStoreId, requestedStoreId);
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
