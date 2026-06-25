package org.dromara.yy.service;

import org.dromara.yy.domain.vo.YyMerchantReadinessItemVo;

import java.util.List;

public interface IYyMerchantReadinessService {

    List<YyMerchantReadinessItemVo> summary();

    List<YyMerchantReadinessItemVo> schedule();

    List<YyMerchantReadinessItemVo> channels();

    List<YyMerchantReadinessItemVo> governance();

    List<YyMerchantReadinessItemVo> dependencies();
}
