package org.dromara.yy.service.impl;

import org.apache.commons.lang3.StringUtils;
import org.dromara.yy.domain.bo.YyCustomerBo;
import org.dromara.yy.domain.bo.YyNotificationLogBo;
import org.dromara.yy.domain.bo.YyPhotoAlbumBo;
import org.dromara.yy.domain.vo.YyCustomerVo;
import org.dromara.yy.domain.vo.YyNotificationLogVo;
import org.dromara.yy.domain.vo.YyPhotoAlbumVo;
import org.dromara.yy.domain.vo.YyToolPrecisionDeliverySummaryVo;
import org.dromara.yy.domain.vo.YyToolPrecisionDeliveryTaskVo;
import org.dromara.yy.domain.vo.YyToolSampleWorkVo;
import org.dromara.yy.service.IYyCustomerService;
import org.dromara.yy.service.IYyNotificationLogService;
import org.dromara.yy.service.IYyPhotoAlbumService;
import org.dromara.yy.service.IYyToolCenterService;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class YyToolCenterServiceImpl implements IYyToolCenterService {

    private final IYyPhotoAlbumService yyPhotoAlbumService;
    private final IYyCustomerService yyCustomerService;
    private final IYyNotificationLogService yyNotificationLogService;

    public YyToolCenterServiceImpl(
        IYyPhotoAlbumService yyPhotoAlbumService,
        IYyCustomerService yyCustomerService,
        IYyNotificationLogService yyNotificationLogService
    ) {
        this.yyPhotoAlbumService = yyPhotoAlbumService;
        this.yyCustomerService = yyCustomerService;
        this.yyNotificationLogService = yyNotificationLogService;
    }

    @Override
    public List<YyToolSampleWorkVo> listSampleWorks() {
        List<YyPhotoAlbumVo> albums = albums();
        if (albums.isEmpty()) {
            return List.of(sample("sample-empty", "No authorized sample album", "", "DRAFT", "scaffold"));
        }
        return albums.stream()
            .sorted(Comparator.comparing(YyPhotoAlbumVo::getUpdateTime, Comparator.nullsLast(Comparator.reverseOrder())))
            .limit(20)
            .map(album -> sample(
                "album-" + album.getId(),
                StringUtils.defaultIfBlank(album.getAlbumName(), "Album " + album.getId()),
                String.valueOf(album.getId()),
                publishStatus(album),
                activeStatus(album.getStatus()) ? "ready" : "scaffold"
            ))
            .toList();
    }

    @Override
    public List<YyToolSampleWorkVo> publishSampleWork(String sampleId) {
        return listSampleWorks().stream()
            .peek(item -> {
                if (StringUtils.equals(item.getSampleId(), sampleId)) {
                    item.setPublishStatus("REVIEWING");
                }
            })
            .toList();
    }

    @Override
    public YyToolPrecisionDeliverySummaryVo getPrecisionDeliverySummary() {
        List<YyCustomerVo> customers = customers();
        List<YyNotificationLogVo> logs = notificationLogs();
        YyToolPrecisionDeliverySummaryVo vo = new YyToolPrecisionDeliverySummaryVo();
        vo.setAudienceCount(customers.size());
        vo.setActiveTaskCount((int) logs.stream().filter(log -> !delivered(log)).count());
        vo.setDeliveredCount((int) logs.stream().filter(this::delivered).count());
        vo.setStatus(customers.isEmpty() && logs.isEmpty() ? "scaffold" : "ready");
        return vo;
    }

    @Override
    public List<YyToolPrecisionDeliveryTaskVo> listPrecisionDeliveryTasks() {
        Map<String, List<YyNotificationLogVo>> logsByChannel = notificationLogs().stream()
            .collect(Collectors.groupingBy(log -> StringUtils.defaultIfBlank(log.getChannelType(), "UNKNOWN")));
        if (logsByChannel.isEmpty()) {
            return List.of(task("delivery-empty", "No precision delivery logs", "UNKNOWN", "No audience selected", "DRAFT", "scaffold"));
        }
        return logsByChannel.entrySet().stream()
            .map(entry -> {
                String channelType = entry.getKey();
                List<YyNotificationLogVo> logs = entry.getValue();
                long deliveredCount = logs.stream().filter(this::delivered).count();
                return task(
                    "delivery-" + channelType.toLowerCase(Locale.ROOT),
                    channelType + " delivery",
                    channelType,
                    logs.size() + " notification logs",
                    deliveredCount > 0 ? "SENT" : "SCHEDULED",
                    "ready"
                );
            })
            .toList();
    }

    private List<YyPhotoAlbumVo> albums() {
        return safeList(yyPhotoAlbumService.queryList(new YyPhotoAlbumBo()));
    }

    private List<YyCustomerVo> customers() {
        return safeList(yyCustomerService.queryList(new YyCustomerBo()));
    }

    private List<YyNotificationLogVo> notificationLogs() {
        return safeList(yyNotificationLogService.queryList(new YyNotificationLogBo()));
    }

    private boolean delivered(YyNotificationLogVo log) {
        String status = StringUtils.defaultString(log.getSendStatus()).trim().toUpperCase(Locale.ROOT);
        return "SENT".equals(status) || "SUCCESS".equals(status) || "DELIVERED".equals(status);
    }

    private static String publishStatus(YyPhotoAlbumVo album) {
        String status = StringUtils.defaultString(album.getStatus()).trim().toUpperCase(Locale.ROOT);
        if ("PUBLISHED".equals(status) || "PUBLIC".equals(status) || "ACTIVE".equals(status)) return "PUBLISHED";
        if ("REVIEWING".equals(status)) return "REVIEWING";
        return "DRAFT";
    }

    private static boolean activeStatus(String status) {
        String normalized = StringUtils.defaultString(status).trim().toUpperCase(Locale.ROOT);
        return "ACTIVE".equals(normalized) || "PUBLISHED".equals(normalized) || "PUBLIC".equals(normalized);
    }

    private static YyToolSampleWorkVo sample(String sampleId, String title, String albumId, String publishStatus, String status) {
        YyToolSampleWorkVo vo = new YyToolSampleWorkVo();
        vo.setSampleId(sampleId);
        vo.setTitle(title);
        vo.setAlbumId(albumId);
        vo.setPublishStatus(publishStatus);
        vo.setStatus(status);
        return vo;
    }

    private static YyToolPrecisionDeliveryTaskVo task(
        String taskId,
        String taskName,
        String channelType,
        String targetLabel,
        String deliveryStatus,
        String status
    ) {
        YyToolPrecisionDeliveryTaskVo vo = new YyToolPrecisionDeliveryTaskVo();
        vo.setTaskId(taskId);
        vo.setTaskName(taskName);
        vo.setChannelType(channelType);
        vo.setTargetLabel(targetLabel);
        vo.setDeliveryStatus(deliveryStatus);
        vo.setStatus(status);
        return vo;
    }

    private static <T> List<T> safeList(List<T> rows) {
        return rows == null ? List.of() : rows;
    }
}
