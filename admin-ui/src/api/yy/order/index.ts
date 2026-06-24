import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyOrderForm, YyOrderQuery, YyOrderVO } from './types';
import type { YyPhotoAlbumVO } from '@/api/yy/photoAlbum/types';

export const listYyOrder = (query?: YyOrderQuery): AxiosPromise<YyOrderVO[]> => {
  return request({
    url: '/yy/order/list',
    method: 'get',
    params: query
  });
};

export const getYyOrder = (id: string | number): AxiosPromise<YyOrderVO> => {
  return request({
    url: '/yy/order/' + id,
    method: 'get'
  });
};

export const addYyOrder = (data: YyOrderForm) => {
  return request({
    url: '/yy/order',
    method: 'post',
    data
  });
};

export const updateYyOrder = (data: YyOrderForm) => {
  return request({
    url: '/yy/order',
    method: 'put',
    data
  });
};

export const delYyOrder = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/order/' + ids,
    method: 'delete'
  });
};

export const repairYyOrderPhotoAlbumPlaceholder = (id: string | number): AxiosPromise<YyPhotoAlbumVO> => {
  return request({
    url: `/yy/order/${id}/photo-album-placeholder`,
    method: 'post'
  });
};
