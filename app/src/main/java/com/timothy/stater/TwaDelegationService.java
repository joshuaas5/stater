package com.timothy.stater;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;

/**
 * ✅ SERVIÇO DE DELEGAÇÃO PADRÃO PARA TWA
 * Este serviço é essencial para que o Chrome confie no app nativo
 * para gerenciar permissões e outras funcionalidades TWA.
 */
public class TwaDelegationService extends Service {
    
    private static final String TAG = "TWA_SERVICE";
    
    @Override
    public void onCreate() {
        super.onCreate();
        android.util.Log.d(TAG, "TwaDelegationService criado com sucesso");
    }

    @Override
    public IBinder onBind(Intent intent) {
        android.util.Log.d(TAG, "TwaDelegationService conectado");
        return null; // Serviço simples sem binding
    }

    @Override
    public void onDestroy() {
        android.util.Log.d(TAG, "TwaDelegationService destruído");
        super.onDestroy();
    }
}
