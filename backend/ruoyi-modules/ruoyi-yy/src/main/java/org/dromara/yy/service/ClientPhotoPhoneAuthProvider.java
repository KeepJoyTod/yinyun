package org.dromara.yy.service;

import org.dromara.yy.domain.bo.ClientPhotoPlatformLoginRequest;

/**
 * 小程序手机号授权解析器。
 */
@FunctionalInterface
public interface ClientPhotoPhoneAuthProvider {

    /**
     * 根据平台登录参数解析客户手机号。
     *
     * @param request 平台登录请求
     * @return 明文手机号；返回空表示当前解析器不支持该平台
     */
    String resolvePhone(ClientPhotoPlatformLoginRequest request);
}
