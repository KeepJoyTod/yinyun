const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('production public booking api does not silently fall back to demo stores products or slots', () => {
  const source = read('src/api/home.ts');

  assert.match(source, /const publicApiFallbackEnabled = String\(import\.meta\.env\.PROD\) !== 'true'/);
  assert.match(source, /function publicFallbackAllowed\(error: unknown\)/);
  assert.match(source, /if \(!publicApiFallbackEnabled\) \{\s*throw error;\s*\}/);

  for (const functionName of ['getStoreList', 'getStoreProducts', 'getProductDetail', 'getStoreSlots']) {
    const start = source.indexOf(`export function ${functionName}`);
    const end = source.indexOf('\nexport function ', start + 1);
    const block = source.slice(start, end === -1 ? source.length : end);
    assert.match(block, /\.catch\(\(error\) => \{/);
    assert.match(block, /publicFallbackAllowed\(error\);/);
  }
});

test('production customer api fallback cannot be enabled by env typo', () => {
  const source = read('src/api/customer.ts');

  assert.match(source, /const customerApiFallbackEnabled = String\(import\.meta\.env\.PROD\) !== 'true'/);
  assert.doesNotMatch(source, /\|\|\s*String\(import\.meta\.env\.VITE_CUSTOMER_API_FALLBACK/);
});

test('customer api no longer exposes album endpoints under /api/customer', () => {
  const source = read('src/api/customer.ts');

  for (const forbiddenPath of [
    '/api/customer/albums',
    '/api/customer/albums/',
    '/api/customer/albums/photos/',
  ]) {
    assert.doesNotMatch(source, new RegExp(forbiddenPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  for (const forbiddenExport of [
    'listCustomerAlbums',
    'getCustomerAlbum',
    'submitCustomerAlbumSelection',
    'getCustomerThumbnailUrl',
    'getCustomerPreviewUrl',
    'getCustomerDownloadUrl',
    'getCustomerStreamUrl',
  ]) {
    assert.doesNotMatch(source, new RegExp(`export function ${forbiddenExport}\\b`));
  }
});

test('pickup albums and detail pages do not import or call customer album apis', () => {
  const files = [
    'src/pages/pickup/albums/index.vue',
    'src/pages/pickup/detail/index.vue',
  ];

  for (const file of files) {
    const source = read(file);
    assert.doesNotMatch(source, /from ['"]@\/api\/customer['"]/);
    assert.doesNotMatch(source, /listCustomerAlbums|getCustomerAlbum|submitCustomerAlbumSelection|getCustomerThumbnailUrl/);
    assert.match(source, /from ['"]@\/api\/clientPhoto['"]/);
  }
});

test('pickup preview page uses client photo stream with X-Client-Token instead of customer album api', () => {
  const source = read('src/pages/pickup/preview/index.vue');
  const clientPhotoApi = read('src/api/clientPhoto.ts');

  assert.doesNotMatch(source, /from ['"]@\/api\/customer['"]/);
  assert.doesNotMatch(source, /getCustomerAlbum|getCustomerPreviewUrl|getCustomerDownloadUrl/);
  assert.match(source, /from ['"]@\/api\/clientPhoto['"]/);
  assert.match(source, /getStreamUrl\(/);
  assert.match(source, /X-Client-Token/);
  assert.match(clientPhotoApi, /const root = ['"]\/client\/photo['"]/);
});
