// Teste das variáveis de ambiente
console.log('=== TESTE DE ENVIRONMENT ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DEV:', import.meta.env?.DEV);
console.log('PROD:', import.meta.env?.PROD);
console.log('MODE:', import.meta.env?.MODE);
console.log('VITE_GEMINI_API_KEY disponível:', !!import.meta.env?.VITE_GEMINI_API_KEY);
console.log('Todas as variáveis import.meta.env:', import.meta.env);

// Para executar no navegador
if (typeof window !== 'undefined') {
    window.debugEnv = () => {
        console.log('=== DEBUG ENVIRONMENT ===');
        console.log('DEV:', import.meta.env?.DEV);
        console.log('PROD:', import.meta.env?.PROD);
        console.log('MODE:', import.meta.env?.MODE);
        console.log('VITE_GEMINI_API_KEY disponível:', !!import.meta.env?.VITE_GEMINI_API_KEY);
        console.log('Todas as variáveis:', import.meta.env);
    };
}
