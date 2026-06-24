import { describe, expect, it } from 'vitest';
import { canGenerateClientThumbnail, resolveThumbnailFileName } from './photoThumbnail';

describe('photo thumbnail helpers', () => {
  it('generates safe webp thumbnail names beside uploaded originals', () => {
    expect(resolveThumbnailFileName('客户成片 01.JPG')).toBe('客户成片 01-thumb.webp');
    expect(resolveThumbnailFileName('a/b:c*bad?.png')).toBe('a_b_c_bad_-thumb.webp');
    expect(resolveThumbnailFileName('')).toBe('photo-thumb.webp');
  });

  it('allows normal still images and rejects gif/non-image files', () => {
    expect(canGenerateClientThumbnail({ name: 'portrait.jpg', type: 'image/jpeg' })).toBe(true);
    expect(canGenerateClientThumbnail({ name: 'portrait.webp', type: '' })).toBe(true);
    expect(canGenerateClientThumbnail({ name: 'motion.gif', type: 'image/gif' })).toBe(false);
    expect(canGenerateClientThumbnail({ name: 'notes.txt', type: 'text/plain' })).toBe(false);
  });
});
