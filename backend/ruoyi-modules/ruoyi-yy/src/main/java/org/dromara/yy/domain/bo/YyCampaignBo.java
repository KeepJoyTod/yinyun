package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyCampaign;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyCampaign.class, reverseConvertGenerate = false)
public class YyCampaignBo extends BaseEntity {

    @NotNull(message = "活动ID不能为空", groups = { EditGroup.class })
    private Long id;

    private Long storeId;

    @NotBlank(message = "活动名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String campaignName;

    @NotBlank(message = "活动类型不能为空", groups = { AddGroup.class, EditGroup.class })
    private String campaignType;

    private String status;

    private Long queryStoreId;

    @NotEmpty(message = "适用门店不能为空", groups = { AddGroup.class, EditGroup.class })
    private List<Long> storeIds;

    private List<Long> productIds;

    private String startAt;

    private String endAt;

    private String ruleSummary;
}
