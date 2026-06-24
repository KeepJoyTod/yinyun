export interface YyCustomerVO extends BaseEntity {
  id: string | number;
  tenantId?: string;
  customerName: string;
  mobile: string;
  gender: string;
  birthday?: string;
  source: string;
  memberLevel: string;
  totalOrderCount: number;
  totalSpend: number;
  lastOrderTime?: string;
  tags: string;
  remark: string;
  createTime?: string;
  updateTime?: string;
}

export interface YyCustomerForm {
  id?: string | number | undefined;
  customerName: string;
  mobile: string;
  gender: string;
  birthday?: string;
  source: string;
  memberLevel: string;
  totalOrderCount: number;
  totalSpend: number;
  lastOrderTime?: string;
  tags: string;
  remark: string;
}

export interface YyCustomerQuery extends PageQuery {
  keyword?: string;
  customerName?: string;
  mobile?: string;
  source?: string;
  memberLevel?: string;
  tags?: string;
}
