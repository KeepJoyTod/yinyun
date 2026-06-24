package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyPhotoAccessLog;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 客户取片访问日志视图对象 yy_photo_access_log
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyPhotoAccessLog.class)
public class YyPhotoAccessLogVo implements Serializable {

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

    /**
     * 门店ID
     */
    @ExcelProperty(value = "门店ID")
    private Long storeId;

    /**
     * 相册ID
     */
    @ExcelProperty(value = "相册ID")
    private Long albumId;

    /**
     * 底片ID
     */
    @ExcelProperty(value = "底片ID")
    private Long assetId;

    /**
     * 客户手机号
     */
    @ExcelProperty(value = "客户手机号")
    private String customerPhone;

    /**
     * 访问平台
     */
    @ExcelProperty(value = "访问平台")
    private String platform;

    /**
     * 访问动作
     */
    @ExcelProperty(value = "访问动作")
    private String action;

    /**
     * 访问IP
     */
    @ExcelProperty(value = "访问IP")
    private String ip;

    /**
     * 是否成功
     */
    @ExcelProperty(value = "是否成功")
    private String success;

    /**
     * 备注
     */
    @ExcelProperty(value = "备注")
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
