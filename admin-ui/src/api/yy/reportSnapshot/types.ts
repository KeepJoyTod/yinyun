export interface YyReportSnapshotVO extends BaseEntity {
  id: string | number;
  tenantId?: string;
  storeId?: string | number;
  reportDate: string;
  reportType: string;
  orderTotal: number;
  arrivedTotal: number;
  completedTotal: number;
  revenueTotal: number;
  selectionTotal: number;
  sourceSummary: string;
  remark: string;
  createTime?: string;
  updateTime?: string;
}

export interface YyReportSnapshotForm {
  id?: string | number | undefined;
  storeId?: string | number;
  reportDate: string;
  reportType: string;
  orderTotal: number;
  arrivedTotal: number;
  completedTotal: number;
  revenueTotal: number;
  selectionTotal: number;
  sourceSummary: string;
  remark: string;
}

export interface YyReportSnapshotQuery extends PageQuery {
  storeId?: string | number;
  reportDate?: string;
  reportType?: string;
}
