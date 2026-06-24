export interface YyPhotoAccessLogVO extends BaseEntity {
  id: string | number;
  storeId?: string | number;
  albumId?: string | number;
  assetId?: string | number;
  customerPhone?: string;
  platform?: string;
  action?: string;
  ip?: string;
  success?: string;
  remark?: string;
  tenantId?: string;
}

export interface YyPhotoAccessLogQuery extends PageQuery {
  storeId?: string | number;
  albumId?: string | number;
  assetId?: string | number;
  customerPhone?: string;
  platform?: string;
  action?: string;
  success?: string;
}
