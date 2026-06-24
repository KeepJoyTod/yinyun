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
@TableName("yy_campaign_participation")
public class YyCampaignParticipation extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId("id")
    private Long id;

    private Long campaignId;
    private Long customerId;
    private Long orderId;
    private String channelSource;
    private String stage;
    private Long payableAmountCent;
    private Long finalAmountCent;

    @TableLogic
    private String delFlag;
}
