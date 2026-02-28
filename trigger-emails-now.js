// Disparar envio de emails via fetch direto
// node trigger-emails-now.js

async function triggerEmails() {
  // Service Role Key do Supabase
  const SERVICE_ROLE_KEY = 'YOUR_JWT_TOKEN';
  
  console.log('📧 Disparando weekly-email-digest...\n');

  try {
    const response = await fetch('https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/weekly-email-digest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({})
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('');
    
    if (data.success) {
      console.log('🎉 SUCESSO!\n');
      console.log(`📬 Emails enviados: ${data.emailsSent}`);
      console.log(`⏭️ Emails pulados (opt-out): ${data.emailsSkipped}`);
      if (data.errors?.length > 0) {
        console.log(`\n⚠️ Erros (${data.errors.length}):`);
        data.errors.forEach(e => console.log(`   - ${e}`));
      }
      console.log(`\n⏰ Timestamp: ${data.timestamp}`);
    } else {
      console.log('❌ Erro:', data.error || JSON.stringify(data));
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

triggerEmails();
