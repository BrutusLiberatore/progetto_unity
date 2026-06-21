# Autenticazione

## Panoramica

Il sistema di autenticazione gestisce registrazione, login, verifica email e reset password usando JWT tokens.

## Flusso di Registrazione

```
1. Frontend: POST /api/auth/register {email, password, username}
2. Backend: 
   - Valida campi (email, password, username)
   - Controlla duplicati
   - Genera codice verifica 6 cifre
   - Salva utente con isVerified=false
   - Invia email verifica
3. Frontend: Mostra popup inserimento codice
4. Frontend: POST /api/auth/verify-email {email, code}
5. Backend:
   - Valida codice (6 cifre)
   - Controlla scadenza (30 minuti)
   - Setta isVerified=true
   - Genera JWT token
   - Invia email benvenuto
6. Frontend: Login automatico
```

## Codici di Stato

- `USERNAME_TAKEN` - Username gia in uso
- `NOT_VERIFIED` - Email non verificata
- `EXPIRED` - Codice scaduto

## Endpoint

| Metodo | Endpoint | Descrizione |
|-------|----------|------------|
| POST | /api/auth/register | Registrazione (invia codice) |
| POST | /api/auth/verify-email | Verifica codice e login |
| POST | /api/auth/resend-verification | Reinvio codice |
| POST | /api/auth/login | Login (richiede verifica) |
| POST | /api/auth/forgot-password | Reset password |
| POST | /api/auth/reset-password | Nuova password |

## Struttura JWT

Il token JWT contiene:
- `sub`: email
- `role`: ADMIN o USER
- `exp`: timestamp scadenza

## Campi Utente

| Campo | Tipo | Descrizione |
|-------|------|------------|
| email | String | Email univoca |
| passwordHash | String | Hash BCrypt |
| username | String | Username |
| isVerified | Boolean | Email verificata |
| verificationCode | String | Codice 6 cifre |
| verificationExpires | Timestamp | Scadenza codice |
| apiKey | UUID | Per Unity |
| isAdmin | Boolean | Admin |
| createdAt | Timestamp | Registrazione |

## Codice Esempio

```javascript
// Registrazione
const res = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    username: 'player1'
  })
})
// Risposta: {needsVerification: true, avatarUrl: '...'}

// Verifica email
const verifyRes = await fetch('http://localhost:3001/api/auth/verify-email', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'user@example.com',
    code: '123456'
  })
})
// Risposta: {token: '...', user: {...}}

// Login
const loginRes = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})
// Risposta: {token: '...', user: {id, email, username, isVerified, apiKey, avatarUrl}}
```

## File Correlati

- `backend/src/main/java/com/gameshop/controller/AuthController.java`
- `backend/src/main/java/com/gameshop/model/User.java`
- `backend/src/main/java/com/gameshop/util/JwtUtil.java`
- `frontend/src/components/AuthModal.jsx`