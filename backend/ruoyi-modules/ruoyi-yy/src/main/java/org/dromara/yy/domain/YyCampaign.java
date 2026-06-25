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
@TableName("yy_campaign")
public class YyCampaign extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId("id")
    private Long id;

    private String campaignCode;
    private String campaignName;
    private String campaignType;
    private Long storeId;
    private String storeScope;
    private String timeRangeStart;
    private String timeRangeEnd;
    private String ruleSummary;
    private String status;

    @TableLogic
    private String delFlag;
}
