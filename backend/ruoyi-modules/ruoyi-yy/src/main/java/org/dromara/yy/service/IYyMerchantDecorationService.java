package org.dromara.yy.service;

import org.dromara.yy.domain.bo.YyMerchantDecorationBo;
import org.dromara.yy.domain.vo.YyMerchantDecorationVo;

public interface IYyMerchantDecorationService {

    YyMerchantDecorationVo getCurrent(Long storeId, String channelType);

    YyMerchantDecorationVo saveDraft(YyMerchantDecorationBo bo);

    YyMerchantDecorationVo publish(YyMerchantDecorationBo bo);
}
