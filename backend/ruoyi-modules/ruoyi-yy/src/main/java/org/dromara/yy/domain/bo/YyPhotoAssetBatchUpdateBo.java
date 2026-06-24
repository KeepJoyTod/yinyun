package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * 璧勬簮鎵归噺鏇存柊瀵硅薄
 */
@Data
public class YyPhotoAssetBatchUpdateBo {

    @NotEmpty(message = "assetIds 涓嶈兘涓虹┖")
    private List<Long> assetIds;

    private String assetType;

    private Integer rating;

    private Boolean visible;

    private List<Long> tagIdsToAdd;

    private List<Long> tagIdsToRemove;
}
