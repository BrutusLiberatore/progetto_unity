# Game Shop - Documentazione del Progetto

## Panoramica del Progetto

**Game Shop** è un negozio online per l'acquisto di valuta virtuale ("Cristalli") e potenziamenti per videogiochi. Il progetto è costituito da tre componenti principali:

- **Frontend**: Applicazione React con Vite
- **Backend**: API REST Java Spring Boot
- **Database**: PostgreSQL

Il sistema supporta autenticazione utente, gestione carrello, pagamento con Stripe, e sincronizzazione con Unity tramite JWT token.

---

## Struttura del Progetto

```
nuovo/
├── backend/                    # Java Spring Boot API
├── frontend/                   # React + Vite
├── documentazioni/            # Questa documentazione
└── PROGETTO.md                # (questo file)
```

---

## Backend

### Stack Tecnologico
- **Framework**: Spring Boot 3.2.0
- **Database**: PostgreSQL con JPA/Hibernate
- **Security**: Spring Security con CORS
- **Pagamenti**: Stripe Java SDK 24.0.0
- **Email**: Resend Java SDK 1.0.0
- **JWT**: jjwt 0.12.3

### Struttura dei File

```
backend/src/main/java/com/gameshop/
├── GameShopApplication.java          # Punto di ingresso
├── config/
│   └── SecurityConfig.java          # Configurazione sicurezza e CORS
├── controller/
│   ├── AuthController.java           # Registrazione, login, reset password
│   ├── ProductController.java        # CRUD prodotti
│   ├── OrderController.java          # Gestione ordini
│   ├── PaymentController.java        # Pagamenti Stripe
│   └── HealthController.java         # Stato API
├── model/
│   ├── User.java                    # Entità utente
│   ├── Product.java                 # Entità prodotto
│   ├── Order.java                   # Entità ordine
│   ├── OrderItem.java               # Elementi dell'ordine
│   └── Payment.java                 # Pagamento Stripe
├── repository/
│   ├── UserRepository.java
│   ├── ProductRepository.java
│   ├── OrderRepository.java
│   └── PaymentRepository.java
└── service/
    └── PaymentService.java           # Logica pagamento Stripe
```

### Configurazione

**application.properties** (`backend/src/main/resources/application.properties`):

```properties
# Server
server.port=3001

# Database PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/shopdb
spring.datasource.username=postgres
spring.datasource.password=kratos

# JWT
jwt.secret=your-super-secret-key-change-in-production
jwt.expiration=604800000

# Stripe (chiave segreta - lato server)
stripe.api.key=sk_test_...
stripe.webhook.secret=whsec_...

# Resend (email)
resend.api.key=re_...

# Frontend URL per CORS
frontend.url=http://localhost:5174
```

### Endpoint API

| Metodo | Endpoint | Descrizione | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Verifica stato backend | No |
| GET | `/api/products` | Lista tutti i prodotti attivi | No |
| GET | `/api/products/{id}` | Dettaglio prodotto | No |
| GET | `/api/products/type/{type}` | Prodotti per tipo | No |
| POST | `/api/auth/register` | Registrazione utente | No |
| POST | `/api/auth/login` | Login utente | No |
| POST | `/api/auth/forgot-password` | Richiedi reset password | No |
| POST | `/api/auth/reset-password` | Reset password | No |
| GET | `/api/orders` | Lista ordini utente | Sì |
| GET | `/api/orders/{id}` | Dettaglio ordine | Sì |
| POST | `/api/payments/intent` | Crea pagamento Stripe | No |
| POST | `/api/payments/webhook` | Webhook Stripe | No |

### Avvio del Backend

```bash
cd backend
mvn spring-boot:run
```

Il backend sarà disponibile su: **http://localhost:3001**

---

## Frontend

### Stack Tecnologico
- **Framework**: React 18
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS + DaisyUI
- **Routing**: React Router DOM
- **Pagamenti**: Stripe.js (frontend)

### Struttura dei File

```
frontend/src/
├── App.jsx                         # Componente principale
├── main.jsx                        # Entry point
├── index.css                       # Stili globali
├── components/
│   ├── Navbar.jsx                  # Barra di navigazione
│   ├── Footer.jsx                  # Footer
│   ├── ProductCard.jsx             # Card prodotto
│   ├── CartModal.jsx               # Modal carrello
│   └── AuthModal.jsx               # Modal login/register
├── pages/
│   ├── Home.jsx                    # Homepage con prodotti
│   ├── Dashboard.jsx               # Dashboard utente
│   └── ApiDocs.jsx                 # Documentazione API + Tester
└── .env                            # Variabili ambiente
```

### Configurazione

**.env** (`frontend/.env`):
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Pagine

1. **Home** (`/`) - Mostra i prodotti caricati dal backend, separati per:
   - Cristalli (valuta)
   - Potenziamenti (boost)

2. **Dashboard** (`/dashboard`) - Area personale utente con:
   - Info profilo
   - Storico ordini
   - Impostazioni

3. **API Docs** (`/api-docs`) - Documentazione interattiva con:
   - Lista endpoint
   - Tester API integrato

### Avvio del Frontend

```bash
cd frontend
npm run dev
```

Il frontend sarà disponibile su: **http://localhost:5174** (o 5173 se occupato)

---

## Database

### Tabelle

**users**
| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| id | BIGINT | PK, auto-increment |
| email | VARCHAR(255) | Email univoca |
| username | VARCHAR(50) | Username univoco |
| password_hash | VARCHAR(255) | Password crittografata |
| is_verified | BOOLEAN | Email verificata |
| api_key | UUID | Token per Unity |
| reset_code | VARCHAR(6) | Codice reset password |
| reset_expires | TIMESTAMP | Scadenza codice reset |
| created_at | TIMESTAMP | Data creazione |

**products**
| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| id | BIGINT | PK, auto-increment |
| name | VARCHAR(100) | Nome prodotto |
| description | TEXT | Descrizione |
| type | VARCHAR(20) | "currency" o "boost" |
| price_cents | BIGINT | Prezzo in centesimi |
| image_url | VARCHAR(500) | URL immagine |
| is_active | BOOLEAN | Prodotto visibile |

**orders**
| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| id | BIGINT | PK, auto-increment |
| user_id | BIGINT | FK a users |
| total_cents | BIGINT | Totale ordine |
| status | VARCHAR(20) | PENDING/COMPLETED/FAILED/REFUNDED |
| stripe_payment_intent_id | VARCHAR(255) | ID Stripe |
| created_at | TIMESTAMP | Data ordine |

**order_items**
| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| id | BIGINT | PK, auto-increment |
| order_id | BIGINT | FK a orders |
| product_id | BIGINT | FK a products |
| quantity | INT | Quantità |
| price_cents | BIGINT | Prezzo al momento |

**payments**
| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| id | BIGINT | PK, auto-increment |
| order_id | BIGINT | FK a orders |
| stripe_payment_intent_id | VARCHAR(255) | ID Stripe |
| status | VARCHAR(20) | pending/succeeded/failed |
| amount | BIGINT | Importo |
| currency | VARCHAR(3) | "eur" |
| created_at | TIMESTAMP | Data pagamento |

---

## Flusso utente

### 1. Navigazione
L'utente accede al sito e visualizza i prodotti nella home page.

### 2. Autenticazione
- **Registrazione**: `/api/auth/register` (email, username, password)
- **Login**: `/api/auth/login` (email, password) → ritorna token e dati utente

### 3. Carrello
L'utente aggiunge prodotti al carrello (memorizzato in localStorage).

### 4. Pagamento
- L'utente clicca "Paga" su un prodotto
- Il frontend chiama `/api/payments/intent` con l'ID ordine
- Il backend crea un PaymentIntent su Stripe e ritorna il `clientSecret`
- Il frontend usa Stripe Elements per completare il pagamento

### 5. Consegna
Dopo il pagamento, il backend aggiorna lo stato dell'ordine e invia i cristalli all'utente (tramite API Unity se integrato).

---

## Integrazione Stripe

### Lato Backend
1. Creare un ordine nel database
2. Chiamare `PaymentIntent.create()` di Stripe
3. Salvare il `paymentIntentId` nell'ordine
4. Ritornare `clientSecret` al frontend

### Lato Frontend
1. Caricare Stripe con chiave pubblica (`loadStripe`)
2. Chiedere il `clientSecret` al backend
3. Mostrare Stripe Elements per input carta
4. Confermare il pagamento con `stripe.confirmPayment`

### Note
- Le chiavi test iniziano con `sk_test_` (segreta) e `pk_test_` (pubblica)
- Per produzione usare chiavi `sk_live_` e `pk_live_`

---

## Integrazione Resend (Email)

Resend è configurato per:
- Invio email di verifica account
- Codici reset password
- Conferme ordine
- Notifiche

**Endpoint**:
- `/api/auth/forgot-password` - Richiede codice
- `/api/auth/reset-password` - Usa codice per resettare

---

## Variabili d'Ambiente

### Backend
| Variabile | Descrizione |
|-----------|-------------|
| `stripe.api.key` | Chiave segreta Stripe (sk_test_...) |
| `stripe.webhook.secret` | Secret per webhook Stripe |
| `resend.api.key` | Chiave API Resend |
| `jwt.secret` | Secret per firma JWT |
| `jwt.expiration` | Durata token in millisecondi |

### Frontend
| Variabile | Descrizione |
|-----------|-------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Chiave pubblica Stripe (pk_test_...) |

---

## Comandi Utili

### Backend
```bash
# Avvio
cd backend
mvn spring-boot:run

# Build
mvn clean package
```

### Frontend
```bash
# Installazione dipendenze
cd frontend
npm install

# Avvio sviluppo
npm run dev

# Build produzione
npm run build
```

---

## Stato di Sviluppo

### Completato
- [x] Struttura database PostgreSQL
- [x] Backend Spring Boot con API REST
- [x] Autenticazione utente (register/login)
- [x] Security con CORS
- [x] Entity e Repository
- [x] Frontend React con Vite
- [x] Navigazione e routing
- [x] Fetch prodotti dal backend
- [x] Integrazione Stripe lato backend
- [x] Pagina API Docs + Tester

### Da Completare
- [ ] Inizializzazione prodotti nel database
- [ ] Checkout completo (creazione ordine + pagamento)
- [ ] Integrazione Stripe lato frontend
- [ ] Resend per invio email
- [ ] Dashboard admin per gestione prodotti
- [ ] Sincronizzazione Unity
- [ ] Test e debug avvio

---

## Riferimenti

- [Spring Boot Docs](https://docs.spring.io/spring-boot/docs/current/reference/)
- [React Docs](https://react.dev/)
- [Stripe Docs](https://stripe.com/docs)
- [Vite Docs](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

*Documento generato il 29/04/2026*