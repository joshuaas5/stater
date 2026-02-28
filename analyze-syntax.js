#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Ler o arquivo Dashboard.tsx
const filePath = path.join(__dirname, 'src', 'pages', 'Dashboard.tsx');
const content = fs.readFileSync(filePath, 'utf8');

let openBraces = 0;
let openParens = 0;
let openBrackets = 0;
const lines = content.split('\n');

console.log('Analisando balanço de chaves, parênteses e colchetes...\n');

let functionStart = -1;
let problemLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineNum = i + 1;
  
  // Detectar início da função Dashboard
  if (line.includes('const Dashboard') || line.includes('function Dashboard')) {
    functionStart = lineNum;
  }
  
  // Contar caracteres de abertura e fechamento
  for (const char of line) {
    switch (char) {
      case '{': openBraces++; break;
      case '}': openBraces--; break;
      case '(': openParens++; break;
      case ')': openParens--; break;
      case '[': openBrackets++; break;
      case ']': openBrackets--; break;
    }
  }
  
  // Mostrar linhas problemáticas
  if (openBraces < 0 || openParens < 0 || openBrackets < 0) {
    problemLines.push({
      lineNum,
      line: line.trim(),
      braces: openBraces,
      parens: openParens,
      brackets: openBrackets
    });
  }
  
  // Mostrar área crítica próxima ao erro
  if (lineNum >= 1370 && lineNum <= 1395) {
    console.log(`LINHA ${lineNum}: {${openBraces}} (${openParens}) [${openBrackets}]`);
    console.log(`  ${line}`);
  }
  
  // Verificar se chegou no export e ainda há estruturas abertas
  if (line.includes('export default Dashboard') && (openBraces > 0 || openParens > 0 || openBrackets > 0)) {
    console.log(`\n🚨 PROBLEMA ENCONTRADO na linha ${lineNum}:`);
    console.log(`   Chaves abertas: ${openBraces}`);
    console.log(`   Parênteses abertos: ${openParens}`);
    console.log(`   Colchetes abertos: ${openBrackets}`);
    console.log(`   Função Dashboard iniciou na linha: ${functionStart}`);
  }
}

console.log('\n📊 RESUMO FINAL:');
console.log(`Função Dashboard iniciou na linha: ${functionStart}`);
console.log(`Chaves não fechadas: ${openBraces}`);
console.log(`Parênteses não fechados: ${openParens}`);
console.log(`Colchetes não fechados: ${openBrackets}`);

if (problemLines.length > 0) {
  console.log('\n❌ LINHAS COM PROBLEMAS:');
  problemLines.forEach(p => {
    console.log(`  Linha ${p.lineNum}: {${p.braces}} (${p.parens}) [${p.brackets}] - ${p.line}`);
  });
}
