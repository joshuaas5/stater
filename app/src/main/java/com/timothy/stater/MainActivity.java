package com.timothy.stater;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.ValueCallback;
import android.webkit.PermissionRequest;
import android.app.Activity;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.WindowInsets;
import android.graphics.Color;
import android.os.Handler;
import android.os.Build;
import android.Manifest;
import android.content.pm.PackageManager;
import android.widget.Toast;
import android.content.Intent;
import android.net.Uri;
import android.provider.MediaStore;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.annotation.NonNull;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends Activity {
    private WebView webView;
    private static final int PERMISSION_REQUEST_CODE = 1001;
    
    // Permissões necessárias
    private static final String[] REQUIRED_PERMISSIONS = {
        Manifest.permission.CAMERA,
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.READ_EXTERNAL_STORAGE,
        Manifest.permission.WRITE_EXTERNAL_STORAGE
    };
    
    // Permissões para Android 13+
    private static final String[] ANDROID_13_PERMISSIONS = {
        Manifest.permission.READ_MEDIA_IMAGES,
        Manifest.permission.READ_MEDIA_VIDEO,
        Manifest.permission.READ_MEDIA_AUDIO
    };
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // ✅ STATUS BAR AZUL FORÇADA - SEM FAIXA BRANCA
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = getWindow();
            // Limpar flags problemáticas
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
            
            // Definir flags corretas
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            
            // Status bar azul sempre
            window.setStatusBarColor(Color.parseColor("#31518b"));
            
            // Layout não deve sobrepor a status bar
            window.getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            );
        }
        
        setContentView(R.layout.activity_main);
        
        webView = findViewById(R.id.webview);
        
        // Configurações do WebView
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        
        // ❌ NÃO solicitar permissões no início - apenas quando necessário
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        webSettings.setGeolocationEnabled(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        webSettings.setSupportZoom(true);
        
        // ✅ CONFIGURAÇÕES CRÍTICAS PARA MÍDIA E UPLOAD
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        webSettings.setSupportMultipleWindows(true);
        
        // Configurar suporte a uploads e mídia
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }
        
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
                
                // ✅ APENAS GARANTIR STATUS BAR AZUL - CSS cuida do resto
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
            
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                final String[] requestedResources = request.getResources();
                final List<String> androidPermissions = new ArrayList<>();

                for (String resource : requestedResources) {
                    if (resource.equals(PermissionRequest.RESOURCE_AUDIO_CAPTURE)) {
                        if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                            androidPermissions.add(Manifest.permission.RECORD_AUDIO);
                        }
                    }
                    if (resource.equals(PermissionRequest.RESOURCE_VIDEO_CAPTURE)) {
                        if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                            androidPermissions.add(Manifest.permission.CAMERA);
                        }
                    }
                }

                if (androidPermissions.isEmpty()) {
                    // Se já temos as permissões, conceder ao WebView
                    runOnUiThread(() -> request.grant(requestedResources));
                } else {
                    // Se não, solicitar as permissões necessárias
                    currentPermissionRequest = request;
                    ActivityCompat.requestPermissions(MainActivity.this, androidPermissions.toArray(new String[0]), PERMISSION_REQUEST_CODE);
                }
            }
            
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                // ✅ SOLICITAR PERMISSÕES APENAS QUANDO USAR FILE UPLOAD
                if (!hasAllPermissions()) {
                    Toast.makeText(MainActivity.this, "Solicitando permissões para upload de arquivos...", Toast.LENGTH_SHORT).show();
                    requestPermissionsOnDemand(() -> {
                        if (hasAllPermissions()) {
                            openFileChooser(filePathCallback, fileChooserParams);
                        } else {
                            Toast.makeText(MainActivity.this, "❌ Permissões necessárias para upload não concedidas", Toast.LENGTH_LONG).show();
                            if (filePathCallback != null) {
                                filePathCallback.onReceiveValue(null);
                            }
                        }
                    });
                    return true;
                }
                
                return openFileChooser(filePathCallback, fileChooserParams);
            }
        });
        
        // Delay mínimo para splash suave
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                webView.loadUrl("https://stater.app/login");
                
                // Esconder splash logo rapidamente após carregamento começar
                new Handler().postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        View splashLogo = findViewById(R.id.splash_logo);
                        if (splashLogo != null) {
                            splashLogo.setVisibility(View.GONE);
                        }
                    }
                }, 800); // Reduzido de 1.5s para 0.8s
            }
        }, 500); // Reduzido de 1s para 0.5s
        
        hideSystemUI();
    }
    
    private void hideSystemUI() {
        // ✅ STATUS BAR AZUL SEMPRE VISÍVEL - SEM FAIXA BRANCA
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = getWindow();
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.setStatusBarColor(Color.parseColor("#31518b"));
            
            // Texto branco na status bar (para contraste com azul)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                View decor = window.getDecorView();
                decor.setSystemUiVisibility(decor.getSystemUiVisibility() & ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
            }
        }
        
        // ✅ LAYOUT QUE NÃO SOBREPÕE STATUS BAR
        View decorView = getWindow().getDecorView();
        decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
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
    
    // Métodos para gerenciamento de permissões
    private void requestPermissionsOnDemand(Runnable onComplete) {
        if (!hasAllPermissions()) {
            // Guardar callback para executar após permissões
            this.permissionCallback = onComplete;
            
            // Solicitar todas as permissões necessárias SILENCIOSAMENTE
            String[] allPermissions;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                String[] combined = new String[REQUIRED_PERMISSIONS.length + ANDROID_13_PERMISSIONS.length];
                System.arraycopy(REQUIRED_PERMISSIONS, 0, combined, 0, REQUIRED_PERMISSIONS.length);
                System.arraycopy(ANDROID_13_PERMISSIONS, 0, combined, REQUIRED_PERMISSIONS.length, ANDROID_13_PERMISSIONS.length);
                allPermissions = combined;
            } else {
                allPermissions = REQUIRED_PERMISSIONS;
            }
            
            ActivityCompat.requestPermissions(this, allPermissions, PERMISSION_REQUEST_CODE);
        } else {
            // Já tem permissões, executar callback
            onComplete.run();
        }
    }
    
    private boolean openFileChooser(ValueCallback<Uri[]> filePathCallback, WebChromeClient.FileChooserParams fileChooserParams) {
        try {
            this.filePathCallback = filePathCallback;
            
            // ✅ MELHORADO: Criar intent com múltiplas opções SILENCIOSAMENTE
            Intent galleryIntent = new Intent(Intent.ACTION_GET_CONTENT);
            galleryIntent.addCategory(Intent.CATEGORY_OPENABLE);
            galleryIntent.setType("*/*");
            
            Intent cameraIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
            
            Intent chooserIntent = Intent.createChooser(galleryIntent, "Selecionar arquivo");
            chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{cameraIntent});
            
            startActivityForResult(chooserIntent, 1001);
            return true;
        } catch (Exception e) {
            if (filePathCallback != null) {
                filePathCallback.onReceiveValue(null);
            }
            return false;
        }
    }
    
    private ValueCallback<Uri[]> filePathCallback;
    private Runnable permissionCallback;
    private PermissionRequest currentPermissionRequest;
    private boolean hasAllPermissions() {
        for (String permission : REQUIRED_PERMISSIONS) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
        }
        
        // Verificar permissões do Android 13+ se aplicável
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            for (String permission : ANDROID_13_PERMISSIONS) {
                if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == PERMISSION_REQUEST_CODE) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }
            
            if (currentPermissionRequest != null) {
                if (allGranted) {
                    // Permissões concedidas, agora conceder ao WebView
                    runOnUiThread(() -> currentPermissionRequest.grant(currentPermissionRequest.getResources()));
                } else {
                    // Permissões negadas, negar no WebView
                    runOnUiThread(() -> currentPermissionRequest.deny());
                }
                currentPermissionRequest = null;
            }
            
            if (permissionCallback != null) {
                permissionCallback.run();
                permissionCallback = null;
            }
        }
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        
        if (requestCode == 1001) {
            if (filePathCallback != null) {
                Uri[] results = null;
                
                try {
                    if (resultCode == Activity.RESULT_OK) {
                        if (intent != null) {
                            // ✅ MELHORADO: Múltiplas formas de obter o arquivo
                            if (intent.getDataString() != null) {
                                results = new Uri[]{Uri.parse(intent.getDataString())};
                            } else if (intent.getData() != null) {
                                results = new Uri[]{intent.getData()};
                            } else if (intent.getClipData() != null) {
                                // Múltiplos arquivos
                                int count = intent.getClipData().getItemCount();
                                results = new Uri[count];
                                for (int i = 0; i < count; i++) {
                                    results[i] = intent.getClipData().getItemAt(i).getUri();
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    // Erro silencioso
                }
                
                filePathCallback.onReceiveValue(results);
                filePathCallback = null;
            }
        }
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
