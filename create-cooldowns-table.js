const https = require('https');

const sql = `
CREATE TABLE IF NOT EXISTS reward_ad_cooldowns (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    feature_type VARCHAR(50) NOT NULL,
    last_reward_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cooldown_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature_type)
);

CREATE INDEX IF NOT EXISTS idx_reward_cooldowns_user_id ON reward_ad_cooldowns(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_cooldowns_feature ON reward_ad_cooldowns(feature_type);
CREATE INDEX IF NOT EXISTS idx_reward_cooldowns_ends_at ON reward_ad_cooldowns(cooldown_ends_at);

ALTER TABLE reward_ad_cooldowns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own cooldowns" ON reward_ad_cooldowns;
DROP POLICY IF EXISTS "Users can manage their own cooldowns" ON reward_ad_cooldowns;

CREATE POLICY "Users can view their own cooldowns" ON reward_ad_cooldowns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own cooldowns" ON reward_ad_cooldowns
    FOR ALL USING (auth.uid() = user_id);
`;

const data = JSON.stringify({ query: sql });

const options = {
  hostname: 'tmucbwlhkffrhtexmjze.supabase.co',
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'apikey': 'YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', d);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(data);
req.end();
