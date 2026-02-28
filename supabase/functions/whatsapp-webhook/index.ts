import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const { method } = req

  // 1. Verification Challenge (GET)
  // O Facebook faz um GET para verificar se o webhook é válido
  if (method === 'GET') {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    // Token de verificação que você vai colocar no painel da Meta
    if (mode === 'subscribe' && token === 'ICTUS_SECRET_TOKEN') {
      console.log('Webhook verified!')
      return new Response(challenge, { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  // 2. Receive Message (POST)
  // O Facebook faz um POST quando chega mensagem
  if (method === 'POST') {
    try {
      const body = await req.json()
      console.log('Received webhook:', JSON.stringify(body))
      
      // Initialize Supabase Client
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Extract message structure from WhatsApp Cloud API
      const entry = body.entry?.[0]
      const changes = entry?.changes?.[0]
      const value = changes?.value
      const message = value?.messages?.[0]

      if (message) {
        const phoneNumber = message.from
        const text = message.text?.body || '[Media/Other]'
        
        console.log(`Message from ${phoneNumber}: ${text}`)

        // Save to DB
        const { error } = await supabase.from('whatsapp_messages').insert({
          phone_number: phoneNumber,
          message_body: text,
          raw_json: body
        })

        if (error) {
          console.error('Error saving to DB:', error)
        }
      }

      return new Response('OK', { status: 200 })
    } catch (error) {
      console.error('Error processing webhook:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
  }

  return new Response('Method not allowed', { status: 405 })
})
