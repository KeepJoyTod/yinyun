package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.dromara.common.core.constant.Constants;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.encrypt.core.EncryptContext;
import org.dromara.common.encrypt.core.EncryptorManager;
import org.dromara.common.encrypt.enumd.AlgorithmType;
import org.dromara.common.encrypt.enumd.EncodeType;
import org.dromara.common.encrypt.properties.EncryptorProperties;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyPhotoAccessLog;
import org.dromara.yy.domain.bo.YyPhotoAccessLogBo;
import org.dromara.yy.domain.vo.YyPhotoAccessLogVo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyPhotoAccessLogMapper;
import org.dromara.yy.service.IYyPhotoAccessLogService;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * 客户取片访问日志Service业务层处理
 */
@Service
public class YyPhotoAccessLogServiceImpl implements IYyPhotoAccessLogService {

    private final YyPhotoAccessLogMapper baseMapper;
    private final EncryptorManager encryptorManager;
    private final EncryptorProperties encryptorProperties;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;

    @Autowired
    public YyPhotoAccessLogServiceImpl(
        YyPhotoAccessLogMapper baseMapper,
        ObjectProvider<EncryptorManager> encryptorManagerProvider,
        ObjectProvider<EncryptorProperties> encryptorPropertiesProvider,
        ObjectProvider<YyEmployeeMapper> employeeMapperProvider,
        ObjectProvider<YyEmployeeStoreMapper> employeeStoreMapperProvider
    ) {
        this(
            baseMapper,
            encryptorManagerProvider.getIfAvailable(EncryptorManager::new),
            encryptorPropertiesProvider.getIfAvailable(YyPhotoAccessLogServiceImpl::defaultEncryptorProperties),
            employeeMapperProvider.getIfAvailable(),
            employeeStoreMapperProvider.getIfAvailable()
        );
    }

    YyPhotoAccessLogServiceImpl(YyPhotoAccessLogMapper baseMapper) {
        this(baseMapper, new EncryptorManager(), defaultEncryptorProperties(), null, null);
    }

    YyPhotoAccessLogServiceImpl(
        YyPhotoAccessLogMapper baseMapper,
        EncryptorManager encryptorManager,
        EncryptorProperties encryptorProperties,
        YyEmployeeMapper employeeMapper,
        YyEmployeeStoreMapper employeeStoreMapper
    ) {
        this.baseMapper = baseMapper;
        this.encryptorManager = encryptorManager;
        this.encryptorProperties = encryptorProperties == null ? defaultEncryptorProperties() : encryptorProperties;
        this.employeeMapper = employeeMapper;
        this.employeeStoreMapper = employeeStoreMapper;
    }

    @Override
    public TableDataInfo<YyPhotoAccessLogVo> queryPageList(YyPhotoAccessLogBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyPhotoAccessLog> lqw = buildQueryWrapper(bo);
        Page<YyPhotoAccessLogVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyPhotoAccessLogVo> queryList(YyPhotoAccessLogBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    private LambdaQueryWrapper<YyPhotoAccessLog> buildQueryWrapper(YyPhotoAccessLogBo bo) {
        LambdaQueryWrapper<YyPhotoAccessLog> lqw = Wrappers.lambdaQuery();
        if (bo == null) {
            applyStoreScope(lqw, null);
            lqw.orderByDesc(YyPhotoAccessLog::getId);
            return lqw;
        }
        lqw.eq(bo.getStoreId() != null, YyPhotoAccessLog::getStoreId, bo.getStoreId());
        lqw.eq(bo.getAlbumId() != null, YyPhotoAccessLog::getAlbumId, bo.getAlbumId());
        lqw.eq(bo.getAssetId() != null, YyPhotoAccessLog::getAssetId, bo.getAssetId());
        List<String> customerPhoneValues = buildCustomerPhoneQueryValues(bo.getCustomerPhone());
        lqw.and(!customerPhoneValues.isEmpty(), wrapper -> {
            for (int i = 0; i < customerPhoneValues.size(); i++) {
                if (i > 0) {
                    wrapper.or();
                }
                String value = customerPhoneValues.get(i);
                if (StringUtils.startsWith(value, Constants.ENCRYPT_HEADER)) {
                    wrapper.eq(YyPhotoAccessLog::getCustomerPhone, value);
                } else {
                    wrapper.like(YyPhotoAccessLog::getCustomerPhone, value);
                }
            }
        });
        lqw.eq(StringUtils.isNotBlank(bo.getPlatform()), YyPhotoAccessLog::getPlatform, bo.getPlatform());
        lqw.eq(StringUtils.isNotBlank(bo.getAction()), YyPhotoAccessLog::getAction, bo.getAction());
        lqw.eq(StringUtils.isNotBlank(bo.getSuccess()), YyPhotoAccessLog::getSuccess, bo.getSuccess());
        applyStoreScope(lqw, bo.getStoreId());
        lqw.orderByDesc(YyPhotoAccessLog::getId);
        return lqw;
    }

    private List<String> buildCustomerPhoneQueryValues(String customerPhone) {
        List<String> values = new ArrayList<>();
        String trimmed = StringUtils.trimToEmpty(customerPhone);
        addQueryValue(values, trimmed);
        String compact = trimmed.replace(" ", "").replace("-", "");
        addQueryValue(values, compact);
        String encrypted = encryptPhoneForQuery(compact);
        addQueryValue(values, encrypted);
        return values;
    }

    private String encryptPhoneForQuery(String phone) {
        if (StringUtils.isBlank(phone)) {
            return null;
        }
        if (StringUtils.startsWith(phone, Constants.ENCRYPT_HEADER)) {
            return phone;
        }
        try {
            return encryptorManager.encrypt(phone, buildDefaultEncryptContext());
        } catch (Exception e) {
            return null;
        }
    }

    private EncryptContext buildDefaultEncryptContext() {
        EncryptContext context = new EncryptContext();
        context.setAlgorithm(encryptorProperties.getAlgorithm() == null ? AlgorithmType.AES : encryptorProperties.getAlgorithm());
        context.setEncode(encryptorProperties.getEncode() == null ? EncodeType.BASE64 : encryptorProperties.getEncode());
        context.setPassword(StringUtils.defaultIfBlank(encryptorProperties.getPassword(), "change-16-bytes!"));
        context.setPrivateKey(encryptorProperties.getPrivateKey());
        context.setPublicKey(encryptorProperties.getPublicKey());
        return context;
    }

    private static EncryptorProperties defaultEncryptorProperties() {
        EncryptorProperties properties = new EncryptorProperties();
        properties.setEnable(true);
        properties.setAlgorithm(AlgorithmType.AES);
        properties.setEncode(EncodeType.BASE64);
        properties.setPassword("change-16-bytes!");
        return properties;
    }

    private static void addQueryValue(List<String> values, String value) {
        if (StringUtils.isNotBlank(value) && !values.contains(value)) {
            values.add(value);
        }
    }

    private void applyStoreScope(LambdaQueryWrapper<YyPhotoAccessLog> lqw, Long requestedStoreId) {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (!storeScope.applicable() || storeScope.globalScope()) {
            lqw.eq(requestedStoreId != null, YyPhotoAccessLog::getStoreId, requestedStoreId);
            return;
        }

        Set<Long> scopedStoreIds = storeScope.storeIds();
        if (scopedStoreIds.isEmpty()) {
            lqw.apply("1 = 0");
            return;
        }
        if (requestedStoreId == null) {
            lqw.in(YyPhotoAccessLog::getStoreId, scopedStoreIds);
            return;
        }
        if (scopedStoreIds.contains(requestedStoreId)) {
            lqw.eq(YyPhotoAccessLog::getStoreId, requestedStoreId);
            return;
        }
        lqw.apply("1 = 0");
    }

    private StoreScope resolveCurrentStoreScope() {
        if (!LoginHelper.isLogin()) {
            return StoreScope.notApplicable();
        }
        if (LoginHelper.isSuperAdmin() || LoginHelper.isTenantAdmin()) {
            return StoreScope.global();
        }
        if (employeeMapper == null) {
            return StoreScope.empty();
        }
        LoginUser loginUser = LoginHelper.getLoginUser();
        if (loginUser == null || loginUser.getUserId() == null) {
            return StoreScope.empty();
        }
        YyEmployee employee = employeeMapper.selectOne(Wrappers.lambdaQuery(YyEmployee.class)
            .eq(YyEmployee::getUserId, loginUser.getUserId())
            .eq(YyEmployee::getStatus, "0")
            .last("limit 1"));
        if (employee == null) {
            return StoreScope.empty();
        }
        LinkedHashSet<Long> storeIds = new LinkedHashSet<>();
        if (employeeStoreMapper != null && employee.getId() != null) {
            List<YyEmployeeStore> employeeStores = employeeStoreMapper.selectList(
                Wrappers.<YyEmployeeStore>lambdaQuery()
                    .eq(YyEmployeeStore::getEmployeeId, employee.getId())
                    .eq(YyEmployeeStore::getDelFlag, "0")
                    .orderByAsc(YyEmployeeStore::getSort)
                    .orderByAsc(YyEmployeeStore::getId));
            employeeStores.stream()
                .map(YyEmployeeStore::getStoreId)
                .filter(Objects::nonNull)
                .forEach(storeIds::add);
        }
        if (storeIds.isEmpty() && employee.getStoreId() != null) {
            storeIds.add(employee.getStoreId());
        }
        return StoreScope.limited(storeIds);
    }

    private record StoreScope(boolean applicable, boolean globalScope, Set<Long> storeIds) {
        private static StoreScope notApplicable() {
            return new StoreScope(false, false, Set.of());
        }

        private static StoreScope global() {
            return new StoreScope(true, true, Set.of());
        }

        private static StoreScope empty() {
            return new StoreScope(true, false, Set.of());
        }

        private static StoreScope limited(Collection<Long> storeIds) {
            return new StoreScope(true, false, Set.copyOf(storeIds));
        }
    }
}
