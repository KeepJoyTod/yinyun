export interface YyEmployeeVO extends BaseEntity {
  id: string | number;
  tenantId?: string;
  storeId: string | number;
  userId?: string | number;
  employeeNo: string;
  employeeName: string;
  mobile: string;
  roleType: string;
  skillTags: string;
  status: string;
  sort: number;
  remark: string;
}

export interface YyEmployeeForm {
  id?: string | number | undefined;
  storeId: string | number;
  userId?: string | number;
  employeeNo: string;
  employeeName: string;
  mobile: string;
  roleType: string;
  skillTags: string;
  status: string;
  sort: number;
  remark: string;
}

export interface YyEmployeeQuery extends PageQuery {
  storeId?: string | number;
  userId?: string | number;
  employeeNo?: string;
  employeeName?: string;
  mobile?: string;
  roleType?: string;
  status?: string;
}
