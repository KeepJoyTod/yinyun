package org.dromara.yy.service.impl;

import org.dromara.common.core.exception.ServiceException;
import org.dromara.yy.domain.YyAsyncTask;
import org.dromara.yy.domain.vo.YyPlatformAsyncTaskDetailVo;
import org.dromara.yy.domain.vo.YyPlatformAsyncTaskVo;
import org.dromara.yy.mapper.YyAsyncTaskMapper;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyAsyncTaskServiceImplTest {

    @Mock
    private YyAsyncTaskMapper asyncTaskMapper;
    @Mock
    private YyEmployeeMapper employeeMapper;
    @Mock
    private YyEmployeeStoreMapper employeeStoreMapper;

    @InjectMocks
    private YyAsyncTaskServiceImpl service;

    @Test
    void listPlatformTaskSummariesShouldExposeOpenDetailAction() {
        YyAsyncTask task = new YyAsyncTask();
        task.setTaskNo("FIN-REC-1");
        task.setTaskType("REPORT_FINANCE_RECONCILIATION_EXPORT");
        task.setTaskName("Finance reconciliation export");
        task.setQueueName("platform-export");
        task.setStatus("COMPLETED");
        task.setRunStatus("SUCCESS");
        task.setCreateTime(new Date());
        when(asyncTaskMapper.selectList(any())).thenReturn(List.of(task));

        List<YyPlatformAsyncTaskVo> result = service.listPlatformTaskSummaries();

        assertEquals(1, result.size());
        assertEquals("REPORT_FINANCE_RECONCILIATION_EXPORT", result.get(0).getTaskType());
        assertEquals("open_task_detail", result.get(0).getNextActions().get(0).getActionKey());
        assertEquals(true, result.get(0).getNextActions().get(0).getEnabled());
    }

    @Test
    void claimNextTaskShouldTryNextCandidateWhenFirstClaimLost() {
        Date now = new Date();
        Date claimExpireTime = new Date(now.getTime() + 300_000L);

        YyAsyncTask first = new YyAsyncTask();
        first.setId(1L);
        first.setTaskNo("FIN-REC-1");

        YyAsyncTask second = new YyAsyncTask();
        second.setId(2L);
        second.setTaskNo("FIN-REC-2");

        YyAsyncTask claimed = new YyAsyncTask();
        claimed.setId(2L);
        claimed.setTaskNo("FIN-REC-2");
        claimed.setClaimedBy("worker-a");

        when(asyncTaskMapper.selectList(any())).thenReturn(List.of(first, second));
        when(asyncTaskMapper.update(any(YyAsyncTask.class), any())).thenReturn(0, 1);
        when(asyncTaskMapper.selectById(eq(2L))).thenReturn(claimed);

        YyAsyncTask result = service.claimNextTask("REPORT_FINANCE_RECONCILIATION_EXPORT", "worker-a", now, claimExpireTime);

        assertEquals(2L, result.getId());
        assertEquals("worker-a", result.getClaimedBy());
        verify(asyncTaskMapper).selectById(eq(2L));
    }

    @Test
    void getPlatformTaskDetailShouldExposeRecentRunsAndEvidence() {
        YyAsyncTask latest = new YyAsyncTask();
        latest.setTaskNo("FIN-REC-2");
        latest.setTaskType("REPORT_FINANCE_RECONCILIATION_EXPORT");
        latest.setTaskName("Finance reconciliation export");
        latest.setQueueName("platform-export");
        latest.setStatus("COMPLETED");
        latest.setRunStatus("SUCCESS");
        latest.setAuditNote("uploaded to sys_oss");
        latest.setCreateTime(new Date(2_000L));

        YyAsyncTask previous = new YyAsyncTask();
        previous.setTaskNo("FIN-REC-1");
        previous.setTaskType("REPORT_FINANCE_RECONCILIATION_EXPORT");
        previous.setStatus("FAILED");
        previous.setRunStatus("FAILED");
        previous.setErrorMessage("network timeout");
        previous.setCreateTime(new Date(1_000L));

        when(asyncTaskMapper.selectList(any())).thenReturn(List.of(latest, previous));

        YyPlatformAsyncTaskDetailVo detail = service.getPlatformTaskDetail("REPORT_FINANCE_RECONCILIATION_EXPORT");

        assertEquals("REPORT_FINANCE_RECONCILIATION_EXPORT", detail.getTaskType());
        assertEquals("SUCCESS", detail.getLatestRunStatus());
        assertEquals(2, detail.getRuns().size());
        assertEquals("FIN-REC-2", detail.getRuns().get(0).getTaskId());
        assertEquals(2, detail.getEvidence().size());
    }

    @Test
    void getPlatformTaskDetailShouldThrowWhenTaskTypeIsMissing() {
        when(asyncTaskMapper.selectList(any())).thenReturn(List.of());

        ServiceException ex = assertThrows(ServiceException.class,
            () -> service.getPlatformTaskDetail("REPORT_FINANCE_RECONCILIATION_EXPORT"));

        assertEquals("任务类型不存在或无权限查看", ex.getMessage());
    }
}
