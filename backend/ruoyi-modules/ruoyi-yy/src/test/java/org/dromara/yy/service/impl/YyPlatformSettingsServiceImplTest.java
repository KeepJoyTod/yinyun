package org.dromara.yy.service.impl;

import org.dromara.yy.domain.YyAsyncTask;
import org.dromara.yy.domain.vo.YyChannelAccountVo;
import org.dromara.yy.domain.vo.YyChannelSyncLogVo;
import org.dromara.yy.domain.vo.YyNotificationTemplateVo;
import org.dromara.yy.domain.vo.YyPlatformAsyncTaskVo;
import org.dromara.yy.domain.vo.YyPlatformBackupRecoveryVo;
import org.dromara.yy.domain.vo.YyPlatformIntegrationStatusVo;
import org.dromara.yy.domain.vo.YyPlatformLoginRiskPolicyVo;
import org.dromara.yy.domain.vo.YyPlatformMeituanReviewTraceVo;
import org.dromara.yy.domain.vo.YyPlatformNotificationRuleVo;
import org.dromara.yy.domain.vo.YyPlatformOpenApiAppVo;
import org.dromara.yy.domain.vo.YyPlatformServicePackageStatusVo;
import org.dromara.yy.domain.vo.YyServiceLicenseBindingVo;
import org.dromara.yy.mapper.YyAsyncTaskMapper;
import org.dromara.yy.service.IYyChannelAccountService;
import org.dromara.yy.service.IYyChannelSyncLogService;
import org.dromara.yy.service.IYyNotificationLogService;
import org.dromara.yy.service.IYyNotificationTemplateService;
import org.dromara.yy.service.IYyServiceProductionService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyPlatformSettingsServiceImplTest {

    @Mock
    private IYyChannelAccountService yyChannelAccountService;

    @Mock
    private IYyChannelSyncLogService yyChannelSyncLogService;

    @Mock
    private IYyNotificationTemplateService yyNotificationTemplateService;

    @Mock
    private IYyNotificationLogService yyNotificationLogService;

    @Mock
    private IYyServiceProductionService yyServiceProductionService;
    @Mock
    private YyAsyncTaskMapper yyAsyncTaskMapper;

    @InjectMocks
    private YyPlatformSettingsServiceImpl service;

    @Test
    void listIntegrationsShouldExposeChannelAccountState() {
        YyChannelAccountVo account = new YyChannelAccountVo();
        account.setChannelType("DOUYIN_LIFE");
        account.setAccountName("life account");
        account.setStatus("ACTIVE");
        account.setWebhookUrl("https://api.evanshine.me/yy/channel/DOUYIN_LIFE/webhook");
        when(yyChannelAccountService.queryList(any())).thenReturn(List.of(account));
        when(yyChannelSyncLogService.queryList(any())).thenReturn(List.of());

        List<YyPlatformIntegrationStatusVo> result = service.listIntegrations();

        assertEquals("DOUYIN_LIFE", result.get(0).getChannelType());
        assertEquals("ready", result.get(0).getStatus());
        assertEquals("life account", result.get(0).getAccountName());
        assertEquals(false, result.get(0).getNextActions().get(0).getEnabled());
    }

    @Test
    void listNotificationsShouldGroupTemplatesByScene() {
        YyNotificationTemplateVo template = new YyNotificationTemplateVo();
        template.setScene("ORDER_REMINDER");
        template.setTitle("Order reminder");
        template.setChannelType("WECHAT");
        template.setEnabled("Y");
        when(yyNotificationTemplateService.queryList(any())).thenReturn(List.of(template));
        when(yyNotificationLogService.queryList(any())).thenReturn(List.of());

        List<YyPlatformNotificationRuleVo> result = service.listNotifications();

        assertEquals("ORDER_REMINDER", result.get(0).getSceneCode());
        assertEquals("ready", result.get(0).getStatus());
        assertEquals(List.of("WECHAT"), result.get(0).getChannelTypes());
    }

    @Test
    void listLoginRiskPoliciesShouldExposeScaffoldPolicies() {
        List<YyPlatformLoginRiskPolicyVo> result = service.listLoginRiskPolicies();

        assertEquals("STAFF_LOGIN_RISK", result.get(0).getPolicyCode());
        assertEquals("scaffold", result.get(0).getStatus());
        assertEquals(false, result.get(0).getNextActions().get(0).getEnabled());
    }

    @Test
    void listOpenApiAppsShouldExposeSandboxScaffold() {
        List<YyPlatformOpenApiAppVo> result = service.listOpenApiApps();

        assertEquals("ERP-SANDBOX", result.get(0).getAppCode());
        assertEquals("API_KEY + SIGNATURE", result.get(0).getAuthMode());
        assertEquals("scaffold", result.get(0).getStatus());
    }

    @Test
    void listAsyncTasksShouldExposeTaskCenterScaffold() {
        when(yyAsyncTaskMapper.selectList(any())).thenReturn(List.of());

        List<YyPlatformAsyncTaskVo> result = service.listAsyncTasks();

        assertEquals("EXPORT", result.get(0).getTaskType());
        assertEquals("platform-export", result.get(0).getQueueName());
        assertEquals("scaffold", result.get(0).getStatus());
    }

    @Test
    void listAsyncTasksShouldReadPersistedAsyncTaskLedger() {
        YyAsyncTask task = new YyAsyncTask();
        task.setTaskNo("FIN-REC-1");
        task.setTaskType("REPORT_FINANCE_RECONCILIATION_EXPORT");
        task.setTaskName("Finance reconciliation export");
        task.setQueueName("platform-export");
        task.setStatus("COMPLETED");
        task.setRunStatus("COMPLETED");
        task.setAuditNote("created from finance report");
        task.setCreateTime(new Date());
        when(yyAsyncTaskMapper.selectList(any())).thenReturn(List.of(task));

        List<YyPlatformAsyncTaskVo> result = service.listAsyncTasks();

        assertEquals("REPORT_FINANCE_RECONCILIATION_EXPORT", result.get(0).getTaskType());
        assertEquals("platform-export", result.get(0).getQueueName());
        assertEquals("COMPLETED", result.get(0).getLatestRunStatus());
        assertEquals("ready", result.get(0).getStatus());
        assertEquals("yy_async_task", result.get(0).getEvidence().get(0).getSourceType());
    }

    @Test
    void listBackupRecoveryPlansShouldExposeRecoveryScaffold() {
        List<YyPlatformBackupRecoveryVo> result = service.listBackupRecoveryPlans();

        assertEquals("PITR-PRIMARY", result.get(0).getPlanCode());
        assertEquals("PostgreSQL + object storage", result.get(0).getBackupScope());
        assertEquals("scaffold", result.get(0).getStatus());
    }

    @Test
    void listServicePackagesShouldReadLicenseBindingLedger() {
        YyServiceLicenseBindingVo license = new YyServiceLicenseBindingVo();
        license.setLicenseKey("LIC-001");
        license.setPlanName("Advanced");
        license.setStatus("ACTIVE");
        license.setExpireTime(new Date(System.currentTimeMillis() + 86_400_000L));
        when(yyServiceProductionService.queryLicenseBindings(eq(1001L))).thenReturn(List.of(license));

        List<YyPlatformServicePackageStatusVo> result = service.listServicePackages(1001L);

        assertEquals("LIC-001", result.get(0).getPackageCode());
        assertEquals("Advanced", result.get(0).getPackageName());
        assertEquals("ready", result.get(0).getStatus());
        verify(yyServiceProductionService).queryLicenseBindings(eq(1001L));
    }

    @Test
    void listMeituanReviewTracesShouldReuseExistingChannelEvidence() {
        YyChannelAccountVo account = new YyChannelAccountVo();
        account.setChannelType("MEITUAN");
        account.setStatus("ACTIVE");
        YyChannelSyncLogVo log = new YyChannelSyncLogVo();
        log.setChannelType("MEITUAN");
        log.setApiName("review_trace_probe");
        log.setSuccess("Y");
        log.setRequestId("req-1");
        log.setCreateTime(new Date());
        when(yyChannelAccountService.queryList(any())).thenReturn(List.of(account));
        when(yyChannelSyncLogService.queryList(any())).thenReturn(List.of(log));

        List<YyPlatformMeituanReviewTraceVo> result = service.listMeituanReviewTraces();

        assertEquals("MEITUAN_REVIEW_TRACE", result.get(0).getPluginCode());
        assertEquals("AUTH_READY_BUT_REVIEW_SYNC_MISSING", result.get(0).getTraceStatus());
        assertEquals("scaffold", result.get(0).getStatus());
    }
}
