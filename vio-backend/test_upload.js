const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const jwt = require('jsonwebtoken');

async function test() {
  try {
    const token = jwt.sign({userId: 'test', email: 'test@example.com'}, process.env.JWT_SECRET || 'supersecret');
    const form = new FormData();
    form.append('file', fs.createReadStream('package.json'));
    
    console.log('Sending request...');
    const res = await axios.post('http://localhost:5001/api/files/upload', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.log('Error status:', err.response?.status);
    console.log('Error data:', err.response?.data);
    console.log('Error message:', err.message);
  }
}
test();
