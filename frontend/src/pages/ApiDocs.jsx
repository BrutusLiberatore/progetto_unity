import { useState } from 'react'

const endpoints = [
  {
    category: 'Health',
    items: [
      { method: 'GET', path: '/api/health', desc: 'Verifica stato del backend', auth: false }
    ]
  },
  {
    category: 'Prodotti',
    items: [
      { method: 'GET', path: '/api/products', desc: 'Lista tutti i prodotti attivi', auth: false },
      { method: 'GET', path: '/api/products/{id}', desc: 'Dettaglio singolo prodotto', auth: false },
      { method: 'GET', path: '/api/products/type/{type}', desc: 'Prodotti per tipo (currency/boost)', auth: false }
    ]
  },
  {
    category: 'Auth',
    items: [
      { method: 'POST', path: '/api/auth/register', desc: 'Registrazione utente (invia codice verifica)', auth: false, body: { email: 'user@example.com', password: 'password123', username: 'player1' } },
      { method: 'POST', path: '/api/auth/verify-email', desc: 'Verifica email con codice', auth: false, body: { email: 'user@example.com', code: '123456' } },
      { method: 'POST', path: '/api/auth/resend-verification', desc: 'Reinvia codice verifica', auth: false, body: { email: 'user@example.com' } },
      { method: 'POST', path: '/api/auth/login', desc: 'Login utente (richiede email verificata)', auth: false, body: { email: 'user@example.com', password: 'password123' } },
      { method: 'POST', path: '/api/auth/forgot-password', desc: 'Richiedi reset password', auth: false, body: { email: 'user@example.com' } },
      { method: 'POST', path: '/api/auth/reset-password', desc: 'Reset password con codice', auth: false, body: { email: 'user@example.com', code: '123456', newPassword: 'newpassword123' } }
    ]
  },
  {
    category: 'Ordini',
    items: [
      { method: 'GET', path: '/api/orders', desc: 'Lista tutti gli ordini (admin)', auth: true },
      { method: 'GET', path: '/api/orders/user/{userId}', desc: 'Lista ordini di un utente', auth: true },
      { method: 'GET', path: '/api/orders/{id}', desc: 'Dettaglio ordine', auth: true }
    ]
  },
  {
    category: 'Classifica',
    items: [
      { method: 'GET', path: '/api/leaderboard/monthly', desc: 'Classifica mensile top 100', auth: false },
      { method: 'GET', path: '/api/leaderboard/global', desc: 'Classifica mondiale top 100', auth: false },
      { method: 'POST', path: '/api/leaderboard/update', desc: 'Aggiorna punteggio utente', auth: true, body: { userId: 1, score: 100 } },
    ]
  }
]

const methodColors = {
  GET: 'bg-game-green border-game-green',
  POST: 'bg-game-blue border-game-blue',
  PUT: 'bg-game-gold border-game-gold',
  DELETE: 'bg-game-red border-game-red'
}

export default function ApiDocs() {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('http://localhost:3001/api/health')
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}')
  const [body, setBody] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState(null)

  const sendRequest = async () => {
    setLoading(true)
    setResponse(null)

    try {
      const options = {
        method,
        headers: JSON.parse(headers || '{}')
      }

      if (['POST', 'PUT'].includes(method) && body) {
        options.body = body
      }

      const res = await fetch(url, options)
      const status = res.status
      const responseHeaders = Object.fromEntries(res.headers.entries())

      let data
      const contentType = res.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await res.json()
      } else {
        data = await res.text()
      }

      setResponse({ status, headers: responseHeaders, data, ok: res.ok })
    } catch (err) {
      setResponse({ status: 0, headers: {}, data: { error: err.message }, ok: false })
    } finally {
      setLoading(false)
    }
  }

  const selectEndpoint = (endpoint) => {
    setMethod(endpoint.method)
    setUrl(`http://localhost:3001${endpoint.path}`)
    setSelectedEndpoint(endpoint)
    setBody(endpoint.body ? JSON.stringify(endpoint.body, null, 2) : '')
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center py-8 mb-8">
        <h1 className="font-pixel text-game-gold text-3xl mb-2" style={{textShadow: '2px 2px 0 #0a0c10'}}>API DOCUMENTATION</h1>
        <div className="pixel-divider max-w-xs mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-pixel text-game-text text-sm mb-4 uppercase">Endpoint Disponibili</h2>
          <div className="space-y-4">
            {endpoints.map(section => (
              <div key={section.category}>
                <h3 className="font-pixel text-game-gold text-xs mb-2 uppercase">{section.category}</h3>
                <div className="space-y-2">
                  {section.items.map((ep, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectEndpoint(ep)}
                      className={`w-full text-left p-3 border transition-colors ${
                        selectedEndpoint === ep
                          ? 'bg-game-card border-game-gold'
                          : 'bg-game-surface border-game-border hover:border-game-gold/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`pixel-badge text-[8px] ${methodColors[ep.method]}`}>
                          {ep.method}
                        </span>
                        <code className="font-pixel text-game-text text-[10px]">{ep.path}</code>
                        {ep.auth && <span className="pixel-badge bg-game-gold/10 text-game-gold border-game-gold/30 text-[8px]">AUTH</span>}
                      </div>
                      <p className="text-game-text-dim text-[10px] mt-1">{ep.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-pixel text-game-text text-sm mb-4 uppercase">API Tester</h2>
          <div className="pixel-card p-4 space-y-4">
            <div className="flex gap-2">
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="pixel-input px-3 py-2 text-xs"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="flex-1 pixel-input px-3 py-2 text-xs"
                placeholder="URL"
              />
            </div>

            <div>
              <label className="font-pixel text-game-text-dim text-[10px] mb-1 block uppercase">Headers (JSON)</label>
              <textarea
                value={headers}
                onChange={e => setHeaders(e.target.value)}
                className="w-full pixel-input px-3 py-2 font-mono text-[10px] resize-none"
                rows={3}
              />
            </div>

            {['POST', 'PUT'].includes(method) && (
              <div>
                <label className="font-pixel text-game-text-dim text-[10px] mb-1 block uppercase">Body (JSON)</label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  className="w-full pixel-input px-3 py-2 font-mono text-[10px] resize-none"
                  rows={6}
                  placeholder='{"key": "value"}'
                />
              </div>
            )}

            <button onClick={sendRequest} disabled={loading} className="pixel-btn w-full py-3 text-xs">
              {loading ? 'LOADING...' : 'SEND'}
            </button>

            {response && (
              <div className="mt-4">
                <div className={`font-pixel text-xs mb-2 ${response.ok ? 'text-game-green' : 'text-game-red'}`}>
                  STATUS: {response.status} {response.ok ? 'OK' : 'ERROR'}
                </div>
                <div className="bg-game-bg p-3 border border-game-border max-h-60 overflow-auto">
                  <pre className="font-mono text-game-text text-[10px] whitespace-pre-wrap break-all">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
