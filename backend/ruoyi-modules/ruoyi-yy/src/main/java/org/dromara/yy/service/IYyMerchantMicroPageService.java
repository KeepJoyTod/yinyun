package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyMerchantMicroPageBo;
import org.dromara.yy.domain.vo.YyMerchantMicroPagePublicVo;
import org.dromara.yy.domain.vo.YyMerchantMicroPageVo;

import java.util.Collection;
import java.util.List;

public interface IYyMerchantMicroPageService {

    YyMerchantMicroPageVo queryById(Long id);

    TableDataInfo<YyMerchantMicroPageVo> queryPageList(YyMerchantMicroPageBo bo, PageQuery pageQuery);

    List<YyMerchantMicroPageVo> queryList(YyMerchantMicroPageBo bo);

    Boolean insertByBo(YyMerchantMicroPageBo bo);

    Boolean updateByBo(YyMerchantMicroPageBo bo);

    YyMerchantMicroPageVo publish(Long id);

    YyMerchantMicroPageVo offline(Long id);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);

    YyMerchantMicroPagePublicVo publicPage(String idOrKey);
}
