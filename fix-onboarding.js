const fs = require("fs");
let c = fs.readFileSync("src/hooks/useOnboarding.ts", "utf8");

// Dividir em linhas
let lines = c.split("\n");

// Encontrar a linha com "Verificar localStorage primeiro para resposta imediata (cache)"
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("Verificar localStorage primeiro para resposta imediata (cache)")) {
    startIdx = i;
  }
  if (startIdx > 0 && lines[i].includes("const shouldShow = !hasCompletedOnboarding;")) {
    endIdx = i;
    break;
  }
}

console.log("Start:", startIdx, "End:", endIdx);

if (startIdx > 0 && endIdx > startIdx) {
  // Novas linhas para substituir
  const newLines = [
    "        const localKey = `stater_onboarding_completed_${user.id}`;",
    "",
    "        // CORRECAO CRITICA: Verificar PRIMEIRO no Supabase, nao no localStorage",
    "        // Isso garante que novos usuarios sempre vejam o onboarding",
    "        const { data: onboardingData, error } = await supabase",
    "          .from('user_onboarding')",
    "          .select('onboarding_completed')",
    "          .eq('user_id', user.id)",
    "          .single();",
    "",
    "        console.log('[ONBOARDING DEBUG] Resultado Supabase:', { onboardingData, error });",
    "",
    "        // PGRST116 = row not found (usuario novo, nunca fez onboarding)",
    "        if (error && error.code === 'PGRST116') {",
    "          console.log('[ONBOARDING DEBUG] Usuario NOVO - nenhum registro de onboarding encontrado');",
    "          // Limpar qualquer cache antigo que possa existir",
    "          localStorage.removeItem(localKey);",
    "          // Usuario novo = DEVE mostrar onboarding",
    "          setShowOnboarding(true);",
    "          setIsChecking(false);",
    "          return;",
    "        }",
    "",
    "        if (error) {",
    "          console.error('[ONBOARDING DEBUG] Erro ao buscar dados do onboarding:', error);",
    "          // Em caso de erro de conexao, verificar localStorage como fallback",
    "          const hasCompletedFallback = localStorage.getItem(localKey) === 'true';",
    "          setShowOnboarding(!hasCompletedFallback);",
    "          setIsChecking(false);",
    "          return;",
    "        }",
    "",
    "        const hasCompletedOnboarding = onboardingData?.onboarding_completed || false;",
    "",
    "        // Sincronizar cache com Supabase",
    "        if (hasCompletedOnboarding) {",
    "          localStorage.setItem(localKey, 'true');",
    "        } else {",
    "          localStorage.removeItem(localKey);",
    "        }",
    "",
    "        const shouldShow = !hasCompletedOnboarding;"
  ];
  
  // Substituir
  lines.splice(startIdx, endIdx - startIdx + 1, ...newLines);
  
  fs.writeFileSync("src/hooks/useOnboarding.ts", lines.join("\n"), "utf8");
  console.log("Arquivo atualizado com sucesso!");
} else {
  console.log("Nao encontrou as linhas para substituir");
}
