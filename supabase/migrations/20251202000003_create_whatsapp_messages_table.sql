CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT,
    message_body TEXT,
    raw_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Allow service role (Edge Function) to insert
CREATE POLICY "Service role can insert messages"
ON whatsapp_messages
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow authenticated users to view (for debugging/admin)
CREATE POLICY "Authenticated users can view messages"
ON whatsapp_messages
FOR SELECT
TO authenticated
USING (true);
