package org.dromara.yy.service;

import org.dromara.yy.domain.vo.YyPlatformIntegrationStatusVo;
import org.dromara.yy.domain.vo.YyPlatformNotificationRuleVo;
import org.dromara.yy.domain.vo.YyPlatformServicePackageStatusVo;

import java.util.List;

public interface IYyPlatformSettingsService {

    List<YyPlatformIntegrationStatusVo> listIntegrations();

    List<YyPlatformNotificationRuleVo> listNotifications();

    List<YyPlatformServicePackageStatusVo> listServicePackages(Long storeId);
}
