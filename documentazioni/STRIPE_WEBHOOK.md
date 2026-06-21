# Stripe Webhook Setup

## Configurazione

### 1. Installa ngrok (per test locale)

```bash
# Windows (con Chocolatey)
choco install ngrok

# Oppure scarica da https://ngrok.com/download
```

### 2. Avvia ngrok

```bash
ngrok http 3001
```

Copia l'URL HTTPS che ottieni (es. `https://abc123.ngrok.io`)

### 3. Configura Webhook su Stripe Dashboard

1. Vai su https://dashboard.stripe.com/webhooks
2. Clicca "Add endpoint"
3. Endpoint URL: `https://abc123.ngrok.io/api/webhooks/stripe`
4. Seleziona eventi:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Clicca "Add endpoint"

### 4. Aggiorna webhook secret nel .env

Dopo aver creato l'endpoint, Stripe ti fornirà un webhook secret (whsec_...). Aggiungilo al file `.env`:

```
STRIPE_WEBHOOK_SECRET=whsec_abc123def456...
```

### 5. Per Docker Compose

Il webhook secret è già configurato nel file `.env`. Per aggiornarlo:

```bash
# Ferma i container
docker-compose down

# Aggiorna .env con il nuovo secret

# Riavvia
docker-compose up -d
```

## Testing

### Testa il webhook

```bash
# Con ngrok in esecuzione, invia un evento di test
curl -X POST https://abc123.ngrok.io/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test_signature" \
  -d '{"type": "payment_intent.succeeded", "data": {"object": {"id": "pi_test"}}}'
```

### Verifica log

```bash
docker logs boltbone-backend --tail=100 | grep -i webhook
```

## Eventi Gestiti

| Evento | Azione |
|---------|--------|
| `payment_intent.succeeded` | Conferma ordine, invia email |
| `payment_intent.payment_failed` | Segna ordine come fallito |
| `charge.refunded` | Gestione rimborsi (da implementare) |

## URL Webhook

- **Locale**: `http://localhost:3001/api/webhooks/stripe`
- **Produzione**: `https://tuo-dominio.com/api/webhooks/stripe`
