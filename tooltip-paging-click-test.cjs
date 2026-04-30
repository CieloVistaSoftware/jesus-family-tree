const { spawnSync } = require('node:child_process');

const runner = process.platform === 'win32' ? process.env.ComSpec || 'cmd.exe' : 'npx';
const args = process.platform === 'win32'
  ? ['/d', '/s', '/c', 'npx playwright test tests/fluidity.spec.js']
  : ['playwright', 'test', 'tests/fluidity.spec.js'];

const result = spawnSync(runner, args, {
  cwd: __dirname,
  stdio: 'inherit',
  shell: false,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
