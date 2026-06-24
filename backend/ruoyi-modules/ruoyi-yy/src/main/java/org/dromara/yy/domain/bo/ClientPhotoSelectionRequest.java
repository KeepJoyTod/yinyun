package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * 客户提交选片请求。
 */
@Data
public class ClientPhotoSelectionRequest {

    /**
     * 客户选择的底片 ID 列表。
     */
    @NotEmpty(message = "请选择至少一张照片")
    private List<Long> assetIds;
}
