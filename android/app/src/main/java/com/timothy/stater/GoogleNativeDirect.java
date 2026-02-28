package com.timothy.stater;

import android.content.Intent;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

@CapacitorPlugin(name = "GoogleNativeDirect")
public class GoogleNativeDirect extends Plugin {
    private static final String TAG = "GoogleNativeDirect";
    private static final int RC_SIGN_IN = 9001;
    private GoogleSignInClient mGoogleSignInClient;
    private PluginCall savedCall;

    @PluginMethod
    public void signIn(PluginCall call) {
        // Salva a chamada para retornar quando o Intent completar
        savedCall = call;

        try {
            Log.d(TAG, "🚀 [NATIVE DIRECT] Iniciando login Google direto...");

            // Client ID do Google Console (Web Client ID)
            String webClientId = "1011686437516-r63t3ba5gvjg4m7m7vrvcsb80ccqb25a.apps.googleusercontent.com";

            Log.d(TAG, "📱 [NATIVE DIRECT] Configurando GoogleSignInOptions...");
            GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                    .requestIdToken(webClientId)  // Para integração com Supabase
                    .requestEmail()
                    .requestProfile()
                    .build();

            // Inicializa o cliente de login
            mGoogleSignInClient = GoogleSignIn.getClient(getActivity(), gso);
            
            Log.d(TAG, "🔐 [NATIVE DIRECT] Cliente inicializado - abrindo Intent...");
            
            // Inicia o fluxo de login nativo
            Intent signInIntent = mGoogleSignInClient.getSignInIntent();
            startActivityForResult(call, signInIntent, RC_SIGN_IN);
            
        } catch (Exception ex) {
            Log.e(TAG, "❌ [NATIVE DIRECT] Erro ao iniciar login Google", ex);
            call.reject("Erro ao iniciar login: " + ex.getMessage(), ex);
        }
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);

        Log.d(TAG, "🔄 [NATIVE DIRECT] handleOnActivityResult chamado - requestCode: " + requestCode + ", resultCode: " + resultCode);

        if (requestCode == RC_SIGN_IN) {
            try {
                Log.d(TAG, "🔄 [NATIVE DIRECT] Processando resultado do login...");
                
                Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
                GoogleSignInAccount account = task.getResult(ApiException.class);
                
                if (account != null && savedCall != null) {
                    String idToken = account.getIdToken();
                    String email = account.getEmail();
                    String name = account.getDisplayName();
                    
                    Log.d(TAG, "✅ [NATIVE DIRECT] Login bem-sucedido: " + email);
                    
                    if (idToken != null) {
                        JSObject ret = new JSObject();
                        ret.put("idToken", idToken);
                        ret.put("email", email);
                        ret.put("name", name);
                        ret.put("success", true);
                        
                        Log.d(TAG, "🎉 [NATIVE DIRECT] Retornando dados para JavaScript...");
                        savedCall.resolve(ret);
                    } else {
                        Log.e(TAG, "❌ [NATIVE DIRECT] Token ID não disponível");
                        savedCall.reject("Login falhou: token ID não disponível");
                    }
                } else {
                    if (savedCall != null) {
                        Log.e(TAG, "❌ [NATIVE DIRECT] Conta Google não disponível");
                        savedCall.reject("Login cancelado ou falhou");
                    }
                }
            } catch (ApiException e) {
                Log.e(TAG, "❌ [NATIVE DIRECT] Login falhou com código: " + e.getStatusCode(), e);
                String errorMessage = "Login Google falhou: " + e.getStatusMessage() + " (código " + e.getStatusCode() + ")";
                if (savedCall != null) {
                    savedCall.reject(errorMessage, String.valueOf(e.getStatusCode()));
                }
            }
            
            // Limpa a referência da chamada
            savedCall = null;
        }
    }

    @PluginMethod
    public void signOut(PluginCall call) {
        try {
            Log.d(TAG, "🚪 [NATIVE DIRECT] Fazendo logout...");
            if (mGoogleSignInClient != null) {
                mGoogleSignInClient.signOut().addOnCompleteListener(task -> {
                    Log.d(TAG, "✅ [NATIVE DIRECT] Logout concluído");
                    JSObject ret = new JSObject();
                    ret.put("success", true);
                    call.resolve(ret);
                });
            } else {
                call.resolve(new JSObject().put("success", true));
            }
        } catch (Exception ex) {
            Log.e(TAG, "❌ [NATIVE DIRECT] Erro no logout", ex);
            call.reject("Erro no logout: " + ex.getMessage(), ex);
        }
    }
}