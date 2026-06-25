package org.dromara.yy.service;

import org.dromara.yy.domain.bo.YyPhotoResourceSizeBackfillBo;
import org.dromara.yy.domain.vo.YyPhotoResourceSizeBackfillVo;
import org.dromara.yy.domain.vo.YyPhotoResourceUsageSummaryVo;

/**
 * 璧勬簮鐢ㄩ噺 Service 鎺ュ彛
 */
public interface IYyPhotoResourceUsageService {

    YyPhotoResourceUsageSummaryVo getUsageSummary();

    YyPhotoResourceSizeBackfillVo backfillMissingSize(YyPhotoResourceSizeBackfillBo bo);
}
