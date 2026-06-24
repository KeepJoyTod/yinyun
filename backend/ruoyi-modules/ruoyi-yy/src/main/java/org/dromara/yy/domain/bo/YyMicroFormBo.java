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
import org.dromara.yy.domain.YyMicroForm;

import java.util.Date;

@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyMicroForm.class, reverseConvertGenerate = false)
public class YyMicroFormBo extends BaseEntity {

    @NotNull(message = "id is required", groups = { EditGroup.class })
    private Long id;

    private Long storeId;

    @NotBlank(message = "formName is required", groups = { AddGroup.class, EditGroup.class })
    private String formName;

    private String status;

    @NotBlank(message = "schemaJson is required", groups = { AddGroup.class, EditGroup.class })
    private String schemaJson;

    private String notifyUsers;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date publishedAt;

    private String linkKey;

    private String remark;
}
