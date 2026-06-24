package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyPhotoTag;

/**
 * 璧勬簮鏍囩涓氬姟瀵硅薄 yy_photo_tag
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyPhotoTag.class, reverseConvertGenerate = false)
public class YyPhotoTagBo extends BaseEntity {

    @NotNull(message = "鏍囩ID涓嶈兘涓虹┖", groups = { EditGroup.class })
    private Long id;

    @NotNull(message = "门店不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long storeId;

    @NotBlank(message = "鏍囩鍚嶄笉鑳戒负绌?", groups = { AddGroup.class, EditGroup.class })
    private String tagName;

    private String keyword;

    private String remark;
}
