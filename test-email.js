const https = require('https');

// Gera datas dinâmicas baseadas em hoje
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const in3days = new Date(today);
in3days.setDate(in3days.getDate() + 3);
const in5days = new Date(today);
in5days.setDate(in5days.getDate() + 5);

const formatDate = (date) => date.toISOString().split('T')[0];

const data = JSON.stringify({
  to: 'suplementaja@gmail.com',
  subject: '📬 Stater: Lembrete da semana',
  template: 'bills-digest',
  data: {
    userName: 'Joshua',
    bills: [
      { name: 'Aluguel - Apartamento', amount: 1850, dueDate: formatDate(today), category: 'Moradia' },
      { name: 'Conta de Luz - CEMIG', amount: 287.50, dueDate: formatDate(tomorrow), category: 'Utilidades' },
      { name: 'Internet - Vivo Fibra', amount: 129.90, dueDate: formatDate(in3days), category: 'Utilidades' },
      { name: 'Cartão Nubank', amount: 1523.47, dueDate: formatDate(in5days), category: 'Cartões' }
    ],
    overdueBills: [] // Sem contas vencidas para teste padrão
  }
});

const options = {
  hostname: 'tmucbwlhkffrhtexmjze.supabase.co',
  path: '/functions/v1/send-email',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
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
