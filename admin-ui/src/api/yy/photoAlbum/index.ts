import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyPhotoAlbumForm, YyPhotoAlbumOperationsSummaryVO, YyPhotoAlbumQuery, YyPhotoAlbumVO } from './types';

export const listYyPhotoAlbum = (query?: YyPhotoAlbumQuery): AxiosPromise<YyPhotoAlbumVO[]> => {
  return request({
    url: '/yy/photoAlbum/list',
    method: 'get',
    params: query
  });
};

export const getYyPhotoAlbum = (id: string | number): AxiosPromise<YyPhotoAlbumVO> => {
  return request({
    url: '/yy/photoAlbum/' + id,
    method: 'get'
  });
};

export const listYyPhotoAlbumOperationsSummary = (albumIds: Array<string | number>): AxiosPromise<YyPhotoAlbumOperationsSummaryVO[]> => {
  return request({
    url: '/yy/photoAlbum/operations-summary',
    method: 'get',
    params: {
      albumIds: albumIds.join(',')
    }
  });
};

export const addYyPhotoAlbum = (data: YyPhotoAlbumForm) => {
  return request({
    url: '/yy/photoAlbum',
    method: 'post',
    data
  });
};

export const updateYyPhotoAlbum = (data: YyPhotoAlbumForm) => {
  return request({
    url: '/yy/photoAlbum',
    method: 'put',
    data
  });
};

export const delYyPhotoAlbum = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/photoAlbum/' + ids,
    method: 'delete'
  });
};
