package org.dromara.yy.controller;

import org.dromara.yy.domain.vo.ClientPhotoStreamAssetVo;
import org.dromara.yy.service.IYyClientPhotoService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.OutputStream;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyClientPhotoControllerTest {

    @Mock
    private IYyClientPhotoService clientPhotoService;

    @Test
    void streamShouldSetImageHeadersBeforeWritingObject() throws Exception {
        YyClientPhotoController controller = new YyClientPhotoController(clientPhotoService);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Client-Token", "client-token-001");
        MockHttpServletResponse response = new MockHttpServletResponse();
        ClientPhotoStreamAssetVo asset = new ClientPhotoStreamAssetVo();
        asset.setAssetId("2063173289800183809");
        asset.setFileName("02_脱敏处理代码证据.png");
        asset.setContentType("image/png");
        when(clientPhotoService.streamAssetInfo("client-token-001", 2063173289800183809L)).thenReturn(asset);

        controller.stream(2063173289800183809L, request, response);

        assertEquals("image/png", response.getContentType());
        assertEquals("nosniff", response.getHeader("X-Content-Type-Options"));
        assertTrue(response.getHeader("Content-Disposition").contains("attachment"));
        assertTrue(response.getHeader("Content-Disposition").contains("filename=\""));
        assertTrue(response.getHeader("Content-Disposition").contains(".png\""));
        assertTrue(response.getHeader("Content-Disposition").contains("filename*=UTF-8''02_%E8%84%B1%E6%95%8F%E5%A4%84%E7%90%86%E4%BB%A3%E7%A0%81%E8%AF%81%E6%8D%AE.png"));
        verify(clientPhotoService).streamAsset(eq("client-token-001"), eq(2063173289800183809L), any(OutputStream.class));
    }

    @Test
    void streamShouldReturnJsonErrorWhenObjectReadFails() throws Exception {
        YyClientPhotoController controller = new YyClientPhotoController(clientPhotoService);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Client-Token", "client-token-001");
        MockHttpServletResponse response = new MockHttpServletResponse();
        ClientPhotoStreamAssetVo asset = new ClientPhotoStreamAssetVo();
        asset.setAssetId("2063173289800183809");
        asset.setFileName("02_脱敏处理代码证据.png");
        asset.setContentType("image/png");
        when(clientPhotoService.streamAssetInfo("client-token-001", 2063173289800183809L)).thenReturn(asset);
        doThrow(new java.io.IOException("oss read failed"))
            .when(clientPhotoService).streamAsset(eq("client-token-001"), eq(2063173289800183809L), any(OutputStream.class));

        controller.stream(2063173289800183809L, request, response);

        assertEquals(500, response.getStatus());
        assertTrue(response.getContentType().startsWith("application/json"));
        assertTrue(response.getContentAsString().contains("\"code\":500"));
        assertTrue(response.getContentAsString().contains("图片流读取失败"));
    }

    @Test
    void albumsShouldOnlyResolveClientTokenFromHeaders() {
        YyClientPhotoController controller = new YyClientPhotoController(clientPhotoService);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setParameter("client_token", "query-token-should-not-be-used");
        when(clientPhotoService.listAlbums(null)).thenReturn(List.of());

        controller.albums(request);

        verify(clientPhotoService).listAlbums(isNull());
    }
}
