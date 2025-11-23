# Come Abilitare Password Protection in Supabase

## ⚠️ Problema

Il Security Advisor segnala: **"Leaked Password Protection is currently disabled"**

Questo significa che gli utenti possono usare password compromesse note da data breach pubblici.

---

## ✅ Soluzione: Abilita la Protezione

### Passo 1: Vai alle Impostazioni di Auth

1. Apri **Supabase Dashboard**
2. Seleziona il tuo progetto
3. Vai su **Authentication** (nel menu laterale)
4. Clicca su **Settings** (o Impostazioni)

### Passo 2: Trova e Abilita la Protezione

Nella sezione **Security**, cerca:

```
🔒 Leaked Password Protection
```

Opzioni disponibili:
- **Off** (attuale - non sicuro)
- **On** (raccomandato)

### Passo 3: Abilita

1. Seleziona **On**
2. Clicca su **Save** (Salva)

---

## 🎯 Cosa Fa Questa Protezione?

Quando abilitata, Supabase:

1. **Controlla le password** durante la registrazione
2. **Confronta con database** di password compromesse (HaveIBeenPwned)
3. **Blocca password note** da data breach
4. **Richiede cambio password** se compromessa

---

## 📊 Impatto sull'Applicazione

### Registrazione Nuovi Utenti
- ✅ Password sicure → accettate
- ❌ Password compromesse → **rifiutate**
- 📝 Messaggio: "Questa password è stata compromessa in un data breach"

### Utenti Esistenti
- Nessun impatto immediato
- Al prossimo login con password compromessa → richiesta di cambio

### Performance
- Impatto minimo (< 100ms per check)
- Check fatto solo durante registrazione/cambio password

---

## 🔍 Come Testare

### Test 1: Password Compromessa Nota

Prova a registrare un utente con password nota come compromessa:

```
Email: test@example.com
Password: password123
```

**Risultato atteso:** Errore "Password compromessa"

### Test 2: Password Sicura

Prova con una password complessa:

```
Email: test@example.com
Password: X$k9mP#vL2@nQ7wZ
```

**Risultato atteso:** Registrazione OK

---

## ⚙️ Configurazioni Avanzate

### Personalizza il Messaggio di Errore

Nel tuo codice frontend, gestisci l'errore:

```typescript
try {
  const { error } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (error) {
    if (error.message.includes('password') && error.message.includes('breach')) {
      // Mostra messaggio personalizzato
      toast.error('Questa password è stata compromessa. Scegline una più sicura.');
    }
  }
} catch (err) {
  console.error(err);
}
```

### Aggiungi Suggerimenti

Mostra all'utente come creare una password sicura:

```typescript
const PasswordStrengthIndicator = ({ password }) => {
  const checks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  
  return (
    <div>
      <p>La password deve contenere:</p>
      <ul>
        <li className={checks.length ? 'text-green-600' : ''}>
          ✓ Almeno 12 caratteri
        </li>
        <li className={checks.uppercase ? 'text-green-600' : ''}>
          ✓ Lettere maiuscole
        </li>
        <li className={checks.lowercase ? 'text-green-600' : ''}>
          ✓ Lettere minuscole
        </li>
        <li className={checks.number ? 'text-green-600' : ''}>
          ✓ Numeri
        </li>
        <li className={checks.special ? 'text-green-600' : ''}>
          ✓ Caratteri speciali
        </li>
      </ul>
    </div>
  );
};
```

---

## 📋 Checklist Post-Abilitazione

- [ ] Protezione abilitata in Supabase Dashboard
- [ ] Security Advisor refreshed
- [ ] Warning "Leaked Password Protection" scomparso
- [ ] Testata registrazione con password compromessa
- [ ] Testata registrazione con password sicura
- [ ] Messaggi di errore personalizzati implementati
- [ ] Indicatore di forza password aggiunto al form

---

## 🔗 Risorse Utili

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)
- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## ❓ FAQ

### Q: Gli utenti esistenti devono cambiare password?
**A:** No, solo se tentano di usare una password compromessa al prossimo login.

### Q: Posso usare una whitelist di password?
**A:** No, ma puoi implementare regole custom nella tua app.

### Q: C'è un costo aggiuntivo?
**A:** No, è incluso in tutti i piani Supabase.

### Q: Come viene controllata la privacy?
**A:** Le password sono hashate prima del check (k-anonymity model). La password completa non viene mai inviata.

---

## ✅ Conclusione

Abilita questa protezione **il prima possibile** per:
- ✅ Migliorare la sicurezza degli account
- ✅ Ridurre il rischio di account takeover
- ✅ Rispettare le best practice di sicurezza
- ✅ Risolvere il Security Advisor warning

