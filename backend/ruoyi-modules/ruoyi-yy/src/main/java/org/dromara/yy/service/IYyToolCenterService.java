package org.dromara.yy.service;

import org.dromara.yy.domain.vo.YyToolPrecisionDeliverySummaryVo;
import org.dromara.yy.domain.vo.YyToolPrecisionDeliveryTaskVo;
import org.dromara.yy.domain.vo.YyToolSampleWorkVo;

import java.util.List;

public interface IYyToolCenterService {

    List<YyToolSampleWorkVo> listSampleWorks();

    List<YyToolSampleWorkVo> publishSampleWork(String sampleId);

    YyToolPrecisionDeliverySummaryVo getPrecisionDeliverySummary();

    List<YyToolPrecisionDeliveryTaskVo> listPrecisionDeliveryTasks();
}
