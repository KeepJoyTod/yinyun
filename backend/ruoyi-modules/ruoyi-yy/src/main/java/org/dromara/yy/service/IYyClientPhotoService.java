package org.dromara.yy.service;

import org.dromara.yy.domain.bo.ClientPhotoPlatformLoginRequest;
import org.dromara.yy.domain.bo.ClientPhotoSendCodeRequest;
import org.dromara.yy.domain.bo.ClientPhotoVerifyRequest;
import org.dromara.yy.domain.vo.ClientPhotoAlbumDetailVo;
import org.dromara.yy.domain.vo.ClientPhotoAlbumVo;
import org.dromara.yy.domain.vo.ClientPhotoSendCodeVo;
import org.dromara.yy.domain.vo.ClientPhotoSignedUrlVo;
import org.dromara.yy.domain.vo.ClientPhotoStreamAssetVo;
import org.dromara.yy.domain.vo.ClientPhotoTokenVo;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

/**
 * 多端客户取片服务
 */
public interface IYyClientPhotoService {

    ClientPhotoSendCodeVo sendCode(ClientPhotoSendCodeRequest request, String ip);

    ClientPhotoTokenVo verify(ClientPhotoVerifyRequest request, String ip);

    ClientPhotoTokenVo platformLogin(ClientPhotoPlatformLoginRequest request, String ip);

    List<ClientPhotoAlbumVo> listAlbums(String clientToken);

    ClientPhotoAlbumDetailVo getAlbum(String clientToken, Long albumId);

    ClientPhotoAlbumDetailVo submitSelection(String clientToken, Long albumId, List<Long> assetIds);

    ClientPhotoSignedUrlVo previewUrl(String clientToken, Long assetId);

    ClientPhotoSignedUrlVo thumbnailUrl(String clientToken, Long assetId);

    ClientPhotoSignedUrlVo downloadUrl(String clientToken, Long assetId);

    ClientPhotoStreamAssetVo streamAssetInfo(String clientToken, Long assetId);

    void streamAsset(String clientToken, Long assetId, OutputStream outputStream) throws IOException;
}
