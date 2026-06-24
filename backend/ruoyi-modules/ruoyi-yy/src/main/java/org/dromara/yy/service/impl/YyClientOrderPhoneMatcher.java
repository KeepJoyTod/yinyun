package org.dromara.yy.service.impl;

import org.dromara.common.core.utils.StringUtils;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;

final class YyClientOrderPhoneMatcher {

    private static final String FULL_PHONE_PATTERN = "1\\d{10}";
    private static final String MASKED_PHONE_PATTERN = "1\\d{2}\\*{4}\\d{4}";

    private YyClientOrderPhoneMatcher() {
    }

    static String normalizePhone(String phone) {
        if (StringUtils.isBlank(phone)) {
            return "";
        }
        String sanitized = StringUtils.trimToEmpty(phone)
            .replace(" ", "")
            .replace("-", "")
            .replaceAll("[^0-9*]", "");
        if (sanitized.matches(FULL_PHONE_PATTERN) || sanitized.matches(MASKED_PHONE_PATTERN)) {
            return sanitized;
        }
        return sanitized.replaceAll("\\D", "");
    }

    static String maskPhone(String phone) {
        String normalized = normalizePhone(phone);
        if (normalized.matches(MASKED_PHONE_PATTERN)) {
            return normalized;
        }
        if (normalized.matches(FULL_PHONE_PATTERN)) {
            return normalized.substring(0, 3) + "****" + normalized.substring(normalized.length() - 4);
        }
        if (normalized.length() >= 4) {
            return "****" + normalized.substring(normalized.length() - 4);
        }
        return "";
    }

    static boolean isClientLookupPhone(String phone) {
        String normalized = normalizePhone(phone);
        return normalized.matches(FULL_PHONE_PATTERN) || normalized.matches(MASKED_PHONE_PATTERN);
    }

    static List<String> clientOrderPhoneLookupCandidates(String phone) {
        String normalizedPhone = normalizePhone(phone);
        if (!isClientLookupPhone(normalizedPhone)) {
            return List.of();
        }
        LinkedHashSet<String> candidates = new LinkedHashSet<>();
        candidates.add(normalizedPhone);
        String maskedPhone = maskFullPhoneForLookup(normalizedPhone);
        if (StringUtils.isNotBlank(maskedPhone)) {
            candidates.add(maskedPhone);
        }
        return List.copyOf(candidates);
    }

    static boolean matchesClientOrderPhone(String normalizedInputPhone, String storedPhone) {
        String normalizedInput = normalizePhone(normalizedInputPhone);
        String normalizedStoredPhone = normalizePhone(storedPhone);
        if (StringUtils.isBlank(normalizedInput) || StringUtils.isBlank(normalizedStoredPhone)) {
            return false;
        }
        if (Objects.equals(normalizedInput, normalizedStoredPhone)) {
            return true;
        }
        return Objects.equals(maskPhone(normalizedInput), maskPhone(normalizedStoredPhone));
    }

    static boolean isPhoneLast4(String phoneLast4) {
        return StringUtils.isNotBlank(phoneLast4) && phoneLast4.matches("\\d{4}");
    }

    private static String maskFullPhoneForLookup(String normalizedPhone) {
        if (StringUtils.isBlank(normalizedPhone) || !normalizedPhone.matches(FULL_PHONE_PATTERN)) {
            return "";
        }
        return normalizedPhone.substring(0, 3) + "****" + normalizedPhone.substring(7);
    }
}
