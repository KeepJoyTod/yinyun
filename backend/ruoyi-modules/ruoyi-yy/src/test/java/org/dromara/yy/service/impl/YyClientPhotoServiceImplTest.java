package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.encrypt.core.EncryptContext;
import org.dromara.common.encrypt.core.EncryptorManager;
import org.dromara.common.encrypt.enumd.AlgorithmType;
import org.dromara.common.encrypt.enumd.EncodeType;
import org.dromara.yy.domain.YyPhotoAccessLog;
import org.dromara.yy.domain.YyPhotoAlbum;
import org.dromara.yy.domain.YyPhotoAsset;
import org.dromara.yy.domain.bo.ClientPhotoPlatformLoginRequest;
import org.dromara.yy.domain.bo.ClientPhotoVerifyRequest;
import org.dromara.yy.domain.vo.ClientPhotoAlbumDetailVo;
import org.dromara.yy.domain.vo.ClientPhotoAlbumVo;
import org.dromara.yy.domain.vo.ClientPhotoSignedUrlVo;
import org.dromara.yy.domain.vo.ClientPhotoTokenVo;
import org.dromara.yy.mapper.YyPhotoAccessLogMapper;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyPhotoAssetMapper;
import org.dromara.yy.mapper.YyPhotoVerifyCodeMapper;
import org.dromara.yy.service.ClientPhotoPhoneAuthProvider;
import org.dromara.yy.service.YyPhotoAssetUrlSigner;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
public class YyClientPhotoServiceImplTest {

    private static final Clock FIXED_CLOCK = Clock.fixed(Instant.parse("2026-06-06T10:00:00Z"), ZoneOffset.UTC);

    @Mock
    private YyPhotoAlbumMapper albumMapper;

    @Mock
    private YyPhotoAssetMapper assetMapper;

    @Mock
    private YyPhotoAccessLogMapper accessLogMapper;

    @Mock
    private YyPhotoVerifyCodeMapper verifyCodeMapper;

    @Mock
    private YyPhotoAssetUrlSigner signer;

    @Test
    public void verifyWithPickupCodeShouldReturnTwoHourClientToken() {
        YyClientPhotoServiceImpl service = newService();
        when(albumMapper.selectList(any())).thenReturn(List.of(activeAlbum(1L, "13800000000", "PICK123")));
        ClientPhotoVerifyRequest request = new ClientPhotoVerifyRequest();
        request.setPhone("13800000000");
        request.setCode("PICK123");
        request.setPlatform("H5");

        ClientPhotoTokenVo token = service.verify(request, "127.0.0.1");

        assertEquals(7200L, token.getExpiresIn());
        assertEquals("138****0000", token.getPhoneMasked());
        assertFalse(token.getClientToken().contains("13800000000"));
        verify(accessLogMapper).insert(any(YyPhotoAccessLog.class));
    }

    @Test
    public void verifyWithPickupCodeShouldMatchEncryptedAlbumPhone() {
        YyClientPhotoServiceImpl service = newService();
        String encryptedPhone = encryptPhone("13900000001");
        when(albumMapper.selectList(any())).thenReturn(List.of(activeAlbum(1L, encryptedPhone, "PICK123")));
        ClientPhotoVerifyRequest request = new ClientPhotoVerifyRequest();
        request.setPhone("13900000001");
        request.setCode("PICK123");
        request.setPlatform("H5");

        ClientPhotoTokenVo token = service.verify(request, "127.0.0.1");

        assertEquals("139****0001", token.getPhoneMasked());
        verify(accessLogMapper).insert(any(YyPhotoAccessLog.class));
    }

    @Test
    public void verifyShouldRejectDefaultTokenSecretInProductionProfile() {
        YyClientPhotoServiceImpl service = newService();
        ReflectionTestUtils.setField(service, "activeProfiles", "prod");
        when(albumMapper.selectList(any())).thenReturn(List.of(activeAlbum(1L, "13800000000", "PICK123")));
        ClientPhotoVerifyRequest request = new ClientPhotoVerifyRequest();
        request.setPhone("13800000000");
        request.setCode("PICK123");
        request.setPlatform("H5");

        ServiceException ex = assertThrows(ServiceException.class, () -> service.verify(request, "127.0.0.1"));

        assertTrue(ex.getMessage().contains("客户取片令牌密钥未配置"));
    }

    @Test
    public void listAlbumsShouldOnlyReturnActiveAlbumsForTokenPhone() {
        YyClientPhotoServiceImpl service = newService();
        YyPhotoAlbum activeAlbum = activeAlbum(1L, "13800000000", "PICK123");
        activeAlbum.setSelectionStatus("DELIVERED");
        when(albumMapper.selectList(any()))
            .thenReturn(List.of(activeAlbum))
            .thenReturn(List.of(
                activeAlbum,
                expiredAlbum(2L, "13800000000", "PICK123"),
                activeAlbum(3L, "13900000000", "OTHER")
            ));
        when(assetMapper.selectList(any())).thenReturn(List.of(asset(11L, 1L, "face.jpg", "photos/face.jpg", "https://oss.example/photos/face.jpg", "1")));
        ClientPhotoVerifyRequest request = new ClientPhotoVerifyRequest();
        request.setPhone("13800000000");
        request.setCode("PICK123");
        request.setPlatform("H5");

        String clientToken = service.verify(request, "127.0.0.1").getClientToken();
        List<ClientPhotoAlbumVo> albums = service.listAlbums(clientToken);

        assertEquals(1, albums.size());
        assertEquals("1", albums.get(0).getAlbumId());
        assertEquals("证件照交付", albums.get(0).getTitle());
        assertEquals(1, albums.get(0).getAssetCount());
        assertEquals("11", albums.get(0).getCoverAssetId());
        assertEquals("DELIVERED", albums.get(0).getSelectionStatus());
    }

    @Test
    public void tokenShouldOnlyAuthorizeAlbumsMatchedAtVerifyTime() {
        YyClientPhotoServiceImpl service = newService();
        YyPhotoAlbum authorized = activeAlbum(1L, "13800000000", "PICK-A");
        YyPhotoAlbum samePhoneOtherCode = activeAlbum(2L, "13800000000", "PICK-B");
        when(albumMapper.selectList(any()))
            .thenReturn(List.of(authorized, samePhoneOtherCode))
            .thenReturn(List.of(authorized, samePhoneOtherCode));
        when(albumMapper.selectById(2L)).thenReturn(samePhoneOtherCode);
        ClientPhotoVerifyRequest request = new ClientPhotoVerifyRequest();
        request.setPhone("13800000000");
        request.setCode("PICK-A");
        request.setPlatform("H5");

        String clientToken = service.verify(request, "127.0.0.1").getClientToken();
        List<ClientPhotoAlbumVo> albums = service.listAlbums(clientToken);

        assertEquals(1, albums.size());
        assertEquals("1", albums.get(0).getAlbumId());
        ServiceException ex = assertThrows(ServiceException.class, () -> service.getAlbum(clientToken, 2L));
        assertTrue(ex.getMessage().contains("无权限"));
    }

    @Test
    public void albumDetailShouldHideInvisibleAndMissingObjectKeyAssetsAndReturnStringIds() {
        YyClientPhotoServiceImpl service = newService();
        when(albumMapper.selectList(any())).thenReturn(List.of(activeAlbum(1L, "13800000000", "PICK123")));
        when(albumMapper.selectById(1L)).thenReturn(activeAlbum(1L, "13800000000", "PICK123"));
        YyPhotoAsset visible = asset(11L, 1L, "face.jpg", "photos/face.jpg", "https://oss.example/photos/face.jpg", "1");
        visible.setIsSelected("1");
        YyPhotoAsset hidden = asset(12L, 1L, "hidden.jpg", "photos/hidden.jpg", "https://oss.example/photos/hidden.jpg", "0");
        YyPhotoAsset missingObjectKey = asset(13L, 1L, "bad.jpg", "", "https://oss.example/photos/bad.jpg", "1");
        YyPhotoAsset blankVisible = asset(14L, 1L, "blank.jpg", "photos/blank.jpg", "https://oss.example/photos/blank.jpg", "");
        YyPhotoAsset unknownVisible = asset(15L, 1L, "unknown.jpg", "photos/unknown.jpg", "https://oss.example/photos/unknown.jpg", "2");
        YyPhotoAsset nullVisible = asset(16L, 1L, "null.jpg", "photos/null.jpg", "https://oss.example/photos/null.jpg", null);
        when(assetMapper.selectList(any())).thenReturn(List.of(visible, hidden, missingObjectKey, blankVisible, unknownVisible, nullVisible));
        when(accessLogMapper.selectList(any())).thenReturn(List.of(selectionSubmitLog(101L, 1L, Date.from(FIXED_CLOCK.instant().minusSeconds(120)))));
        ClientPhotoVerifyRequest request = new ClientPhotoVerifyRequest();
        request.setPhone("13800000000");
        request.setCode("PICK123");
        request.setPlatform("H5");
        String clientToken = service.verify(request, "127.0.0.1").getClientToken();

        ClientPhotoAlbumDetailVo detail = service.getAlbum(clientToken, 1L);

        assertEquals("1", detail.getAlbumId());
        assertEquals("DRAFT", detail.getSelectionStatus());
        assertEquals(1, detail.getSelectedCount());
        assertEquals(Date.from(FIXED_CLOCK.instant().minusSeconds(120)), detail.getLastSelectionSubmitTime());
        assertEquals(1, detail.getAssets().size());
        assertEquals("11", detail.getAssets().get(0).getAssetId());
        assertEquals("face.jpg", detail.getAssets().get(0).getFileName());
    }

    @Test
    public void previewUrlShouldRequireOwnershipAndReturnAssetMetadata() {
        YyClientPhotoServiceImpl service = newService();
        when(albumMapper.selectList(any())).thenReturn(List.of(activeAlbum(1L, "13800000000", "PICK123")));
        when(albumMapper.selectById(1L)).thenReturn(activeAlbum(1L, "13800000000", "PICK123"));
        when(assetMapper.selectById(11L)).thenReturn(asset(11L, 1L, "face.jpg", "photos/face.jpg", "https://oss.example/raw/face.jpg", "1"));
        when(signer.signGetUrl(eq("photos/face.jpg"), eq(600L), eq("preview"))).thenReturn("https://signed.example/photos/face.jpg?ttl=600");
        ClientPhotoVerifyRequest request = new ClientPhotoVerifyRequest();
        request.setPhone("13800000000");
        request.setCode("PICK123");
        request.setPlatform("H5");
        String clientToken = service.verify(request, "127.0.0.1").getClientToken();

        ClientPhotoSignedUrlVo signedUrl = service.previewUrl(clientToken, 11L);

        assertEquals("11", signedUrl.getAssetId());
        assertEquals("https://signed.example/photos/face.jpg?ttl=600", signedUrl.getUrl());
        assertEquals(600L, signedUrl.getExpiresIn());
        assertEquals("face.jpg", signedUrl.getFileName());
        assertEquals("image/jpeg", signedUrl.getContentType());
    }

    @Test
    public void thumbnailUrlShouldPreferThumbnailObjectKeyAndFallbackToOriginal() {
        YyClientPhotoServiceImpl service = newService();
        when(albumMapper.selectList(any())).thenReturn(List.of(activeAlbum(1L, "13800000000", "PICK123")));
        when(albumMapper.selectById(1L)).thenReturn(activeAlbum(1L, "13800000000", "PICK123"));
        YyPhotoAsset withThumbnail = asset(11L, 1L, "face.jpg", "photos/face.jpg", "https://oss.example/raw/face.jpg", "1");
        withThumbnail.setThumbnailObjectKey("thumbs/face.webp");
        YyPhotoAsset withoutThumbnail = asset(12L, 1L, "wide.jpg", "photos/wide.jpg", "https://oss.example/raw/wide.jpg", "1");
        when(assetMapper.selectById(11L)).thenReturn(withThumbnail);
        when(assetMapper.selectById(12L)).thenReturn(withoutThumbnail);
        when(signer.signGetUrl(eq("thumbs/face.webp"), eq(600L), eq("thumbnail"))).thenReturn("https://signed.example/thumbs/face.webp?ttl=600");
        when(signer.signGetUrl(eq("photos/wide.jpg"), eq(600L), eq("thumbnail"))).thenReturn("https://signed.example/photos/wide.jpg?ttl=600");
        ClientPhotoVerifyRequest request = new ClientPhotoVerifyRequest();
        request.setPhone("13800000000");
        request.setCode("PICK123");
        request.setPlatform("H5");
        String clientToken = service.verify(request, "127.0.0.1").getClientToken();

        ClientPhotoSignedUrlVo thumbnailUrl = service.thumbnailUrl(clientToken, 11L);
        ClientPhotoSignedUrlVo fallbackUrl = service.thumbnailUrl(clientToken, 12L);

        assertEquals("https://signed.example/thumbs/face.webp?ttl=600", thumbnailUrl.getUrl());
        assertEquals("image/webp", thumbnailUrl.getContentType());
        assertEquals("face.webp", thumbnailUrl.getFileName());
        assertEquals("https://signed.example/photos/wide.jpg?ttl=600", fallbackUrl.getUrl());
        assertEquals("image/jpeg", fallbackUrl.getContentType());
    }

    @Test
    public void wrongPickupCodeShouldFail() {
        YyClientPhotoServiceImpl service = newService();
        when(albumMapper.selectList(any(Wrapper.class))).thenReturn(List.of());
        ClientPhotoVerifyRequest request = new ClientPhotoVerifyRequest();
        request.setPhone("13800000000");
        request.setCode("BAD");
        request.setPlatform("H5");

        assertThrows(ServiceException.class, () -> service.verify(request, "127.0.0.1"));
    }

    @Test
    public void platformLoginShouldStayClosedUntilPhoneAuthorizationProviderIsConfigured() {
        YyClientPhotoServiceImpl service = newService();
        ClientPhotoPlatformLoginRequest request = new ClientPhotoPlatformLoginRequest();
        request.setPlatform("WECHAT_MINI_APP");
        request.setLoginCode("login-code");
        request.setPhoneCode("phone-code");

        ServiceException ex = assertThrows(ServiceException.class, () -> service.platformLogin(request, "127.0.0.1"));

        assertTrue(ex.getMessage().contains("平台手机号授权尚未接入"));
    }

    @Test
    public void platformLoginShouldReturnTokenForProviderResolvedPhone() {
        ClientPhotoPhoneAuthProvider provider = request -> "13900000002";
        YyClientPhotoServiceImpl service = newService(provider);
        when(albumMapper.selectList(any())).thenReturn(List.of(activeAlbum(9L, "13900000002", "PICK999")));
        ClientPhotoPlatformLoginRequest request = new ClientPhotoPlatformLoginRequest();
        request.setPlatform("DOUYIN_MINI_APP");
        request.setLoginCode("login-code");
        request.setPhoneCode("phone-code");

        ClientPhotoTokenVo token = service.platformLogin(request, "127.0.0.1");

        assertEquals("139****0002", token.getPhoneMasked());
        assertEquals("DOUYIN_MINI_APP", token.getPlatform());
        ArgumentCaptor<YyPhotoAccessLog> logCaptor = ArgumentCaptor.forClass(YyPhotoAccessLog.class);
        verify(accessLogMapper).insert(logCaptor.capture());
        assertEquals("PLATFORM_LOGIN", logCaptor.getValue().getAction());
        assertEquals("1", logCaptor.getValue().getSuccess());
    }

    @Test
    public void platformLoginShouldRejectWhenProviderPhoneHasNoActiveAlbum() {
        ClientPhotoPhoneAuthProvider provider = request -> "13900000003";
        YyClientPhotoServiceImpl service = newService(provider);
        when(albumMapper.selectList(any())).thenReturn(List.of());
        ClientPhotoPlatformLoginRequest request = new ClientPhotoPlatformLoginRequest();
        request.setPlatform("WECHAT_MINI_APP");
        request.setLoginCode("login-code");
        request.setPhoneCode("phone-code");

        ServiceException ex = assertThrows(ServiceException.class, () -> service.platformLogin(request, "127.0.0.1"));

        assertTrue(ex.getMessage().contains("未找到可访问相册"));
        ArgumentCaptor<YyPhotoAccessLog> logCaptor = ArgumentCaptor.forClass(YyPhotoAccessLog.class);
        verify(accessLogMapper).insert(logCaptor.capture());
        assertEquals("PLATFORM_LOGIN", logCaptor.getValue().getAction());
        assertEquals("0", logCaptor.getValue().getSuccess());
    }

    @Test
    public void submitSelectionShouldOnlyUpdateVisibleOwnedAssetsAndMarkAlbumSubmitted() {
        YyClientPhotoServiceImpl service = newService();
        YyPhotoAlbum album = activeAlbum(1L, "13800000000", "PICK123");
        when(albumMapper.selectList(any())).thenReturn(List.of(album));
        when(albumMapper.selectById(1L)).thenReturn(album);
        YyPhotoAsset first = asset(11L, 1L, "first.jpg", "photos/first.jpg", "https://oss.example/photos/first.jpg", "1");
        YyPhotoAsset second = asset(12L, 1L, "second.jpg", "photos/second.jpg", "https://oss.example/photos/second.jpg", "1");
        YyPhotoAsset hidden = asset(13L, 1L, "hidden.jpg", "photos/hidden.jpg", "https://oss.example/photos/hidden.jpg", "0");
        when(assetMapper.selectList(any())).thenReturn(List.of(first, second, hidden));
        ClientPhotoVerifyRequest request = new ClientPhotoVerifyRequest();
        request.setPhone("13800000000");
        request.setCode("PICK123");
        request.setPlatform("H5");
        String clientToken = service.verify(request, "127.0.0.1").getClientToken();

        ClientPhotoAlbumDetailVo detail = service.submitSelection(clientToken, 1L, List.of(12L));

        assertEquals("1", detail.getAlbumId());
        assertEquals("SUBMITTED", detail.getSelectionStatus());
        assertEquals(1, detail.getSelectedCount());
        assertEquals(2, detail.getAssets().size());
        assertEquals("0", first.getIsSelected());
        assertEquals("1", second.getIsSelected());
        assertEquals("SUBMITTED", album.getSelectionStatus());
        verify(assetMapper, times(2)).updateById(any(YyPhotoAsset.class));
        verify(albumMapper).updateById(album);
    }

    @Test
    public void submitSelectionShouldRejectDeliveredAlbum() {
        YyClientPhotoServiceImpl service = newService();
        YyPhotoAlbum album = activeAlbum(1L, "13800000000", "PICK123");
        album.setSelectionStatus("DELIVERED");
        when(albumMapper.selectList(any())).thenReturn(List.of(album));
        when(albumMapper.selectById(1L)).thenReturn(album);
        ClientPhotoVerifyRequest request = new ClientPhotoVerifyRequest();
        request.setPhone("13800000000");
        request.setCode("PICK123");
        request.setPlatform("H5");
        String clientToken = service.verify(request, "127.0.0.1").getClientToken();

        ServiceException ex = assertThrows(ServiceException.class, () -> service.submitSelection(clientToken, 1L, List.of(11L)));

        assertTrue(ex.getMessage().contains("已完成交付"));
    }

    @Test
    public void submitSelectionShouldRejectAssetOutsideVisibleOwnedAlbum() {
        YyClientPhotoServiceImpl service = newService();
        YyPhotoAlbum album = activeAlbum(1L, "13800000000", "PICK123");
        when(albumMapper.selectList(any())).thenReturn(List.of(album));
        when(albumMapper.selectById(1L)).thenReturn(album);
        when(assetMapper.selectList(any())).thenReturn(List.of(asset(11L, 1L, "first.jpg", "photos/first.jpg", "https://oss.example/photos/first.jpg", "1")));
        ClientPhotoVerifyRequest request = new ClientPhotoVerifyRequest();
        request.setPhone("13800000000");
        request.setCode("PICK123");
        request.setPlatform("H5");
        String clientToken = service.verify(request, "127.0.0.1").getClientToken();

        ServiceException ex = assertThrows(ServiceException.class, () -> service.submitSelection(clientToken, 1L, List.of(99L)));

        assertTrue(ex.getMessage().contains("照片不存在或无权限访问"));
    }

    private YyClientPhotoServiceImpl newService() {
        return new YyClientPhotoServiceImpl(albumMapper, assetMapper, accessLogMapper, verifyCodeMapper, signer, FIXED_CLOCK);
    }

    private YyClientPhotoServiceImpl newService(ClientPhotoPhoneAuthProvider... providers) {
        return new YyClientPhotoServiceImpl(albumMapper, assetMapper, accessLogMapper, verifyCodeMapper, signer, FIXED_CLOCK, List.of(providers));
    }

    private static YyPhotoAlbum activeAlbum(Long id, String phone, String code) {
        YyPhotoAlbum album = new YyPhotoAlbum();
        album.setId(id);
        album.setStoreId(7407304729216157722L);
        album.setAlbumName("证件照交付");
        album.setCustomerName("测试客户");
        album.setCustomerPhone(phone);
        album.setAccessCode(code);
        album.setChannelType("H5");
        album.setStatus("ACTIVE");
        album.setExpireTime(Date.from(FIXED_CLOCK.instant().plusSeconds(86400)));
        return album;
    }

    private static YyPhotoAlbum expiredAlbum(Long id, String phone, String code) {
        YyPhotoAlbum album = activeAlbum(id, phone, code);
        album.setExpireTime(Date.from(FIXED_CLOCK.instant().minusSeconds(60)));
        return album;
    }

    private static YyPhotoAsset asset(Long id, Long albumId, String fileName, String objectKey, String fileUrl, String visible) {
        YyPhotoAsset asset = new YyPhotoAsset();
        asset.setId(id);
        asset.setAlbumId(albumId);
        asset.setStoreId(7407304729216157722L);
        asset.setFileName(fileName);
        asset.setObjectKey(objectKey);
        asset.setFileUrl(fileUrl);
        asset.setVisible(visible);
        asset.setSort(1);
        return asset;
    }

    private static YyPhotoAccessLog selectionSubmitLog(Long id, Long albumId, Date createTime) {
        YyPhotoAccessLog log = new YyPhotoAccessLog();
        log.setId(id);
        log.setAlbumId(albumId);
        log.setAction("SELECTION_SUBMIT");
        log.setSuccess("1");
        log.setCreateTime(createTime);
        return log;
    }

    private static String encryptPhone(String phone) {
        EncryptContext context = new EncryptContext();
        context.setAlgorithm(AlgorithmType.AES);
        context.setEncode(EncodeType.BASE64);
        context.setPassword("change-16-bytes!");
        return new EncryptorManager().encrypt(phone, context);
    }
}
