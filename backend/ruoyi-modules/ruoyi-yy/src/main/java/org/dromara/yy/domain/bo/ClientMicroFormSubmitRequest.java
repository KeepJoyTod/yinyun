package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.LinkedHashMap;
import java.util.Map;

@Data
public class ClientMicroFormSubmitRequest {

    private String customerName;

    private String customerPhone;

    @NotNull(message = "answers is required")
    private Map<String, Object> answers = new LinkedHashMap<>();
}
