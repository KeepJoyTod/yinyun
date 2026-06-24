const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const registrySource = fs.readFileSync(path.join(__dirname, '../src/domainRegistry.ts'), 'utf8');
const pagesSource = fs.readFileSync(path.join(__dirname, '../src/pages.json'), 'utf8');

test('mobile domain registry covers the phase0 planned client domains', () => {
  for (const key of ['home', 'booking', 'orders', 'albums', 'member', 'coupons', 'profile']) {
    assert.match(registrySource, new RegExp(`key: '${key}'`));
  }
});

test('pages.json keeps scaffold routes for coupons and profile', () => {
  assert.match(pagesSource, /pages\/coupons\/index/);
  assert.match(pagesSource, /pages\/profile\/index/);
});
