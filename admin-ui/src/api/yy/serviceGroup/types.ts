export interface YyServiceGroupVO extends BaseEntity {
  id: string | number;
  tenantId?: string;
  storeId: string | number;
  groupCode: string;
  groupName: string;
  capacity: number;
  durationMinutes: number;
  status: string;
  sort: number;
  remark: string;
}

export interface YyServiceGroupForm {
  id?: string | number | undefined;
  storeId: string | number;
  groupCode: string;
  groupName: string;
  capacity: number;
  durationMinutes: number;
  status: string;
  sort: number;
  remark: string;
}

export interface YyServiceGroupQuery extends PageQuery {
  storeId?: string | number;
  groupCode?: string;
  groupName?: string;
  status?: string;
}
