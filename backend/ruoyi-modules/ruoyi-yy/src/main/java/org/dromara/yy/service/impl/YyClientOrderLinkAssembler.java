package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPhotoAlbum;
import org.dromara.yy.domain.vo.ClientOrderLinkVo;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.BiFunction;

final class YyClientOrderLinkAssembler {

    private static final String DEFAULT_PUBLIC_BASE_URL = "https://photo.evanshine.me";

    private YyClientOrderLinkAssembler() {
    }

    static List<ClientOrderLinkVo> toClientOrderLinks(List<YyOrder> orders, YyPhotoAlbumMapper photoAlbumMapper,
                                                      String publicBaseUrl,
                                                      BiFunction<String, String, String> externalStatusResolver) {
        if (orders == null || orders.isEmpty()) {
            return List.of();
        }
        Map<Long, YyPhotoAlbum> albumsByOrderId = queryAlbumsByOrderId(orders, photoAlbumMapper);
        return orders.stream()
            .map(order -> toClientOrderLinkVo(order, albumsByOrderId.get(order.getId()), publicBaseUrl, externalStatusResolver))
            .toList();
    }

    private static ClientOrderLinkVo toClientOrderLinkVo(YyOrder order, YyPhotoAlbum album, String publicBaseUrl,
                                                         BiFunction<String, String, String> externalStatusResolver) {
        ClientOrderLinkVo vo = new ClientOrderLinkVo();
        vo.setOrderId(order.getId() == null ? "" : String.valueOf(order.getId()));
        vo.setOrderNo(firstNotBlank(order.getOrderNo(), ""));
        vo.setChannelType(firstNotBlank(order.getChannelType(), order.getSource(), ""));
        vo.setStatus(firstNotBlank(order.getStatus(), "UNKNOWN"));
        vo.setPayStatus(firstNotBlank(order.getPayStatus(), ""));
        vo.setExternalStatus(externalStatusResolver.apply(order.getSource(), order.getExternalOrderId()));
        vo.setCustomerName(null);
        vo.setPhoneMasked(YyClientOrderPhoneMatcher.maskPhone(order.getCustomerPhone()));
        vo.setAmount(formatAmount(order.getPaidAmountCent() != null ? order.getPaidAmountCent() : order.getTotalAmountCent()));
        vo.setTitle(firstNotBlank(order.getOrderNo(), "影约云订单"));
        vo.setProductTitle("");
        vo.setCreatedTime(order.getOrderTime());
        vo.setAppointmentTime(order.getArrivalTime());
        boolean pickupAvailable = album != null && album.getId() != null && "ACTIVE".equals(firstNotBlank(album.getStatus(), "ACTIVE"));
        vo.setPickupAvailable(pickupAvailable);
        vo.setPickupUrl(pickupAvailable ? publicUrl(publicBaseUrl, "/customer/albums/" + album.getId()) : "");
        vo.setOrderDetailUrl(publicUrl(
            publicBaseUrl,
            "/customer/orders/" + encodePathSegment(firstNotBlank(order.getOrderNo(), String.valueOf(order.getId())))
        ));
        return vo;
    }

    private static Map<Long, YyPhotoAlbum> queryAlbumsByOrderId(List<YyOrder> orders, YyPhotoAlbumMapper photoAlbumMapper) {
        List<Long> orderIds = orders.stream()
            .map(YyOrder::getId)
            .filter(Objects::nonNull)
            .toList();
        if (orderIds.isEmpty()) {
            return Map.of();
        }
        List<YyPhotoAlbum> albums = photoAlbumMapper.selectList(Wrappers.<YyPhotoAlbum>lambdaQuery()
            .in(YyPhotoAlbum::getOrderId, orderIds)
            .orderByDesc(YyPhotoAlbum::getId));
        Map<Long, YyPhotoAlbum> latestAlbums = new LinkedHashMap<>();
        for (YyPhotoAlbum album : albums == null ? List.<YyPhotoAlbum>of() : albums) {
            if (album.getOrderId() != null) {
                latestAlbums.putIfAbsent(album.getOrderId(), album);
            }
        }
        return latestAlbums;
    }

    private static String publicUrl(String baseUrl, String path) {
        String base = StringUtils.trimToEmpty(baseUrl).replaceAll("/+$", "");
        String normalizedPath = path.startsWith("/") ? path : "/" + path;
        return firstNotBlank(base, DEFAULT_PUBLIC_BASE_URL) + normalizedPath;
    }

    private static String encodePathSegment(String value) {
        return URLEncoder.encode(firstNotBlank(value, ""), StandardCharsets.UTF_8)
            .replace("+", "%20");
    }

    private static String formatAmount(Long amountCent) {
        if (amountCent == null || amountCent <= 0) {
            return "";
        }
        return BigDecimal.valueOf(amountCent, 2).setScale(2).toPlainString();
    }

    private static String firstNotBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            if (StringUtils.isNotBlank(value)) {
                return value;
            }
        }
        return "";
    }
}
