// Script para corrigir caracteres bugados no bot do Telegram
const fs = require('fs');

console.log('🔧 Corrigindo caracteres bugados no bot...');

const botPath = './telegram-bot/bot.js';
let content = fs.readFileSync(botPath, 'utf8');

// Correções básicas mais importantes
console.log('🔄 Aplicando correções...');

// Emojis bugados
content = content.replaceAll('âš ï¸', '⚠️');
content = content.replaceAll('âœ…', '✅');
content = content.replaceAll('âŒ', '❌');

// Caracteres portugueses
content = content.replaceAll('VocÃª', 'Você');
content = content.replaceAll('nÃ£o', 'não');
content = content.replaceAll('transaÃ§Ãµes', 'transações');
content = content.replaceAll('anÃ¡lises', 'análises');
content = content.replaceAll('conexÃ£o', 'conexão');
content = content.replaceAll('sessÃµes', 'sessões');
content = content.replaceAll('SessÃµes', 'Sessões');
content = content.replaceAll('vinculaÃ§Ã£o', 'vinculação');
content = content.replaceAll('UsuÃ¡rio', 'Usuário');
content = content.replaceAll('usuÃ¡rio', 'usuário');
content = content.replaceAll('PERSISTÃŠNCIA', 'PERSISTÊNCIA');
content = content.replaceAll('CONFIRMAÃ‡ÃƒO', 'CONFIRMAÇÃO');
content = content.replaceAll('EXTRAÃ‡ÃƒO', 'EXTRAÇÃO');

// Salvar arquivo corrigido
fs.writeFileSync(botPath, content, 'utf8');

console.log('✅ Caracteres corrigidos no bot!');
console.log('🔄 Agora vou verificar o saldo...');
