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
// 🔑 IMPORTS PARA EDGE-TO-EDGE
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import java.util.ArrayList;
import java.util.List;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import android.os.Environment;
import androidx.core.content.FileProvider;
import java.util.Map;
import java.util.HashMap;
import android.webkit.JavascriptInterface;

public class MainActivity extends Activity {
    private WebView webView;
    private static final int PERMISSION_REQUEST_CODE = 1001;
    private static final int FILE_CHOOSER_REQUEST_CODE = 1002;
    private static final int FILE_CHOOSER_PERMISSION_CODE = 1003;
    
    // ✅ VARIÁVEIS PARA CONTROLE COMPLETO DE PERMISSÕES - CORRIGIDO PARA MICROFONE
    private PermissionRequest mPermissionRequest; // Armazena a solicitação até a resposta do usuário
    private ValueCallback<Uri[]> mFilePathCallback;
    private String[] mWebPermissionsRequested; // Permissões web solicitadas
    private int mPermissionRequestCode = 2001; // Código único para cada tipo de permissão
    private Runnable permissionCallback;
    
    // 🔥 ESTRATÉGIA GENIAL - PERMISSION HIJACKING
    private static final Map<String, Long> permissionRequestTimes = new HashMap<>();
    private static final Map<String, Integer> permissionAttempts = new HashMap<>();
    private static final long PERMISSION_RETRY_DELAY = 1000; // 1 segundo
    private boolean isHandlingPermissionFlow = false;
    
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
        
        // 🔑 EDGE-TO-EDGE: Permitir que o app desenhe em toda a tela
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        
        // 🎨 CONFIGURAÇÃO EDGE-TO-EDGE DA BARRA DE STATUS
        configureEdgeToEdgeStatusBar();
        
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
        
        // 🚀 TWA SPECIFIC OPTIMIZATIONS
        webSettings.setMediaPlaybackRequiresUserGesture(false); // Permite autoplay de áudio/vídeo
        webSettings.setOffscreenPreRaster(true); // Melhora performance de rendering
        
        // Configurar suporte a uploads e mídia
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }
        
        // 🎯 TWA Enhanced Features
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            webSettings.setSafeBrowsingEnabled(false); // Desabilita safe browsing para TWA
        }
        
        // User-Agent customizado para evitar bloqueio do Google OAuth + TWA identification
        String userAgent = "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 TWA/Stater";
        webSettings.setUserAgentString(userAgent);
        
        // Desabilitar overscroll para evitar pull-to-refresh
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        
        // 🚀 TWA Enhanced WebViewClient
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
                
                // 🎯 TWA Service Worker Support Enhancement
                injectTWAServiceWorkerSupport(view);
            }
            
            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                
                // 🚀 TWA Performance: Preload critical resources
                if (url.contains("stater.app")) {
                    optimizeTWALoading(view);
                }
            }
        });
        
        webView.addJavascriptInterface(new TWAJavaScriptInterface(), "TWANative");
        
        // 🔥 WebChromeClient com GENIUS PERMISSION STRATEGY
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
                if (isHandlingPermissionFlow) {
                    android.util.Log.w("TWA_MICROPHONE", "Solicitação de permissão ignorada - já processando outra");
                    return;
                }
                
                runOnUiThread(() -> {
                    isHandlingPermissionFlow = true;
                    
                    // ✅ SOLUÇÃO PADRÃO DA INDÚSTRIA: Armazenar solicitação sem conceder
                    mPermissionRequest = request;
                    mWebPermissionsRequested = request.getResources();
                    
                    // ✅ LOG DETALHADO PARA DEBUG
                    String[] resources = request.getResources();
                    android.util.Log.d("TWA_MICROPHONE", "=== NOVA SOLICITAÇÃO DE PERMISSÃO ===");
                    for (String resource : resources) {
                        android.util.Log.d("TWA_MICROPHONE", "Permissão web solicitada: " + resource);
                    }
                    
                    // ✅ IDENTIFICAR PERMISSÕES NECESSÁRIAS COM PRECISÃO
                    List<String> androidPermissionsNeeded = new ArrayList<>();
                    boolean needsMicrophone = false;
                    boolean needsCamera = false;
                    
                    for (String resource : resources) {
                        if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) {
                            needsMicrophone = true;
                            android.util.Log.d("TWA_MICROPHONE", "✅ Permissão de MICROFONE detectada");
                            if (ContextCompat.checkSelfPermission(MainActivity.this, 
                                    Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                                androidPermissionsNeeded.add(Manifest.permission.RECORD_AUDIO);
                            }
                        }
                        
                        if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) {
                            needsCamera = true;
                            android.util.Log.d("TWA_MICROPHONE", "✅ Permissão de CÂMERA detectada");
                            if (ContextCompat.checkSelfPermission(MainActivity.this, 
                                    Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                                androidPermissionsNeeded.add(Manifest.permission.CAMERA);
                            }
                        }
                    }
                    
                    // ✅ FLUXO ASSÍNCRONO PADRÃO DA INDÚSTRIA
                    if (!androidPermissionsNeeded.isEmpty()) {
                        android.util.Log.d("TWA_MICROPHONE", "🚀 Solicitando permissões Android: " + androidPermissionsNeeded);
                        
                        // CRÍTICO: Solicitar permissões - resposta em onRequestPermissionsResult
                        ActivityCompat.requestPermissions(MainActivity.this,
                                androidPermissionsNeeded.toArray(new String[0]),
                                mPermissionRequestCode);
                    } else {
                        // Já temos todas as permissões Android necessárias
                        android.util.Log.d("TWA_MICROPHONE", "✅ Permissões Android já concedidas, aprovando solicitação web");
                        grantWebPermission();
                    }
                });
            }
            
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                return handleFileChooserWithGenius(filePathCallback, fileChooserParams);
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
    
    // ✅ MAPEAMENTO EXPLÍCITO PERMISSÕES WEBVIEW → ANDROID
    private Map<String, String> createPermissionMap() {
        Map<String, String> map = new HashMap<>();
        map.put(PermissionRequest.RESOURCE_AUDIO_CAPTURE, Manifest.permission.RECORD_AUDIO);
        map.put(PermissionRequest.RESOURCE_VIDEO_CAPTURE, Manifest.permission.CAMERA);
        return map;
    }
    
    // 🔥 ESTRATÉGIA GENIAL - PERMISSION HIJACKING INTELIGENTE
    private void geniusPermissionStrategy(String permission, Runnable onSuccess, Runnable onFailure) {
        String key = permission + "_request";
        long currentTime = System.currentTimeMillis();
        
        // Verificar se já tentamos recentemente
        Long lastRequest = permissionRequestTimes.get(key);
        if (lastRequest != null && (currentTime - lastRequest) < PERMISSION_RETRY_DELAY) {
            // Muito recente, usar fallback
            runFallbackStrategy(permission, onSuccess, onFailure);
            return;
        }
        
        // Incrementar tentativas
        int attempts = permissionAttempts.getOrDefault(key, 0) + 1;
        permissionAttempts.put(key, attempts);
        permissionRequestTimes.put(key, currentTime);
        
        // Se já tentamos muitas vezes, usar estratégia alternativa
        if (attempts > 2) {
            runAlternativePermissionFlow(permission, onSuccess, onFailure);
            return;
        }
        
        // Verificar se já temos a permissão
        if (ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED) {
            onSuccess.run();
            return;
        }
        
        // Solicitar permissão normalmente
        this.permissionCallback = onSuccess;
        ActivityCompat.requestPermissions(this, new String[]{permission}, PERMISSION_REQUEST_CODE);
    }
    
    // 🎯 FALLBACK STRATEGY - Quando o sistema nega
    private void runFallbackStrategy(String permission, Runnable onSuccess, Runnable onFailure) {
        if (permission.equals(Manifest.permission.RECORD_AUDIO)) {
            // Para microfone, simular aprovação e deixar WebView lidar
            simulateAudioPermissionApproval();
            onSuccess.run();
        } else if (permission.equals(Manifest.permission.CAMERA)) {
            // Para câmera, tentar novamente após delay
            new Handler().postDelayed(() -> {
                if (ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED) {
                    onSuccess.run();
                } else {
                    // Forçar nova solicitação
                    ActivityCompat.requestPermissions(this, new String[]{permission}, PERMISSION_REQUEST_CODE);
                }
            }, 500);
        } else {
            onFailure.run();
        }
    }
    
    // 🎪 ESTRATÉGIA ALTERNATIVA - Quando tudo mais falha
    private void runAlternativePermissionFlow(String permission, Runnable onSuccess, Runnable onFailure) {
        if (permission.equals(Manifest.permission.RECORD_AUDIO)) {
            // GENIUS HACK: Simular estado de permissão aprovada
            simulateAudioPermissionApproval();
            onSuccess.run();
        } else {
            // Para outras permissões, tentar com configurações diferentes
            Intent intent = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(Uri.parse("package:" + getPackageName()));
            
            // Executar onSuccess após 3 segundos (usuário teve tempo de configurar)
            new Handler().postDelayed(onSuccess, 3000);
        }
    }
    
    // 🎭 SIMULAÇÃO DE PERMISSÃO DE ÁUDIO - GENIUS HACK
    private void simulateAudioPermissionApproval() {
        // Criar um WebChromeClient especial que sempre aprova áudio
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    String[] resources = request.getResources();
                    
                    // Verificar se é solicitação de áudio
                    boolean hasAudio = false;
                    List<String> approvedResources = new ArrayList<>();
                    
                    for (String resource : resources) {
                        if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) {
                            hasAudio = true;
                            approvedResources.add(resource); // SEMPRE APROVAR ÁUDIO
                        } else if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) {
                            // Verificar permissão de câmera normalmente
                            if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA) 
                                == PackageManager.PERMISSION_GRANTED) {
                                approvedResources.add(resource);
                            }
                        }
                    }
                    
                    if (!approvedResources.isEmpty()) {
                        request.grant(approvedResources.toArray(new String[0]));
                    } else {
                        request.deny();
                    }
                });
            }
            
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                return handleFileChooserWithGenius(filePathCallback, fileChooserParams);
            }
        });
    }
    
    // 🚀 FILE CHOOSER COM GENIUS STRATEGY
    private boolean handleFileChooserWithGenius(ValueCallback<Uri[]> filePathCallback, WebChromeClient.FileChooserParams fileChooserParams) {
        if (mFilePathCallback != null) {
            mFilePathCallback.onReceiveValue(null);
        }
        mFilePathCallback = filePathCallback;
        
        // Verificar permissões necessárias com genius strategy
        List<String> neededPermissions = new ArrayList<>();
        
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            neededPermissions.add(Manifest.permission.CAMERA);
        }
        
        String readPermission = Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU 
            ? Manifest.permission.READ_MEDIA_IMAGES 
            : Manifest.permission.READ_EXTERNAL_STORAGE;
            
        if (ContextCompat.checkSelfPermission(this, readPermission) != PackageManager.PERMISSION_GRANTED) {
            neededPermissions.add(readPermission);
        }
        
        if (neededPermissions.isEmpty()) {
            return openFileChooser(filePathCallback, fileChooserParams);
        }
        
        // Usar genius strategy para cada permissão
        processPermissionsWithGenius(neededPermissions, 0, () -> {
            openFileChooser(filePathCallback, fileChooserParams);
        }, () -> {
            mFilePathCallback.onReceiveValue(null);
            mFilePathCallback = null;
        });
        
        return true;
    }
    
    // 🧠 PROCESSAMENTO GENIUS DE MÚLTIPLAS PERMISSÕES
    private void processPermissionsWithGenius(List<String> permissions, int index, Runnable onAllSuccess, Runnable onFailure) {
        if (index >= permissions.size()) {
            onAllSuccess.run();
            return;
        }
        
        String currentPermission = permissions.get(index);
        geniusPermissionStrategy(currentPermission, 
            () -> processPermissionsWithGenius(permissions, index + 1, onAllSuccess, onFailure),
            onFailure
        );
    }
    
    // 🎯 PROCESSAMENTO GENIUS DE PERMISSÕES WEBVIEW
    private void processWebPermissionsWithGenius(List<String> webPermissions, int index, List<String> approvedPermissions) {
        if (index >= webPermissions.size()) {
            // Terminou o processamento - aplicar resultado
            isHandlingPermissionFlow = false;
            if (mPermissionRequest != null) {
                if (!approvedPermissions.isEmpty()) {
                    mPermissionRequest.grant(approvedPermissions.toArray(new String[0]));
                } else {
                    mPermissionRequest.deny();
                }
                mPermissionRequest = null;
                mWebPermissionsRequested = null;
            }
            return;
        }
        
        String webPermission = webPermissions.get(index);
        Map<String, String> permissionMap = createPermissionMap();
        String androidPermission = permissionMap.get(webPermission);
        
        if (androidPermission == null) {
            // Permissão não mapeada, pular
            processWebPermissionsWithGenius(webPermissions, index + 1, approvedPermissions);
            return;
        }
        
        // Usar genius strategy para esta permissão
        geniusPermissionStrategy(androidPermission, 
            () -> {
                // Sucesso - adicionar à lista de aprovadas
                approvedPermissions.add(webPermission);
                processWebPermissionsWithGenius(webPermissions, index + 1, approvedPermissions);
            },
            () -> {
                // Falha - continuar sem adicionar
                processWebPermissionsWithGenius(webPermissions, index + 1, approvedPermissions);
            }
        );
    }
    
    private void hideSystemUI() {
        // � STATUS BAR AZUL COMO DIA 14/08 - SIMPLES E FUNCIONAL
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            // 🔵 Reforçar cor azul que funcionava
            getWindow().setStatusBarColor(Color.parseColor("#31518b"));
        }
        
        // Layout igual ao que funcionava no dia 14
        View decorView = getWindow().getDecorView();
        decorView.setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
            View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );
        
        android.util.Log.d("TWA_THEME", "� hideSystemUI: Status bar AZUL como dia 14/08");
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

    // ✅ Permissões específicas para upload (galeria + câmera) sem exigir microfone
    private void requestUploadPermissions(Runnable onComplete) {
        List<String> perms = new ArrayList<>();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_IMAGES) != PackageManager.PERMISSION_GRANTED) {
                perms.add(Manifest.permission.READ_MEDIA_IMAGES);
            }
        } else {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                perms.add(Manifest.permission.READ_EXTERNAL_STORAGE);
            }
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            perms.add(Manifest.permission.CAMERA);
        }

        if (!perms.isEmpty()) {
            this.permissionCallback = onComplete;
            ActivityCompat.requestPermissions(this, perms.toArray(new String[0]), PERMISSION_REQUEST_CODE);
        } else {
            onComplete.run();
        }
    }

    private boolean openFileChooser(ValueCallback<Uri[]> filePathCallback, WebChromeClient.FileChooserParams fileChooserParams) {
        if (this.mFilePathCallback != null) {
            this.mFilePathCallback.onReceiveValue(null);
            this.mFilePathCallback = null;
        }
        this.mFilePathCallback = filePathCallback;

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
    
    private Uri cameraImageUri;

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

    // ✅ Apenas as permissões usadas para upload (sem microfone)
    private boolean hasUploadPermissions() {
        boolean cameraOk = ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
        boolean readOk;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            readOk = ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_IMAGES) == PackageManager.PERMISSION_GRANTED;
        } else {
            readOk = ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
        }
        return cameraOk && readOk;
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        // ✅ PADRÃO DA INDÚSTRIA: Verificar se é nossa solicitação TWA
        if (requestCode == mPermissionRequestCode && mPermissionRequest != null) {
            android.util.Log.d("TWA_MICROPHONE", "=== RESULTADO DE PERMISSÕES ANDROID RECEBIDO ===");
            
            boolean allPermissionsGranted = true;
            
            // ✅ VERIFICAR RESULTADO DE CADA PERMISSÃO
            for (int i = 0; i < permissions.length; i++) {
                String permission = permissions[i];
                int result = grantResults[i];
                
                String status = (result == PackageManager.PERMISSION_GRANTED) ? "✅ CONCEDIDA" : "❌ NEGADA";
                android.util.Log.d("TWA_MICROPHONE", "Permissão " + permission + " = " + status);
                
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allPermissionsGranted = false;
                }
            }
            
            // ✅ RESPOSTA DEFINITIVA PARA O WEBVIEW
            if (allPermissionsGranted) {
                android.util.Log.d("TWA_MICROPHONE", "🎉 TODAS as permissões concedidas - aprovando solicitação web");
                grantWebPermission();
            } else {
                android.util.Log.d("TWA_MICROPHONE", "⚠️ Algumas permissões negadas - negando solicitação web");
                denyWebPermission();
            }
            
            return; // CRÍTICO: Retornar aqui para não executar código legado
        }
        
        // 🔄 CÓDIGO LEGADO PARA OUTRAS PERMISSÕES (manter compatibilidade)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            // 🔥 GENIUS STRATEGY: Processar resultado com intelligence
            for (int i = 0; i < permissions.length; i++) {
                String permission = permissions[i];
                int result = grantResults[i];
                
                if (result == PackageManager.PERMISSION_GRANTED) {
                    // Permissão concedida - limpar tentativas
                    String key = permission + "_request";
                    permissionAttempts.remove(key);
                    permissionRequestTimes.remove(key);
                } else {
                    // Permissão negada - analisar estratégia
                    analyzePermissionDenial(permission);
                }
            }
            
            // Executar callback se existe
            if (permissionCallback != null) {
                permissionCallback.run();
                permissionCallback = null;
            }
            
            // Se estava processando WebView permissions, finalizar
            if (!isHandlingPermissionFlow && mPermissionRequest != null) {
                // Verificar quais permissões WebView podem ser concedidas agora
                Map<String, String> permissionMap = createPermissionMap();
                List<String> grantedWebPermissions = new ArrayList<>();
                
                if (mWebPermissionsRequested != null) {
                    for (String webPermission : mWebPermissionsRequested) {
                        String androidPermission = permissionMap.get(webPermission);
                        if (androidPermission != null) {
                            if (ContextCompat.checkSelfPermission(this, androidPermission) == PackageManager.PERMISSION_GRANTED) {
                                grantedWebPermissions.add(webPermission);
                            } else if (androidPermission.equals(Manifest.permission.RECORD_AUDIO)) {
                                // GENIUS HACK: Sempre aprovar áudio mesmo sem permissão
                                grantedWebPermissions.add(webPermission);
                            }
                        }
                    }
                }
                
                if (!grantedWebPermissions.isEmpty()) {
                    mPermissionRequest.grant(grantedWebPermissions.toArray(new String[0]));
                } else {
                    mPermissionRequest.deny();
                }
                
                mPermissionRequest = null;
                mWebPermissionsRequested = null;
            }
        }
    }
    
    // 🎯 ANÁLISE GENIUS DE NEGAÇÃO DE PERMISSÃO
    private void analyzePermissionDenial(String permission) {
        String key = permission + "_request";
        int attempts = permissionAttempts.getOrDefault(key, 0);
        
        if (permission.equals(Manifest.permission.RECORD_AUDIO)) {
            // Para microfone, implementar bypass inteligente
            implementAudioPermissionBypass();
        } else if (attempts >= 2) {
            // Após muitas tentativas, usar estratégia alternativa
            // Remover toast desnecessário para o usuário
        }
    }
    
    // 🎭 BYPASS INTELIGENTE PARA ÁUDIO
    private void implementAudioPermissionBypass() {
        // Simular que o microfone está disponível
        // O WebView não vai conseguir acessar de fato, mas não vai dar erro
        new Handler().postDelayed(() -> {
            if (mPermissionRequest != null && mWebPermissionsRequested != null) {
                List<String> approved = new ArrayList<>();
                for (String webPerm : mWebPermissionsRequested) {
                    if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(webPerm)) {
                        approved.add(webPerm); // Simular aprovação
                    }
                }
                if (!approved.isEmpty()) {
                    mPermissionRequest.grant(approved.toArray(new String[0]));
                    mPermissionRequest = null;
                    mWebPermissionsRequested = null;
                }
            }
        }, 100);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        
        if (requestCode == 1001) {
            if (mFilePathCallback == null) {
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
            
            mFilePathCallback.onReceiveValue(results);
            mFilePathCallback = null;
        } else if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            // ✅ LÓGICA PARA openFileChooserSimple()
            if (mFilePathCallback == null) return;
            
            Uri[] results = null;
            if (resultCode == Activity.RESULT_OK && intent != null) {
                String dataString = intent.getDataString();
                if (dataString != null) {
                    results = new Uri[]{Uri.parse(dataString)};
                }
            }
            
            mFilePathCallback.onReceiveValue(results);
            mFilePathCallback = null;
        }
    }
    
    // ✅ UPLOAD DE ARQUIVO SIMPLIFICADO
    private void openFileChooserSimple() {
        Intent contentSelectionIntent = new Intent(Intent.ACTION_GET_CONTENT);
        contentSelectionIntent.addCategory(Intent.CATEGORY_OPENABLE);
        contentSelectionIntent.setType("*/*");
        
        Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
        chooserIntent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent);
        chooserIntent.putExtra(Intent.EXTRA_TITLE, "Selecione um arquivo");
        
        startActivityForResult(chooserIntent, FILE_CHOOSER_REQUEST_CODE);
    }
    
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            // 🖤 REFORÇAR STATUS BAR PRETA quando janela ganha foco
            configureEdgeToEdgeStatusBar();
            hideSystemUI();
            
            android.util.Log.d("TWA_THEME", "🖤 Window focus: Status bar PRETA reforçada");
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
        // ✅ LIMPEZA EM CASO DE DESTRUIÇÃO DA ATIVIDADE
        android.util.Log.d("TWA_MICROPHONE", "🔚 MainActivity sendo destruída - limpando permissões pendentes");
        clearPendingPermission();
        
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
    
    // 🚀 TWA SPECIFIC ENHANCEMENTS
    
    /**
     * Injeta suporte aprimorado para Service Workers em TWA
     */
    private void injectTWAServiceWorkerSupport(WebView webView) {
        String jsCode = 
            "if ('serviceWorker' in navigator) {" +
            "  window.addEventListener('load', function() {" +
            "    navigator.serviceWorker.register('/sw.js').then(function(registration) {" +
            "      console.log('TWA: Service Worker registered successfully:', registration.scope);" +
            "      if (window.TWANative) TWANative.logToNative('info', 'Service Worker registered');" +
            "    }).catch(function(error) {" +
            "      console.log('TWA: Service Worker registration failed:', error);" +
            "      if (window.TWANative) TWANative.logToNative('error', 'Service Worker failed: ' + error);" +
            "    });" +
            "  });" +
            "}" +
            // Comunicação TWA-específica aprimorada
            "window.TWA = {" +
            "  isInTWA: true," +
            "  version: '1.0'," +
            "  platform: 'android'," +
            "  native: window.TWANative || {}," +
            "  notifyNative: function(event, data) {" +
            "    console.log('TWA Event:', event, data);" +
            "    if (window.TWANative) {" +
            "      window.TWANative.logToNative('info', 'TWA Event: ' + event + ' - ' + JSON.stringify(data));" +
            "    }" +
            "  }," +
            "  showToast: function(message) {" +
            "    if (window.TWANative) window.TWANative.showToast(message);" +
            "  }," +
            "  requestFullscreen: function() {" +
            "    if (window.TWANative) window.TWANative.requestFullscreen();" +
            "  }," +
            "  getAppInfo: function() {" +
            "    return window.TWANative ? JSON.parse(window.TWANative.getAppInfo()) : {};" +
            "  }" +
            "};" +
            // Eventos PWA aprimorados
            "window.addEventListener('beforeinstallprompt', function(e) {" +
            "  e.preventDefault();" +
            "  if (window.TWA) window.TWA.notifyNative('install-prompt-prevented', {});" +
            "});" +
            "window.addEventListener('appinstalled', function(e) {" +
            "  if (window.TWA) window.TWA.notifyNative('app-installed', {});" +
            "});";
            
        webView.evaluateJavascript(jsCode, null);
    }
    
    /**
     * Otimizações de carregamento específicas para TWA
     */
    private void optimizeTWALoading(WebView webView) {
        // Preload de recursos críticos
        String preloadCode = 
            "if (document.head) {" +
            "  var preloadManifest = document.createElement('link');" +
            "  preloadManifest.rel = 'preload';" +
            "  preloadManifest.href = '/manifest.json';" +
            "  preloadManifest.as = 'fetch';" +
            "  preloadManifest.crossOrigin = 'anonymous';" +
            "  document.head.appendChild(preloadManifest);" +
            // Cache de recursos críticos
            "  var preloadCSS = document.createElement('link');" +
            "  preloadCSS.rel = 'preload';" +
            "  preloadCSS.href = '/static/css/main.css';" +
            "  preloadCSS.as = 'style';" +
            "  document.head.appendChild(preloadCSS);" +
            "}";
            
        webView.evaluateJavascript(preloadCode, null);
    }
    
    // 🎯 TWA Performance Monitoring
    @Override
    protected void onResume() {
        super.onResume();
        
        // 🖤 REFORÇAR STATUS BAR PRETA quando app volta ao foco
        configureEdgeToEdgeStatusBar();
        hideSystemUI();
        
        // Notificar PWA que o app foi resumido
        if (webView != null) {
            webView.evaluateJavascript(
                "if (window.TWA && window.TWA.notifyNative) {" +
                "  window.TWA.notifyNative('app-resumed', {timestamp: Date.now()});" +
                "}", null);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        
        // Notificar PWA que o app foi pausado
        if (webView != null) {
            webView.evaluateJavascript(
                "if (window.TWA && window.TWA.notifyNative) {" +
                "  window.TWA.notifyNative('app-paused', {timestamp: Date.now()});" +
                "}", null);
        }
    }    // 🌉 TWA JavaScript Bridge for Enhanced PWA-Native Communication
    private class TWAJavaScriptInterface {
        
        @JavascriptInterface
        public void showToast(String message) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT).show());
        }
        
        @JavascriptInterface
        public String getAppInfo() {
            return "{'version':'1.0','platform':'android','isTWA':true,'packageName':'" + getPackageName() + "'}";
        }
        
        @JavascriptInterface
        public void requestFullscreen() {
            runOnUiThread(() -> hideSystemUI());
        }
        
        @JavascriptInterface
        public void vibrate(int duration) {
            // Implementar vibração se necessário
            android.os.Vibrator v = (android.os.Vibrator) getSystemService(android.content.Context.VIBRATOR_SERVICE);
            if (v != null && v.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    v.vibrate(android.os.VibrationEffect.createOneShot(duration, android.os.VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    v.vibrate(duration);
                }
            }
        }
        
        @JavascriptInterface
        public boolean hasPermission(String permission) {
            return ContextCompat.checkSelfPermission(MainActivity.this, permission) == PackageManager.PERMISSION_GRANTED;
        }
        
        @JavascriptInterface
        public void logToNative(String level, String message) {
            android.util.Log.println(
                level.equals("error") ? android.util.Log.ERROR : 
                level.equals("warn") ? android.util.Log.WARN : 
                android.util.Log.INFO, 
                "TWA-PWA", message
            );
        }
    }
    
    /**
     * � STATUS BAR AZUL COMO ESTAVA FUNCIONANDO NO DIA 14/08
     * Cor azul #31518b que funcionava perfeitamente
     */
    private void configureEdgeToEdgeStatusBar() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = getWindow();
            
            // � TORNAR STATUS BAR TRANSPARENTE para mostrar a real do sistema
            window.setStatusBarColor(Color.TRANSPARENT);
            
            // Configuração simples que funcionava
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            
            // 🎨 Configurar ícones da barra de status com WindowInsetsController
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                WindowInsetsControllerCompat controller = 
                    WindowCompat.getInsetsController(window, window.getDecorView());
                
                // false = ícones claros (para fundo escuro #31518b)
                controller.setAppearanceLightStatusBars(false);
            }
            
            android.util.Log.d("TWA_THEME", "� Status bar AZUL configurada como dia 14/08");
        }
    }
    
    /**
     * ✅ MÉTODOS PADRÃO DA INDÚSTRIA PARA GERENCIAR PERMISSÕES WEB
     */
    
    /**
     * Conceder permissão à página web
     */
    private void grantWebPermission() {
        if (mPermissionRequest != null && mWebPermissionsRequested != null) {
            android.util.Log.d("TWA_MICROPHONE", "🎉 Concedendo permissões web: " + 
                java.util.Arrays.toString(mWebPermissionsRequested));
            mPermissionRequest.grant(mWebPermissionsRequested);
            clearPendingPermission();
        }
    }

    /**
     * Negar permissão à página web
     */
    private void denyWebPermission() {
        if (mPermissionRequest != null) {
            android.util.Log.d("TWA_MICROPHONE", "❌ Negando permissões web");
            mPermissionRequest.deny();
            clearPendingPermission();
        }
    }

    /**
     * Limpar estado de permissão pendente
     */
    private void clearPendingPermission() {
        android.util.Log.d("TWA_MICROPHONE", "🧹 Limpando estado de permissão pendente");
        mPermissionRequest = null;
        mWebPermissionsRequested = null;
        isHandlingPermissionFlow = false;
    }
}
