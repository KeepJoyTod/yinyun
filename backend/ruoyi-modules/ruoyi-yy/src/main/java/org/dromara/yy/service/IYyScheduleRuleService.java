package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyScheduleRuleBo;
import org.dromara.yy.domain.vo.YyScheduleRuleVo;

import java.util.Collection;
import java.util.List;

/**
 * 影约云预约规则Service接口
 */
public interface IYyScheduleRuleService {

    YyScheduleRuleVo queryById(Long id);

    TableDataInfo<YyScheduleRuleVo> queryPageList(YyScheduleRuleBo bo, PageQuery pageQuery);

    List<YyScheduleRuleVo> queryList(YyScheduleRuleBo bo);

    Boolean insertByBo(YyScheduleRuleBo bo);

    Boolean updateByBo(YyScheduleRuleBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
