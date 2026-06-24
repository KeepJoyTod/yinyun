-- =============================================
-- Review-only migration: yy_work_order + yy_work_order_event
-- DO NOT execute directly. Review with DBA before applying to production.
-- =============================================

-- yy_work_order table (review only)
CREATE TABLE IF NOT EXISTS yy_work_order (
    id              BIGINT       NOT NULL PRIMARY KEY,
    tenant_id       VARCHAR(20)  DEFAULT '',
    store_id        BIGINT,
    order_no        VARCHAR(64)  NOT NULL,
    order_type      VARCHAR(32)  NOT NULL,
    status          VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    priority        VARCHAR(16)  NOT NULL DEFAULT 'MEDIUM',
    order_id        BIGINT,
    handler_id      BIGINT,
    handler_name    VARCHAR(64),
    description     TEXT,
    remark          VARCHAR(512),
    del_flag        CHAR(1)      DEFAULT '0',
    create_dept     BIGINT,
    create_by       BIGINT,
    create_time     TIMESTAMP,
    update_by       BIGINT,
    update_time     TIMESTAMP,
    CONSTRAINT uk_work_order_no UNIQUE (order_no)
);

COMMENT ON TABLE yy_work_order IS '工单主表';
COMMENT ON COLUMN yy_work_order.id IS '主键';
COMMENT ON COLUMN yy_work_order.order_no IS '工单编号';
COMMENT ON COLUMN yy_work_order.order_type IS '工单类型：PHOTO_UPLOAD / SELECTION / RETOUCH / DELIVERY / OTHER';
COMMENT ON COLUMN yy_work_order.status IS '工单状态：PENDING / IN_PROGRESS / COMPLETED / CANCELLED';
COMMENT ON COLUMN yy_work_order.priority IS '优先级：LOW / MEDIUM / HIGH / URGENT';

CREATE INDEX IF NOT EXISTS idx_yy_work_order_store_status ON yy_work_order (store_id, status);
CREATE INDEX IF NOT EXISTS idx_yy_work_order_order_id ON yy_work_order (order_id);

-- yy_work_order_event table (review only)
CREATE TABLE IF NOT EXISTS yy_work_order_event (
    id              BIGINT       NOT NULL PRIMARY KEY,
    tenant_id       VARCHAR(20)  DEFAULT '',
    work_order_id   BIGINT       NOT NULL,
    event_type      VARCHAR(32)  NOT NULL,
    event_detail    TEXT,
    operator_id     BIGINT,
    operator_name   VARCHAR(64),
    remark          VARCHAR(512),
    del_flag        CHAR(1)      DEFAULT '0',
    create_dept     BIGINT,
    create_by       BIGINT,
    create_time     TIMESTAMP
);

COMMENT ON TABLE yy_work_order_event IS '工单事件表';
COMMENT ON COLUMN yy_work_order_event.work_order_id IS '关联工单ID';
COMMENT ON COLUMN yy_work_order_event.event_type IS '事件类型：CREATE / TRANSITION / COMMENT / ASSIGN / CLOSE';
COMMENT ON COLUMN yy_work_order_event.event_detail IS '事件详情 JSON';

CREATE INDEX IF NOT EXISTS idx_yy_work_order_event_work_order ON yy_work_order_event (work_order_id, create_time DESC);
