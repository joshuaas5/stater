// Script para corrigir caracteres bugados no bot do Telegram
const fs = require('fs');

console.log('🔧 Corrigindo caracteres bugados no bot...');

const botPath = './telegram-bot/bot.js';
let content = fs.readFileSync(botPath, 'utf8');

// Mapeamento de caracteres bugados para corretos
const fixes = {
    'âš ï¸': '⚠️',
    'âœ…': '✅',
    'âŒ': '❌',
    'ðŸ'°': '💰',
    'ðŸ"§': '🔧',
    'ðŸ"¥': '🔥',
    'ðŸ"Š': '📊',
    'ðŸ¤–': '🤖',
    'ðŸ"„': '📄',
    'ðŸš€': '🚀',
    'ðŸ"—': '🔗',
    'ðŸ˜"': '😔',
    'ðŸ§®': '🧮',
    'ðŸ'¡': '💡',
    'ðŸ"': '📋',
    'ðŸ'¥': '💥',
    'ðŸ'€': '👀',
    'ðŸŽ¯': '🎯',
    'ðŸ"±': '📱',
    'VocÃª': 'Você',
    'nÃ£o': 'não',
    'transaÃ§Ãµes': 'transações',
    'anÃ¡lises': 'análises',
    'ã§': 'ç',
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã­': 'í',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ã¢': 'â',
    'Ãª': 'ê',
    'Ã´': 'ô',
    'Ã ': 'à',
    'Ã§': 'ç',
    'SessÃµes': 'Sessões',
    'sessÃµes': 'sessões',
    'conexÃ£o': 'conexão',
    'PERSISTÃŠNCIA': 'PERSISTÊNCIA',
    'vinculaÃ§Ã£o': 'vinculação',
    'UsuÃ¡rio': 'Usuário',
    'usuÃ¡rio': 'usuário',
    'categoria': 'categoria',
    'CONFIRMAÃ‡ÃƒO': 'CONFIRMAÇÃO',
    'EXTRAÃ‡ÃƒO': 'EXTRAÇÃO'
};

console.log('🔄 Aplicando correções...');
let fixesApplied = 0;

Object.entries(fixes).forEach(([buggy, correct]) => {
    if (content.includes(buggy)) {
        content = content.replaceAll(buggy, correct);
        fixesApplied++;
        console.log(`✅ Corrigido: ${buggy} → ${correct}`);
    }
});

// Salvar arquivo corrigido
fs.writeFileSync(botPath, content, 'utf8');

console.log(`🎯 Correções aplicadas: ${fixesApplied}`);
console.log('✅ Bot com caracteres corrigidos!');
