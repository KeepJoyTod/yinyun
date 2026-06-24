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
import org.dromara.yy.domain.YyMicroFormSubmission;

import java.util.Date;

@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyMicroFormSubmission.class, reverseConvertGenerate = false)
public class YyMicroFormSubmissionBo extends BaseEntity {

    @NotNull(message = "id is required", groups = { EditGroup.class })
    private Long id;

    @NotNull(message = "formId is required", groups = { AddGroup.class, EditGroup.class })
    private Long formId;

    private String formNameSnapshot;

    private String customerName;

    private String customerPhone;

    @NotBlank(message = "answersJson is required", groups = { AddGroup.class, EditGroup.class })
    private String answersJson;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date submittedAt;

    private String followStatus;

    private String followRemark;

    private Long orderId;

    private String remark;
}
