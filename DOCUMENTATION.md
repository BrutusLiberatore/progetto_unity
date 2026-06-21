# Bolt & Bone - Documentazione Tecnica

## Panoramica del Progetto

Bolt & Bone e-commerce per la vendita di valuta di gioco (Cristalli) e potenziamenti (Boosts) per il gioco Unity "Bolt & Bone".

Stack tecnologico:
- **Frontend**: React 5 + Vite + Tailwind CSS + DaisyUI
- **Backend**: Java Spring Boot
- **Database**: PostgreSQL
- **Pagamenti**: Stripe
- **Email**: Brevo (ex Sendinblue)

---

## Struttura del Progetto

```
nuovo/
+-- frontend/               # React frontend (porta 5173)
|   +-- src/
|   |   +-- components/  # Componenti riutilizzabili
|   |   +-- pages/       # Pagine router
|   |   +-- App.jsx      # Router principale
|   |   +-- index.css    # Tailwind + stili custom
|   +-- public/
|       +-- assets/images/  # Immagini prodotti
|
+-- backend/               # Spring Boot (porta 3001)
|   +-- src/main/java/com/gameshop/
|       +-- controller/   # API REST
|       +-- model/       # Entity JPA
|       +-- repository/  # Data access
|       +-- service/     # Logica di business
|       +-- config/      # Configurazione
|
+-- docker-compose.yml    # Container orchestration
```
nuovo/
|-- frontend/               # React frontend (porta 5173)
|   |-- src/
|   |   |-- components/  # Componenti riutilizzabili
|   |   |-- pages/       # Pagine router
|   |   |-- App.jsx      # Router principale
|   |   |-- index.css    # Tailwind + stili custom
|   |-- public/
|       |-- assets/images/  # Immagini prodotti
|
|-- backend/               # Spring Boot (porta 3001)
|   |-- src/main/java/com/gameshop/
|       |-- controller/   # API REST
|       |-- model/       # Entity JPA
|       |-- repository/  # Data access
|       |-- service/     # Logica di business
|       |-- config/      # Configurazione
|
|-- docker-compose.yml        # Container orchestration
```
nuovo/
├── frontend/               # React frontend (porta 5173)
│   ├── src/
│   │   ├── components/  # Componenti riutilizzabili
│   │   ├── pages/       # Pagine router
│   │   ├── App.jsx      # Router principale
│   │   └── index.css    # Tailwind + stili custom
│   └── public/
│       └── assets/images/  # Immagini prodotti
│
├── backend/               # Spring Boot (porta 3001)
│   └── src/main/java/com/gameshop/
│       ├── controller/   # API REST
│       ├── model/       # Entity JPA
│       ├── repository/  # Data access
│       ├── service/     # Logica di business
│       └── config/      # Configurazione
│
└── docker-compose.yml    # Container orchestration
```

---

## Credenziali e Configurazione

### Database PostgreSQL
- **Host**: boltbone-db
- **DB**: boltbonedb
- **User**: boltbone
- **Password**: kratos

### Backend
- **Porta**: 3001
- **Admin token**: configurato in application.yml

### Stripe
- **Chiave pubblica** (frontend): `pk_test_...`
- **Chiave segreta** (backend): `sk_test_...`
- **Webhook secret**: `whsec_...`

### Brevo
- **API key**: `xkeysib-...`
- **Email mittente**: `boltbone26@gmail.com`

---

## Flussi Principali

### 1. Registrazione Utente

```
1. Utente compila form registrazione
2. Backend crea utente (isVerified=false)
3. Backend genera codice 6 cifre random
4. Backend invia email verifica via Brevo
5. Frontend mostra popup inserimento codice
6. Utente inserisce codice
7. Backend verifica codice + scadenza (30 min)
8. Se valido: isVerified=true, login automatico
```

**Endpoint**: `POST /api/auth/register` -> `POST /api/auth/verify-email`

### 2. Acquisto Prodotti

```
1. Utente aggiunge prodotti al carrello
2. Utente effettua checkout
3. Backend crea ordine PENDING
4. Frontend Stripe payment intent
5. Utente completa pagamento Stripe
6. Admin conferma manualmente
7. Backend invia email conferma ordine
```

**Endpoint**: `POST /api/payments/create-order` -> `POST /api/payments/create-intent`

### 3. Classifica (Leaderboard)

```
1. Unity invia punteggio a frontend
2. Frontend chiama API classifica
3. Backend aggiorna punteggio utente
4. Backend ricalcola rank globali/nazionali
5. Home visualizza classifica
```

**Endpoint**: `POST /api/leaderboard/update`

---

## API Endpoints

### Auth
| Metodo | Endpoint | Descrizione |
|-------|----------|------------|
| POST | /api/auth/register | Registrazione |
| POST | /api/auth/verify-email | Verifica email |
| POST | /api/auth/resend-verification | Reinvio codice |
| POST | /api/auth/login | Login |
| POST | /api/auth/forgot-password | Reset password |
| POST | /api/auth/reset-password | Nuova password |

### Prodotti
| Metodo | Endpoint | Descrizione |
|-------|----------|------------|
| GET | /api/products | Lista attivi |
| GET | /api/products/{id} | Dettaglio |

### Ordini
| Metodo | Endpoint | Descrizione |
|-------|----------|------------|
| GET | /api/orders | Tutti (admin) |
| GET | /api/orders/user/{id} | Utente |
| POST | /api/admin/confirm-order | Conferma |

### Leaderboard
| Metodo | Endpoint | Descrizione |
|-------|----------|------------|
| GET | /api/leaderboard/monthly | Mensile |
| GET | /api/leaderboard/global | Mondiale |
| GET | /api/leaderboard/national | Nazionale |
| POST | /api/leaderboard/update | Aggiorna |
| POST | /api/leaderboard/init | Test data |

---

## Componenti Frontend

### Pagine
- **Home.jsx** - Shop + classifica
- **Dashboard.jsx** - Profilo utente + ordini
- **Admin.jsx** - Gestione prodotti/utenti/ordini
- **AdminLogin.jsx** - Login admin
- **ApiDocs.jsx** - Documentazione API

### Componenti
- **Navbar.jsx** - Menu navigazione
- **Footer.jsx** - Footer
- **ProductCard.jsx** - Scheda prodotto
- **CartModal.jsx** - Carrello
- **AuthModal.jsx** - Login/Register
- **CheckoutForm.jsx** - Pagamento Stripe

---

## Tabelle Database

### users
| Colonna | Tipo | Descrizione |
|--------|------|------------|
| id | BIGINT | PK auto-increment |
| email | VARCHAR | Unique, not null |
| password_hash | VARCHAR | BCrypt hash |
| username | VARCHAR | Unique |
| is_verified | BOOLEAN | Email verificata |
| verification_code | VARCHAR | Codice 6 cifre |
| verification_expires | TIMESTAMP | Scadenza |
| api_key | UUID | Per Unity |
| is_admin | BOOLEAN | Admin |
| created_at | TIMESTAMP | Registrazione |

### products
| Colonna | Tipo | Descrizione |
|--------|------|------------|
| id | BIGINT | PK |
| name | VARCHAR | Nome |
| description | TEXT | Descrizione |
| type | VARCHAR | currency/boost |
| price_cents | INT | Prezzo in cent |
| image_url | VARCHAR | Immagine |
| is_active | BOOLEAN | Visibile |

### orders
| Colonna | Tipo | Descrizione |
|--------|------|------------|
| id | BIGINT | PK |
| user_id | BIGINT | FK users |
| total_cents | INT | Totale |
| status | VARCHAR | PENDING/COMPLETED/FAILED |
| stripe_payment_intent_id | VARCHAR | Stripe ID |
| created_at | TIMESTAMP | Data ordine |

### order_items
| Colonna | Tipo | Descrizione |
|--------|------|------------|
| id | BIGINT | PK |
| order_id | BIGINT | FK orders |
| product_id | BIGINT | FK products |
| product_name | VARCHAR | Snapshot nome |
| quantity | INT | Quantita |
| price_cents | INT | Prezzo unitario |

### user_scores
| Colonna | Tipo | Descrizione |
|--------|------|------------|
| id | BIGINT | PK |
| user_id | BIGINT | FK users |
| monthly_score | BIGINT | Punteggiomensile |
| total_score | BIGINT | Punteggiototale |
| national_rank | INT | Rank nazionale |
| global_rank | INT | Rank mondiale |
| last_updated | TIMESTAMP | Ultimo aggiornamento |

---

## Configurazione Docker

```yaml
services:
  boltbone-db:
    image: postgres:15
    environment:
      POSTGRES_DB: boltbonedb
      POSTGRES_USER: boltbone
      POSTGRES_PASSWORD: kratos

  boltbone-backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://boltbone-db:5432/boltbonedb

  boltbone-frontend:
    build: ./frontend
    ports:
      - "5173:5173"
```

---

## Note per Sviluppo

1. **Frontend**: `npm run dev` (porta 5173)
2. **Backend**: `mvn spring-boot:run` (porta 3001)
3. **Stripe webhook**: richiede URL pubblico (ngrok per test)
4. **Email verifica**: 30 minuti di scadenza
5. **Classifica**: dati test con `POST /api/leaderboard/init`

---

##Link Utili

- Backend API: http://localhost:3001
- Frontend: http://localhost:5173
- Admin: http://localhost:5173/admin
- Stripe Dashboard: https://dashboard.stripe.com
- Brevo: https://app.brevo.com