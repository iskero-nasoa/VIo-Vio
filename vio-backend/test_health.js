const axios = require('axios');
axios.get('http://localhost:5001/api/health')
  .then(res => console.log('Health:', res.data))
  .catch(err => console.log('Error:', err.message));
