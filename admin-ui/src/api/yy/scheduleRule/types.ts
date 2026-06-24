export interface YyScheduleRuleVO extends BaseEntity {
  id: string | number;
  tenantId?: string;
  storeId: string | number;
  serviceGroupId: string | number;
  weekday: number;
  startTime: string;
  endTime: string;
  capacity: number;
  enabled: string;
  remark: string;
}

export interface YyScheduleRuleForm {
  id?: string | number | undefined;
  storeId: string | number;
  serviceGroupId: string | number;
  weekday: number;
  startTime: string;
  endTime: string;
  capacity: number;
  enabled: string;
  remark: string;
}

export interface YyScheduleRuleQuery extends PageQuery {
  storeId?: string | number;
  serviceGroupId?: string | number;
  weekday?: number;
  startTime?: string;
  endTime?: string;
  enabled?: string;
}
