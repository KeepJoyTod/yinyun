package org.dromara.yy.service;

import org.dromara.yy.domain.bo.YyFinanceTransactionQueryBo;
import org.dromara.yy.domain.vo.YyFinanceOverviewVo;
import org.dromara.yy.domain.vo.YyFinanceTransactionVo;

import java.util.List;

public interface IYyFinanceCenterService {

    YyFinanceOverviewVo getOverview();

    List<YyFinanceTransactionVo> listTransactions(YyFinanceTransactionQueryBo bo);
}
