# Spiegazione Security Warnings di Supabase

Questo documento spiega i warning del Security Advisor e perché alcuni sono **intenzionali** per il funzionamento dell'applicazione.

## ✅ Warning Risolti

### 1. Security Definer View - `public.public_profiles`
**Status:** ✅ **RISOLTO** con `fix-public-profiles-security-definer.sql`

**Problema:** La view era in modalità SECURITY DEFINER (default PostgreSQL)

**Soluzione:** Cambiata a SECURITY INVOKER per maggiore sicurezza

---

### 2. Function Search Path Mutable
**Status:** ✅ **RISOLTO** con `fix-function-search-path.sql`

**Problema:** Due funzioni non avevano `search_path` impostato:
- `update_gift_card_updated_at`
- `generate_gift_card_code`

**Rischio:** SQL injection tramite manipolazione del search_path

**Soluzione:** Aggiunto `SET search_path = public` a entrambe le funzioni

---

## ⚠️ Warning Intenzionali (Non Risolvere)

### 3. RLS Policies Allow Anonymous Access

Queste policy **permettono intenzionalmente** l'accesso anonimo per supportare funzionalità critiche:

#### 📋 `public.bookings`
**Perché è intenzionale:**
- Gli utenti possono prenotare **senza registrarsi** (guest checkout)
- Le policy controllano che ogni utente veda solo le proprie prenotazioni
- Usato per: processo di checkout rapido

#### 🎁 `public.gift_cards`
**Perché è intenzionale:**
- Policy: "Anyone can view gift card by valid code"
- Necessario per: redemption delle gift card tramite codice
- Sicurezza: solo card attive e non scadute sono visibili

#### 💳 `public.gift_card_transactions`
**Perché è intenzionale:**
- Gli utenti vedono solo le transazioni delle proprie gift card
- Necessario per: storico utilizzo gift card

#### 👤 `public.profiles`
**Perché è intenzionale:**
- Permette creazione profilo per utenti anonimi che poi si registrano
- Le policy garantiscono accesso solo al proprio profilo
- La view `public_profiles` espone solo dati pubblici sicuri

#### ⭐ `public.reviews`
**Perché è intenzionale:**
- Policy: "Public can view approved reviews"
- Le recensioni approvate **devono** essere pubbliche
- Usato per: pagina recensioni, snapshot script, SEO

#### 🔗 `public.temp_magic_links`
**Perché è intenzionale:**
- Tabella temporanea per magic link authentication
- Necessaria per: login passwordless

#### 👥 `public.user_roles`
**Perché è intenzionale:**
- Gli utenti vedono solo i propri ruoli
- Necessario per: controlli di autorizzazione

#### 📦 `storage.objects`
**Perché è intenzionale:**
- Immagini pubbliche (tour, profili, ecc.) devono essere accessibili
- Policy RLS controllano accesso a file privati

---

## 🔒 Warning da Risolvere Manualmente

### 4. Leaked Password Protection Disabled
**Status:** ⚠️ **DA CONFIGURARE MANUALMENTE**

**Cosa fare:**
1. Vai su Supabase Dashboard → Authentication → Settings
2. Trova "Password Protection"
3. Abilita "Leaked Password Protection"

**Cosa fa:**
Previene l'uso di password compromesse note da data breach

---

### 5. Postgres Version Has Security Patches
**Status:** ℹ️ **GESTITO DA SUPABASE**

**Cosa fare:**
1. Vai su Supabase Dashboard → Settings → Infrastructure
2. Controlla la versione di PostgreSQL
3. Se disponibile un update, pianifica un maintenance window
4. Aggiorna PostgreSQL

**Nota:** Gli update possono richiedere downtime

---

## 📊 Riepilogo

| Warning | Tipo | Status | Azione |
|---------|------|--------|---------|
| Security Definer View | 🔴 Sicurezza | ✅ Risolto | Eseguire SQL script |
| Function Search Path | 🔴 Sicurezza | ✅ Risolto | Eseguire SQL script |
| Anonymous RLS (9 tabelle) | 🟡 Intenzionale | ✅ OK | Nessuna azione |
| Password Protection | 🟡 Configurazione | ⚠️ Da fare | Config manuale |
| Postgres Update | ℹ️ Manutenzione | ⏳ Pianificare | Update DB |

---

## 🚀 Come Applicare i Fix

### Passo 1: Fix SQL (Obbligatorio)
```bash
# In Supabase Dashboard → SQL Editor
# Esegui in ordine:

1. fix-public-profiles-security-definer.sql
2. fix-function-search-path.sql
```

### Passo 2: Abilita Password Protection (Raccomandato)
1. Dashboard → Authentication → Settings
2. Enable "Leaked Password Protection"

### Passo 3: Aggiorna PostgreSQL (Pianifica)
1. Dashboard → Settings → Infrastructure
2. Scegli una data/ora con poco traffico
3. Esegui l'update

---

## ✅ Checklist Post-Fix

- [ ] Eseguiti script SQL
- [ ] Security Advisor refresh → 0 errors
- [ ] Test funzionalità gift cards
- [ ] Test recensioni pubbliche
- [ ] Test prenotazioni guest
- [ ] Password protection abilitata
- [ ] PostgreSQL aggiornato

---

## 📚 Riferimenti

- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Search Path Security](https://www.postgresql.org/docs/current/ddl-schemas.html#DDL-SCHEMAS-PATH)
- [Security Definer Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)

