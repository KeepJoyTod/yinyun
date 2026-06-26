package org.dromara.yy.service.impl;

import org.dromara.yy.domain.vo.YyCardBatchOrderVo;
import org.dromara.yy.domain.vo.YyRiskApprovalVo;
import org.dromara.yy.domain.bo.YyCardBatchOrderCreateBo;
import org.dromara.yy.mapper.YyRiskApprovalMapper;
import org.dromara.yy.service.IYyRiskApprovalService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyCardBatchOrderServiceImplTest {

    @Mock
    private YyRiskApprovalMapper riskApprovalMapper;

    @Mock
    private IYyRiskApprovalService riskApprovalService;

    @InjectMocks
    private YyCardBatchOrderServiceImpl service;

    @Test
    void createCardBatchOrderShouldWrapPayloadIntoPendingApproval() {
        YyRiskApprovalVo approval = new YyRiskApprovalVo();
        approval.setId(9101L);
        approval.setStoreId(1001L);
        approval.setBusinessNo("CBO-202606250001");
        approval.setTitle("批量开卡申请 - 399 次卡 x20");
        approval.setStatus(IYyRiskApprovalService.STATUS_PENDING);
        approval.setReason("批量开卡属于高风险动作，需审批后执行");
        approval.setPayloadJson("""
            {"batchNo":"CBO-202606250001","cardName":"399 次卡","cardType":"TIMES_CARD","batchCount":20,"targetCustomerCount":18,"unitPriceCent":29900,"estimatedTotalCent":598000,"targetAudience":"老会员复购","channelPolicy":"审批通过后人工执行","remark":"导入名单来自活动复购池","executionMode":"RISK_APPROVAL_SCAFFOLD"}
            """);
        approval.setCreateTime(new Date());
        when(riskApprovalService.createPending(any())).thenReturn(approval);

        YyCardBatchOrderCreateBo bo = new YyCardBatchOrderCreateBo();
        bo.setStoreId(1001L);
        bo.setCardName("399 次卡");
        bo.setBatchCount(20);
        bo.setTargetCustomerCount(18);
        bo.setUnitPriceCent(29900L);
        bo.setTargetAudience("老会员复购");
        bo.setReason("批量开卡属于高风险动作，需审批后执行");
        bo.setRemark("导入名单来自活动复购池");

        YyCardBatchOrderVo result = service.createCardBatchOrder(bo);

        ArgumentCaptor<IYyRiskApprovalService.CreateRiskApprovalCommand> commandCaptor =
            ArgumentCaptor.forClass(IYyRiskApprovalService.CreateRiskApprovalCommand.class);
        verify(riskApprovalService).createPending(commandCaptor.capture());
        assertEquals(IYyRiskApprovalService.BUSINESS_CARD_BATCH_ORDER_APPLY, commandCaptor.getValue().businessType());
        assertTrue(commandCaptor.getValue().payloadJson().contains("\"cardName\":\"399 次卡\""));
        assertEquals("399 次卡", result.getCardName());
        assertEquals(598000L, result.getEstimatedTotalCent());
        assertEquals(IYyRiskApprovalService.STATUS_PENDING, result.getStatus());
    }

    @Test
    void listCardBatchOrdersShouldProjectRiskApprovalPayloadFields() {
        YyRiskApprovalVo approval = new YyRiskApprovalVo();
        approval.setId(9102L);
        approval.setStoreId(1002L);
        approval.setBusinessNo("CBO-202606250002");
        approval.setTitle("新人拉新共享卡");
        approval.setStatus(IYyRiskApprovalService.STATUS_APPROVED);
        approval.setReason("活动拉新批量开卡");
        approval.setApplicantName("operator-a");
        approval.setApproverName("manager-b");
        approval.setResultSummary("approved");
        approval.setPayloadJson("""
            {"batchNo":"CBO-202606250002","cardName":"新人共享卡","cardType":"SHARED_CARD","batchCount":50,"targetCustomerCount":50,"unitPriceCent":9900,"estimatedTotalCent":495000,"targetAudience":"新客拉新","channelPolicy":"审批通过后人工执行","remark":"线下地推活动","executionMode":"RISK_APPROVAL_SCAFFOLD"}
            """);
        approval.setCreateTime(new Date());
        approval.setApproveTime(new Date());
        when(riskApprovalMapper.selectVoList(any())).thenReturn(List.of(approval));

        List<YyCardBatchOrderVo> result = service.listCardBatchOrders(null);

        assertEquals(1, result.size());
        assertEquals("新人共享卡", result.get(0).getCardName());
        assertEquals("SHARED_CARD", result.get(0).getCardType());
        assertEquals(50, result.get(0).getBatchCount());
        assertEquals(495000L, result.get(0).getEstimatedTotalCent());
        assertEquals("approved", result.get(0).getResultSummary());
    }
}
