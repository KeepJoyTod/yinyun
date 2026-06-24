package org.dromara.yy.service;

import org.dromara.yy.domain.bo.YyCollaborationLicenseBindStoreBo;
import org.dromara.yy.domain.bo.YyCollaborationLicenseBo;
import org.dromara.yy.domain.bo.YyCollaborationSettingBo;
import org.dromara.yy.domain.bo.YyProductCollaborationConfigBo;
import org.dromara.yy.domain.vo.YyCollaborationLicenseVo;
import org.dromara.yy.domain.vo.YyCollaborationSettingVo;
import org.dromara.yy.domain.vo.YyProductCollaborationConfigVo;

import java.util.List;

public interface IYyCollaborationService {

    YyCollaborationSettingVo querySetting(String settingType);

    YyCollaborationSettingVo saveSetting(YyCollaborationSettingBo bo);

    List<YyProductCollaborationConfigVo> queryProductConfigs();

    YyProductCollaborationConfigVo saveProductConfig(Long productId, YyProductCollaborationConfigBo bo);

    List<YyCollaborationLicenseVo> queryLicenses(Long storeId);

    YyCollaborationLicenseVo saveLicense(YyCollaborationLicenseBo bo);

    YyCollaborationLicenseVo bindLicenseStore(Long licenseId, YyCollaborationLicenseBindStoreBo bo);

    YyCollaborationLicenseVo unbindLicenseStore(Long licenseId, Long storeId);
}
