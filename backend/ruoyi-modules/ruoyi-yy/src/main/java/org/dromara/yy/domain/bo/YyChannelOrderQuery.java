package org.dromara.yy.domain.bo;

import lombok.Data;

/**
 * 渠道订单查询对象
 */
@Data
public class YyChannelOrderQuery {

    /**
     * 门店ID
     */
    private Long storeId;

    /**
     * 渠道类型
     */
    private String channelType;

    /**
     * 关键字
     */
    private String keyword;

    /**
     * 测试用户 open_id，抖音服务市场沙盒联调用
     */
    private String openId;

    /**
     * 抖音服务ID
     */
    private String serviceId;

    /**
     * 抖音服务模式ID
     */
    private String serviceModeId;

    /**
     * 抖音生活服务商家 account_id
     */
    private String accountId;

    /**
     * 生活服务订单号
     */
    private String orderId;

    /**
     * 手机号后四位，用户侧绑定抖音官方订单时用于校验归属
     */
    private String phoneLast4;

    /**
     * 商家侧外部订单号
     */
    private String outOrderNo;

    /**
     * 订单状态
     */
    private String orderStatus;

    /**
     * 查询开始时间
     */
    private String startTime;

    /**
     * 查询结束时间
     */
    private String endTime;

    /**
     * 分页页码
     */
    private Integer pageNum;

    /**
     * 分页大小
     */
    private Integer pageSize;

    /**
     * 同步最多翻页数，防止开放平台时间过滤异常时一次灌入过多订单
     */
    private Integer maxPages;

    /**
     * 同步最多处理订单数，防止开放平台时间过滤异常时一次灌入过多订单
     */
    private Integer maxTotal;

    /**
     * 是否开启测试数据头
     */
    private Boolean useTestDataHeader;

    /**
     * 综合预约 book_id
     */
    private String bookId;

    /**
     * 接单结果，1=Accept，2=Reject
     */
    private Integer confirmResult;

    /**
     * 履约类型
     */
    private Integer fulfilType;

    /**
     * 拒单原因
     */
    private String reason;

    /**
     * 拒单码
     */
    private String rejectCode;

    /**
     * 商家备注
     */
    private String merchantNotes;

    /**
     * 抖音生活服务 POI ID
     */
    private String poiId;

    /**
     * 三方码/券码，多个用英文逗号分隔
     */
    private String codes;

    /**
     * 抖音码核销 token
     */
    private String verifyToken;

    /**
     * 是否整单核销
     */
    private Boolean totalVerify;
}
