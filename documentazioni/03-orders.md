# Ordini

## Panoramica

Il sistema ordini gestisce gli acquisti degli utenti con stati PENDING, COMPLETED, FAILED.

## Stati Ordine

| Stato | Descrizione |
|-------|-------------|
| PENDING | In attesa di pagamento |
| COMPLETED | Pagamento confermato |
| FAILED | Pagamento fallito |

## Flusso Completo

```
1. Utente: Checkout carrello
2. Frontend: POST /api/payments/create-order {items, userId}
3. Backend: Crea ordine PENDING, restituisce orderId
4. Frontend: POST /api/payments/create-intent {orderId}
5. Backend: Stripe payment intent, restituisce clientSecret
6. Frontend: Stripe Elements checkout
7. Utente: Pagamento
8. Admin: Conferma da dashboard
9. Backend: Status -> COMPLETED
10. Backend: Invia email conferma
```

## Endpoint

| Metodo | Endpoint | Descrizione |
|-------|----------|------------|
| GET | /api/orders | Tutti gli ordini (admin) |
| GET | /api/orders/{id} | Dettaglio ordine |
| GET | /api/orders/user/{userId} | Ordini utente |
| POST | /api/payments/create-order | Crea ordine |
| POST | /api/payments/create-intent | Payment intent |
| POST | /api/admin/confirm-order | Conferma (admin) |

## Struttura Ordine

| Campo | Tipo | Descrizione |
|-------|------|------------|
| id | Long | PK auto-increment |
| userId | Long | FK utente |
| totalCents | Integer | Totale |
| status | Enum | PENDING/COMPLETED/FAILED |
| stripePaymentIntentId | String | Stripe ID |
| createdAt | Timestamp | Data ordine |

## Struttura OrderItem

| Campo | Tipo | Descrizione |
|-------|------|------------|
| id | Long | PK |
| orderId | Long | FK ordine |
| productId | Long | FK prodotto |
| productName | String | Snapshot nome |
| quantity | Integer | Quantita |
| priceCents | Integer | Prezzo unitario |

## Email Confirmation

Dopo la conferma admin, viene inviata email con:
- Dettagli ordine
- Prodotti acquistati
- Totale
- Link alla dashboard

## File Correlati

- `backend/src/main/java/com/gameshop/controller/OrderController.java`
- `backend/src/main/java/com/gameshop/controller/PaymentController.java`
- `backend/src/main/java/com/gameshop/model/Order.java`
- `backend/src/main/java/com/gameshop/model/OrderItem.java`
- `backend/src/main/java/com/gameshop/service/EmailService.java`
- `frontend/src/components/CartModal.jsx`