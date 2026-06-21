# Pannello Admin

## Panoramica

Il pannello admin gestisce prodotti, utenti e ordini con operazioni CRUD complete.

## Accesso

L'accesso admin richiede:
1. Utente con `isAdmin = true` nel database
2. Login tramite `POST /api/admin/login`
3. Token JWT con role ADMIN

## Tab Administratori

| Tab | Descrizione |
|-----|-------------|
| Prodotti | CRUD prodotti |
| Utenti | Gestione utenti |
| Ordini | Visualizza e conferma |
| API | Documentazione |

## Funzionalita Prodotti

| Operazione | Descrizione |
|-----------|-------------|
| Lista | Visualizza tutti i prodotti |
| Crea | Nuovo prodotto |
| Modifica | Modifica esistente |
| Elimina | Rimuovi prodotto |

## Funzionalita Utenti

| Operazione | Descrizione |
|-----------|-------------|
| Lista | Visualizza utenti |
| Modifica | Username, email, admin |
| Disattiva | set isVerified=false |
| Reset Password | Nuova password |

## Funzionalita Ordini

| Operazione | Descrizione |
|-----------|-------------|
| Lista | Tutti gli ordini |
| Dettaglio | Prodotti acquistati |
| Conferma | PENDING -> COMPLETED |

## Endpoint

| Metodo | Endpoint | Descrizione |
|-------|----------|------------|
| POST | /api/admin/login | Login admin |
| POST | /api/admin/confirm-order | Conferma ordine |
| GET | /api/admin/users | Lista utenti |
| PUT | /api/admin/users/{id} | Modifica utente |
| DELETE | /api/admin/users/{id} | Disattiva utente |

## Struttura Risposta Ordine

```json
{
  "id": 1,
  "userId": 1,
  "user": {
    "id": 1,
    "username": "player1",
    "email": "player@example.com"
  },
  "totalCents": 999,
  "status": "COMPLETED",
  "items": [
    {"productName": "100 Cristalli", "quantity": 1, "priceCents": 999}
  ],
  "createdAt": "2026-05-08"
}
```

## File Correlati

- `frontend/src/pages/Admin.jsx`
- `backend/src/main/java/com/gameshop/controller/AdminController.java`
- `backend/src/main/java/com/gameshop/controller/AdminUserController.java`