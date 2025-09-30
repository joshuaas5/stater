# Correção – Google Sign-In `DEVELOPER_ERROR` (statusCode 10)

Este documento registra a correção aplicada quando o login com Google no aplicativo Android retorna **`statusCode=10 (DEVELOPER_ERROR)`**, impedindo a emissão do `idToken` exigido pelo Supabase.

## Sintoma observado
- Toast/alerta mostrando: _"(10) Status 10 (DEVELOPER_ERROR) indica que o aplicativo não está autorizado"_.
- `adb logcat` sem linhas do plugin (`GoogleAuth`, `SignIn`) ou com `idTokenRequested=false`.
- Google Sign-In falha assim que o usuário escolhe a conta, retornando ao app sem sessão.

## Causa raiz
- O SDK nativo estava sendo inicializado com o **Android Client ID** em vez do **Web Client ID**.
- Com isso, o Google Play Services não retornava `idToken`, pois o Web client ID é o único habilitado para `requestIdToken` no fluxo nativo.

## Arquivos alterados
- `src/pages/Login.tsx`
  - Força o uso do Web Client ID (`1011686437516-r63t3ba5gvjg4m7m7vrvcsb80ccqb25a.apps.googleusercontent.com`) ao chamar `GoogleAuth.initialize`, mantendo o Android Client ID apenas para logs.
- `android/app/src/main/java/com/timothy/stater/GoogleNativeDirect.java`
  - Atualizado para o mesmo Web Client ID (garante consistência com o plugin nativo alternativo).

## Passo a passo para reaplicar a correção
1. **Conferir Client IDs** no Google Cloud/Firebase:
   - Android client (`1011…bvvcq8e`) deve ter o SHA-1/SHA-256 corretos do keystore de release.
   - Web client (`1011…ccqb25a`) permanece habilitado e sem restrições.
2. **Ajustar o código** (caso volte a mudar):
   - Em `Login.tsx`, garanta que `GoogleAuth.initialize({ clientId: WEB_CLIENT_ID, … })` use o Web client.
   - Sincronize qualquer wrapper/bridge nativo que solicite `requestIdToken` com o mesmo Web client.
3. **Recompilar o app**:
   ```powershell
   npm run build
   npx cap sync android
   cd android
   ./gradlew assembleRelease
   ```
4. **Instalar/atualizar no dispositivo**:
   ```powershell
   cd "c:\Users\Editora Vélos\ICTUS"
   &"C:\Android\Sdk\platform-tools\adb.exe" install -r android\app\build\outputs\apk\release\app-release.apk
   ```

## Validação (sempre fazer)
1. Limpe o logcat: `adb logcat -c`.
2. Inicie captura: `adb logcat -v time | Select-String "GoogleAuth|SignIn|statusCode|STATER"`.
3. Execute login Google no app:
   - Log deve mostrar `requestIdToken` verdadeiro.
   - Nenhuma linha com `statusCode=10` deve aparecer.
   - Supabase cria sessão e o usuário é redirecionado ao dashboard.

## Observações adicionais
- Se o erro persistir, confira se há **cliente Android duplicado** no Firebase ou credenciais antigas.
- Verifique se o aparelho está online e com a versão do Google Play Services atualizada.
- Manter este arquivo atualizado sempre que houver mudanças nos IDs ou no fluxo de login.
