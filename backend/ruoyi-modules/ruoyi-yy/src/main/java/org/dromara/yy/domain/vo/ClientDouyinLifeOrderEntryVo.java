package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 客户端抖音来客真实下单入口。
 */
@Data
public class ClientDouyinLifeOrderEntryVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String entryId;

    private String storeId;

    private String productId;

    private String channelType;

    private String title;

    private String externalProductId;

    private String externalSkuId;

    private String externalPoiId;

    private String landingUrl;

    private String landingPath;
}
