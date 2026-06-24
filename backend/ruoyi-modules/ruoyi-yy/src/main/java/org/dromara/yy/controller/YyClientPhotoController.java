package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.bo.ClientPhotoPlatformLoginRequest;
import org.dromara.yy.domain.bo.ClientPhotoSelectionRequest;
import org.dromara.yy.domain.bo.ClientPhotoSendCodeRequest;
import org.dromara.yy.domain.bo.ClientPhotoVerifyRequest;
import org.dromara.yy.domain.vo.ClientPhotoAlbumDetailVo;
import org.dromara.yy.domain.vo.ClientPhotoAlbumVo;
import org.dromara.yy.domain.vo.ClientPhotoSendCodeVo;
import org.dromara.yy.domain.vo.ClientPhotoSignedUrlVo;
import org.dromara.yy.domain.vo.ClientPhotoStreamAssetVo;
import org.dromara.yy.domain.vo.ClientPhotoTokenVo;
import org.dromara.yy.service.IYyClientPhotoService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * H5/微信/抖音小程序客户取片接口。
 */
@SaIgnore
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/client/photo")
public class YyClientPhotoController {

    private final IYyClientPhotoService clientPhotoService;

    @PostMapping("/auth/send-code")
    public R<ClientPhotoSendCodeVo> sendCode(@Valid @RequestBody ClientPhotoSendCodeRequest request, HttpServletRequest servletRequest) {
        return R.ok(clientPhotoService.sendCode(request, clientIp(servletRequest)));
    }

    @PostMapping("/auth/verify")
    public R<ClientPhotoTokenVo> verify(@Valid @RequestBody ClientPhotoVerifyRequest request, HttpServletRequest servletRequest) {
        return R.ok(clientPhotoService.verify(request, clientIp(servletRequest)));
    }

    @PostMapping("/auth/platform-login")
    public R<ClientPhotoTokenVo> platformLogin(@Valid @RequestBody ClientPhotoPlatformLoginRequest request, HttpServletRequest servletRequest) {
        return R.ok(clientPhotoService.platformLogin(request, clientIp(servletRequest)));
    }

    @GetMapping("/albums")
    public R<List<ClientPhotoAlbumVo>> albums(HttpServletRequest request) {
        return R.ok(clientPhotoService.listAlbums(resolveClientToken(request)));
    }

    @GetMapping("/albums/{albumId}")
    public R<ClientPhotoAlbumDetailVo> albumDetail(@PathVariable Long albumId, HttpServletRequest request) {
        return R.ok(clientPhotoService.getAlbum(resolveClientToken(request), albumId));
    }

    @PostMapping("/albums/{albumId}/selection")
    public R<ClientPhotoAlbumDetailVo> submitSelection(
        @PathVariable Long albumId,
        @Valid @RequestBody ClientPhotoSelectionRequest selectionRequest,
        HttpServletRequest request
    ) {
        return R.ok(clientPhotoService.submitSelection(resolveClientToken(request), albumId, selectionRequest.getAssetIds()));
    }

    @GetMapping("/assets/{assetId}/preview-url")
    public R<ClientPhotoSignedUrlVo> previewUrl(@PathVariable Long assetId, HttpServletRequest request) {
        return R.ok(clientPhotoService.previewUrl(resolveClientToken(request), assetId));
    }

    @GetMapping("/assets/{assetId}/thumbnail-url")
    public R<ClientPhotoSignedUrlVo> thumbnailUrl(@PathVariable Long assetId, HttpServletRequest request) {
        return R.ok(clientPhotoService.thumbnailUrl(resolveClientToken(request), assetId));
    }

    @GetMapping("/assets/{assetId}/download-url")
    public R<ClientPhotoSignedUrlVo> downloadUrl(@PathVariable Long assetId, HttpServletRequest request) {
        return R.ok(clientPhotoService.downloadUrl(resolveClientToken(request), assetId));
    }

    @GetMapping("/assets/{assetId}/stream")
    public void stream(@PathVariable Long assetId, HttpServletRequest request, HttpServletResponse response) throws IOException {
        String clientToken = resolveClientToken(request);
        ClientPhotoStreamAssetVo asset = clientPhotoService.streamAssetInfo(clientToken, assetId);
        try {
            response.setContentType(StringUtils.defaultIfBlank(asset.getContentType(), "application/octet-stream"));
            response.setHeader("Content-Disposition", contentDisposition(asset.getFileName()));
            response.setHeader("X-Content-Type-Options", "nosniff");
            clientPhotoService.streamAsset(clientToken, assetId, response.getOutputStream());
        } catch (Exception e) {
            log.warn("客户取片图片流读取失败: assetId={}", assetId, e);
            if (!response.isCommitted()) {
                response.resetBuffer();
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                String message = "图片流读取失败，请稍后重试或使用签名链接下载";
                response.getOutputStream().write(("{\"code\":500,\"msg\":\"" + message + "\",\"data\":null}").getBytes(StandardCharsets.UTF_8));
            }
        }
    }

    private String contentDisposition(String fileName) {
        String safeFileName = StringUtils.defaultIfBlank(fileName, "photo.jpg");
        String asciiFileName = safeFileName.replaceAll("[^A-Za-z0-9._-]", "_");
        asciiFileName = StringUtils.defaultIfBlank(asciiFileName, "photo.jpg");
        String encoded = URLEncoder.encode(safeFileName, StandardCharsets.UTF_8).replace("+", "%20");
        return "attachment; filename=\"" + asciiFileName + "\"; filename*=UTF-8''" + encoded;
    }

    private String resolveClientToken(HttpServletRequest request) {
        String token = request.getHeader("X-Client-Token");
        if (StringUtils.isBlank(token)) {
            token = request.getHeader("Authorization");
        }
        return token;
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.isNotBlank(forwarded)) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
