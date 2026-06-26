package org.dromara.yy.service;

import org.dromara.yy.domain.bo.YyCardBatchOrderCreateBo;
import org.dromara.yy.domain.bo.YyCardBatchOrderQueryBo;
import org.dromara.yy.domain.vo.YyCardBatchOrderVo;

import java.util.List;

public interface IYyCardBatchOrderService {

    List<YyCardBatchOrderVo> listCardBatchOrders(YyCardBatchOrderQueryBo bo);

    YyCardBatchOrderVo createCardBatchOrder(YyCardBatchOrderCreateBo bo);
}
