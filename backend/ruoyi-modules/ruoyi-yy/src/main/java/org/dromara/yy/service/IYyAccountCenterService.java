package org.dromara.yy.service;

import org.dromara.yy.domain.bo.YyAccountProfileBo;
import org.dromara.yy.domain.vo.YyAccountBrandVo;
import org.dromara.yy.domain.vo.YyAccountProfileVo;
import org.dromara.yy.domain.vo.YyHelpCenterArticleVo;

import java.util.List;

public interface IYyAccountCenterService {

    YyAccountProfileVo getProfile();

    YyAccountProfileVo updateProfile(YyAccountProfileBo bo);

    List<YyAccountBrandVo> listBrands();

    List<YyAccountBrandVo> switchBrand(String brandId);

    List<YyHelpCenterArticleVo> listHelpArticles(String keyword);
}
