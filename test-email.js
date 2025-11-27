const https = require('https');

const data = JSON.stringify({
  to: 'suplementaja@gmail.com',
  subject: '📬 Stater: 4 contas esta semana (R$ 1.775,17)',
  template: 'bills-digest',
  data: {
    userName: 'Joshua',
    bills: [
      { name: 'Internet - Vivo Fibra', amount: 129.90, dueDate: '2025-11-29', category: 'Utilidades' },
      { name: 'Cartão Nubank', amount: 1523.47, dueDate: '2025-12-02', category: 'Cartões' },
      { name: 'Academia Smart Fit', amount: 99.90, dueDate: '2025-12-05', category: 'Saúde' },
      { name: 'Spotify Premium', amount: 21.90, dueDate: '2025-12-10', category: 'Assinaturas' }
    ]
  }
});

const options = {
  hostname: 'tmucbwlhkffrhtexmjze.supabase.co',
  path: '/functions/v1/send-email',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjEzMDMwOCwiZXhwIjoyMDYxNzA2MzA4fQ.LCCOutviXdakdnQlWbSMhLoMCzJUEG2CLWxgfxkseg0',
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', d);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(data);
req.end();
