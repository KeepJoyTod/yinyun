const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function lineCount(relativePath) {
  return read(relativePath).split(/\r?\n/).length;
}

test('home page delegates presentation, navigation, and styles to focused owners', () => {
  const pageSource = read('src/pages/home/index.vue');
  const presentationSource = read('src/pages/home/homePresentation.ts');
  const navigationSource = read('src/pages/home/homeNavigation.ts');
  const styleSource = read('src/pages/home/home-page.scss');

  assert.match(pageSource, /from '\.\/homePresentation'/);
  assert.match(pageSource, /from '\.\/homeNavigation'/);
  assert.match(pageSource, /<style scoped src="\.\/home-page\.scss"><\/style>/);

  assert.doesNotMatch(pageSource, /const fallbackMenus:/);
  assert.doesNotMatch(pageSource, /const fallbackCategories:/);
  assert.doesNotMatch(pageSource, /const menuItemIconMap:/);
  assert.doesNotMatch(pageSource, /function navigateByLink/);
  assert.doesNotMatch(pageSource, /function resolveMenuIcon/);

  assert.match(presentationSource, /export const fallbackMenus/);
  assert.match(presentationSource, /export function resolveMenuIcon/);
  assert.match(navigationSource, /export function navigateByLink/);
  assert.match(styleSource, /\.home-photo-page/);

  assert.ok(lineCount('src/pages/home/index.vue') <= 500, 'home page should stay within the 500-line target');
});
