export interface YyPhotoAlbumVO extends BaseEntity {
  id: string | number;
  storeId: string | number;
  orderId: string | number;
  albumName: string;
  customerName?: string;
  customerPhone?: string;
  publicToken: string;
  accessCode?: string;
  channelType?: string;
  status?: string;
  selectionStatus: string;
  expireTime: string;
  remark: string;
  tenantId?: string;
}

export interface YyPhotoAlbumForm {
  id?: string | number | undefined;
  storeId: string | number;
  orderId: string | number;
  albumName: string;
  customerName?: string;
  customerPhone?: string;
  publicToken: string;
  accessCode?: string;
  channelType?: string;
  status?: string;
  selectionStatus: string;
  expireTime: string;
  remark: string;
}

export interface YyPhotoAlbumQuery extends PageQuery {
  storeId?: string | number;
  orderId?: string | number;
  albumName?: string;
  selectionStatus?: string;
}

export interface YyPhotoAlbumOperationsRecentFailureVO {
  action?: string;
  remark?: string;
  createTime?: string;
}

export interface YyPhotoAlbumOperationsSummaryVO {
  albumId: string | number;
  totalAssets: number;
  visibleAssets: number;
  selectedAssets: number;
  missingObjectKeyAssets: number;
  recentFailure?: YyPhotoAlbumOperationsRecentFailureVO;
}
