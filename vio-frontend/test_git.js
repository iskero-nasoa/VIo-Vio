const fs = require('fs');
console.log(fs.readFileSync('./.git/logs/HEAD', 'utf8').split('\n').slice(-10).join('\n'));
