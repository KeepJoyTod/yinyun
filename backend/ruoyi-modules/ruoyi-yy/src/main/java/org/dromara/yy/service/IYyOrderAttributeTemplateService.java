package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyOrderAttributeTemplateBo;
import org.dromara.yy.domain.vo.YyOrderAttributeTemplateVo;

import java.util.Collection;
import java.util.List;

public interface IYyOrderAttributeTemplateService {

    YyOrderAttributeTemplateVo queryById(Long id);

    TableDataInfo<YyOrderAttributeTemplateVo> queryPageList(YyOrderAttributeTemplateBo bo, PageQuery pageQuery);

    List<YyOrderAttributeTemplateVo> queryList(YyOrderAttributeTemplateBo bo);

    Boolean insertByBo(YyOrderAttributeTemplateBo bo);

    Boolean updateByBo(YyOrderAttributeTemplateBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
