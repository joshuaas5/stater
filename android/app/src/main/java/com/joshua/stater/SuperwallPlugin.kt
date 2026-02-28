package com.joshua.stater

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.superwall.sdk.Superwall

@CapacitorPlugin(name = "SuperwallPlugin")
class SuperwallPlugin : Plugin() {

    @PluginMethod
    fun register(call: PluginCall) {
        val event = call.getString("event")
        if (event == null) {
            call.reject("Event name is required")
            return
        }

        // Registrar evento no Superwall
        Superwall.instance.register(placement = event)
        
        val ret = JSObject()
        ret.put("success", true)
        ret.put("event", event)
        call.resolve(ret)
    }

    @PluginMethod
    fun setUserAttributes(call: PluginCall) {
        val attributes = call.getObject("attributes")
        if (attributes == null) {
            call.reject("Attributes are required")
            return
        }

        // Converter JSObject para Map
        val userAttributes = mutableMapOf<String, Any?>()
        val keys = attributes.keys()
        while (keys.hasNext()) {
            val key = keys.next()
            userAttributes[key] = attributes.opt(key)
        }

        Superwall.instance.setUserAttributes(userAttributes)
        
        val ret = JSObject()
        ret.put("success", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun track(call: PluginCall) {
        val event = call.getString("event")
        if (event == null) {
            call.reject("Event name is required")
            return
        }

        val parameters = call.getObject("parameters")
        val eventParameters = mutableMapOf<String, Any>()
        
        if (parameters != null) {
            val keys = parameters.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                parameters.opt(key)?.let { value ->
                    eventParameters[key] = value
                }
            }
        }

        // Para Android, usar register com parâmetros
        Superwall.instance.register(placement = event, params = eventParameters)
        
        val ret = JSObject()
        ret.put("success", true)
        ret.put("event", event)
        call.resolve(ret)
    }

    @PluginMethod
    fun getPresentationResult(call: PluginCall) {
        // Implementação futura para obter resultados de apresentação
        val ret = JSObject()
        ret.put("success", true)
        ret.put("message", "Feature coming soon")
        call.resolve(ret)
    }
}
