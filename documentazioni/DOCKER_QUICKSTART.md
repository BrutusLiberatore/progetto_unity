# Guida Rapida - Docker Compose

## Prerequisiti
- Docker Desktop installato (Windows/Mac/Linux)
- Almeno 4GB di RAM disponibili

## Installazione

### Windows
1. Scarica **Docker Desktop** da https://docker.com
2. Installa e avvia Docker Desktop
3. Attendi che l'icona nella tray diventi verde

### Verifica installazione
```bash
docker --version
docker-compose --version
```

---

## Avvio Rapido

### 1. Configura le variabili d'ambiente
```bash
# Copia il file di esempio
cp .env.example .env

# Modifica le chiavi API se necessario
# (per ora puoi lasciare i valori di default per test)
```

### 2. Avvia tutti i servizi
```bash
docker-compose up -d
```

### 3. Verifica che tutto funzioni
```bash
# Database
curl http://localhost:5432

# Backend
curl http://localhost:3001/api/health

# Frontend
curl http://localhost:5173
```

### 4. Accedi all'applicazione
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

---

## Fermare i Servizi

```bash
# Ferma tutti i servizi (mantiene i dati)
docker-compose down

# Ferma e cancella i dati (ATTENZIONE!)
docker-compose down -v
```

---

## Comandi Daily

| Azione | Comando |
|--------|---------|
| Avvia | `docker-compose up -d` |
| Stop | `docker-compose down` |
| Riavvia | `docker-compose restart` |
| Log | `docker-compose logs -f` |
| Status | `docker-compose ps` |
| Build | `docker-compose up --build` |

---

## Problemi Comuni

### "Port already in use"
```bash
# Trova e ferma il processo sulla porta
netstat -ano | findstr :3001
# Su Windows: Task Manager → Termina processo

# Oppure cambia la porta nel docker-compose.yml
```

### "Cannot connect to Docker daemon"
- Avvia Docker Desktop
- Verifica che il servizio sia in esecuzione

### Container in crash
```bash
# Mostra i log del container specifico
docker-compose logs backend
docker-compose logs postgres
```

---

## Struttura dei Container

| Servizio | Container | Porta |
|----------|-----------|-------|
| PostgreSQL | gameshop-db | 5432 |
| Backend | gameshop-backend | 3001 |
| Frontend | gameshop-frontend | 5173 |

---

*Per dettagli vedere DOCKER.md*