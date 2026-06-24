package org.dromara.yy.domain.bo;

import lombok.Data;

/**
 * 相册工作流动作请求。
 */
@Data
public class YyPhotoAlbumActionBo {

    /**
     * 订单上下文，仅用于后台操作日志审计和工作台订单抽屉匹配。
     */
    private Long orderId;

    /**
     * 相册上下文，仅用于后台操作日志审计；业务主键仍以 path id 为准。
     */
    private Long albumId;

    /**
     * 通知渠道；未传时由服务端按动作默认值补齐。
     */
    private String channelType;

    /**
     * 接收人；通知动作未传时默认取相册客户手机号。
     */
    private String receiver;

    /**
     * 操作备注。
     */
    private String remark;
}
