package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;
import org.dromara.yy.handler.JsonbStringTypeHandler;

import java.io.Serial;
import java.util.Date;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName(value = "yy_merchant_decoration", autoResultMap = true)
public class YyMerchantDecoration extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    private Long storeId;

    private String channelType;

    private String status;

    @TableField(typeHandler = JsonbStringTypeHandler.class)
    private String configJson;

    @TableField(typeHandler = JsonbStringTypeHandler.class)
    private String publishedConfigJson;

    private Long shareIconOssId;

    private Long watermarkOssId;

    private Date publishedAt;

    private String previewToken;

    private String remark;

    @TableLogic
    private String delFlag;
}
