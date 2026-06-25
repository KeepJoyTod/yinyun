package org.dromara.yy.service;

import java.io.IOException;
import java.io.OutputStream;

/**
 * 客户照片私有对象访问适配器。
 */
public interface YyPhotoAssetUrlSigner {

    String signGetUrl(String objectKey, long expiresInSeconds, String usage);

    void writeObject(String objectKey, OutputStream outputStream) throws IOException;

    Long resolveObjectSizeBytes(String objectKey);
}
