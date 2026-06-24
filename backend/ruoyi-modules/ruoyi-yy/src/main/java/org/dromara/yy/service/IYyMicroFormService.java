package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.ClientMicroFormSubmitRequest;
import org.dromara.yy.domain.bo.YyMicroFormBo;
import org.dromara.yy.domain.vo.ClientMicroFormSubmitVo;
import org.dromara.yy.domain.vo.ClientMicroFormVo;
import org.dromara.yy.domain.vo.YyMicroFormVo;

import java.util.Collection;
import java.util.List;

public interface IYyMicroFormService {

    YyMicroFormVo queryById(Long id);

    TableDataInfo<YyMicroFormVo> queryPageList(YyMicroFormBo bo, PageQuery pageQuery);

    List<YyMicroFormVo> queryList(YyMicroFormBo bo);

    Boolean insertByBo(YyMicroFormBo bo);

    Boolean updateByBo(YyMicroFormBo bo);

    YyMicroFormVo publish(Long id);

    YyMicroFormVo offline(Long id);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);

    ClientMicroFormVo publicForm(String idOrKey);

    ClientMicroFormSubmitVo submitPublicForm(String idOrKey, ClientMicroFormSubmitRequest request);
}
