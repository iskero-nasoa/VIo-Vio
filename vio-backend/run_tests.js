const { execSync } = require('child_process');
const fs = require('fs');

try {
  const out1 = execSync('node test_health.js', { encoding: 'utf8' });
  fs.writeFileSync('health_out.txt', out1);
} catch (e) {
  fs.writeFileSync('health_out.txt', e.message);
}

try {
  const out2 = execSync('node dump_routes.js', { encoding: 'utf8' });
} catch (e) {
  console.log('dump_routes failed');
}
