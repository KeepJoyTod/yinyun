package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyReportSnapshotBo;
import org.dromara.yy.domain.vo.YyReportSnapshotVo;

import java.util.Collection;
import java.util.List;

/**
 * 经营报表快照Service接口
 */
public interface IYyReportSnapshotService {

    YyReportSnapshotVo queryById(Long id);

    TableDataInfo<YyReportSnapshotVo> queryPageList(YyReportSnapshotBo bo, PageQuery pageQuery);

    List<YyReportSnapshotVo> queryList(YyReportSnapshotBo bo);

    Boolean insertByBo(YyReportSnapshotBo bo);

    Boolean updateByBo(YyReportSnapshotBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
