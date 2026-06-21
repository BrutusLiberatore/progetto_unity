# Prodotti

## Panoramica

Il sistema prodotti gestisce Cristalli (valuta di gioco) e Potenziamenti (boost) venduti nello shop.

## Tipi di Prodotto

| Tipo | Descrizione |
|------|-------------|
| currency | Cristalli - valuta di gioco |
| boost | Potenziamenti - boost speciali |

## Flusso di Acquisto

```
1. Frontend: Visualizza prodotti da GET /api/products
2. Utente: Aggiunge al carrello
3. Checkout: Redirect Stripe payment
4. Backend: Crea ordine PENDING
5. Stripe: Payment intent
6. Pagamento: Completato
7. Admin: Conferma manualmente
8. Backend: Invia email conferma
```

## Endpoint

| Metodo | Endpoint | Descrizione |
|-------|----------|------------|
| GET | /api/products | Lista prodotti attivi |
| GET | /api/products/all | Tutti i prodotti (admin) |
| GET | /api/products/{id} | Dettaglio prodotto |
| GET | /api/products/type/{type} | Per tipo |
| POST | /api/products | Crea prodotto (admin) |
| PUT | /api/products/{id} | Modifica (admin) |
| DELETE | /api/products/{id} | Elimina (admin) |

## Struttura Prodotto

| Campo | Tipo | Descrizione |
|-------|------|------------|
| id | Long | PK auto-increment |
| name | String | Nome prodotto |
| description | Text | Descrizione |
| type | String | currency/boost |
| priceCents | Integer | Prezzo in cent |
| imageUrl | String | URL immagine |
| isActive | Boolean | Visibile in shop |

## Prodotti Default

### Cristalli
- 100 Cristalli - 0.99 EUR
- 500 Cristalli - 4.49 EUR
- 1000 Cristalli - 7.99 EUR
- 5000 Cristalli - 34.99 EUR

### Potenziamenti
- XP Boost (1h) - 1.99 EUR
- Drop Boost (24h) - 2.99 EUR
- Pet VIP - 9.99 EUR

## File Correlati

- `backend/src/main/java/com/gameshop/controller/ProductController.java`
- `backend/src/main/java/com/gameshop/model/Product.java`
- `backend/src/main/java/com/gameshop/repository/ProductRepository.java`
- `frontend/src/components/ProductCard.jsx`
- `frontend/src/pages/Home.jsx`