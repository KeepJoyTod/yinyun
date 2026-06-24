package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * 璧勬簮绠＄悊琛岃鍥惧璞?
 */
@Data
public class YyPhotoResourceRowVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long assetId;

    private Long albumId;

    private Long storeId;

    private String storeName;

    private Long orderId;

    private Long productId;

    private String productName;

    private String fileName;

    private String fileUrl;

    private String thumbnailUrl;

    private String assetType;

    private Integer rating;

    private String visible;

    private Long fileSizeBytes;

    private List<YyPhotoTagVo> tagList = new ArrayList<>();

    private String customerName;

    private String customerPhoneMasked;

    private String albumName;

    private Date uploadedAt;

    private Long uploaderId;

    private String uploaderName;
}
