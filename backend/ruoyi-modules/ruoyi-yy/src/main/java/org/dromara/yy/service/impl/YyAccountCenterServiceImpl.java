package org.dromara.yy.service.impl;

import org.apache.commons.lang3.StringUtils;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.bo.YyAccountProfileBo;
import org.dromara.yy.domain.bo.YyStoreBo;
import org.dromara.yy.domain.vo.YyAccountBrandVo;
import org.dromara.yy.domain.vo.YyAccountProfileVo;
import org.dromara.yy.domain.vo.YyHelpCenterArticleVo;
import org.dromara.yy.domain.vo.YyStoreVo;
import org.dromara.yy.service.IYyAccountCenterService;
import org.dromara.yy.service.IYyStoreService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class YyAccountCenterServiceImpl implements IYyAccountCenterService {

    private final IYyStoreService yyStoreService;

    public YyAccountCenterServiceImpl(IYyStoreService yyStoreService) {
        this.yyStoreService = yyStoreService;
    }

    @Override
    public YyAccountProfileVo getProfile() {
        return currentProfile(null);
    }

    @Override
    public YyAccountProfileVo updateProfile(YyAccountProfileBo bo) {
        return currentProfile(bo);
    }

    @Override
    public List<YyAccountBrandVo> listBrands() {
        List<YyStoreVo> stores = safeList(yyStoreService.queryList(new YyStoreBo()));
        if (stores.isEmpty()) {
            return List.of(brand("tenant-default", "Default brand", true, "scaffold"));
        }
        return stores.stream()
            .map(store -> brand(
                String.valueOf(store.getId()),
                StringUtils.defaultIfBlank(store.getStoreName(), "Store " + store.getId()),
                stores.indexOf(store) == 0,
                activeStatus(store.getStatus()) ? "ready" : "scaffold"
            ))
            .toList();
    }

    @Override
    public List<YyAccountBrandVo> switchBrand(String brandId) {
        return listBrands().stream()
            .peek(item -> item.setDefaultBrand(StringUtils.equals(item.getBrandId(), brandId)))
            .toList();
    }

    @Override
    public List<YyHelpCenterArticleVo> listHelpArticles(String keyword) {
        String normalized = StringUtils.defaultString(keyword).trim().toLowerCase(Locale.ROOT);
        List<YyHelpCenterArticleVo> rows = List.of(
            article("account-profile", "Account profile and security", "account,security,login", "ready"),
            article("brand-switch", "Brand and store scope", "brand,store,scope", "ready"),
            article("finance-center", "Finance center reconciliation", "finance,ledger,export", "ready")
        );
        if (StringUtils.isBlank(normalized)) {
            return rows;
        }
        return rows.stream()
            .filter(item -> (item.getTitle() + " " + item.getKeyword()).toLowerCase(Locale.ROOT).contains(normalized))
            .toList();
    }

    private YyAccountProfileVo currentProfile(YyAccountProfileBo patch) {
        LoginUser loginUser = safeLoginUser();
        YyAccountProfileVo vo = new YyAccountProfileVo();
        vo.setAccountId(loginUser == null || loginUser.getUserId() == null ? "anonymous" : String.valueOf(loginUser.getUserId()));
        vo.setUsername(loginUser == null ? "" : StringUtils.defaultString(loginUser.getUsername()));
        vo.setNickname(firstNotBlank(patch == null ? null : patch.getNickname(), loginUser == null ? "" : loginUser.getNickname()));
        vo.setPhoneMasked(StringUtils.defaultString(patch == null ? null : patch.getPhoneMasked()));
        vo.setEmail(StringUtils.defaultString(patch == null ? null : patch.getEmail()));
        vo.setStatus(loginUser == null ? "scaffold" : "ready");
        return vo;
    }

    private static LoginUser safeLoginUser() {
        try {
            return LoginHelper.isLogin() ? LoginHelper.getLoginUser() : null;
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private static YyAccountBrandVo brand(String brandId, String brandName, boolean defaultBrand, String status) {
        YyAccountBrandVo vo = new YyAccountBrandVo();
        vo.setBrandId(brandId);
        vo.setBrandName(brandName);
        vo.setDefaultBrand(defaultBrand);
        vo.setStatus(status);
        return vo;
    }

    private static YyHelpCenterArticleVo article(String articleId, String title, String keyword, String status) {
        YyHelpCenterArticleVo vo = new YyHelpCenterArticleVo();
        vo.setArticleId(articleId);
        vo.setTitle(title);
        vo.setKeyword(keyword);
        vo.setStatus(status);
        return vo;
    }

    private static boolean activeStatus(String status) {
        String normalized = StringUtils.defaultString(status).trim().toUpperCase(Locale.ROOT);
        return "ACTIVE".equals(normalized) || "ENABLED".equals(normalized) || "Y".equals(normalized) || "NORMAL".equals(normalized);
    }

    private static String firstNotBlank(String first, String second) {
        return StringUtils.isNotBlank(first) ? first : StringUtils.defaultString(second);
    }

    private static <T> List<T> safeList(List<T> rows) {
        return rows == null ? List.of() : rows;
    }
}
