package com.timothy.stater;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.ValueCallback;
import android.webkit.WebViewClient;
import android.Manifest;
import android.media.AudioManager;
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;

import com.timothy.stater.GoogleAuthInterceptor;
import com.timothy.stater.GoogleNativeDirect;

public class MainActivity extends BridgeActivity {
    private static final int PERMISSION_REQUEST_CODE = 1001;
    private static final int FILE_CHOOSER_REQUEST_CODE = 1002;
    private ValueCallback<Uri[]> filePathCallback;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        registerPlugin(GoogleAuthInterceptor.class);
        registerPlugin(GoogleNativeDirect.class);
        
        WebView.setWebContentsDebuggingEnabled(true);
        android.util.Log.d("STATER", "MainActivity created successfully");
        
        requestPermissions();
        setupAudioMode();
        handleIntent(getIntent());
    }
    
    private void setupAudioMode() {
        try {
            AudioManager audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);
            if (audioManager != null) {
                audioManager.setMode(AudioManager.MODE_IN_COMMUNICATION);
                android.util.Log.d("STATER", "AudioManager set to MODE_IN_COMMUNICATION");
            }
        } catch (Exception e) {
            android.util.Log.e("STATER", "Failed to setup audio mode: " + e.getMessage());
        }
    }
    
    private void requestPermissions() {
        String[] permissions = {
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.MODIFY_AUDIO_SETTINGS,
            Manifest.permission.CAMERA,
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE
        };
        
        boolean needRequest = false;
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                needRequest = true;
                break;
            }
        }
        
        if (needRequest) {
            android.util.Log.d("STATER", "Requesting runtime permissions");
            ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE);
        } else {
            android.util.Log.d("STATER", "All permissions already granted");
        }
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            for (int i = 0; i < permissions.length; i++) {
                String permission = permissions[i];
                boolean granted = grantResults[i] == PackageManager.PERMISSION_GRANTED;
                android.util.Log.d("STATER", "Permission " + permission + " granted: " + granted);
            }
        }
    }
    
    @Override
    public void onStart() {
        super.onStart();
        setupWebViewPermissions();
    }
    
    private void setupWebViewPermissions() {
        if (bridge != null && bridge.getWebView() != null) {
            WebView webView = bridge.getWebView();
            
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    String[] resources = request.getResources();
                    android.util.Log.d("STATER", "WebView permission requested: " + java.util.Arrays.toString(resources));
                    runOnUiThread(() -> {
                        request.grant(request.getResources());
                        android.util.Log.d("STATER", "WebView permissions GRANTED");
                    });
                }
                
                @Override
                public void onPermissionRequestCanceled(PermissionRequest request) {
                    android.util.Log.d("STATER", "WebView permission request canceled");
                }
                
                // Handler para file chooser (input type=file)
                @Override
                public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                    android.util.Log.d("STATER", "File chooser requested");
                    
                    if (MainActivity.this.filePathCallback != null) {
                        MainActivity.this.filePathCallback.onReceiveValue(null);
                    }
                    MainActivity.this.filePathCallback = filePathCallback;
                    
                    Intent intent = fileChooserParams.createIntent();
                    try {
                        startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE);
                        android.util.Log.d("STATER", "File chooser started");
                    } catch (Exception e) {
                        android.util.Log.e("STATER", "Cannot start file chooser: " + e.getMessage());
                        MainActivity.this.filePathCallback = null;
                        return false;
                    }
                    return true;
                }
            });
            
            webView.getSettings().setJavaScriptEnabled(true);
            webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
            webView.getSettings().setAllowFileAccess(true);
            webView.getSettings().setAllowContentAccess(true);
            
            android.util.Log.d("STATER", "WebView configured with permission handler and file chooser");
        }
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            android.util.Log.d("STATER", "File chooser result received, resultCode: " + resultCode);
            
            if (filePathCallback != null) {
                Uri[] results = null;
                
                if (resultCode == RESULT_OK && data != null) {
                    String dataString = data.getDataString();
                    if (dataString != null) {
                        results = new Uri[] { Uri.parse(dataString) };
                        android.util.Log.d("STATER", "File selected: " + dataString);
                    }
                }
                
                filePathCallback.onReceiveValue(results);
                filePathCallback = null;
            }
        }
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
    
    public void handleDeepLink(Intent intent) {
        Uri data = intent.getData();
        if (data != null) {
            android.util.Log.d("STATER", "Deep link received: " + data.toString());
            
            if (data.getScheme() != null && data.getScheme().equals("com.timothy.stater")) {
                String url = data.toString();
                bridge.eval("window.handleAuthCallback && window.handleAuthCallback('" + url + "');", null);
            }
        }
    }
}