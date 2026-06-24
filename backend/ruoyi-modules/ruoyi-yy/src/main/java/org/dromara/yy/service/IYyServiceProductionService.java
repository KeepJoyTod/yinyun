package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.*;
import org.dromara.yy.domain.vo.*;

import java.util.List;

/**
 * 服务生产模块 Service。
 */
public interface IYyServiceProductionService {

    TableDataInfo<YyRetouchTaskVo> queryRetouchTaskPageList(YyRetouchTaskQueryBo bo, PageQuery pageQuery);

    YyRetouchTaskVo updateRetouchTask(Long id, YyRetouchTaskActionBo bo);

    List<YyRetouchProviderVo> queryRetouchProviders(YyRetouchProviderQueryBo bo);

    YyRetouchProviderVo saveRetouchProvider(YyRetouchProviderBo bo);

    YyCollaborationPolicyVo queryCollaborationPolicy();

    YyCollaborationPolicyVo saveCollaborationPolicy(YyCollaborationPolicyBo bo);

    List<YyServiceLicenseBindingVo> queryLicenseBindings(Long storeId);

    YyServiceLicenseBindingVo saveLicenseBinding(YyServiceLicenseBindingBo bo);
}
