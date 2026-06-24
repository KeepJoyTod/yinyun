package org.dromara.yy.service;

import org.dromara.yy.domain.vo.YyPriorityFeatureVo;
import org.dromara.yy.domain.vo.YyEnterpriseModuleVo;

import java.util.List;

/**
 * 影约云元数据服务
 */
public interface IYyMetaService {

    /**
     * 标红优先功能清单
     */
    List<YyPriorityFeatureVo> listPriorityFeatures();

    /**
     * 企业版下一批模块清单
     */
    List<YyEnterpriseModuleVo> listEnterpriseModules();
}
