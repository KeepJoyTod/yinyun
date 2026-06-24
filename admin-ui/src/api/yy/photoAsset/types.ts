export interface YyPhotoAssetVO extends BaseEntity {
  id: string | number;
  storeId: string | number;
  albumId: string | number;
  fileName: string;
  fileUrl: string;
  objectKey: string;
  thumbnailObjectKey: string;
  sort: number;
  isSelected: string;
  visible: string;
  remark: string;
  tenantId?: string;
}

export interface YyPhotoAssetForm {
  id?: string | number | undefined;
  storeId: string | number;
  albumId: string | number;
  fileName: string;
  fileUrl: string;
  objectKey: string;
  thumbnailObjectKey: string;
  sort: number;
  isSelected: string;
  visible: string;
  remark: string;
}

export interface YyPhotoAssetQuery extends PageQuery {
  storeId?: string | number;
  albumId?: string | number;
  fileName?: string;
  isSelected?: string;
  visible?: string;
}
