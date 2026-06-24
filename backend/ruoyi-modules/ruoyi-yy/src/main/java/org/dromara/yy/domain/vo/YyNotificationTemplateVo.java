package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyNotificationTemplate;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 通知模板视图对象 yy_notification_template
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyNotificationTemplate.class)
public class YyNotificationTemplateVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "主键")
    private Long id;

    /**
     * 租户编号
     */
    private String tenantId;

    @ExcelProperty(value = "模板编码")
    private String templateCode;

    @ExcelProperty(value = "业务场景")
    private String scene;

    @ExcelProperty(value = "通知渠道")
    private String channelType;

    @ExcelProperty(value = "标题")
    private String title;

    @ExcelProperty(value = "模板内容")
    private String content;

    @ExcelProperty(value = "服务商模板ID")
    private String providerTemplateId;

    @ExcelProperty(value = "是否启用")
    private String enabled;

    @ExcelProperty(value = "备注")
    private String remark;

    @ExcelProperty(value = "创建时间")
    private Date createTime;

    @ExcelProperty(value = "更新时间")
    private Date updateTime;
}
