package com.timothy.stater;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

// ✅ IMPORTS DOS PLUGINS CUSTOMIZADOS
import com.timothy.stater.GoogleAuthInterceptor;
import com.timothy.stater.GoogleNativeDirect;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Registrar plugins customizados
        registerPlugin(GoogleAuthInterceptor.class);
        registerPlugin(GoogleNativeDirect.class);
        
        // Habilitar debug da WebView para ver logs JavaScript
        WebView.setWebContentsDebuggingEnabled(true);
        
        // Log para confirmar que a activity iniciou
        android.util.Log.d("STATER", "MainActivity created successfully");
        
        // Processar intent inicial se houver deep link
        handleIntent(getIntent());
    }
    
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }
    
    private void handleIntent(Intent intent) {
        String action = intent.getAction();
        Uri data = intent.getData();
        
        if (Intent.ACTION_VIEW.equals(action) && data != null) {
            handleDeepLink(intent);
        }
    }
    
    // Método público para ser usado pelo plugin
    public void handleDeepLink(Intent intent) {
        Uri data = intent.getData();
        if (data != null) {
            android.util.Log.d("STATER", "Deep link received: " + data.toString());
            
            // Se é um callback de OAuth, processar no JavaScript
            if (data.getScheme() != null && data.getScheme().equals("com.timothy.stater")) {
                // Enviar para o JavaScript via Bridge
                String url = data.toString();
                bridge.eval("window.handleAuthCallback && window.handleAuthCallback('" + url + "');", null);
            }
        }
    }
}
