package com.joshua.stater

import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    
    override fun onCreate(savedInstanceState: android.os.Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Temporariamente comentado para testar crash
        // Registrar o plugin Superwall
        // this.bridge.registerPlugin(SuperwallPlugin::class.java)
    }
}
