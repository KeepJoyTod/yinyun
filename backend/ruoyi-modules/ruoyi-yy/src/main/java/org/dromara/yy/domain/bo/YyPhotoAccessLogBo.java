package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyPhotoAccessLog;

/**
 * 客户取片访问日志业务对象 yy_photo_access_log
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyPhotoAccessLog.class, reverseConvertGenerate = false)
public class YyPhotoAccessLogBo extends BaseEntity {

    /**
     * 主键
     */
    private Long id;

    /**
     * 门店ID
     */
    private Long storeId;

    /**
     * 相册ID
     */
    private Long albumId;

    /**
     * 底片ID
     */
    private Long assetId;

    /**
     * 客户手机号
     */
    private String customerPhone;

    /**
     * 访问平台
     */
    private String platform;

    /**
     * 访问动作
     */
    private String action;

    /**
     * 访问IP
     */
    private String ip;

    /**
     * 是否成功
     */
    private String success;

    /**
     * 备注
     */
    private String remark;
}
