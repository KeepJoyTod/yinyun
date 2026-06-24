import type { ClientPhotoAlbum } from '@/types/clientPhoto';

export function getAlbumAvailabilityLabel(album?: Partial<ClientPhotoAlbum>): string;
export function getAlbumActionLabel(album?: Partial<ClientPhotoAlbum>): string;
export function getAlbumDeliverySteps(album?: Partial<ClientPhotoAlbum>): Array<{
  title: string;
  copy: string;
  active: boolean;
}>;
export function getAlbumListRecoverySteps(options?: { loadFailed?: boolean }): Array<{
  title: string;
  copy: string;
}>;
