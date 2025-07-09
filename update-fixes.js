// Script para atualizar os arquivos com as correções do loop de F5 e problemas de login/termos

// 1. Atualizar Service Worker
console.log('Atualizando Service Worker...');
const swFixedContent = await Bun.file('public/sw-fixed.js').text();
await Bun.write('public/sw.js', swFixedContent);
console.log('✓ Service Worker atualizado');

// 2. Atualizar hook useTermsAcceptance
console.log('Atualizando hook useTermsAcceptance...');
const termsHookContent = await Bun.file('src/hooks/useTermsAcceptance-fixed.ts').text();
await Bun.write('src/hooks/useTermsAcceptance.ts', termsHookContent);
console.log('✓ Hook useTermsAcceptance atualizado');

// 3. Atualizar main.tsx
console.log('Atualizando main.tsx...');
const mainContent = await Bun.file('src/main-fixed.tsx').text();
await Bun.write('src/main.tsx', mainContent);
console.log('✓ main.tsx atualizado');

// 4. Atualizar AuthContext.tsx
console.log('Atualizando AuthContext.tsx...');
const authContextContent = await Bun.file('src/contexts/AuthContext-fixed.tsx').text();
await Bun.write('src/contexts/AuthContext.tsx', authContextContent);
console.log('✓ AuthContext.tsx atualizado');

// 5. Criar arquivo offline.html
console.log('Criando página offline.html...');
await Bun.write('public/offline.html', `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stater - Offline</title>
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
      color: #333;
      background-color: #f7f7f7;
    }
    
    .container {
      max-width: 500px;
      padding: 30px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    h1 {
      color: #2E4A6B;
      margin-bottom: 20px;
    }
    
    p {
      margin-bottom: 20px;
      line-height: 1.5;
    }
    
    button {
      background: #2E4A6B;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    button:hover {
      background: #1a3654;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Você está offline</h1>
    <p>Parece que você está sem conexão com a internet. Algumas funcionalidades podem não estar disponíveis.</p>
    <p>Seus dados estão seguros e sincronizaremos quando a conexão for restaurada.</p>
    <button onclick="window.location.reload()">Tentar novamente</button>
  </div>
  
  <script>
    // Verificar conexão periodicamente
    setInterval(() => {
      if (navigator.onLine) {
        window.location.reload();
      }
    }, 5000);
  </script>
</body>
</html>
`);
console.log('✓ offline.html criada');

console.log('Todas as correções foram aplicadas com sucesso!');
console.log('Para testar, execute: bun run dev');
