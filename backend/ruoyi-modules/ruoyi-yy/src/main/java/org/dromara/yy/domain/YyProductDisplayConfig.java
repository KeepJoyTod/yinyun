package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_product_display_config")
public class YyProductDisplayConfig extends TenantEntity {
    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;
    private Long productId;
    private String showPlatform;
    private String bookingButtonText;
    private String directUrl;
    private String qrScene;
    private String onlineBookingFlag;
    private String storeOrderFlag;
    private String detailButtonMode;
    private String status;
    private String remark;
    @TableLogic
    private String delFlag;
}
