package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyProductBookingRuleBo;
import org.dromara.yy.domain.vo.YyProductBookingRuleVo;

import java.util.Collection;
import java.util.List;

public interface IYyProductBookingRuleService {
    YyProductBookingRuleVo queryById(Long id);

    TableDataInfo<YyProductBookingRuleVo> queryPageList(YyProductBookingRuleBo bo, PageQuery pageQuery);

    List<YyProductBookingRuleVo> queryList(YyProductBookingRuleBo bo);

    Boolean insertByBo(YyProductBookingRuleBo bo);

    Boolean updateByBo(YyProductBookingRuleBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
