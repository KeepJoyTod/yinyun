import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyBookingSlotInventoryForm, YyBookingSlotInventoryQuery, YyBookingSlotInventoryVO } from './types';

export const listYyBookingSlotInventory = (query?: YyBookingSlotInventoryQuery): AxiosPromise<YyBookingSlotInventoryVO[]> => {
  return request({
    url: '/yy/bookingSlotInventory/list',
    method: 'get',
    params: query
  });
};

export const getYyBookingSlotInventory = (id: string | number): AxiosPromise<YyBookingSlotInventoryVO> => {
  return request({
    url: '/yy/bookingSlotInventory/' + id,
    method: 'get'
  });
};

export const updateYyBookingSlotInventory = (data: YyBookingSlotInventoryForm) => {
  return request({
    url: '/yy/bookingSlotInventory',
    method: 'put',
    data
  });
};
