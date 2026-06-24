const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('client photo api exposes a separate thumbnail signed url endpoint', () => {
  const api = read('src/api/clientPhoto.ts');

  assert.match(api, /export function getThumbnailUrl/);
  assert.match(api, /export function getThumbnailDisplayUrl/);
  assert.match(api, /export function getPreviewDisplayUrl/);
  assert.match(api, /thumbnail:\s*'thumbnail-url'/);
  assert.match(api, /preview:\s*'preview-url'/);
  assert.match(api, /download:\s*'download-url'/);
});

test('thumbnail signed url falls back to preview signed url when backend lacks thumbnail endpoint', () => {
  const api = read('src/api/clientPhoto.ts');

  assert.match(api, /export function getThumbnailUrl/);
  assert.match(api, /thumbnail-url/);
  assert.match(api, /silent:\s*true/);
  assert.match(api, /catch[\s\S]*getSignedUrl\('preview',\s*assetId\)/);
  assert.match(api, /setCachedSignedUrl\(assetKey,\s*'thumbnail',\s*payload\)/);
});

test('miniapp image display uses api-domain stream temp files instead of direct OSS signed urls', () => {
  const api = read('src/api/clientPhoto.ts');
  const detailPage = read('src/pages/pickup/detail/index.vue');
  const albumsPage = read('src/pages/pickup/albums/index.vue');
  const previewPage = read('src/pages/pickup/preview/index.vue');

  assert.match(api, /function downloadStreamImage/);
  assert.match(api, /uni\.downloadFile/);
  assert.match(api, /getStreamUrl\(assetId\)/);
  assert.match(api, /'X-Client-Token':\s*getClientTokenValue\(\)/);
  assert.match(api, /resolveDisplayImageUrl/);
  assert.match(api, /url:\s*tempFilePath/);
  assert.match(detailPage, /getThumbnailDisplayUrl/);
  assert.doesNotMatch(detailPage, /getPreviewUrl/);
  assert.match(albumsPage, /getThumbnailDisplayUrl/);
  assert.doesNotMatch(albumsPage, /getPreviewUrl/);
  assert.match(previewPage, /getPreviewDisplayUrl/);
});

test('album directory and cover use thumbnails while preview keeps preview metadata', () => {
  const detailPage = read('src/pages/pickup/detail/index.vue');
  const albumsPage = read('src/pages/pickup/albums/index.vue');
  const previewPage = read('src/pages/pickup/preview/index.vue');

  assert.match(detailPage, /getThumbnailDisplayUrl/);
  assert.doesNotMatch(detailPage, /getPreviewUrl/);
  assert.match(albumsPage, /getThumbnailDisplayUrl/);
  assert.doesNotMatch(albumsPage, /getPreviewUrl/);
  assert.match(previewPage, /getPreviewDisplayUrl/);
});
