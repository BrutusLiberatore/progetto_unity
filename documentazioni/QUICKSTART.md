# Guida Rapida - Game Shop

## Prerequisiti
- Node.js 18+
- Java 17+
- Maven 3.8+
- PostgreSQL 14+

---

## Installazione e Avvio

### 1. Database PostgreSQL
```sql
-- Creare database
CREATE DATABASE shopdb;

-- Creare tabelle (eseguito automaticamente da Hibernate)
-- Verificare che la password in application.properties sia corretta
```

### 2. Backend
```bash
cd backend

# Build (prima volta)
mvn clean install

# Avvio
mvn spring-boot:run

# Il backend sarà su http://localhost:3001
```

### 3. Frontend
```bash
cd frontend

# Installazione dipendenze (prima volta)
npm install

# Avvio
npm run dev

# Il frontend sarà su http://localhost:5174
```

---

## Verifica Funzionamento

1. **Backend**: Apri http://localhost:3001/api/health
   - Dovresti vedere: `{"status":"ok","message":"Backend is running"}`

2. **Frontend**: Apri http://localhost:5174
   - Dovresti vedere la lista prodotti

3. **API Docs**: http://localhost:5174/api-docs
   - Tester integrato per tutte le API

---

## Problemi Comuni

### "Port 3001 already in use"
```bash
# Trova e termina il processo
powershell
Get-Process -Name java | Stop-Process -Force
```

### "Access denied" nel browser
- Verifica che il backend sia avviato
- Verifica CORS in SecurityConfig

### "Failed to fetch" nel frontend
- Backend non raggiungibile
- CORS non configurato correttamente

### Database vuoto
- Nessun prodotto nel DB
- Hibernate crea le tabelle automaticamente ma non i dati

---

## Chiavi API da Inserire

### backend/src/main/resources/application.properties
```properties
stripe.api.key=sk_test_TUA_CHIAVE
resend.api.key=re_TUA_CHIAVE
```

### frontend/.env
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_TUA_CHIAVE
```

---

*Per dettagli completi vedere PROGETTO.md*