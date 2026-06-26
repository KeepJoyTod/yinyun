package org.dromara.yy.service;

import org.dromara.yy.domain.bo.YyScheduleGovernanceBo;
import org.dromara.yy.domain.vo.YyScheduleGovernancePreviewVo;

public interface IYyScheduleGovernanceService {

    YyScheduleGovernancePreviewVo preview(YyScheduleGovernanceBo bo);

    YyScheduleGovernancePreviewVo apply(YyScheduleGovernanceBo bo);
}
