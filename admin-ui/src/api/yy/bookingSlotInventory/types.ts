export interface YyBookingSlotInventoryVO extends BaseEntity {
  id: string | number;
  tenantId?: string;
  storeId: string | number;
  serviceGroupId?: string | number;
  externalSkuId?: string;
  bizDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  paidCount: number;
  conflictCount: number;
  status: string;
  remark?: string;
}

export interface YyBookingSlotInventoryForm {
  id?: string | number;
  capacity?: number;
  status?: string;
  remark?: string;
}

export interface YyBookingSlotInventoryQuery extends PageQuery {
  storeId?: string | number;
  serviceGroupId?: string | number;
  externalSkuId?: string;
  bizDate?: string;
  beginBizDate?: string;
  endBizDate?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  conflictOnly?: string;
}
