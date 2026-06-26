package org.dromara.yy.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.bo.YyOrderAttributeValueBo;
import org.dromara.yy.domain.vo.YyOrderAttributeValueVo;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;

final class YyOrderAttributeSnapshotSupport {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final Set<String> ALLOWED_FIELD_TYPES = Set.of(
        "TEXT", "TEXTAREA", "PHONE", "DATE", "NUMBER", "SELECT", "CHECKBOX"
    );

    private YyOrderAttributeSnapshotSupport() {
    }

    static String normalizeToJson(List<YyOrderAttributeValueBo> values) {
        if (values == null) {
            return null;
        }
        List<YyOrderAttributeValueVo> normalized = new ArrayList<>();
        LinkedHashSet<String> fieldCodes = new LinkedHashSet<>();
        for (YyOrderAttributeValueBo item : values) {
            YyOrderAttributeValueVo value = normalize(item);
            if (value == null) {
                continue;
            }
            if (!fieldCodes.add(value.getFieldCode())) {
                throw new ServiceException("订单属性字段编码重复: " + value.getFieldCode());
            }
            normalized.add(value);
        }
        try {
            return OBJECT_MAPPER.writeValueAsString(normalized);
        } catch (Exception ex) {
            throw new ServiceException("订单属性序列化失败");
        }
    }

    static List<YyOrderAttributeValueVo> parse(String json) {
        if (StringUtils.isBlank(json)) {
            return List.of();
        }
        try {
            List<YyOrderAttributeValueVo> items = OBJECT_MAPPER.readValue(json, new TypeReference<List<YyOrderAttributeValueVo>>() {
            });
            return items == null ? List.of() : items;
        } catch (Exception ignored) {
            return List.of();
        }
    }

    private static YyOrderAttributeValueVo normalize(YyOrderAttributeValueBo source) {
        if (source == null) {
            return null;
        }
        String fieldCode = StringUtils.substring(StringUtils.trimToEmpty(source.getFieldCode()), 0, 64);
        String fieldLabel = StringUtils.substring(StringUtils.trimToEmpty(source.getFieldLabel()), 0, 64);
        String fieldType = StringUtils.trimToEmpty(source.getFieldType()).toUpperCase(Locale.ROOT);
        if (StringUtils.isBlank(fieldCode) || StringUtils.isBlank(fieldLabel) || !ALLOWED_FIELD_TYPES.contains(fieldType)) {
            throw new ServiceException("订单属性字段不合法");
        }
        List<String> options = source.getOptions() == null
            ? List.of()
            : source.getOptions().stream()
                .map(item -> StringUtils.substring(StringUtils.trimToEmpty(item), 0, 80))
                .filter(StringUtils::isNotBlank)
                .distinct()
                .toList();
        Object value = normalizeValue(fieldType, source.getValue());
        if (Boolean.TRUE.equals(source.getRequired()) && isEmptyValue(value)) {
            throw new ServiceException("订单属性必填项不能为空: " + fieldLabel);
        }
        YyOrderAttributeValueVo target = new YyOrderAttributeValueVo();
        target.setFieldCode(fieldCode);
        target.setFieldLabel(fieldLabel);
        target.setFieldType(fieldType);
        target.setRequired(Boolean.TRUE.equals(source.getRequired()));
        target.setOptions(options);
        target.setSort(Objects.requireNonNullElse(source.getSort(), 0));
        target.setValue(value);
        return target;
    }

    private static Object normalizeValue(String fieldType, Object rawValue) {
        if (rawValue == null) {
            return null;
        }
        if ("CHECKBOX".equals(fieldType)) {
            if (rawValue instanceof List<?> list) {
                return list.stream()
                    .map(item -> StringUtils.substring(StringUtils.trimToEmpty(Objects.toString(item, "")), 0, 80))
                    .filter(StringUtils::isNotBlank)
                    .distinct()
                    .toList();
            }
            String single = StringUtils.trimToEmpty(Objects.toString(rawValue, ""));
            return StringUtils.isBlank(single) ? List.of() : List.of(StringUtils.substring(single, 0, 80));
        }
        if ("NUMBER".equals(fieldType)) {
            String value = StringUtils.substring(StringUtils.trimToEmpty(Objects.toString(rawValue, "")), 0, 64);
            if (StringUtils.isBlank(value)) {
                return null;
            }
            if (!value.matches("^-?\\d+(\\.\\d+)?$")) {
                throw new ServiceException("数字类型订单属性格式不正确");
            }
            return value;
        }
        return StringUtils.substring(StringUtils.trimToEmpty(Objects.toString(rawValue, "")), 0, 500);
    }

    private static boolean isEmptyValue(Object value) {
        if (value == null) {
            return true;
        }
        if (value instanceof List<?> list) {
            return list.isEmpty();
        }
        return StringUtils.isBlank(Objects.toString(value, ""));
    }
}
