# Documentazione Casi di Pagamento

## Panoramica
Il sistema gestisce 3 tipi di pagamento principali, ognuno con comportamenti specifici per lo status della prenotazione.

## 1. Pagamento Acconto (`paymentType: 'deposit'`)

**Comportamento**: L'utente sceglie di pagare solo l'acconto
**Status risultante**: SEMPRE `deposit_paid`

### Sottocasi:

#### 1.1 Acconto senza Gift Card
- Paga l'acconto con Stripe
- Status: `deposit_paid`
- `amount_paid` = importo acconto pagato

#### 1.2 Acconto con Gift Card che copre tutto
- Gift card copre l'intero acconto
- Paga 0€ con Stripe
- Status: `deposit_paid` (NON `fully_paid`!)
- `amount_paid` = importo acconto (pagato con gift card)

#### 1.3 Acconto con Gift Card parziale
- Gift card copre parte dell'acconto
- Paga la differenza con Stripe
- Status: `deposit_paid`
- `amount_paid` = importo acconto totale (gift card + Stripe)

## 2. Pagamento Completo (`paymentType: 'full'`)

**Comportamento**: L'utente sceglie di pagare l'intero importo del tour
**Status risultante**: SEMPRE `fully_paid`

### Sottocasi:

#### 2.1 Pagamento completo senza Gift Card
- Paga il prezzo completo con Stripe
- Status: `fully_paid`
- `amount_paid` = prezzo completo
- `deposit_amount` = 0

#### 2.2 Pagamento completo con Gift Card che copre tutto
- Gift card copre l'intero prezzo
- Paga 0€ con Stripe
- Status: `fully_paid`
- `amount_paid` = prezzo completo (pagato con gift card)
- `deposit_amount` = 0

#### 2.3 Pagamento completo con Gift Card parziale
- Gift card copre parte del prezzo
- Paga la differenza con Stripe
- Status: `fully_paid`
- `amount_paid` = prezzo completo (gift card + Stripe)
- `deposit_amount` = 0

## 3. Pagamento Saldo (`paymentType: 'balance'`)

**Comportamento**: L'utente paga il saldo rimanente di una prenotazione esistente
**Status risultante**: Aggiorna a `fully_paid`

### Sottocasi:

#### 3.1 Saldo senza Gift Card
- Paga il saldo rimanente con Stripe
- Aggiorna booking esistente a `fully_paid`
- `amount_paid` = importo già pagato + saldo pagato

#### 3.2 Saldo con Gift Card che copre tutto
- Gift card copre tutto il saldo rimanente
- Paga 0€ con Stripe
- Aggiorna booking esistente a `fully_paid`
- `amount_paid` = importo già pagato + saldo (gift card)

#### 3.3 Saldo con Gift Card parziale
- Gift card copre parte del saldo
- Paga la differenza con Stripe
- Aggiorna booking esistente a `fully_paid`
- `amount_paid` = importo già pagato + saldo totale (gift card + Stripe)

## 4. Pagamento Zero (solo Gift Card)

**Comportamento**: Nessun pagamento Stripe, solo gift card
**Gestito da**: API `/api/zero-payment`

### Sottocasi:

#### 4.1 Gift Card per acconto
- Status: `deposit_paid`
- `amount_paid` = importo acconto
- `payment_method` = 'gift_card'

#### 4.2 Gift Card per pagamento completo
- Status: `fully_paid`
- `amount_paid` = prezzo completo
- `deposit_amount` = 0
- `payment_method` = 'gift_card'

## Regole Chiave

1. **La scelta dell'utente determina lo status**: Se sceglie "acconto" → `deposit_paid`, se sceglie "completo" → `fully_paid`
2. **Le gift card non cambiano lo status**: Se l'utente sceglie acconto e paga tutto con gift card, rimane `deposit_paid`
3. **Il saldo aggiorna sempre a `fully_paid`**: Indipendentemente da come viene pagato
4. **`deposit_amount` è 0 solo per pagamenti completi**: Per acconti, `deposit_amount` = importo acconto

## Esempi Pratici

### Esempio 1: Tour 349€, Acconto 105€
- **Utente sceglie "acconto" + gift card 105€**
- Risultato: `deposit_paid`, `amount_paid` = 105€, `deposit_amount` = 105€

### Esempio 2: Tour 349€, Acconto 105€  
- **Utente sceglie "pagamento completo" + gift card 251€**
- Risultato: `fully_paid`, `amount_paid` = 349€, `deposit_amount` = 0€

### Esempio 3: Tour 349€, Acconto 105€
- **Utente paga acconto, poi saldo con gift card 244€**
- Risultato finale: `fully_paid`, `amount_paid` = 349€, `deposit_amount` = 105€
