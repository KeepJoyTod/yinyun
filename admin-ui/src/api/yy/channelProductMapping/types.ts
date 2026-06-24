export interface YyChannelProductMappingVO extends BaseEntity {
  id: string | number;
  storeId: string | number;
  productId: string | number;
  channelType: string;
  externalProductId: string;
  externalSkuId: string;
  externalPoiId: string;
  landingUrl: string;
  landingPath: string;
  externalName: string;
  mappingStatus: string;
  remark: string;
  tenantId?: string;
}

export interface YyChannelProductMappingForm {
  id?: string | number | undefined;
  storeId: string | number;
  productId: string | number;
  channelType: string;
  externalProductId: string;
  externalSkuId: string;
  externalPoiId: string;
  landingUrl: string;
  landingPath: string;
  externalName: string;
  mappingStatus: string;
  remark: string;
}

export interface YyChannelProductMappingQuery extends PageQuery {
  storeId?: string | number;
  productId?: string | number;
  channelType?: string;
  externalProductId?: string;
  externalSkuId?: string;
  externalPoiId?: string;
  landingUrl?: string;
  landingPath?: string;
  externalName?: string;
  mappingStatus?: string;
}
