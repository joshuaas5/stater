package com.timothy.stater;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.app.Activity;
import android.view.View;
import android.view.WindowManager;
import android.graphics.Color;
import android.os.Handler;
import android.os.Build;

public class MainActivity extends Activity {
    private WebView webView;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Configurar status bar azul
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setStatusBarColor(getResources().getColor(R.color.statusBarBlue));
        }
        
        // Configurar para respeitar a status bar
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        
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
            private boolean isLoadingOAuth = false;
            
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // Detectar início de OAuth Google
                if (url.contains("accounts.google.com") || url.contains("oauth") || url.contains("auth")) {
                    isLoadingOAuth = true;
                    // Mostrar loading overlay durante OAuth
                    runOnUiThread(() -> {
                        View splashContainer = findViewById(R.id.splash_container);
                        if (splashContainer != null) {
                            splashContainer.setVisibility(View.VISIBLE);
                        }
                    });
                }
                
                // Manter navegação dentro do app para URLs do stater.app
                if (url.contains("stater.app")) {
                    if (isLoadingOAuth) {
                        // Delay pequeno para evitar flash após OAuth
                        new Handler().postDelayed(() -> {
                            runOnUiThread(() -> {
                                View splashContainer = findViewById(R.id.splash_container);
                                if (splashContainer != null) {
                                    splashContainer.setVisibility(View.GONE);
                                }
                            });
                        }, 800);
                        isLoadingOAuth = false;
                    }
                    return false; // Permite carregar no WebView
                }
                return super.shouldOverrideUrlLoading(view, url);
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                
                // JavaScript para otimizar experiência mobile
                String javascript = 
                    "javascript:(function() {" +
                    // Remover faixa azul inferior se existir
                    "var bottomBars = document.querySelectorAll('[style*=\"background-color: rgb(37, 99, 235)\"], [style*=\"background-color: #2563eb\"], .bg-blue-600, .bg-blue-500');" +
                    "bottomBars.forEach(function(el) { if(el.offsetHeight < 100) el.style.display = 'none'; });" +
                    
                    // Otimizar viewport para mobile
                    "var viewport = document.querySelector('meta[name=\"viewport\"]');" +
                    "if(!viewport) { viewport = document.createElement('meta'); viewport.name = 'viewport'; document.head.appendChild(viewport); }" +
                    "viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';" +
                    
                    // CSS para melhorar layout mobile da página de login
                    "var style = document.createElement('style');" +
                    "style.innerHTML = '" +
                    "body { overflow-x: hidden !important; }" +
                    ".login-container, .auth-container, .signin-container { max-height: 100vh !important; overflow-y: auto !important; padding: 10px !important; }" +
                    "form { margin: 0 !important; padding: 20px 10px !important; }" +
                    "input, button { font-size: 16px !important; padding: 12px !important; margin: 8px 0 !important; }" +
                    ".logo, .brand-logo { max-height: 60px !important; margin: 10px 0 !important; }" +
                    "h1, h2, .title { font-size: 24px !important; margin: 15px 0 !important; }" +
                    "p, .description { font-size: 14px !important; margin: 10px 0 !important; }" +
                    ".footer, .bottom-section { margin-top: 20px !important; }" +
                    "';" +
                    "document.head.appendChild(style);" +
                    
                    // Prevenir refresh em scroll
                    "document.body.style.overscrollBehavior = 'none';" +
                    "document.addEventListener('touchstart', function(e) { if(window.pageYOffset === 0) e.preventDefault(); }, {passive: false});" +
                    "document.addEventListener('touchmove', function(e) { if(window.pageYOffset === 0 && e.touches[0].clientY > e.changedTouches[0].clientY) e.preventDefault(); }, {passive: false});" +
                    "})()";
                
                view.evaluateJavascript(javascript, null);
                
                // Esconder UI do sistema após carregamento da página
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
                // Esconder splash inicial após carregamento começar
                new Handler().postDelayed(() -> {
                    View splashContainer = findViewById(R.id.splash_container);
                    if (splashContainer != null) {
                        splashContainer.setVisibility(View.GONE);
                    }
                }, 1500);
            }
        }, 1000); // 1 segundo de splash inicial
        
        // Mostrar splash container inicialmente
        View splashContainer = findViewById(R.id.splash_container);
        if (splashContainer != null) {
            splashContainer.setVisibility(View.VISIBLE);
        }
        
        hideSystemUI();
    }
    
    private void hideSystemUI() {
        View decorView = getWindow().getDecorView();
        decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        // Status bar permanece visível, apenas navigation bar é escondida
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
