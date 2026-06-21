# Classifica (Leaderboard)

## Panoramica

Il sistema di classifica gestisce i punteggi dei giocatori con rankings mensili, globali e nazionali.

## Tipi di Classifica

| Tipo | Descrizione | Endpoint |
|------|-------------|----------|
| Mensile | Punteggi del mese corrente | /api/leaderboard/monthly |
| Mondiale | Punteggi totali | /api/leaderboard/global |
| Nazionale | Rank nazionale | /api/leaderboard/national |

## Struttura UserScore

| Campo | Tipo | Descrizione |
|-------|------|------------|
| id | Long | PK auto-increment |
| userId | Long | FK utente (unique) |
| monthlyScore | Long | Punteggiomensile |
| totalScore | Long | Punteggiototale |
| nationalRank | Integer | Rank nazionale |
| globalRank | Integer | Rank mondiale |
| lastUpdated | Timestamp | Ultimo aggiornamento |

## Flusso di Aggiornamento

```
1. Unity: Invia punteggio a frontend
2. Frontend: POST /api/leaderboard/update {userId, score}
3. Backend: Aggiorna punteggio utente
4. Backend: Ricalcola tutti i rank
5. Frontend: Visualizza classifica
```

## Endpoint

| Metodo | Endpoint | Descrizione |
|-------|----------|------------|
| GET | /api/leaderboard/monthly | Classifica mensile |
| GET | /api/leaderboard/global | Classifica mondiale |
| GET | /api/leaderboard/national | Classifica nazionale |
| POST | /api/leaderboard/update | Aggiorna punteggio |
| POST | /api/leaderboard/init | Genera dati test |

## Risposta Classifica

```json
[
  {
    "rank": 1,
    "monthlyScore": 15000,
    "totalScore": 45000,
    "nationalRank": 5,
    "globalRank": 12,
    "lastUpdated": "2026-05-08",
    "user": {
      "id": 1,
      "username": "PlayerOne",
      "avatarUrl": "https://..."
    }
  }
]
```

## Init Test Data

`POST /api/leaderboard/init` genera dati casuali per tutti gli utenti registrati utile per testare la visualizzazione.

## File Correlati

- `backend/src/main/java/com/gameshop/controller/LeaderboardController.java`
- `backend/src/main/java/com/gameshop/model/UserScore.java`
- `backend/src/main/java/com/gameshop/repository/UserScoreRepository.java`
- `frontend/src/pages/Home.jsx`