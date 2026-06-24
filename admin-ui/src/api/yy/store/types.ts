export interface YyStoreVO extends BaseEntity {
  id: string | number;
  storeCode: string;
  storeName: string;
  status: string;
  phone: string;
  address: string;
  businessHours: string;
  sort: number;
  remark: string;
  tenantId?: string;
}

export interface YyStoreForm {
  id?: string | number | undefined;
  storeCode: string;
  storeName: string;
  status: string;
  phone: string;
  address: string;
  businessHours: string;
  sort: number;
  remark: string;
}

export interface YyStoreQuery extends PageQuery {
  storeCode?: string;
  storeName?: string;
  status?: string;
  address?: string;
}
