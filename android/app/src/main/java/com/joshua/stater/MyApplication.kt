package com.joshua.stater

import android.app.Application
// import com.superwall.sdk.Superwall

class MyApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // Temporariamente comentado para testar crash
        /*
        // Configure Superwall - API Key do projeto ICTUS
        Superwall.configure(
            this,
            "pk_e3d79a8b8e8334c5f361e9c62602290f60354f1932f34aeb" // API Key do Superwall ICTUS
        )
        
        // Opcional: Definir atributos do usuário
        val userAttributes = mapOf(
            "app_version" to "1.0.0",
            "platform" to "android",
            "device_type" to "mobile",
            "app_name" to "Stater"
        )
        
        Superwall.instance.setUserAttributes(userAttributes)
        */
    }
}
