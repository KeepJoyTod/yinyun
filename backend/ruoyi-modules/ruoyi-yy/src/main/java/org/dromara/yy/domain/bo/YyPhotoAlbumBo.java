package org.dromara.yy.domain.bo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyPhotoAlbum;
import java.util.Date;

/**
 * 影约云相册业务对象 yy_photo_album
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyPhotoAlbum.class, reverseConvertGenerate = false)
public class YyPhotoAlbumBo extends BaseEntity {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    @NotNull(message = "门店ID不能为空", groups = { AddGroup.class, EditGroup.class })
    /**
     * 门店ID
     */
    private Long storeId;

    /**
     * 订单ID
     */
    private Long orderId;

    @NotBlank(message = "相册名称不能为空", groups = { AddGroup.class, EditGroup.class })
    /**
     * 相册名称
     */
    private String albumName;

    /**
     * 客户姓名
     */
    private String customerName;

    /**
     * 客户手机号
     */
    private String customerPhone;

    /**
     * 公开选片令牌
     */
    private String publicToken;

    /**
     * 客户取片码
     */
    private String accessCode;

    /**
     * 渠道类型
     */
    private String channelType;

    /**
     * 相册状态
     */
    private String status;

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
    /**
     * 过期时间
     */
    private Date expireTime;

    /**
     * 备注
     */
    private String remark;
}
