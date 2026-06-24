package org.dromara.yy.service;

import org.dromara.yy.domain.vo.YyMemberBalanceLedgerVo;
import org.dromara.yy.domain.vo.YyMemberBenefitLedgerVo;
import org.dromara.yy.domain.vo.YyMemberCardInstanceVo;
import org.dromara.yy.domain.vo.YyMemberCouponVo;
import org.dromara.yy.domain.vo.YyMemberGrowthLedgerVo;
import org.dromara.yy.domain.vo.YyMemberOverviewVo;
import org.dromara.yy.domain.vo.YyMemberPointsLedgerVo;

import java.util.List;

public interface IYyMemberAssetService {

    YyMemberOverviewVo getMemberOverview(Long customerId);

    List<YyMemberCardInstanceVo> listMemberCards(Long customerId);

    List<YyMemberBenefitLedgerVo> listMemberBenefits(Long customerId);

    List<YyMemberCouponVo> listMemberCoupons(Long customerId);

    List<YyMemberPointsLedgerVo> listMemberPointsLedger(Long customerId, int limit);

    List<YyMemberGrowthLedgerVo> listMemberGrowthLedger(Long customerId, int limit);

    List<YyMemberBalanceLedgerVo> listMemberBalanceLedger(Long customerId, int limit);
}
