import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyPhotoAssetForm, YyPhotoAssetQuery, YyPhotoAssetVO } from './types';

export const listYyPhotoAsset = (query?: YyPhotoAssetQuery): AxiosPromise<YyPhotoAssetVO[]> => {
  return request({
    url: '/yy/photoAsset/list',
    method: 'get',
    params: query
  });
};

export const getYyPhotoAsset = (id: string | number): AxiosPromise<YyPhotoAssetVO> => {
  return request({
    url: '/yy/photoAsset/' + id,
    method: 'get'
  });
};

export const addYyPhotoAsset = (data: YyPhotoAssetForm) => {
  return request({
    url: '/yy/photoAsset',
    method: 'post',
    data
  });
};

export const updateYyPhotoAsset = (data: YyPhotoAssetForm) => {
  return request({
    url: '/yy/photoAsset',
    method: 'put',
    data
  });
};

export const delYyPhotoAsset = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/photoAsset/' + ids,
    method: 'delete'
  });
};
