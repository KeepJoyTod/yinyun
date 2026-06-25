package org.dromara.yy.service;

import org.dromara.yy.domain.vo.YyFeatureScopeVo;

import java.util.List;

public interface IYyFeatureScopeService {

    List<YyFeatureScopeVo> listFeatureScopes(List<String> featureKeys);
}
