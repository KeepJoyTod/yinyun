package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import cn.idev.excel.annotation.format.DateTimeFormat;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyPhotoAlbum;
import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 影约云相册视图对象 yy_photo_album
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyPhotoAlbum.class)
public class YyPhotoAlbumVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @ExcelProperty(value = "主键")
    private Long id;

    /**
     * 租户编号
     */
    private String tenantId;

    @ExcelProperty(value = "门店ID")
    /**
     * 门店ID
     */
    private Long storeId;

    @ExcelProperty(value = "订单ID")
    /**
     * 订单ID
     */
    private Long orderId;

    @ExcelProperty(value = "相册名称")
    /**
     * 相册名称
     */
    private String albumName;

    @ExcelProperty(value = "客户姓名")
    /**
     * 客户姓名
     */
    private String customerName;

    @ExcelProperty(value = "客户手机号")
    /**
     * 客户手机号
     */
    private String customerPhone;

    @ExcelProperty(value = "公开选片令牌")
    /**
     * 公开选片令牌
     */
    private String publicToken;

    @ExcelProperty(value = "客户取片码")
    /**
     * 客户取片码
     */
    private String accessCode;

    @ExcelProperty(value = "渠道类型")
    /**
     * 渠道类型
     */
    private String channelType;

    @ExcelProperty(value = "相册状态")
    /**
     * 相册状态
     */
    private String status;

    @ExcelProperty(value = "选片状态")
    /**
     * 选片状态
     */
    private String selectionStatus;

    /**
     * 抖音订单号
     */
    private String douyinOrderId;

    /**
     * 抖音券码
     */
    private String certificateCode;

    /**
     * 抖音预约单ID
     */
    private String bookId;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat("yyyy-MM-dd HH:mm:ss")
    @ExcelProperty(value = "过期时间")
    /**
     * 过期时间
     */
    private Date expireTime;

    @ExcelProperty(value = "备注")
    /**
     * 备注
     */
    private String remark;

    /**
     * 创建时间
     */
    @ExcelProperty(value = "创建时间")
    private Date createTime;

    /**
     * 更新时间
     */
    @ExcelProperty(value = "更新时间")
    private Date updateTime;
}
