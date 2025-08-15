package com.timothy.stater;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.app.Activity;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.WindowInsets;
import android.graphics.Color;
import android.os.Handler;
import android.os.Build;

public class MainActivity extends Activity {
    private WebView webView;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // ✅ STATUS BAR AZUL FORÇADA - SEM FAIXA BRANCA
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            // Forçar status bar azul ANTES de tudo
            getWindow().setStatusBarColor(Color.parseColor("#31518b"));
            
            // Remover qualquer faixa branca - layout completo
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            );
            
            // Para Android 11+ - garantir que funcione
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                getWindow().setDecorFitsSystemWindows(false);
            }
        }
        
        setContentView(R.layout.activity_main);
        
        webView = findViewById(R.id.webview);
        
        // Configurações do WebView
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setGeolocationEnabled(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        webSettings.setSupportZoom(true);
        
        // User-Agent customizado para evitar bloqueio do Google OAuth
        String userAgent = "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
        webSettings.setUserAgentString(userAgent);
        
        // Desabilitar overscroll para evitar pull-to-refresh
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        
        // WebViewClient personalizado
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // Manter navegação dentro do app para URLs do stater.app
                if (url.contains("stater.app")) {
                    return false; // Permite carregar no WebView
                }
                return super.shouldOverrideUrlLoading(view, url);
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                
                // ✅ DETECTAR ALTURA REAL DA STATUS BAR E APLICAR PADDING + MARGEM EXTRA
                int statusBarHeight = getStatusBarHeight() + 8; // +8px extra para não cortar
                
                String viewportFix = 
                    "javascript:(function() {" +
                    // Usar altura real detectada da status bar + margem extra
                    "var statusBarHeight = " + statusBarHeight + ";" +
                    
                    // Remover CSS existente
                    "var existingStyles = document.querySelectorAll('style[data-stater-viewport]');" +
                    "existingStyles.forEach(function(style) { style.remove(); });" +
                    
                    // CSS para posicionar conteúdo EXATAMENTE abaixo da status bar AZUL
                    "var style = document.createElement('style');" +
                    "style.setAttribute('data-stater-viewport', 'true');" +
                    "style.innerHTML = '" +
                    "* { box-sizing: border-box; }" +
                    "html { height: 100%; overflow: hidden; margin: 0; padding: 0; }" +
                    "body { height: 100%; margin: 0; padding: 0; overflow: hidden; background: #31518b !important; }" +
                    "#root { position: absolute; top: ' + statusBarHeight + 'px; left: 0; right: 0; bottom: 0; overflow-y: auto; overflow-x: hidden; }" +
                    ".login-container, .homepage-container, .dashboard-container, .main-container, .app-container { min-height: 100%; }" +
                    "';" +
                    "document.head.appendChild(style);" +
                    
                    // Meta viewport otimizado para não fazer zoom
                    "var viewport = document.querySelector(\"meta[name=viewport]\");" +
                    "if (!viewport) {" +
                    "  viewport = document.createElement('meta');" +
                    "  viewport.name = 'viewport';" +
                    "  document.head.appendChild(viewport);" +
                    "}" +
                    "viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no, shrink-to-fit=no, maximum-scale=1.0';" +
                    
                    "console.log('Status bar real height applied: ' + statusBarHeight + 'px');" +
                    "})()";
                
                view.evaluateJavascript(viewportFix, null);
                
                // Esconder UI do sistema
                hideSystemUI();
            }
        });
        
        // WebChromeClient para PWA features
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                super.onProgressChanged(view, newProgress);
                if (newProgress == 100) {
                    hideSystemUI();
                }
            }
        });
        
        // Delay pequeno para mostrar splash e depois carregar URL
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                webView.loadUrl("https://stater.app/login");
                
                // Esconder splash logo após carregamento começar
                new Handler().postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        View splashLogo = findViewById(R.id.splash_logo);
                        if (splashLogo != null) {
                            splashLogo.setVisibility(View.GONE);
                        }
                    }
                }, 1500); // 1.5 segundos total para esconder splash
            }
        }, 1000); // 1 segundo de splash inicial
        
        hideSystemUI();
    }
    
    private void hideSystemUI() {
        // ✅ STATUS BAR AZUL SEMPRE VISÍVEL
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = getWindow();
            // Limpar flags que podem interferir
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            // Forçar cor azul
            window.setStatusBarColor(Color.parseColor("#31518b"));
            
            // Texto branco na status bar (para contraste com azul)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                View decor = window.getDecorView();
                decor.setSystemUiVisibility(decor.getSystemUiVisibility() & ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
            }
        }
        
        View decorView = getWindow().getDecorView();
        decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        // Status bar azul sempre visível - navigation bar escondida
    }
    
    private int getStatusBarHeight() {
        int result = 0;
        int resourceId = getResources().getIdentifier("status_bar_height", "dimen", "android");
        if (resourceId > 0) {
            result = getResources().getDimensionPixelSize(resourceId);
        }
        
        // Fallback para dispositivos que não conseguimos detectar
        if (result == 0) {
            result = (int) Math.ceil(24 * getResources().getDisplayMetrics().density); // 24dp default
        }
        
        return result;
    }
    
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemUI();
        }
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
    
    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
