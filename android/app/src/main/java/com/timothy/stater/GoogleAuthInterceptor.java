package com.timothy.stater;

import android.content.Intent;
import android.net.Uri;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "GoogleAuthInterceptor")
public class GoogleAuthInterceptor extends Plugin {
    
    @PluginMethod
    public void openAuthUrl(PluginCall call) {
        String url = call.getString("url");
        if (url == null) {
            call.reject("URL is required");
            return;
        }
        
        // Interceptar e abrir em WebView interno fullscreen sem barras
        getActivity().runOnUiThread(() -> {
            // Criar dialog fullscreen para WebView
            android.app.Dialog dialog = new android.app.Dialog(getActivity(), android.R.style.Theme_Black_NoTitleBar_Fullscreen);
            
            WebView webView = new WebView(getContext());
            webView.getSettings().setJavaScriptEnabled(true);
            webView.getSettings().setDomStorageEnabled(true);
            webView.getSettings().setUserAgentString(webView.getSettings().getUserAgentString() + " SupabaseAuth");
            
            // Configurações para experiência nativa
            webView.getSettings().setBuiltInZoomControls(false);
            webView.getSettings().setDisplayZoomControls(false);
            webView.getSettings().setSupportZoom(false);
            webView.getSettings().setLoadWithOverviewMode(true);
            webView.getSettings().setUseWideViewPort(true);
            
            webView.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    android.util.Log.d("STATER", "WebView navigation: " + url);
                    
                    // Interceptar callback URLs
                    if (url.startsWith("com.timothy.stater://")) {
                        android.util.Log.d("STATER", "OAuth callback intercepted: " + url);
                        
                        // Fechar dialog
                        dialog.dismiss();
                        
                        // Processar callback
                        Intent intent = new Intent();
                        intent.setData(Uri.parse(url));
                        ((MainActivity) getActivity()).handleDeepLink(intent);
                        call.resolve();
                        return true;
                    }
                    
                    // Continuar navegação normal
                    view.loadUrl(url);
                    return true;
                }
                
                @Override
                public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                    android.util.Log.d("STATER", "Page started: " + url);
                    super.onPageStarted(view, url, favicon);
                }
                
                @Override
                public void onPageFinished(WebView view, String url) {
                    android.util.Log.d("STATER", "Page finished: " + url);
                    super.onPageFinished(view, url);
                }
            });
            
            dialog.setContentView(webView);
            dialog.show();
            
            android.util.Log.d("STATER", "Opening fullscreen WebView for: " + url);
            webView.loadUrl(url);
        });
    }
}
