-- Reset onboarding para joshuaas500@gmail.com
DELETE FROM user_onboarding 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'joshuaas500@gmail.com'
);
