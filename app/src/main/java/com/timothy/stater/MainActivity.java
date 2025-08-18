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
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import android.os.Environment;
import androidx.core.content.FileProvider;

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
        // STATUS BAR TRANSPARENTE COM CONTEÚDO POR BAIXO
        Window window = getWindow();
        window.setFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS, WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
        
        // Garante que a cor da status bar seja transparente
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.setStatusBarColor(Color.TRANSPARENT);
        }

        // Ícones da status bar escuros para contraste com fundo claro
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            View decor = window.getDecorView();
            decor.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        }
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
    
    private Uri cameraImageUri;

    private boolean openFileChooser(ValueCallback<Uri[]> filePathCallback, WebChromeClient.FileChooserParams fileChooserParams) {
        if (this.filePathCallback != null) {
            this.filePathCallback.onReceiveValue(null);
            this.filePathCallback = null;
        }
        this.filePathCallback = filePathCallback;

        // Intent para a câmera
        Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        if (takePictureIntent.resolveActivity(getPackageManager()) != null) {
            File photoFile = null;
            try {
                photoFile = createImageFile();
            } catch (IOException ex) {
                // Tratar erro
            }
            if (photoFile != null) {
                cameraImageUri = FileProvider.getUriForFile(this, getApplicationContext().getPackageName() + ".provider", photoFile);
                takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri);
            }
        }

        // Intent para a galeria
        Intent contentSelectionIntent = new Intent(Intent.ACTION_GET_CONTENT);
        contentSelectionIntent.addCategory(Intent.CATEGORY_OPENABLE);
        contentSelectionIntent.setType("*/*");
        contentSelectionIntent.putExtra(Intent.EXTRA_MIME_TYPES, fileChooserParams.getAcceptTypes());

        // Intent do chooser
        Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
        chooserIntent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent);
        chooserIntent.putExtra(Intent.EXTRA_TITLE, "Selecione uma opção");
        chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{takePictureIntent});

        startActivityForResult(chooserIntent, 1001);
        return true;
    }

    private File createImageFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        return File.createTempFile(imageFileName, ".jpg", storageDir);
    }
    
    private PermissionRequest currentPermissionRequest;
    private ValueCallback<Uri[]> filePathCallback;
    private Runnable permissionCallback;

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
            // Lógica para a solicitação de permissão do WebChromeClient (microfone, câmera)
            if (currentPermissionRequest != null) {
                List<String> grantedResources = new ArrayList<>();
                boolean allGranted = true;

                // Mapeia as permissões do Android para os recursos do WebView
                for (int i = 0; i < permissions.length; i++) {
                    if (grantResults[i] == PackageManager.PERMISSION_GRANTED) {
                        if (Manifest.permission.RECORD_AUDIO.equals(permissions[i])) {
                            grantedResources.add(PermissionRequest.RESOURCE_AUDIO_CAPTURE);
                        }
                        if (Manifest.permission.CAMERA.equals(permissions[i])) {
                            grantedResources.add(PermissionRequest.RESOURCE_VIDEO_CAPTURE);
                        }
                    } else {
                        allGranted = false;
                    }
                }

                if (!grantedResources.isEmpty()) {
                    // Concede os recursos que foram permitidos
                    final String[] resourcesToGrant = grantedResources.toArray(new String[0]);
                    runOnUiThread(() -> currentPermissionRequest.grant(resourcesToGrant));
                }
                
                // Se alguma permissão essencial foi negada, nega a solicitação inteira
                if (!allGranted) {
                     runOnUiThread(() -> currentPermissionRequest.deny());
                }

                currentPermissionRequest = null;
            }
            // Lógica para o callback de permissão do upload de arquivo
            else if (permissionCallback != null) {
                if (hasAllPermissions()) {
                    permissionCallback.run();
                } else {
                    Toast.makeText(this, "Permissões negadas. Não é possível continuar.", Toast.LENGTH_LONG).show();
                    // Se o upload de arquivo estava pendente, precisa ser cancelado
                    if (filePathCallback != null) {
                        filePathCallback.onReceiveValue(null);
                        filePathCallback = null;
                    }
                }
                permissionCallback = null;
            }
        }
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        
        if (requestCode == 1001) {
            if (filePathCallback == null) {
                return;
            }

            Uri[] results = null;
            // Se a câmera foi usada, o resultado estará em cameraImageUri
            if (resultCode == Activity.RESULT_OK) {
                if (intent == null || intent.getData() == null) {
                    if (cameraImageUri != null) {
                        results = new Uri[]{cameraImageUri};
                    }
                } else {
                    String dataString = intent.getDataString();
                    if (dataString != null) {
                        results = new Uri[]{Uri.parse(dataString)};
                    }
                }
            }
            
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
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
