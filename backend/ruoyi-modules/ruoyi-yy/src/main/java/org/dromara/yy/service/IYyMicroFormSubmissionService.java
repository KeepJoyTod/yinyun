package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyMicroFormFollowBo;
import org.dromara.yy.domain.bo.YyMicroFormSubmissionBo;
import org.dromara.yy.domain.vo.YyMicroFormSubmissionVo;

import java.util.Collection;
import java.util.List;

public interface IYyMicroFormSubmissionService {

    YyMicroFormSubmissionVo queryById(Long id);

    TableDataInfo<YyMicroFormSubmissionVo> queryPageList(YyMicroFormSubmissionBo bo, PageQuery pageQuery);

    List<YyMicroFormSubmissionVo> queryList(YyMicroFormSubmissionBo bo);

    Boolean insertByBo(YyMicroFormSubmissionBo bo);

    Boolean updateByBo(YyMicroFormSubmissionBo bo);

    Boolean updateFollow(Long id, YyMicroFormFollowBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
