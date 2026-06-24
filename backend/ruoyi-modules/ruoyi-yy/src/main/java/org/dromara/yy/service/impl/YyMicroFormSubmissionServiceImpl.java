package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyMicroForm;
import org.dromara.yy.domain.YyMicroFormSubmission;
import org.dromara.yy.domain.bo.YyMicroFormFollowBo;
import org.dromara.yy.domain.bo.YyMicroFormSubmissionBo;
import org.dromara.yy.domain.vo.YyMicroFormSubmissionVo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyMicroFormMapper;
import org.dromara.yy.mapper.YyMicroFormSubmissionMapper;
import org.dromara.yy.service.IYyMicroFormSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
public class YyMicroFormSubmissionServiceImpl implements IYyMicroFormSubmissionService {

    private static final Set<String> FOLLOW_STATUSES = Set.of("PENDING", "FOLLOWED", "CLOSED");
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final YyMicroFormSubmissionMapper baseMapper;
    private final ObjectMapper objectMapper;
    private final YyMicroFormMapper formMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;

    @Autowired
    public YyMicroFormSubmissionServiceImpl(
        YyMicroFormSubmissionMapper baseMapper,
        ObjectMapper objectMapper,
        YyMicroFormMapper formMapper,
        YyEmployeeMapper employeeMapper,
        YyEmployeeStoreMapper employeeStoreMapper
    ) {
        this.baseMapper = baseMapper;
        this.objectMapper = objectMapper;
        this.formMapper = formMapper;
        this.employeeMapper = employeeMapper;
        this.employeeStoreMapper = employeeStoreMapper;
    }

    YyMicroFormSubmissionServiceImpl(YyMicroFormSubmissionMapper baseMapper, ObjectMapper objectMapper) {
        this(baseMapper, objectMapper, null, null, null);
    }

    @Override
    public YyMicroFormSubmissionVo queryById(Long id) {
        YyMicroFormSubmissionVo vo = baseMapper.selectVoById(id);
        if (vo != null && !canAccessForm(vo.getFormId())) {
            return null;
        }
        return vo;
    }

    @Override
    public TableDataInfo<YyMicroFormSubmissionVo> queryPageList(YyMicroFormSubmissionBo bo, PageQuery pageQuery) {
        Page<YyMicroFormSubmissionVo> result = baseMapper.selectVoPage(pageQuery.build(), buildQueryWrapper(bo));
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyMicroFormSubmissionVo> queryList(YyMicroFormSubmissionBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    private LambdaQueryWrapper<YyMicroFormSubmission> buildQueryWrapper(YyMicroFormSubmissionBo bo) {
        LambdaQueryWrapper<YyMicroFormSubmission> lqw = Wrappers.lambdaQuery();
        if (bo == null) {
            applyFormScope(lqw, null);
            lqw.orderByDesc(YyMicroFormSubmission::getSubmittedAt);
            lqw.orderByDesc(YyMicroFormSubmission::getId);
            return lqw;
        }
        applyFormScope(lqw, bo.getFormId());
        lqw.like(StringUtils.isNotBlank(bo.getFormNameSnapshot()), YyMicroFormSubmission::getFormNameSnapshot, bo.getFormNameSnapshot());
        lqw.like(StringUtils.isNotBlank(bo.getCustomerName()), YyMicroFormSubmission::getCustomerName, bo.getCustomerName());
        lqw.like(StringUtils.isNotBlank(bo.getCustomerPhone()), YyMicroFormSubmission::getCustomerPhone, bo.getCustomerPhone());
        lqw.eq(StringUtils.isNotBlank(bo.getFollowStatus()), YyMicroFormSubmission::getFollowStatus, normalizeFollowStatus(bo.getFollowStatus(), null));
        lqw.orderByDesc(YyMicroFormSubmission::getSubmittedAt);
        lqw.orderByDesc(YyMicroFormSubmission::getId);
        return lqw;
    }

    @Override
    public Boolean insertByBo(YyMicroFormSubmissionBo bo) {
        YyMicroFormSubmission add = BeanUtil.toBean(bo, YyMicroFormSubmission.class);
        requireFormAccess(add.getFormId(), "No permission to create this submission");
        validEntityBeforeSave(add);
        if (add.getSubmittedAt() == null) {
            add.setSubmittedAt(new Date());
        }
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyMicroFormSubmissionBo bo) {
        if (bo == null || bo.getId() == null) {
            throw new ServiceException("Submission id is required");
        }
        YyMicroFormSubmission existing = baseMapper.selectById(bo.getId());
        if (existing == null) {
            throw new ServiceException("Submission does not exist");
        }
        requireFormAccess(existing.getFormId(), "No permission to update this submission");
        YyMicroFormSubmission update = BeanUtil.toBean(bo, YyMicroFormSubmission.class);
        if (update.getFormId() == null) {
            update.setFormId(existing.getFormId());
        }
        requireFormAccess(update.getFormId(), "No permission to update this submission");
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    @Override
    public Boolean updateFollow(Long id, YyMicroFormFollowBo bo) {
        YyMicroFormSubmission existing = baseMapper.selectById(id);
        if (existing == null) {
            throw new ServiceException("Submission does not exist");
        }
        requireFormAccess(existing.getFormId(), "No permission to update this submission");
        YyMicroFormSubmission update = new YyMicroFormSubmission();
        update.setId(id);
        update.setFollowStatus(normalizeFollowStatus(bo.getFollowStatus(), "PENDING"));
        update.setFollowRemark(StringUtils.substring(StringUtils.trimToEmpty(bo.getFollowRemark()), 0, 500));
        update.setOrderId(bo.getOrderId());
        return baseMapper.updateById(update) > 0;
    }

    private void validEntityBeforeSave(YyMicroFormSubmission entity) {
        String source = StringUtils.trimToEmpty(entity.getAnswersJson());
        if (StringUtils.isBlank(source)) {
            throw new ServiceException("answersJson is required");
        }
        try {
            entity.setAnswersJson(objectMapper.writeValueAsString(objectMapper.readValue(source, MAP_TYPE)));
        } catch (Exception ex) {
            throw new ServiceException("answersJson is invalid");
        }
        entity.setFollowStatus(normalizeFollowStatus(entity.getFollowStatus(), "PENDING"));
        entity.setFormNameSnapshot(StringUtils.substring(StringUtils.trimToEmpty(entity.getFormNameSnapshot()), 0, 120));
        entity.setCustomerName(StringUtils.substring(StringUtils.trimToEmpty(entity.getCustomerName()), 0, 64));
        entity.setCustomerPhone(StringUtils.substring(StringUtils.trimToEmpty(entity.getCustomerPhone()), 0, 32));
        entity.setFollowRemark(StringUtils.substring(StringUtils.trimToEmpty(entity.getFollowRemark()), 0, 500));
        entity.setRemark(StringUtils.substring(StringUtils.trimToEmpty(entity.getRemark()), 0, 500));
    }

    private String normalizeFollowStatus(String rawStatus, String defaultStatus) {
        String status = StringUtils.blankToDefault(rawStatus, defaultStatus);
        if (StringUtils.isBlank(status)) {
            return status;
        }
        status = status.trim().toUpperCase(Locale.ROOT);
        if (!FOLLOW_STATUSES.contains(status)) {
            throw new ServiceException("Unsupported follow status: " + status);
        }
        return status;
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyMicroFormSubmission> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size() || list.stream().anyMatch(submission -> !canAccessForm(submission.getFormId()))) {
                throw new ServiceException("No permission to delete these submissions");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }

    private void applyFormScope(LambdaQueryWrapper<YyMicroFormSubmission> lqw, Long requestedFormId) {
        FormScope formScope = resolveCurrentFormScope();
        if (!formScope.applicable() || formScope.globalScope()) {
            lqw.eq(requestedFormId != null, YyMicroFormSubmission::getFormId, requestedFormId);
            return;
        }

        Set<Long> scopedFormIds = formScope.formIds();
        if (scopedFormIds.isEmpty()) {
            lqw.apply("1 = 0");
            return;
        }
        if (requestedFormId == null) {
            lqw.in(YyMicroFormSubmission::getFormId, scopedFormIds);
            return;
        }
        if (scopedFormIds.contains(requestedFormId)) {
            lqw.eq(YyMicroFormSubmission::getFormId, requestedFormId);
            return;
        }
        lqw.apply("1 = 0");
    }

    private void requireFormAccess(Long formId, String message) {
        if (!canAccessForm(formId)) {
            throw new ServiceException(message);
        }
    }

    private boolean canAccessForm(Long formId) {
        FormScope formScope = resolveCurrentFormScope();
        return !formScope.applicable()
            || formScope.globalScope()
            || (formId != null && formScope.formIds().contains(formId));
    }

    private FormScope resolveCurrentFormScope() {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (!storeScope.applicable()) {
            return FormScope.notApplicable();
        }
        if (storeScope.globalScope()) {
            return FormScope.global();
        }
        if (storeScope.storeIds().isEmpty() || formMapper == null) {
            return FormScope.empty();
        }
        List<YyMicroForm> forms = formMapper.selectList(Wrappers.<YyMicroForm>lambdaQuery()
            .select(YyMicroForm::getId)
            .in(YyMicroForm::getStoreId, storeScope.storeIds()));
        Set<Long> formIds = forms == null ? Set.of() : forms.stream()
            .map(YyMicroForm::getId)
            .filter(Objects::nonNull)
            .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
        return FormScope.limited(formIds);
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

    private record FormScope(boolean applicable, boolean globalScope, Set<Long> formIds) {
        private static FormScope notApplicable() {
            return new FormScope(false, false, Set.of());
        }

        private static FormScope global() {
            return new FormScope(true, true, Set.of());
        }

        private static FormScope empty() {
            return new FormScope(true, false, Set.of());
        }

        private static FormScope limited(Collection<Long> formIds) {
            return new FormScope(true, false, Set.copyOf(formIds));
        }
    }
}
