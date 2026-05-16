const fs = require('fs');
const { execSync } = require('child_process');
try {
  const out = execSync('node test_routes.js', { encoding: 'utf8' });
  fs.writeFileSync('routes_output.txt', out);
} catch (e) {
  fs.writeFileSync('routes_output.txt', e.message + '\n' + e.stdout);
}
