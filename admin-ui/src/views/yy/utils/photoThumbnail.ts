const THUMBNAIL_MAX_EDGE = 720;
const THUMBNAIL_QUALITY = 0.82;

type ImageLikeFile = Pick<File, 'name' | 'type'>;

export function canGenerateClientThumbnail(file: ImageLikeFile) {
  const fileType = String(file.type || '').toLowerCase();
  const fileName = String(file.name || '').toLowerCase();
  if (fileType === 'image/gif' || fileName.endsWith('.gif')) {
    return false;
  }
  return fileType.startsWith('image/') || /\.(jpe?g|png|webp)$/.test(fileName);
}

export function resolveThumbnailFileName(fileName: string) {
  const safeName = String(fileName || 'photo').replace(/[\\/:*?"<>|]+/g, '_');
  const withoutExt = safeName.replace(/\.[^.]+$/, '') || 'photo';
  return `${withoutExt}-thumb.webp`;
}

export async function createClientThumbnailFile(file: File): Promise<File | null> {
  if (!canGenerateClientThumbnail(file) || typeof document === 'undefined' || typeof URL === 'undefined') {
    return null;
  }
  const image = await loadImage(file);
  const { width, height } = fitWithin(image.width, image.height, THUMBNAIL_MAX_EDGE);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }
  context.drawImage(image, 0, 0, width, height);
  const blob = await canvasToBlob(canvas, 'image/webp', THUMBNAIL_QUALITY);
  if (!blob) {
    return null;
  }
  return new File([blob], resolveThumbnailFileName(file.name), { type: 'image/webp' });
}

function fitWithin(width: number, height: number, maxEdge: number) {
  if (!width || !height || Math.max(width, height) <= maxEdge) {
    return {
      width: Math.max(1, Math.round(width || maxEdge)),
      height: Math.max(1, Math.round(height || maxEdge))
    };
  }
  const scale = maxEdge / Math.max(width, height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('缩略图图片读取失败'));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}
