# TODO - Lavori da Completare

## Completati ✅

### 1. Backend Avvio
- [x] Risolvere problema porte
- [x] Testare endpoint API
- [x] Verificare connessione database

### 2. Database
- [x] Inserire prodotti di esempio
- [x] Prodotti visualizzati nel frontend

### 3. Checkout
- [x] Creare endpoint per generare ordine
- [x] Integrare Stripe lato frontend
- [x] Login richiesto prima del checkout
- [x] Storico acquisti nella Dashboard
- [x] Data acquisto nello storico

### 4. UI/UX
- [x] Contrasto elevato su tutti i componenti
- [x] Sfondi più chiari
- [x] Testo nero su sfondi chiari

### 5. Admin
- [x] Visualizzazione ordini
- [x] Conferma manuale pagamenti
- [x] Ordini dal più recente
- [x] CRUD Prodotti (crea, modifica, elimina)
- [x] CRUD Utenti (crea, modifica, elimina)

### 6. Email (Brevo)
- [x] Email benvenuto registrazione
- [x] Email verifica account
- [x] Email reset password
- [x] Email conferma ordine

---

## Da Completare ❌

### 1. Integrazione Unity - Priorità Bassa
- [ ] Sviluppare gioco Unity (prerequisito)
- [ ] Endpoint invio punteggi da Unity
- [ ] Generazione token JWT per Unity
- [ ] Documentazione integrazione

### 2. Deployment - Priorità Bassa
- [ ] Build produzione
- [ ] Script deployment

### 3. Test - Priorità Bassa
- [ ] Test unitari backend
- [ ] Test frontend

---

## Note

### Endpoint API Attivi
- `POST /api/auth/register` - Registrazione
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Reset password
- `POST /api/auth/verify-email` - Verifica email
- `GET /api/products` - Prodotti attivi
- `GET /api/products/all` - Tutti i prodotti (admin)
- `POST /api/products` - Crea prodotto
- `PUT /api/products/{id}` - Modifica prodotto
- `DELETE /api/products/{id}` - Elimina prodotto
- `POST /api/payments/create-order` - Crea ordine
- `POST /api/payments/intent` - PaymentIntent Stripe
- `GET /api/orders` - Storico ordini
- `POST /api/admin/confirm-order` - Conferma ordine
- `GET /api/admin/users` - Lista utenti
- `PUT /api/admin/users/{id}` - Modifica utente
- `DELETE /api/admin/users/{id}` - Disattiva utente
- `GET /api/leaderboard/monthly` - Classifica mensile
- `GET /api/leaderboard/global` - Classifica mondiale
- `GET /api/leaderboard/national` - Classifica nazionale

### Prossimo Task Consigliato
1. **Integrazione Unity** - Dopo lo sviluppo del gioco
2. **Deployment** - Per produzione

---

*Ultimo aggiornamento: 11/05/2026*