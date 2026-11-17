process.env.PORT = process.env.PORT || '5509';
const http = require('http');
const server = require('../server.js');

const port = process.env.PORT;
setTimeout(() => {
  http.get(`http://127.0.0.1:${port}/main/index.html`, (res) => {
    console.log('index.html status:', res.statusCode);
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('index.html length:', body.length);
      console.log('Includes assisted-filing.js script tag?', body.includes('<script src="assisted-filing.js"></script>'));
      console.log('Includes assistedFilingPanel?', body.includes('id="assistedFilingPanel"'));
      console.log('Includes assistedFilingTopBtn?', body.includes('id="assistedFilingTopBtn"'));
      process.exit(0);
    });
  }).on('error', (e) => {
    console.error('Request error:', e.message);
    process.exit(1);
  });
}, 500);
