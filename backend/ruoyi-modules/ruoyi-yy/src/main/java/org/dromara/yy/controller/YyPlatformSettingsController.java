package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.vo.YyPlatformAsyncTaskVo;
import org.dromara.yy.domain.vo.YyPlatformBackupRecoveryVo;
import org.dromara.yy.domain.vo.YyPlatformIntegrationStatusVo;
import org.dromara.yy.domain.vo.YyPlatformLoginRiskPolicyVo;
import org.dromara.yy.domain.vo.YyPlatformMeituanReviewTraceVo;
import org.dromara.yy.domain.vo.YyPlatformNotificationRuleVo;
import org.dromara.yy.domain.vo.YyPlatformOpenApiAppVo;
import org.dromara.yy.domain.vo.YyPlatformServicePackageStatusVo;
import org.dromara.yy.service.IYyPlatformSettingsService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/platform-settings")
public class YyPlatformSettingsController {

    private final IYyPlatformSettingsService yyPlatformSettingsService;

    @SaCheckPermission("yy:channel:list")
    @GetMapping("/integrations")
    public R<List<YyPlatformIntegrationStatusVo>> integrations() {
        return R.ok(yyPlatformSettingsService.listIntegrations());
    }

    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/login-risk-policies")
    public R<List<YyPlatformLoginRiskPolicyVo>> loginRiskPolicies() {
        return R.ok(yyPlatformSettingsService.listLoginRiskPolicies());
    }

    @SaCheckPermission("yy:channel:list")
    @GetMapping("/open-api-apps")
    public R<List<YyPlatformOpenApiAppVo>> openApiApps() {
        return R.ok(yyPlatformSettingsService.listOpenApiApps());
    }

    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/async-tasks")
    public R<List<YyPlatformAsyncTaskVo>> asyncTasks() {
        return R.ok(yyPlatformSettingsService.listAsyncTasks());
    }

    @SaCheckPermission("yy:notification:list")
    @GetMapping("/notifications")
    public R<List<YyPlatformNotificationRuleVo>> notifications() {
        return R.ok(yyPlatformSettingsService.listNotifications());
    }

    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/backup-recovery-plans")
    public R<List<YyPlatformBackupRecoveryVo>> backupRecoveryPlans() {
        return R.ok(yyPlatformSettingsService.listBackupRecoveryPlans());
    }

    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/service-packages")
    public R<List<YyPlatformServicePackageStatusVo>> servicePackages(@RequestParam(required = false) Long storeId) {
        return R.ok(yyPlatformSettingsService.listServicePackages(storeId));
    }

    @SaCheckPermission("yy:channel:list")
    @GetMapping("/meituan-review-traces")
    public R<List<YyPlatformMeituanReviewTraceVo>> meituanReviewTraces() {
        return R.ok(yyPlatformSettingsService.listMeituanReviewTraces());
    }
}
