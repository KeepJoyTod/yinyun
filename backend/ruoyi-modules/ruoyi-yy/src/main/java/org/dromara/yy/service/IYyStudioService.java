package org.dromara.yy.service;

import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.yy.domain.vo.YyStudioBootstrapVo;

/**
 * 门店工作台启动服务。
 */
public interface IYyStudioService {

    YyStudioBootstrapVo bootstrap(LoginUser loginUser, boolean globalStoreScope);
}
