const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..', '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('production env templates include both photo and order client token secrets', () => {
  const envExample = read('backend/.env.example');
  const appYaml = read('backend/ruoyi-admin/src/main/resources/application.yml');
  const deployDoc = read('docs/yingyue-springboot-production-deploy.md');
  const deployPackageBuilder = read('tools/yingyue-build-deploy-package.ps1');

  for (const source of [envExample, appYaml, deployDoc, deployPackageBuilder]) {
    assert.match(source, /YY_CLIENT_PHOTO_TOKEN_SECRET/);
    assert.match(source, /YY_CLIENT_ORDER_TOKEN_SECRET/);
  }
  assert.match(appYaml, /client-order:/);
  assert.match(appYaml, /token-secret:\s*\$\{YY_CLIENT_ORDER_TOKEN_SECRET:/);
});
