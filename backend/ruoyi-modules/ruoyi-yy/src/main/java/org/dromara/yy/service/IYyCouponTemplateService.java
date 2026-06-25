package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyCouponIssueBo;
import org.dromara.yy.domain.bo.YyCouponTemplateBo;
import org.dromara.yy.domain.vo.YyCouponScaffoldVo;
import org.dromara.yy.domain.vo.YyMarketingCouponGrantRecordVo;
import org.dromara.yy.domain.vo.YyMarketingCouponInstanceVo;
import org.dromara.yy.domain.vo.YyMarketingCouponTemplateVo;
import org.dromara.yy.domain.vo.YyMarketingCouponWriteoffVo;

import java.util.List;

public interface IYyCouponTemplateService {

    YyCouponScaffoldVo getCouponScaffold();

    TableDataInfo<YyMarketingCouponTemplateVo> queryPageList(YyCouponTemplateBo bo, PageQuery pageQuery);

    Boolean insertByBo(YyCouponTemplateBo bo);

    Boolean updateByBo(YyCouponTemplateBo bo);

    Boolean issueCoupons(Long templateId, YyCouponIssueBo bo);

    List<YyMarketingCouponGrantRecordVo> listGrantRecords(Long templateId);

    List<YyMarketingCouponInstanceVo> listInstances(Long templateId);

    List<YyMarketingCouponWriteoffVo> listWriteoffs(Long templateId);
}
