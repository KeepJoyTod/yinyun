export interface YyProductVO extends BaseEntity {
  id: string | number;
  storeId: string | number;
  productType: string;
  productName: string;
  price: number;
  durationMinutes: number;
  selectionPrice: number;
  albumProductName: string;
  status: string;
  sort: number;
  remark: string;
  tenantId?: string;
}

export interface YyProductForm {
  id?: string | number | undefined;
  storeId: string | number;
  productType: string;
  productName: string;
  price: number;
  durationMinutes: number;
  selectionPrice: number;
  albumProductName: string;
  status: string;
  sort: number;
  remark: string;
}

export interface YyProductQuery extends PageQuery {
  storeId?: string | number;
  productType?: string;
  productName?: string;
  albumProductName?: string;
  status?: string;
}
