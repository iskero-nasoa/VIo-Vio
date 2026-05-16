const express = require('express');
const app = require('./src/config/app');

// Simulate a POST request
const req = { method: 'POST', url: '/api/files/upload', headers: {} };
const res = { 
  status: (code) => { console.log('Status:', code); return res; },
  json: (data) => { console.log('JSON:', data); return res; },
  send: (data) => { console.log('Send:', data); return res; }
};

app(req, res, (err) => {
  if (err) console.log('Error:', err);
  else console.log('Next called');
});
