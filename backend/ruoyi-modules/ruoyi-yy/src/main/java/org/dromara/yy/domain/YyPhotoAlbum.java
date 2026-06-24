package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.encrypt.annotation.EncryptField;
import org.dromara.common.tenant.core.TenantEntity;
import java.io.Serial;
import java.util.Date;

/**
 * 影约云相册对象 yy_photo_album
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_photo_album")
public class YyPhotoAlbum extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 门店ID
     */
    private Long storeId;

    /**
     * 订单ID
     */
    private Long orderId;

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
    @EncryptField
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

    /**
     * 过期时间
     */
    private Date expireTime;

    /**
     * 备注
     */
    private String remark;

    /**
     * 删除标志
     */
    @TableLogic
    private String delFlag;
}
