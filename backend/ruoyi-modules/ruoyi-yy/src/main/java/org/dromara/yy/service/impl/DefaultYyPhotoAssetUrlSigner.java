package org.dromara.yy.service.impl;

import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.oss.factory.OssFactory;
import org.dromara.yy.service.YyPhotoAssetUrlSigner;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.OutputStream;
import java.time.Duration;

/**
 * 基于 RuoYi OSS 配置生成短期访问链接。
 */
@Service
public class DefaultYyPhotoAssetUrlSigner implements YyPhotoAssetUrlSigner {

    @Override
    public String signGetUrl(String objectKey, long expiresInSeconds, String usage) {
        if (StringUtils.isBlank(objectKey)) {
            throw new ServiceException("照片对象Key不能为空");
        }
        return OssFactory.instance().createPresignedGetUrl(objectKey, Duration.ofSeconds(expiresInSeconds));
    }

    @Override
    public void writeObject(String objectKey, OutputStream outputStream) throws IOException {
        if (StringUtils.isBlank(objectKey)) {
            throw new ServiceException("照片对象Key不能为空");
        }
        OssFactory.instance().download(objectKey, outputStream, null);
    }
}
