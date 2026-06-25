package org.dromara.yy.service.impl;

import org.dromara.yy.domain.vo.YyChannelAccountVo;
import org.dromara.yy.domain.vo.YyNotificationTemplateVo;
import org.dromara.yy.domain.vo.YyPlatformIntegrationStatusVo;
import org.dromara.yy.domain.vo.YyPlatformNotificationRuleVo;
import org.dromara.yy.domain.vo.YyPlatformServicePackageStatusVo;
import org.dromara.yy.domain.vo.YyServiceLicenseBindingVo;
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
}
