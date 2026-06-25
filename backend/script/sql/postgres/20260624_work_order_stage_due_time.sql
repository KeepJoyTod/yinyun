-- yy_work_order collaboration stage and SLA contract.
-- Review with DBA before production execution.

ALTER TABLE yy_work_order
  ADD COLUMN IF NOT EXISTS stage_code varchar(32) DEFAULT 'RECEPTION',
  ADD COLUMN IF NOT EXISTS due_time timestamp;

COMMENT ON COLUMN yy_work_order.stage_code IS '协作岗位编码';
COMMENT ON COLUMN yy_work_order.due_time IS 'SLA截止时间';

CREATE INDEX IF NOT EXISTS idx_yy_work_order_stage_due
  ON yy_work_order (tenant_id, store_id, stage_code, status, due_time);
