package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyProductFulfillmentRuleBo;
import org.dromara.yy.domain.vo.YyProductFulfillmentRuleVo;

import java.util.Collection;
import java.util.List;

public interface IYyProductFulfillmentRuleService {
    YyProductFulfillmentRuleVo queryById(Long id);

    TableDataInfo<YyProductFulfillmentRuleVo> queryPageList(YyProductFulfillmentRuleBo bo, PageQuery pageQuery);

    List<YyProductFulfillmentRuleVo> queryList(YyProductFulfillmentRuleBo bo);

    Boolean insertByBo(YyProductFulfillmentRuleBo bo);

    Boolean updateByBo(YyProductFulfillmentRuleBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
