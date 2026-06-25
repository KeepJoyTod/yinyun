package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * Resource size backfill result.
 */
@Data
public class YyPhotoResourceSizeBackfillVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long attemptedCount;

    private Long updatedCount;

    private Long skippedCount;

    private Long failedCount;

    private Long remainingMissingSizeCount;

    private String message;
}
