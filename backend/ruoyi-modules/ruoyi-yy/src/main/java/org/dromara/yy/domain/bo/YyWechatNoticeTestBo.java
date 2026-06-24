package org.dromara.yy.domain.bo;

import lombok.Data;

/**
 * 微信通知测试请求
 */
@Data
public class YyWechatNoticeTestBo {

    /**
     * 客户手机号
     */
    private String customerPhone;

    /**
     * 订单编号
     */
    private String orderNo;

    /**
     * 模板编码
     */
    private String templateCode;

    /**
     * 备注
     */
    private String remark;
}
