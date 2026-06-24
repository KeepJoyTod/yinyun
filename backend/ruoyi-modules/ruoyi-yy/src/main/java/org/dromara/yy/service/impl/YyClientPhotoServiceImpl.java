package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.dromara.common.core.constant.Constants;
import lombok.extern.slf4j.Slf4j;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.encrypt.core.EncryptContext;
import org.dromara.common.encrypt.core.EncryptorManager;
import org.dromara.common.encrypt.enumd.AlgorithmType;
import org.dromara.common.encrypt.enumd.EncodeType;
import org.dromara.common.encrypt.properties.EncryptorProperties;
import org.dromara.yy.domain.YyPhotoAccessLog;
import org.dromara.yy.domain.YyPhotoAlbum;
import org.dromara.yy.domain.YyPhotoAsset;
import org.dromara.yy.domain.YyPhotoVerifyCode;
import org.dromara.yy.domain.bo.ClientPhotoPlatformLoginRequest;
import org.dromara.yy.domain.bo.ClientPhotoSendCodeRequest;
import org.dromara.yy.domain.bo.ClientPhotoVerifyRequest;
import org.dromara.yy.domain.vo.ClientPhotoAlbumDetailVo;
import org.dromara.yy.domain.vo.ClientPhotoAlbumVo;
import org.dromara.yy.domain.vo.ClientPhotoAssetVo;
import org.dromara.yy.domain.vo.ClientPhotoSendCodeVo;
import org.dromara.yy.domain.vo.ClientPhotoSignedUrlVo;
import org.dromara.yy.domain.vo.ClientPhotoStreamAssetVo;
import org.dromara.yy.domain.vo.ClientPhotoTokenVo;
import org.dromara.yy.mapper.YyPhotoAccessLogMapper;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyPhotoAssetMapper;
import org.dromara.yy.mapper.YyPhotoVerifyCodeMapper;
import org.dromara.yy.service.ClientPhotoPhoneAuthProvider;
import org.dromara.yy.service.IYyClientPhotoService;
import org.dromara.yy.service.YyPhotoAssetUrlSigner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 多端客户取片服务。
 */
@Slf4j
@Service
public class YyClientPhotoServiceImpl implements IYyClientPhotoService {

    private static final long CLIENT_TOKEN_TTL_SECONDS = 7200L;
    private static final long SIGNED_URL_TTL_SECONDS = 600L;
    private static final long VERIFY_CODE_TTL_SECONDS = 300L;
    private static final String TOKEN_VERSION = "v1";
    private static final String DEFAULT_TOKEN_SECRET = "yingyue-client-photo-dev-secret-change-me";

    private final YyPhotoAlbumMapper albumMapper;
    private final YyPhotoAssetMapper assetMapper;
    private final YyPhotoAccessLogMapper accessLogMapper;
    private final YyPhotoVerifyCodeMapper verifyCodeMapper;
    private final YyPhotoAssetUrlSigner signer;
    private final Clock clock;
    private final EncryptorManager encryptorManager;
    private final EncryptorProperties encryptorProperties;
    private final List<ClientPhotoPhoneAuthProvider> phoneAuthProviders;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${yy.client-photo.token-secret:" + DEFAULT_TOKEN_SECRET + "}")
    private String tokenSecret = DEFAULT_TOKEN_SECRET;

    @Value("${spring.profiles.active:}")
    private String activeProfiles = "";

    @Autowired
    public YyClientPhotoServiceImpl(
        YyPhotoAlbumMapper albumMapper,
        YyPhotoAssetMapper assetMapper,
        YyPhotoAccessLogMapper accessLogMapper,
        YyPhotoVerifyCodeMapper verifyCodeMapper,
        YyPhotoAssetUrlSigner signer,
        ObjectProvider<EncryptorManager> encryptorManagerProvider,
        ObjectProvider<EncryptorProperties> encryptorPropertiesProvider,
        ObjectProvider<ClientPhotoPhoneAuthProvider> phoneAuthProviderProvider
    ) {
        this(
            albumMapper,
            assetMapper,
            accessLogMapper,
            verifyCodeMapper,
            signer,
            Clock.systemUTC(),
            encryptorManagerProvider.getIfAvailable(EncryptorManager::new),
            encryptorPropertiesProvider.getIfAvailable(YyClientPhotoServiceImpl::defaultEncryptorProperties),
            phoneAuthProviderProvider.orderedStream().toList()
        );
    }

    YyClientPhotoServiceImpl(
        YyPhotoAlbumMapper albumMapper,
        YyPhotoAssetMapper assetMapper,
        YyPhotoAccessLogMapper accessLogMapper,
        YyPhotoVerifyCodeMapper verifyCodeMapper,
        YyPhotoAssetUrlSigner signer,
        Clock clock
    ) {
        this(albumMapper, assetMapper, accessLogMapper, verifyCodeMapper, signer, clock, new EncryptorManager(), defaultEncryptorProperties(), List.of());
    }

    YyClientPhotoServiceImpl(
        YyPhotoAlbumMapper albumMapper,
        YyPhotoAssetMapper assetMapper,
        YyPhotoAccessLogMapper accessLogMapper,
        YyPhotoVerifyCodeMapper verifyCodeMapper,
        YyPhotoAssetUrlSigner signer,
        Clock clock,
        List<ClientPhotoPhoneAuthProvider> phoneAuthProviders
    ) {
        this(albumMapper, assetMapper, accessLogMapper, verifyCodeMapper, signer, clock, new EncryptorManager(), defaultEncryptorProperties(), phoneAuthProviders);
    }

    YyClientPhotoServiceImpl(
        YyPhotoAlbumMapper albumMapper,
        YyPhotoAssetMapper assetMapper,
        YyPhotoAccessLogMapper accessLogMapper,
        YyPhotoVerifyCodeMapper verifyCodeMapper,
        YyPhotoAssetUrlSigner signer,
        Clock clock,
        EncryptorManager encryptorManager,
        EncryptorProperties encryptorProperties,
        List<ClientPhotoPhoneAuthProvider> phoneAuthProviders
    ) {
        this.albumMapper = albumMapper;
        this.assetMapper = assetMapper;
        this.accessLogMapper = accessLogMapper;
        this.verifyCodeMapper = verifyCodeMapper;
        this.signer = signer;
        this.clock = clock;
        this.encryptorManager = encryptorManager;
        this.encryptorProperties = encryptorProperties;
        this.phoneAuthProviders = phoneAuthProviders == null ? List.of() : List.copyOf(phoneAuthProviders);
    }

    @Override
    public ClientPhotoSendCodeVo sendCode(ClientPhotoSendCodeRequest request, String ip) {
        String phone = normalizePhone(request.getPhone());
        String platform = normalizePlatform(request.getPlatform());
        YyPhotoVerifyCode verifyCode = new YyPhotoVerifyCode();
        verifyCode.setPhone(phone);
        verifyCode.setVerifyCode(randomSixDigitCode());
        verifyCode.setScene("PHOTO_PICKUP");
        verifyCode.setPlatform(platform);
        verifyCode.setExpireTime(Date.from(now().plusSeconds(VERIFY_CODE_TTL_SECONDS)));
        verifyCode.setStatus("CREATED");
        verifyCode.setIp(ip);
        verifyCode.setRemark("短信通道未接入前仅记录验证码申请，不向客户端返回验证码");
        verifyCodeMapper.insert(verifyCode);
        logAccess(null, null, phone, platform, "SEND_CODE", ip, true, "MVP no sms provider");

        ClientPhotoSendCodeVo vo = new ClientPhotoSendCodeVo();
        vo.setSent(false);
        vo.setExpiresIn(VERIFY_CODE_TTL_SECONDS);
        vo.setMessage("短信通道尚未接入，请使用后台生成的取片码登录");
        return vo;
    }

    @Override
    public ClientPhotoTokenVo verify(ClientPhotoVerifyRequest request, String ip) {
        String phone = normalizePhone(request.getPhone());
        String code = StringUtils.trimToEmpty(request.getCode());
        String platform = normalizePlatform(request.getPlatform());
        List<YyPhotoAlbum> albums = queryAlbumsByPhone(phone).stream()
            .filter(album -> isActiveAlbum(album) && codeMatches(album, code))
            .toList();
        if (albums.isEmpty()) {
            logAccess(null, null, phone, platform, "VERIFY", ip, false, "bad code");
            throw new ServiceException("手机号或取片码错误");
        }
        logAccess(albums.get(0).getId(), null, phone, platform, "VERIFY", ip, true, "pickup code");
        return buildToken(phone, platform, albums.stream().map(YyPhotoAlbum::getId).toList());
    }

    @Override
    public ClientPhotoTokenVo platformLogin(ClientPhotoPlatformLoginRequest request, String ip) {
        String platform = normalizePlatform(request.getPlatform());
        String phone = resolvePlatformPhone(request);
        if (StringUtils.isBlank(phone)) {
            logAccess(null, null, null, platform, "PLATFORM_LOGIN", ip, false, "phone auth provider unavailable");
            throw new ServiceException("平台手机号授权尚未接入，请使用手机号和取片码登录");
        }
        String normalizedPhone = normalizePhone(phone);
        List<YyPhotoAlbum> albums = queryAlbumsByPhone(normalizedPhone).stream()
            .filter(this::isActiveAlbum)
            .toList();
        if (albums.isEmpty()) {
            logAccess(null, null, normalizedPhone, platform, "PLATFORM_LOGIN", ip, false, "no active album");
            throw new ServiceException("未找到可访问相册，请使用手机号和取片码登录或联系门店");
        }
        logAccess(albums.get(0).getId(), null, normalizedPhone, platform, "PLATFORM_LOGIN", ip, true, "platform phone auth");
        return buildToken(normalizedPhone, platform, albums.stream().map(YyPhotoAlbum::getId).toList());
    }

    @Override
    public List<ClientPhotoAlbumVo> listAlbums(String clientToken) {
        ClientIdentity identity = parseToken(clientToken);
        List<YyPhotoAlbum> albums = queryAlbumsByPhone(identity.phone()).stream()
            .filter(album -> phoneMatches(album.getCustomerPhone(), identity.phone()))
            .filter(album -> identity.isAlbumAuthorized(album.getId()))
            .filter(this::isActiveAlbum)
            .sorted(Comparator.comparing(YyPhotoAlbum::getCreateTime, Comparator.nullsLast(Comparator.reverseOrder())))
            .toList();
        List<Long> albumIds = albums.stream().map(YyPhotoAlbum::getId).toList();
        var visibleAssetsByAlbumId = listVisibleAssetsByAlbumIds(albumIds);
        return albums.stream()
            .map(album -> toAlbumVo(album, visibleAssetsByAlbumId.get(album.getId())))
            .toList();
    }

    @Override
    public ClientPhotoAlbumDetailVo getAlbum(String clientToken, Long albumId) {
        ClientIdentity identity = parseToken(clientToken);
        YyPhotoAlbum album = requireOwnedActiveAlbum(albumId, identity);
        List<YyPhotoAsset> visibleAssets = listVisibleAssetsByAlbumId(albumId);
        List<ClientPhotoAssetVo> assets = visibleAssets.stream()
            .map(this::toAssetVo)
            .toList();

        ClientPhotoAlbumDetailVo detail = new ClientPhotoAlbumDetailVo();
        detail.setAlbumId(toClientId(album.getId()));
        detail.setTitle(album.getAlbumName());
        detail.setExpireTime(album.getExpireTime());
        detail.setSelectionStatus(StringUtils.defaultIfBlank(album.getSelectionStatus(), "DRAFT"));
        detail.setSelectedCount((int) assets.stream().filter(asset -> "1".equals(asset.getSelected())).count());
        detail.setLastSelectionSubmitTime(resolveLastSelectionSubmitTime(album.getId()));
        detail.setAssets(new ArrayList<>(assets));
        logAccess(album.getId(), null, identity.phone(), identity.platform(), "ALBUM_DETAIL", null, true, null);
        return detail;
    }

    @Override
    public ClientPhotoAlbumDetailVo submitSelection(String clientToken, Long albumId, List<Long> assetIds) {
        ClientIdentity identity = parseToken(clientToken);
        YyPhotoAlbum album = requireOwnedActiveAlbum(albumId, identity);
        if ("DELIVERED".equalsIgnoreCase(album.getSelectionStatus())) {
            throw new ServiceException("相册已完成交付，不能再次提交选片");
        }
        if (assetIds == null || assetIds.isEmpty()) {
            throw new ServiceException("请选择至少一张照片");
        }
        Set<Long> selectedAssetIds = assetIds.stream()
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
        if (selectedAssetIds.isEmpty()) {
            throw new ServiceException("请选择至少一张照片");
        }

        List<YyPhotoAsset> visibleAssets = listVisibleAssetsByAlbumId(albumId);
        Set<Long> visibleAssetIds = visibleAssets.stream()
            .map(YyPhotoAsset::getId)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
        if (!visibleAssetIds.containsAll(selectedAssetIds)) {
            logAccess(albumId, null, identity.phone(), identity.platform(), "SELECTION_SUBMIT", null, false, "asset outside visible album");
            throw new ServiceException("照片不存在或无权限访问");
        }

        for (YyPhotoAsset asset : visibleAssets) {
            asset.setIsSelected(selectedAssetIds.contains(asset.getId()) ? "1" : "0");
            assetMapper.updateById(asset);
        }
        album.setSelectionStatus("SUBMITTED");
        albumMapper.updateById(album);
        logAccess(album.getId(), null, identity.phone(), identity.platform(), "SELECTION_SUBMIT", null, true, "selected=" + selectedAssetIds.size());
        return getAlbum(clientToken, albumId);
    }

    @Override
    public ClientPhotoSignedUrlVo previewUrl(String clientToken, Long assetId) {
        return signedUrl(clientToken, assetId, "PREVIEW");
    }

    @Override
    public ClientPhotoSignedUrlVo thumbnailUrl(String clientToken, Long assetId) {
        ClientIdentity identity = parseToken(clientToken);
        YyPhotoAsset asset = requireVisibleOwnedAsset(assetId, identity);
        String objectKey = resolveThumbnailObjectKey(asset);
        ClientPhotoSignedUrlVo vo = buildSignedUrlVo(asset, objectKey, "THUMBNAIL");
        logAccess(asset.getAlbumId(), asset.getId(), identity.phone(), identity.platform(), "THUMBNAIL", null, true, null);
        return vo;
    }

    @Override
    public ClientPhotoSignedUrlVo downloadUrl(String clientToken, Long assetId) {
        return signedUrl(clientToken, assetId, "DOWNLOAD");
    }

    @Override
    public ClientPhotoStreamAssetVo streamAssetInfo(String clientToken, Long assetId) {
        ClientIdentity identity = parseToken(clientToken);
        YyPhotoAsset asset = requireVisibleOwnedAsset(assetId, identity);
        ClientPhotoStreamAssetVo vo = new ClientPhotoStreamAssetVo();
        vo.setAssetId(toClientId(asset.getId()));
        vo.setFileName(resolveDownloadFileName(asset));
        vo.setContentType(contentTypeOf(asset));
        return vo;
    }

    @Override
    public void streamAsset(String clientToken, Long assetId, OutputStream outputStream) throws IOException {
        ClientIdentity identity = parseToken(clientToken);
        YyPhotoAsset asset = requireVisibleOwnedAsset(assetId, identity);
        signer.writeObject(resolveObjectKey(asset), outputStream);
        logAccess(asset.getAlbumId(), asset.getId(), identity.phone(), identity.platform(), "STREAM", null, true, null);
    }

    private ClientPhotoSignedUrlVo signedUrl(String clientToken, Long assetId, String usage) {
        ClientIdentity identity = parseToken(clientToken);
        YyPhotoAsset asset = requireVisibleOwnedAsset(assetId, identity);
        ClientPhotoSignedUrlVo vo = buildSignedUrlVo(asset, resolveObjectKey(asset), usage);
        logAccess(asset.getAlbumId(), asset.getId(), identity.phone(), identity.platform(), usage, null, true, null);
        return vo;
    }

    private Date resolveLastSelectionSubmitTime(Long albumId) {
        if (albumId == null) {
            return null;
        }
        List<YyPhotoAccessLog> logs = accessLogMapper.selectList(Wrappers.<YyPhotoAccessLog>lambdaQuery()
            .eq(YyPhotoAccessLog::getAlbumId, albumId)
            .eq(YyPhotoAccessLog::getAction, "SELECTION_SUBMIT")
            .eq(YyPhotoAccessLog::getSuccess, "1")
            .orderByDesc(YyPhotoAccessLog::getCreateTime)
            .orderByDesc(YyPhotoAccessLog::getId)
            .last("limit 1"));
        if (logs == null || logs.isEmpty()) {
            return null;
        }
        return logs.get(0).getCreateTime();
    }

    private ClientPhotoSignedUrlVo buildSignedUrlVo(YyPhotoAsset asset, String objectKey, String usage) {
        String url = signer.signGetUrl(objectKey, SIGNED_URL_TTL_SECONDS, usage.toLowerCase());
        ClientPhotoSignedUrlVo vo = new ClientPhotoSignedUrlVo();
        vo.setAssetId(toClientId(asset.getId()));
        vo.setUrl(url);
        vo.setExpiresIn(SIGNED_URL_TTL_SECONDS);
        vo.setExpiresAt(Date.from(now().plusSeconds(SIGNED_URL_TTL_SECONDS)));
        String fileName = resolveFileName(asset, objectKey);
        vo.setFileName(fileName);
        vo.setContentType(contentTypeOf(fileName));
        return vo;
    }

    private YyPhotoAsset requireVisibleOwnedAsset(Long assetId, ClientIdentity identity) {
        if (assetId == null) {
            throw new ServiceException("照片ID不能为空");
        }
        YyPhotoAsset asset = assetMapper.selectById(assetId);
        if (asset == null || !isVisibleAsset(asset)) {
            throw new ServiceException("照片不存在或无权限访问");
        }
        requireOwnedActiveAlbum(asset.getAlbumId(), identity);
        return asset;
    }

    private YyPhotoAlbum requireOwnedActiveAlbum(Long albumId, ClientIdentity identity) {
        if (albumId == null) {
            throw new ServiceException("相册ID不能为空");
        }
        YyPhotoAlbum album = albumMapper.selectById(albumId);
        if (album == null
            || !isActiveAlbum(album)
            || !phoneMatches(album.getCustomerPhone(), identity.phone())
            || !identity.isAlbumAuthorized(album.getId())) {
            throw new ServiceException("相册不存在或无权限访问");
        }
        return album;
    }

    private List<YyPhotoAlbum> queryAlbumsByPhone(String phone) {
        return albumMapper.selectList(Wrappers.<YyPhotoAlbum>lambdaQuery()
            .eq(YyPhotoAlbum::getDelFlag, "0")
            .orderByDesc(YyPhotoAlbum::getId))
            .stream()
            .filter(album -> phoneMatches(album.getCustomerPhone(), phone))
            .toList();
    }

    private String resolvePlatformPhone(ClientPhotoPlatformLoginRequest request) {
        if (phoneAuthProviders.isEmpty()) {
            return "";
        }
        for (ClientPhotoPhoneAuthProvider provider : phoneAuthProviders) {
            try {
                String phone = provider.resolvePhone(request);
                if (StringUtils.isNotBlank(phone)) {
                    return phone;
                }
            } catch (ServiceException e) {
                throw e;
            } catch (Exception e) {
                log.warn("平台手机号授权解析失败: platform={}", normalizePlatform(request.getPlatform()));
                throw new ServiceException("平台手机号授权失败，请使用手机号和取片码登录");
            }
        }
        return "";
    }

    private ClientPhotoTokenVo buildToken(String phone, String platform, List<Long> authorizedAlbumIds) {
        long expiresAtEpoch = now().plusSeconds(CLIENT_TOKEN_TTL_SECONDS).getEpochSecond();
        String albumScope = encodeAlbumScope(authorizedAlbumIds);
        String payload = String.join("|", TOKEN_VERSION, phone, platform, String.valueOf(expiresAtEpoch), UUID.randomUUID().toString(), albumScope);
        String signature = hmac(payload);
        String token = base64Url(payload) + "." + signature;
        ClientPhotoTokenVo vo = new ClientPhotoTokenVo();
        vo.setClientToken(token);
        vo.setExpiresIn(CLIENT_TOKEN_TTL_SECONDS);
        vo.setExpiresAt(Date.from(Instant.ofEpochSecond(expiresAtEpoch)));
        vo.setPhoneMasked(maskPhone(phone));
        vo.setPlatform(platform);
        return vo;
    }

    private ClientIdentity parseToken(String clientToken) {
        if (StringUtils.isBlank(clientToken)) {
            throw new ServiceException("客户登录已失效，请重新登录");
        }
        String token = clientToken;
        if (StringUtils.startsWithIgnoreCase(token, "Bearer ")) {
            token = token.substring(7).trim();
        }
        String[] parts = token.split("\\.", 2);
        if (parts.length != 2) {
            throw new ServiceException("客户登录已失效，请重新登录");
        }
        String payload;
        try {
            payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            throw new ServiceException("客户登录已失效，请重新登录");
        }
        String expected = hmac(payload);
        if (!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), parts[1].getBytes(StandardCharsets.UTF_8))) {
            throw new ServiceException("客户登录已失效，请重新登录");
        }
        String[] payloadParts = payload.split("\\|", -1);
        if (payloadParts.length != 6 || !TOKEN_VERSION.equals(payloadParts[0])) {
            throw new ServiceException("客户登录已失效，请重新登录");
        }
        long expiresAt;
        try {
            expiresAt = Long.parseLong(payloadParts[3]);
        } catch (NumberFormatException e) {
            throw new ServiceException("客户登录已失效，请重新登录");
        }
        if (expiresAt <= now().getEpochSecond()) {
            throw new ServiceException("客户登录已过期，请重新登录");
        }
        Set<Long> authorizedAlbumIds = decodeAlbumScope(payloadParts[5]);
        if (authorizedAlbumIds.isEmpty()) {
            throw new ServiceException("客户登录已失效，请重新登录");
        }
        return new ClientIdentity(payloadParts[1], payloadParts[2], expiresAt, authorizedAlbumIds);
    }

    private String encodeAlbumScope(List<Long> albumIds) {
        if (albumIds == null || albumIds.isEmpty()) {
            throw new ServiceException("客户取片授权相册为空");
        }
        return albumIds.stream()
            .filter(Objects::nonNull)
            .distinct()
            .sorted()
            .map(String::valueOf)
            .collect(Collectors.joining(","));
    }

    private Set<Long> decodeAlbumScope(String albumScope) {
        if (StringUtils.isBlank(albumScope)) {
            return Set.of();
        }
        Set<Long> albumIds = new HashSet<>();
        for (String rawId : albumScope.split(",")) {
            if (StringUtils.isBlank(rawId)) {
                continue;
            }
            try {
                albumIds.add(Long.parseLong(rawId.trim()));
            } catch (NumberFormatException e) {
                throw new ServiceException("客户登录已失效，请重新登录");
            }
        }
        return Set.copyOf(albumIds);
    }

    private String hmac(String payload) {
        validateTokenSecret();
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(tokenSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new ServiceException("客户登录令牌生成失败");
        }
    }

    private void validateTokenSecret() {
        if (!isProductionProfile()) {
            return;
        }
        if (StringUtils.isBlank(tokenSecret) || DEFAULT_TOKEN_SECRET.equals(tokenSecret)) {
            throw new ServiceException("客户取片令牌密钥未配置，请设置 yy.client-photo.token-secret");
        }
    }

    private boolean isProductionProfile() {
        if (StringUtils.isBlank(activeProfiles)) {
            return false;
        }
        for (String profile : activeProfiles.split(",")) {
            if ("prod".equalsIgnoreCase(profile.trim()) || "production".equalsIgnoreCase(profile.trim())) {
                return true;
            }
        }
        return false;
    }

    private String base64Url(String value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private boolean codeMatches(YyPhotoAlbum album, String code) {
        return StringUtils.equals(code, album.getAccessCode()) || StringUtils.equals(code, album.getPublicToken());
    }

    private boolean isActiveAlbum(YyPhotoAlbum album) {
        if (album == null || StringUtils.equals(album.getDelFlag(), "1")) {
            return false;
        }
        String status = StringUtils.defaultIfBlank(album.getStatus(), "ACTIVE");
        if (StringUtils.equalsAnyIgnoreCase(status, "DISABLED", "EXPIRED", "DELETED")) {
            return false;
        }
        return album.getExpireTime() == null || album.getExpireTime().toInstant().isAfter(now());
    }

    private boolean isVisibleAsset(YyPhotoAsset asset) {
        return asset != null
            && !StringUtils.equals(asset.getDelFlag(), "1")
            && "1".equals(asset.getVisible())
            && StringUtils.isNotBlank(asset.getObjectKey());
    }

    private String resolveObjectKey(YyPhotoAsset asset) {
        if (StringUtils.isNotBlank(asset.getObjectKey())) {
            return asset.getObjectKey();
        }
        String fileUrl = StringUtils.trimToEmpty(asset.getFileUrl());
        if (!StringUtils.startsWithAny(fileUrl, "http://", "https://")) {
            return fileUrl;
        }
        int queryIndex = fileUrl.indexOf('?');
        String withoutQuery = queryIndex >= 0 ? fileUrl.substring(0, queryIndex) : fileUrl;
        int schemeIndex = withoutQuery.indexOf("://");
        int pathIndex = withoutQuery.indexOf('/', schemeIndex + 3);
        if (pathIndex >= 0 && pathIndex + 1 < withoutQuery.length()) {
            return withoutQuery.substring(pathIndex + 1);
        }
        throw new ServiceException("照片对象Key未配置");
    }

    private String resolveDownloadFileName(YyPhotoAsset asset) {
        return resolveFileName(asset, asset.getObjectKey());
    }

    private String resolveFileName(YyPhotoAsset asset, String objectKey) {
        String fileName = StringUtils.trimToEmpty(asset.getFileName());
        if (StringUtils.isNotBlank(fileName) && StringUtils.equals(objectKey, asset.getObjectKey())) {
            return fileName;
        }
        objectKey = StringUtils.trimToEmpty(objectKey);
        int slashIndex = objectKey.lastIndexOf('/');
        if (slashIndex >= 0 && slashIndex + 1 < objectKey.length()) {
            return objectKey.substring(slashIndex + 1);
        }
        return StringUtils.defaultIfBlank(objectKey, "photo-" + asset.getId());
    }

    private String contentTypeOf(YyPhotoAsset asset) {
        return contentTypeOf(StringUtils.defaultIfBlank(asset.getFileName(), asset.getObjectKey()));
    }

    private String contentTypeOf(String fileNameOrObjectKey) {
        String name = StringUtils.lowerCase(fileNameOrObjectKey);
        if (StringUtils.endsWithAny(name, ".jpg", ".jpeg")) {
            return "image/jpeg";
        }
        if (StringUtils.endsWith(name, ".png")) {
            return "image/png";
        }
        if (StringUtils.endsWith(name, ".webp")) {
            return "image/webp";
        }
        if (StringUtils.endsWith(name, ".gif")) {
            return "image/gif";
        }
        return "application/octet-stream";
    }

    private String resolveThumbnailObjectKey(YyPhotoAsset asset) {
        return StringUtils.defaultIfBlank(asset.getThumbnailObjectKey(), resolveObjectKey(asset));
    }

    private String toClientId(Long id) {
        return id == null ? null : String.valueOf(id);
    }

    private ClientPhotoAlbumVo toAlbumVo(YyPhotoAlbum album, List<YyPhotoAsset> visibleAssets) {
        ClientPhotoAlbumVo vo = new ClientPhotoAlbumVo();
        vo.setAlbumId(toClientId(album.getId()));
        vo.setTitle(album.getAlbumName());
        vo.setAssetCount(visibleAssets == null ? 0 : visibleAssets.size());
        vo.setCoverAssetId(visibleAssets == null || visibleAssets.isEmpty() ? null : toClientId(visibleAssets.get(0).getId()));
        vo.setCustomerName(album.getCustomerName());
        vo.setChannelType(album.getChannelType());
        vo.setStatus(StringUtils.defaultIfBlank(album.getStatus(), "ACTIVE"));
        vo.setSelectionStatus(StringUtils.defaultIfBlank(album.getSelectionStatus(), "DRAFT"));
        vo.setExpireTime(album.getExpireTime());
        return vo;
    }

    private List<YyPhotoAsset> listVisibleAssetsByAlbumId(Long albumId) {
        return assetMapper.selectList(Wrappers.<YyPhotoAsset>lambdaQuery()
                .eq(YyPhotoAsset::getAlbumId, albumId)
                .orderByAsc(YyPhotoAsset::getSort)
                .orderByAsc(YyPhotoAsset::getId))
            .stream()
            .filter(this::isVisibleAsset)
            .toList();
    }

    private java.util.Map<Long, List<YyPhotoAsset>> listVisibleAssetsByAlbumIds(List<Long> albumIds) {
        if (albumIds == null || albumIds.isEmpty()) {
            return java.util.Map.of();
        }
        return assetMapper.selectList(Wrappers.<YyPhotoAsset>lambdaQuery()
                .in(YyPhotoAsset::getAlbumId, albumIds)
                .orderByAsc(YyPhotoAsset::getAlbumId)
                .orderByAsc(YyPhotoAsset::getSort)
                .orderByAsc(YyPhotoAsset::getId))
            .stream()
            .filter(this::isVisibleAsset)
            .collect(java.util.stream.Collectors.groupingBy(
                YyPhotoAsset::getAlbumId,
                java.util.stream.Collectors.toList()
            ));
    }

    private ClientPhotoAssetVo toAssetVo(YyPhotoAsset asset) {
        ClientPhotoAssetVo vo = new ClientPhotoAssetVo();
        vo.setAssetId(toClientId(asset.getId()));
        vo.setFileName(asset.getFileName());
        vo.setSort(asset.getSort());
        vo.setSelected(asset.getIsSelected());
        return vo;
    }

    private void logAccess(Long albumId, Long assetId, String phone, String platform, String action, String ip, boolean success, String remark) {
        try {
            YyPhotoAccessLog logEntity = new YyPhotoAccessLog();
            logEntity.setAlbumId(albumId);
            logEntity.setAssetId(assetId);
            logEntity.setCustomerPhone(phone);
            logEntity.setPlatform(platform);
            logEntity.setAction(action);
            logEntity.setIp(ip);
            logEntity.setSuccess(success ? "1" : "0");
            logEntity.setRemark(remark);
            accessLogMapper.insert(logEntity);
        } catch (Exception e) {
            log.warn("客户取片访问日志写入失败: action={}, success={}", action, success);
        }
    }

    private String normalizePhone(String phone) {
        String normalized = StringUtils.trimToEmpty(phone).replace(" ", "").replace("-", "");
        if (normalized.length() < 6 || normalized.length() > 32) {
            throw new ServiceException("手机号格式错误");
        }
        return normalized;
    }

    private boolean phoneMatches(String storedPhone, String normalizedPhone) {
        String plainStoredPhone = normalizeStoredPhoneOrNull(storedPhone);
        return plainStoredPhone != null && Objects.equals(plainStoredPhone, normalizedPhone);
    }

    private String normalizeStoredPhoneOrNull(String storedPhone) {
        String plainPhone = decryptPhoneIfNeeded(StringUtils.trimToEmpty(storedPhone));
        if (StringUtils.isBlank(plainPhone)) {
            return null;
        }
        try {
            return normalizePhone(plainPhone);
        } catch (ServiceException e) {
            return null;
        }
    }

    private String decryptPhoneIfNeeded(String storedPhone) {
        if (!StringUtils.startsWith(storedPhone, Constants.ENCRYPT_HEADER)) {
            return storedPhone;
        }
        try {
            return encryptorManager.decrypt(storedPhone, buildDefaultEncryptContext());
        } catch (Exception e) {
            log.warn("客户取片手机号解密失败，已按不匹配处理");
            return null;
        }
    }

    private EncryptContext buildDefaultEncryptContext() {
        EncryptContext context = new EncryptContext();
        context.setAlgorithm(encryptorProperties.getAlgorithm() == null ? AlgorithmType.AES : encryptorProperties.getAlgorithm());
        context.setEncode(encryptorProperties.getEncode() == null ? EncodeType.BASE64 : encryptorProperties.getEncode());
        context.setPassword(StringUtils.defaultIfBlank(encryptorProperties.getPassword(), "change-16-bytes!"));
        context.setPrivateKey(encryptorProperties.getPrivateKey());
        context.setPublicKey(encryptorProperties.getPublicKey());
        return context;
    }

    private static EncryptorProperties defaultEncryptorProperties() {
        EncryptorProperties properties = new EncryptorProperties();
        properties.setEnable(true);
        properties.setAlgorithm(AlgorithmType.AES);
        properties.setEncode(EncodeType.BASE64);
        properties.setPassword("change-16-bytes!");
        return properties;
    }

    private String normalizePlatform(String platform) {
        String normalized = StringUtils.upperCase(StringUtils.defaultIfBlank(platform, "H5"));
        return switch (normalized) {
            case "WECHAT", "WECHAT_MINI_APP" -> "WECHAT_MINI_APP";
            case "DOUYIN", "DOUYIN_MINI_APP" -> "DOUYIN_MINI_APP";
            case "DOUYIN_LIFE" -> "DOUYIN_LIFE";
            case "MANUAL" -> "MANUAL";
            default -> "H5";
        };
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) {
            return "****";
        }
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }

    private String randomSixDigitCode() {
        return String.valueOf(100000 + secureRandom.nextInt(900000));
    }

    private Instant now() {
        return clock.instant();
    }

    private record ClientIdentity(String phone, String platform, long expiresAt, Set<Long> authorizedAlbumIds) {
        private boolean isAlbumAuthorized(Long albumId) {
            return albumId != null && authorizedAlbumIds.contains(albumId);
        }
    }
}
