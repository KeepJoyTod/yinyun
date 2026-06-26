package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.json.utils.JsonUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyAsyncTask;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.vo.YyPlatformActionHintVo;
import org.dromara.yy.domain.vo.YyPlatformAsyncTaskDetailVo;
import org.dromara.yy.domain.vo.YyPlatformAsyncTaskRunVo;
import org.dromara.yy.domain.vo.YyPlatformAsyncTaskVo;
import org.dromara.yy.domain.vo.YyPlatformEvidenceVo;
import org.dromara.yy.domain.vo.YyReportFinanceExportPayloadVo;
import org.dromara.yy.domain.vo.YyReportFinanceExportTaskVo;
import org.dromara.yy.mapper.YyAsyncTaskMapper;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.service.IYyAsyncTaskService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class YyAsyncTaskServiceImpl implements IYyAsyncTaskService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final String TASK_NAME_FINANCE_EXPORT = "Finance reconciliation export";
    private static final String BUSINESS_TYPE_FINANCE = "REPORT_FINANCE";

    private final YyAsyncTaskMapper asyncTaskMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyReportFinanceExportTaskVo enqueueFinanceExportTask(YyReportFinanceExportPayloadVo payload) {
        if (payload == null) {
            throw new ServiceException("finance export payload cannot be empty");
        }
        String taskNo = "FIN-REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        YyAsyncTask entity = new YyAsyncTask();
        entity.setStoreId(payload.getRequestedStoreId());
        entity.setTaskNo(taskNo);
        entity.setTaskType(TASK_TYPE_FINANCE_EXPORT);
        entity.setTaskName(TASK_NAME_FINANCE_EXPORT);
        entity.setQueueName(QUEUE_PLATFORM_EXPORT);
        entity.setStatus("PENDING");
        entity.setRunStatus("PENDING");
        entity.setBusinessType(BUSINESS_TYPE_FINANCE);
        entity.setDateFrom(StringUtils.defaultString(payload.getDateFrom()));
        entity.setDateTo(StringUtils.defaultString(payload.getDateTo()));
        entity.setPayloadJson(JsonUtils.toJsonString(payload));
        entity.setRetryCount(0);
        entity.setMaxRetryCount(3);
        entity.setDownloadUrl(downloadPath(taskNo));
        entity.setAuditNote(buildAuditNote(payload));
        entity.setRemark("Created from /yy/reportFinanceReconciliation/export");
        entity.setDelFlag("0");
        asyncTaskMapper.insert(entity);
        return mapFinanceExportTask(entity);
    }

    @Override
    public List<YyReportFinanceExportTaskVo> listFinanceExportTasks(Long storeId, String dateFrom, String dateTo) {
        List<YyAsyncTask> rows = listAccessibleTasks(Wrappers.<YyAsyncTask>lambdaQuery()
            .eq(YyAsyncTask::getTaskType, TASK_TYPE_FINANCE_EXPORT)
            .eq(storeId != null, YyAsyncTask::getStoreId, storeId)
            .eq(StringUtils.isNotBlank(dateFrom), YyAsyncTask::getDateFrom, dateFrom)
            .eq(StringUtils.isNotBlank(dateTo), YyAsyncTask::getDateTo, dateTo)
            .orderByDesc(YyAsyncTask::getCreateTime));
        return rows.stream()
            .map(this::mapFinanceExportTask)
            .toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyAsyncTask claimNextTask(String taskType, String workerCode, Date now, Date claimExpireTime) {
        List<YyAsyncTask> candidates = asyncTaskMapper.selectList(Wrappers.<YyAsyncTask>lambdaQuery()
            .eq(YyAsyncTask::getTaskType, taskType)
            .and(wrapper -> wrapper
                .eq(YyAsyncTask::getStatus, "PENDING")
                .or(retry -> retry.eq(YyAsyncTask::getStatus, "RETRY")
                    .and(time -> time.isNull(YyAsyncTask::getNextRetryTime).or().le(YyAsyncTask::getNextRetryTime, now)))
                .or(running -> running.eq(YyAsyncTask::getStatus, "RUNNING")
                    .and(time -> time.isNotNull(YyAsyncTask::getClaimExpireTime).lt(YyAsyncTask::getClaimExpireTime, now))))
            .and(wrapper -> wrapper.isNull(YyAsyncTask::getClaimExpireTime).or().lt(YyAsyncTask::getClaimExpireTime, now))
            .orderByAsc(YyAsyncTask::getNextRetryTime)
            .orderByAsc(YyAsyncTask::getCreateTime)
            .last("limit 10"));
        for (YyAsyncTask candidate : safeList(candidates)) {
            YyAsyncTask update = new YyAsyncTask();
            update.setClaimedBy(workerCode);
            update.setClaimExpireTime(claimExpireTime);
            update.setRunStatus("CLAIMED");
            int changed = asyncTaskMapper.update(update, Wrappers.<YyAsyncTask>lambdaUpdate()
                .eq(YyAsyncTask::getId, candidate.getId())
                .and(wrapper -> wrapper.isNull(YyAsyncTask::getClaimExpireTime).or().lt(YyAsyncTask::getClaimExpireTime, now))
                .and(wrapper -> wrapper
                    .eq(YyAsyncTask::getStatus, "PENDING")
                    .or(retry -> retry.eq(YyAsyncTask::getStatus, "RETRY")
                        .and(time -> time.isNull(YyAsyncTask::getNextRetryTime).or().le(YyAsyncTask::getNextRetryTime, now)))
                    .or(running -> running.eq(YyAsyncTask::getStatus, "RUNNING")
                        .and(time -> time.isNotNull(YyAsyncTask::getClaimExpireTime).lt(YyAsyncTask::getClaimExpireTime, now)))));
            if (changed > 0) {
                return asyncTaskMapper.selectById(candidate.getId());
            }
        }
        return null;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markTaskRunning(Long taskId, String workerCode, Date startedTime) {
        asyncTaskMapper.update(new YyAsyncTask(), Wrappers.<YyAsyncTask>lambdaUpdate()
            .eq(YyAsyncTask::getId, taskId)
            .eq(StringUtils.isNotBlank(workerCode), YyAsyncTask::getClaimedBy, workerCode)
            .set(YyAsyncTask::getStatus, "RUNNING")
            .set(YyAsyncTask::getRunStatus, "RUNNING")
            .set(YyAsyncTask::getStartedTime, startedTime)
            .set(YyAsyncTask::getErrorMessage, ""));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markTaskSuccess(Long taskId, String workerCode, Long ossId, String fileName, String contentType, Long fileSizeBytes, String downloadUrl, Date finishedTime, Date expireTime, String auditNote) {
        asyncTaskMapper.update(new YyAsyncTask(), Wrappers.<YyAsyncTask>lambdaUpdate()
            .eq(YyAsyncTask::getId, taskId)
            .eq(StringUtils.isNotBlank(workerCode), YyAsyncTask::getClaimedBy, workerCode)
            .set(YyAsyncTask::getStatus, "COMPLETED")
            .set(YyAsyncTask::getRunStatus, "SUCCESS")
            .set(YyAsyncTask::getOssId, ossId)
            .set(YyAsyncTask::getFileName, StringUtils.defaultString(fileName))
            .set(YyAsyncTask::getContentType, StringUtils.defaultString(contentType))
            .set(YyAsyncTask::getFileSizeBytes, fileSizeBytes == null ? 0L : fileSizeBytes)
            .set(YyAsyncTask::getDownloadUrl, StringUtils.defaultString(downloadUrl))
            .set(YyAsyncTask::getFinishedTime, finishedTime)
            .set(YyAsyncTask::getExpireTime, expireTime)
            .set(YyAsyncTask::getErrorMessage, "")
            .set(YyAsyncTask::getAuditNote, StringUtils.defaultString(auditNote))
            .set(YyAsyncTask::getClaimedBy, "")
            .set(YyAsyncTask::getClaimExpireTime, null)
            .set(YyAsyncTask::getNextRetryTime, null));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markTaskRetry(Long taskId, String workerCode, String errorMessage, Date nextRetryTime) {
        YyAsyncTask existing = asyncTaskMapper.selectById(taskId);
        if (existing == null) {
            return;
        }
        int nextRetryCount = (existing.getRetryCount() == null ? 0 : existing.getRetryCount()) + 1;
        asyncTaskMapper.update(new YyAsyncTask(), Wrappers.<YyAsyncTask>lambdaUpdate()
            .eq(YyAsyncTask::getId, taskId)
            .eq(StringUtils.isNotBlank(workerCode), YyAsyncTask::getClaimedBy, workerCode)
            .set(YyAsyncTask::getStatus, "RETRY")
            .set(YyAsyncTask::getRunStatus, "RETRY")
            .set(YyAsyncTask::getRetryCount, nextRetryCount)
            .set(YyAsyncTask::getNextRetryTime, nextRetryTime)
            .set(YyAsyncTask::getErrorMessage, limitText(errorMessage, 500))
            .set(YyAsyncTask::getClaimedBy, "")
            .set(YyAsyncTask::getClaimExpireTime, null));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markTaskFailed(Long taskId, String workerCode, String errorMessage) {
        asyncTaskMapper.update(new YyAsyncTask(), Wrappers.<YyAsyncTask>lambdaUpdate()
            .eq(YyAsyncTask::getId, taskId)
            .eq(StringUtils.isNotBlank(workerCode), YyAsyncTask::getClaimedBy, workerCode)
            .set(YyAsyncTask::getStatus, "FAILED")
            .set(YyAsyncTask::getRunStatus, "FAILED")
            .set(YyAsyncTask::getFinishedTime, new Date())
            .set(YyAsyncTask::getErrorMessage, limitText(errorMessage, 500))
            .set(YyAsyncTask::getClaimedBy, "")
            .set(YyAsyncTask::getClaimExpireTime, null)
            .set(YyAsyncTask::getNextRetryTime, null));
    }

    @Override
    public List<YyPlatformAsyncTaskVo> listPlatformTaskSummaries() {
        Map<String, List<YyAsyncTask>> grouped = new LinkedHashMap<>();
        for (YyAsyncTask row : listAccessibleTasks(Wrappers.<YyAsyncTask>lambdaQuery()
            .orderByDesc(YyAsyncTask::getCreateTime)
            .last("limit 200"))) {
            grouped.computeIfAbsent(normalizeText(row.getTaskType()), ignored -> new ArrayList<>()).add(row);
        }
        List<YyPlatformAsyncTaskVo> result = new ArrayList<>();
        for (Map.Entry<String, List<YyAsyncTask>> entry : grouped.entrySet()) {
            YyAsyncTask latest = entry.getValue().stream()
                .max(Comparator.comparing(YyAsyncTask::getCreateTime, Comparator.nullsLast(Comparator.naturalOrder())))
                .orElse(null);
            if (latest == null) {
                continue;
            }
            YyPlatformAsyncTaskVo vo = new YyPlatformAsyncTaskVo();
            vo.setTaskType(entry.getKey());
            vo.setTaskName(StringUtils.defaultIfBlank(latest.getTaskName(), entry.getKey()));
            vo.setQueueName(StringUtils.defaultIfBlank(latest.getQueueName(), QUEUE_PLATFORM_EXPORT));
            vo.setLatestRunStatus(StringUtils.defaultIfBlank(latest.getRunStatus(), latest.getStatus()));
            vo.setRetentionPolicy(resolveRetentionPolicy(latest));
            vo.setStatus(taskCenterStatus(latest.getStatus()));
            vo.getEvidence().add(buildEvidence(latest));
            vo.getNextActions().add(buildAction("open_task_detail", "Open task detail", true, ""));
            result.add(vo);
        }
        return result;
    }

    @Override
    public YyPlatformAsyncTaskDetailVo getPlatformTaskDetail(String taskType) {
        List<YyAsyncTask> rows = listAccessibleTasks(Wrappers.<YyAsyncTask>lambdaQuery()
            .eq(YyAsyncTask::getTaskType, taskType)
            .orderByDesc(YyAsyncTask::getCreateTime)
            .last("limit 20"));
        if (rows.isEmpty()) {
            throw new ServiceException("任务类型不存在或无权限查看");
        }
        YyAsyncTask latest = rows.get(0);
        YyPlatformAsyncTaskDetailVo detail = new YyPlatformAsyncTaskDetailVo();
        detail.setTaskType(StringUtils.defaultString(latest.getTaskType()));
        detail.setTaskName(StringUtils.defaultIfBlank(latest.getTaskName(), latest.getTaskType()));
        detail.setQueueName(StringUtils.defaultIfBlank(latest.getQueueName(), QUEUE_PLATFORM_EXPORT));
        detail.setLatestRunStatus(StringUtils.defaultIfBlank(latest.getRunStatus(), latest.getStatus()));
        detail.setRetentionPolicy(resolveRetentionPolicy(latest));
        detail.setStatus(taskCenterStatus(latest.getStatus()));
        rows.stream().limit(5).map(this::buildEvidence).forEach(detail.getEvidence()::add);
        rows.stream().map(this::mapTaskRun).forEach(detail.getRuns()::add);
        return detail;
    }

    @Override
    public YyAsyncTask requireAccessibleTask(String taskId) {
        YyAsyncTask task = asyncTaskMapper.selectOne(Wrappers.<YyAsyncTask>lambdaQuery()
            .eq(YyAsyncTask::getTaskNo, taskId)
            .last("limit 1"));
        if (task == null) {
            throw new ServiceException("异步任务不存在");
        }
        if (!canAccessTask(task)) {
            throw new ServiceException("无权访问该异步任务");
        }
        return task;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int expireAccessibleDownloads(Date now, int batchSize) {
        List<YyAsyncTask> rows = asyncTaskMapper.selectList(Wrappers.<YyAsyncTask>lambdaQuery()
            .eq(YyAsyncTask::getTaskType, TASK_TYPE_FINANCE_EXPORT)
            .eq(YyAsyncTask::getStatus, "COMPLETED")
            .isNotNull(YyAsyncTask::getOssId)
            .le(YyAsyncTask::getExpireTime, now)
            .orderByAsc(YyAsyncTask::getExpireTime)
            .last("limit " + Math.max(1, batchSize)));
        int expired = 0;
        for (YyAsyncTask task : safeList(rows)) {
            expired += asyncTaskMapper.update(new YyAsyncTask(), Wrappers.<YyAsyncTask>lambdaUpdate()
                .eq(YyAsyncTask::getId, task.getId())
                .eq(YyAsyncTask::getStatus, "COMPLETED")
                .set(YyAsyncTask::getStatus, "EXPIRED")
                .set(YyAsyncTask::getRunStatus, "EXPIRED")
                .set(YyAsyncTask::getDownloadUrl, "")
                .set(YyAsyncTask::getAuditNote, appendAuditNote(task.getAuditNote(), "expired cleanup completed"))) > 0 ? 1 : 0;
        }
        return expired;
    }

    @Override
    public YyReportFinanceExportPayloadVo parseFinanceExportPayload(YyAsyncTask task) {
        if (task == null || StringUtils.isBlank(task.getPayloadJson())) {
            return null;
        }
        YyReportFinanceExportPayloadVo payload = JsonUtils.parseObject(task.getPayloadJson(), YyReportFinanceExportPayloadVo.class);
        if (payload == null) {
            return null;
        }
        payload.setScopedStoreIds(new ArrayList<>(sanitizeStoreIds(payload.getScopedStoreIds())));
        return payload;
    }

    private List<YyAsyncTask> listAccessibleTasks(com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<YyAsyncTask> query) {
        return safeList(asyncTaskMapper.selectList(query)).stream()
            .filter(this::canAccessTask)
            .toList();
    }

    private boolean canAccessTask(YyAsyncTask task) {
        if (task == null) {
            return false;
        }
        StoreScope scope = resolveCurrentStoreScope();
        if (!scope.applicable() || scope.globalScope()) {
            return true;
        }
        if (task.getStoreId() != null) {
            return scope.storeIds().contains(task.getStoreId());
        }
        Long currentUserId = LoginHelper.getUserId();
        return currentUserId != null && currentUserId.equals(task.getCreateBy());
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

    private YyReportFinanceExportTaskVo mapFinanceExportTask(YyAsyncTask entity) {
        YyReportFinanceExportTaskVo task = new YyReportFinanceExportTaskVo();
        task.setTaskId(StringUtils.defaultString(entity.getTaskNo()));
        task.setTaskType(StringUtils.defaultString(entity.getTaskType()));
        task.setStatus(StringUtils.defaultString(entity.getStatus()));
        task.setStoreId(entity.getStoreId());
        task.setDateFrom(StringUtils.defaultString(entity.getDateFrom()));
        task.setDateTo(StringUtils.defaultString(entity.getDateTo()));
        task.setCreatedTime(format(entity.getCreateTime()));
        task.setFinishedTime(format(entity.getFinishedTime()));
        task.setExpireTime(format(entity.getExpireTime()));
        task.setDownloadUrl(StringUtils.defaultString(entity.getDownloadUrl()));
        task.setFileName(StringUtils.defaultString(entity.getFileName()));
        task.setErrorMessage(StringUtils.defaultString(entity.getErrorMessage()));
        task.setAuditNote(StringUtils.defaultString(entity.getAuditNote()));
        return task;
    }

    private YyPlatformAsyncTaskRunVo mapTaskRun(YyAsyncTask row) {
        YyPlatformAsyncTaskRunVo run = new YyPlatformAsyncTaskRunVo();
        run.setTaskId(StringUtils.defaultString(row.getTaskNo()));
        run.setStatus(StringUtils.defaultString(row.getStatus()));
        run.setRunStatus(StringUtils.defaultIfBlank(row.getRunStatus(), row.getStatus()));
        run.setCreatedTime(format(row.getCreateTime()));
        run.setStartedTime(format(row.getStartedTime()));
        run.setFinishedTime(format(row.getFinishedTime()));
        run.setExpireTime(format(row.getExpireTime()));
        run.setDownloadUrl(StringUtils.defaultString(row.getDownloadUrl()));
        run.setFileName(StringUtils.defaultString(row.getFileName()));
        run.setContentType(StringUtils.defaultString(row.getContentType()));
        run.setErrorMessage(StringUtils.defaultString(row.getErrorMessage()));
        run.setAuditNote(StringUtils.defaultString(row.getAuditNote()));
        return run;
    }

    private YyPlatformEvidenceVo buildEvidence(YyAsyncTask task) {
        YyPlatformEvidenceVo vo = new YyPlatformEvidenceVo();
        vo.setSourceType("yy_async_task");
        vo.setSourceKey(StringUtils.defaultString(task.getTaskNo()));
        vo.setStatus(StringUtils.defaultIfBlank(task.getRunStatus(), task.getStatus()));
        vo.setMessage(StringUtils.defaultIfBlank(task.getAuditNote(), task.getErrorMessage()));
        vo.setRequestId("");
        vo.setEventTime(task.getUpdateTime() == null ? task.getCreateTime() : task.getUpdateTime());
        return vo;
    }

    private YyPlatformActionHintVo buildAction(String actionKey, String label, boolean enabled, String reason) {
        YyPlatformActionHintVo vo = new YyPlatformActionHintVo();
        vo.setActionKey(actionKey);
        vo.setLabel(label);
        vo.setEnabled(enabled);
        vo.setReason(reason);
        return vo;
    }

    private String buildAuditNote(YyReportFinanceExportPayloadVo payload) {
        String scope = payload.getScopedStoreIds() == null || payload.getScopedStoreIds().isEmpty()
            ? "ALL_SCOPES"
            : payload.getScopedStoreIds().stream().map(String::valueOf).collect(Collectors.joining(","));
        return "snapshot requestedStoreId=" + StringUtils.defaultString(payload.getRequestedStoreId() == null ? "" : String.valueOf(payload.getRequestedStoreId()))
            + ", scopedStoreIds=" + scope;
    }

    private String resolveRetentionPolicy(YyAsyncTask task) {
        if (task.getExpireTime() == null) {
            return "not configured";
        }
        return "expires at " + format(task.getExpireTime());
    }

    private String taskCenterStatus(String status) {
        String normalized = normalizeText(status);
        if ("COMPLETED".equals(normalized) || "SUCCESS".equals(normalized)) {
            return "ready";
        }
        if ("FAILED".equals(normalized) || "EXPIRED".equals(normalized) || "CANCELLED".equals(normalized)) {
            return "retired";
        }
        return "scaffold";
    }

    private String downloadPath(String taskNo) {
        return "/yy/reportFinanceReconciliation/export/tasks/" + taskNo + "/download";
    }

    private String appendAuditNote(String existing, String append) {
        if (StringUtils.isBlank(existing)) {
            return append;
        }
        return limitText(existing + "; " + append, 500);
    }

    private Set<Long> sanitizeStoreIds(Collection<Long> storeIds) {
        if (storeIds == null) {
            return Set.of();
        }
        return storeIds.stream()
            .filter(Objects::nonNull)
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private String format(Date value) {
        if (value == null) {
            return "";
        }
        return DATE_TIME_FORMATTER.format(LocalDateTime.ofInstant(value.toInstant(), ZoneId.systemDefault()));
    }

    private String normalizeText(String value) {
        return StringUtils.defaultString(value).trim().toUpperCase(Locale.ROOT);
    }

    private String limitText(String value, int maxLength) {
        if (StringUtils.isBlank(value) || value.length() <= maxLength) {
            return StringUtils.defaultString(value);
        }
        return value.substring(0, maxLength);
    }

    private <T> List<T> safeList(List<T> rows) {
        return rows == null ? List.of() : rows;
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
