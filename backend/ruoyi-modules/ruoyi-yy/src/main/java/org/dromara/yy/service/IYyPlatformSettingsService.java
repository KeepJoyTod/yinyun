package org.dromara.yy.service;

import org.dromara.yy.domain.vo.YyPlatformAsyncTaskDetailVo;
import org.dromara.yy.domain.vo.YyPlatformAsyncTaskVo;
import org.dromara.yy.domain.vo.YyPlatformBackupRecoveryVo;
import org.dromara.yy.domain.vo.YyPlatformIntegrationStatusVo;
import org.dromara.yy.domain.vo.YyPlatformLoginRiskPolicyVo;
import org.dromara.yy.domain.vo.YyPlatformMeituanReviewTraceVo;
import org.dromara.yy.domain.vo.YyPlatformNotificationRuleVo;
import org.dromara.yy.domain.vo.YyPlatformOpenApiAppVo;
import org.dromara.yy.domain.vo.YyPlatformServicePackageStatusVo;

import java.util.List;

public interface IYyPlatformSettingsService {

    List<YyPlatformIntegrationStatusVo> listIntegrations();

    List<YyPlatformLoginRiskPolicyVo> listLoginRiskPolicies();

    List<YyPlatformOpenApiAppVo> listOpenApiApps();

    List<YyPlatformAsyncTaskVo> listAsyncTasks();

    YyPlatformAsyncTaskDetailVo getAsyncTaskDetail(String taskType);

    List<YyPlatformNotificationRuleVo> listNotifications();

    List<YyPlatformBackupRecoveryVo> listBackupRecoveryPlans();

    List<YyPlatformServicePackageStatusVo> listServicePackages(Long storeId);

    List<YyPlatformMeituanReviewTraceVo> listMeituanReviewTraces();
}
