# 📊 COMANDOS SQL PRONTOS - SUPABASE ANALYTICS

Cole no SQL Editor: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/editor

---

## 1. 🟢 VER VISITANTES AGORA (últimos 5 minutos)

```sql
SELECT COUNT(DISTINCT user_agent) as online_agora,
       COUNT(*) as pageviews,
       MAX(created_at) as ultima_visita
FROM analytics_pageviews
WHERE created_at >= NOW() - INTERVAL '5 minutes';
```

**Use para:** Ver quem está online AGORA no site

---

## 2. 📈 DASHBOARD COMPLETO DE HOJE

```sql
SELECT 
  (SELECT COUNT(DISTINCT user_agent) FROM analytics_pageviews WHERE created_at >= CURRENT_DATE) as visitantes_unicos,
  (SELECT COUNT(*) FROM analytics_pageviews WHERE created_at >= CURRENT_DATE) as total_pageviews,
  (SELECT COUNT(*) FROM analytics_events WHERE event_name = 'sign_up' AND created_at >= CURRENT_DATE) as novos_usuarios,
  (SELECT COUNT(*) FROM analytics_events WHERE event_name = '
  purchase' AND created_at >= CURRENT_DATE) as vendas_hoje;
```

**Use para:** Ver resumo completo do dia (visitantes, pageviews, signups, vendas)

---

## 3. ⏱️ ÚLTIMOS 50 ACESSOS (TEMPO REAL)

```sql
SELECT path,
       device,
       SUBSTRING(user_agent, 1, 50) as navegador,
       created_at
FROM analytics_pageviews
ORDER BY created_at DESC
LIMIT 50;
```

**Use para:** Ver os acessos acontecendo em tempo real

---

## 4. 🏆 PÁGINAS MAIS VISITADAS HOJE

```sql
SELECT path,
       COUNT(*) as visitas,
       COUNT(DISTINCT user_agent) as visitantes_unicos
FROM analytics_pageviews
WHERE created_at >= CURRENT_DATE
GROUP BY path
ORDER BY visitas DESC
LIMIT 10;
```

**Use para:** Saber quais páginas são mais populares

---

## 5. 📱 MOBILE vs DESKTOP HOJE

```sql
SELECT device,
       COUNT(*) as total,
       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentagem
FROM analytics_pageviews
WHERE created_at >= CURRENT_DATE
GROUP BY device
ORDER BY total DESC;
```

**Use para:** Ver quantos % usam mobile vs desktop

---

## 6. 💰 TAXA DE CONVERSÃO (SIGNUPS → COMPRAS)

```sql
WITH stats AS (
  SELECT 
    COUNT(*) FILTER (WHERE event_name = 'sign_up') as signups,
    COUNT(*) FILTER (WHERE event_name = 'purchase') as purchases
  FROM analytics_events
  WHERE created_at >= CURRENT_DATE
)
SELECT 
  signups,
  purchases,
  ROUND((purchases::numeric / NULLIF(signups, 0)) * 100, 2) as taxa_conversao_percent
FROM stats;
```

**Use para:** Saber quantos % dos que criam conta compram o PRO

---

## 7. 📅 HISTÓRICO DOS ÚLTIMOS 7 DIAS

```sql
SELECT 
  DATE(created_at) as data,
  COUNT(DISTINCT user_agent) as visitantes_unicos,
  COUNT(*) as pageviews
FROM analytics_pageviews
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY data DESC;
```

**Use para:** Ver a evolução dos últimos 7 dias

---

## 8. 🎯 TODOS OS EVENTOS DE HOJE

```sql
SELECT event_name,
       event_category,
       COUNT(*) as total
FROM analytics_events
WHERE created_at >= CURRENT_DATE
GROUP BY event_name, event_category
ORDER BY total DESC;
```

**Use para:** Ver todos os eventos (signup, purchase, use_stater_ia, etc)

---

## 9. 🌐 REFERRERS (DE ONDE VEM O TRÁFEGO)

```sql
SELECT 
  CASE 
    WHEN referrer = '' OR referrer IS NULL THEN 'Direto'
    ELSE referrer
  END as origem,
  COUNT(*) as visitas
FROM analytics_pageviews
WHERE created_at >= CURRENT_DATE
GROUP BY referrer
ORDER BY visitas DESC
LIMIT 10;
```

**Use para:** Saber se vieram do Google, Reddit, Twitter, etc

---

## 10. 🎉 RESUMO SUPER COMPLETO

```sql
SELECT 
  'Hoje' as periodo,
  COUNT(DISTINCT user_agent) as visitantes,
  COUNT(*) as pageviews,
  ROUND(COUNT(*)::numeric / COUNT(DISTINCT user_agent), 2) as paginas_por_visitante,
  COUNT(DISTINCT CASE WHEN device = 'mobile' THEN user_agent END) as mobile,
  COUNT(DISTINCT CASE WHEN device = 'desktop' THEN user_agent END) as desktop
FROM analytics_pageviews
WHERE created_at >= CURRENT_DATE;
```

**Use para:** Ver tudo de uma vez (visitantes, páginas/visitante, mobile, desktop)

---

## 💡 DICA PRO: SALVAR AS QUERIES

No SQL Editor do Supabase:

1. Cole a query
2. Clique em **SAVE** (canto superior direito)
3. Dê um nome (ex: "Visitantes Hoje", "Dashboard Completo")
4. Clique novamente para executar instantaneamente!

Assim você não precisa copiar/colar toda vez! 🚀

---

## 🎯 QUERIES PERSONALIZADAS

### Ver visitantes de uma página específica hoje:

```sql
SELECT COUNT(DISTINCT user_agent) as visitantes
FROM analytics_pageviews
WHERE path = '/dashboard' 
  AND created_at >= CURRENT_DATE;
```

### Ver horários de pico (hoje):

```sql
SELECT EXTRACT(HOUR FROM created_at) as hora,
       COUNT(*) as acessos
FROM analytics_pageviews
WHERE created_at >= CURRENT_DATE
GROUP BY hora
ORDER BY acessos DESC;
```

### Ver tempo médio entre signup e primeira compra:

```sql
WITH signups AS (
  SELECT user_id, MIN(created_at) as signup_time
  FROM analytics_events
  WHERE event_name = 'sign_up'
  GROUP BY user_id
),
purchases AS (
  SELECT user_id, MIN(created_at) as purchase_time
  FROM analytics_events
  WHERE event_name = 'purchase'
  GROUP BY user_id
)
SELECT AVG(purchase_time - signup_time) as tempo_medio
FROM signups s
JOIN purchases p ON s.user_id = p.user_id;
```

---

## ✅ TUDO PRONTO!

Agora você tem:
- ✅ **Vercel Analytics** (Dashboard visual lindo)
- ✅ **Supabase Analytics** (SQL queries poderosas)
- ✅ **10 queries prontas** para usar
- ✅ **Tempo real instantâneo**
- ✅ **100% gratuito e ilimitado**

Cole qualquer query no SQL Editor e veja os dados em **TEMPO REAL**! 🎉
