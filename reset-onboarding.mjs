// Script para resetar onboarding de um usuário
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjEzMDMwOCwiZXhwIjoyMDYxNzA2MzA4fQ.LCCOutviXdakdnQlWbSMhLoMCzJUEG2CLWxgfxkseg0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetOnboarding(email) {
  console.log(`🔄 Resetando onboarding para: ${email}`);
  
  // Primeiro, buscar o user_id pelo email
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('❌ Erro ao buscar usuários:', userError);
    return;
  }
  
  const user = users.users.find(u => u.email === email);
  
  if (!user) {
    console.error('❌ Usuário não encontrado:', email);
    return;
  }
  
  console.log(`✅ Usuário encontrado: ${user.id}`);
  
  // Deletar o registro de onboarding
  const { error: deleteError } = await supabase
    .from('user_onboarding')
    .delete()
    .eq('user_id', user.id);
  
  if (deleteError) {
    console.error('❌ Erro ao deletar onboarding:', deleteError);
    return;
  }
  
  console.log('✅ Onboarding resetado com sucesso!');
  console.log('📝 Agora faça logout e login novamente para ver o onboarding.');
}

resetOnboarding('joshuaas500@gmail.com');
