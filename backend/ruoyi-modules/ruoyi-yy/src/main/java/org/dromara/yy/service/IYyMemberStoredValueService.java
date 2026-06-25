package org.dromara.yy.service;

import org.dromara.yy.domain.bo.YyMemberStoredValueTransactionQueryBo;
import org.dromara.yy.domain.vo.YyMemberRechargeCapabilityVo;
import org.dromara.yy.domain.vo.YyMemberRechargeSettingVo;
import org.dromara.yy.domain.vo.YyMemberStoredValueTransactionVo;

import java.util.List;

public interface IYyMemberStoredValueService {

    YyMemberRechargeSettingVo getRechargeSetting();

    YyMemberRechargeCapabilityVo getRechargeCapability();

    List<YyMemberStoredValueTransactionVo> listStoredValueTransactions(YyMemberStoredValueTransactionQueryBo bo);
}
