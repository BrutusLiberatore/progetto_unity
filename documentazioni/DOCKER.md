# Docker Compose - Game Shop

## Cos'è Docker Compose?

**Docker Compose** è uno strumento che permette di definire e gestire applicazioni multi-container in un singolo file di configurazione YAML.

Invece di avviare manualmente ogni container (database, backend, frontend) con comandi separati, Docker Compose ti permette di:
- Definire tutti i servizi in un unico file (`docker-compose.yml`)
- Avviarli tutti con un solo comando
- Gestire dipendenze tra i servizi automaticamente
- Scalare l'applicazione facilmente

---

## Struttura del Progetto con Docker

```
nuovo/
├── docker-compose.yml      # Configurazione principale
├── .env.example           # Variabili d'ambiente (da rinominare)
├── backend/
│   ├── Dockerfile          # Immagine backend Java
│   └── ...
├── frontend/
│   ├── Dockerfile          # Immagine frontend React
│   ├── nginx.conf         # Configurazione Nginx
│   └── ...
└── documentazioni/
    └── DOCKER.md
```

---

## Servizi Definiti

### 1. PostgreSQL (Database)
- **Immagine**: `postgres:14-alpine`
- **Porta**: `5432` (locale) → `5432` (container)
- **Database**: `shopdb`
- **Credenziali**: `postgres` / `kratos`
- **Volume**: dati persistenti in `postgres_data`

### 2. Backend (Java Spring Boot)
- **Build**: Dockerfile dal codice sorgente
- **Porta**: `3001` (locale) → `3001` (container)
- **Dipendenze**: aspetta che PostgreSQL sia pronto
- **Environment**: connessione al database, chiavi API

### 3. Frontend (React + Vite)
- **Build**: Dockerfile + Nginx per produzione
- **Porta**: `5173` (locale) → `5173` (container)
- **Dipendenze**: aspetta che il backend sia pronto
- **Nginx**: gestisce routing e proxy API

---

## Comandi Utili

### Avvio (dalla cartella principale)
```bash
# Avvia tutti i servizi
docker-compose up -d

# Avvista e mostra i log
docker-compose up

# Forza la ricostruzione delle immagini
docker-compose up --build
```

### Gestione
```bash
# Lista i container in esecuzione
docker-compose ps

# Stoppa tutti i servizi
docker-compose down

# Stoppa e rimuove i volumi (ATTENZIONE: cancella i dati!)
docker-compose down -v

# Riavvia un servizio specifico
docker-compose restart backend
```

### Log
```bash
# Log di tutti i servizi
docker-compose logs

# Log di un servizio specifico
docker-compose logs -f backend
docker-compose logs -f postgres

# Log con timestamp
docker-compose logs -t
```

### Accesso
```bash
# Entra nel container del database
docker-compose exec postgres psql -U postgres -d shopdb

# Entra nel container backend
docker-compose exec backend sh
```

---

## Variabili d'Ambiente

Crea un file `.env` nella cartella principale (copia da `.env.example`):

```env
STRIPE_API_KEY=sk_test_...
JWT_SECRET=chiave_segretissima
```

Queste variabili vengono inserite automaticamente nei container.

---

## Risoluzione Problemi

### Container non si avvia
```bash
# Verifica lo stato
docker-compose ps

# Mostra log dettagliati
docker-compose logs nome_servizio
```

### Database non connesso
```bash
# Verifica che PostgreSQL siaHealthy
docker-compose ps

# Controlla i log
docker-compose logs postgres
```

### Problemi di rete
```bash
# Ricrea la rete
docker-compose down
docker-compose up

# Verifica la rete
docker network ls
```

### Pulizia completa
```bash
# Ferma tutto e rimuovi tutto (compresi volumi)
docker-compose down -v --rmi all

# Rimuovi solo le immagini buildate
docker-compose down --rmi local
```

---

## Build per Produzione

```bash
# Build delle immagini senza avviarle
docker-compose build

# Avvio in produzione (senza volumi per clean install)
docker-compose up -d --build

# Verifica che tutto funzioni
docker-compose ps
curl http://localhost:3001/api/health
curl http://localhost:5173
```

---

## Vantaggi dell'Usare Docker Compose

1. **Setup rapido**: Un comando per avviare tutto
2. **Portabilità**: Stesso setup su qualsiasi macchina con Docker
3. **Isolamento**: Ogni servizio nel suo container
4. **Scalabilità**: Possibilità di scalare con `docker-compose up --scale`
5. **Reproducibilità**: Stessa configurazione ovunque

---

## Riferimenti

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Nginx Docker Image](https://hub.docker.com/_/nginx)

---

*Documento generato il 30/04/2026*