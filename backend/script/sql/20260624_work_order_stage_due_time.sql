-- yy_work_order collaboration stage and SLA contract.
-- Review with DBA before production execution.

ALTER TABLE yy_work_order
  ADD COLUMN stage_code VARCHAR(32) DEFAULT 'RECEPTION' COMMENT '协作岗位编码' AFTER order_type,
  ADD COLUMN due_time DATETIME NULL COMMENT 'SLA截止时间' AFTER handler_name;

CREATE INDEX idx_yy_work_order_stage_due
  ON yy_work_order (tenant_id, store_id, stage_code, status, due_time);
