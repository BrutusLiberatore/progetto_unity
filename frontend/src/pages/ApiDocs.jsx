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
      { method: 'GET', path: '/api/leaderboard/national', desc: 'Classifica nazionale top 100', auth: false },
      { method: 'POST', path: '/api/leaderboard/update', desc: 'Aggiorna punteggio utente', auth: true, body: { userId: 1, score: 100 } },
      { method: 'POST', path: '/api/leaderboard/init', desc: 'Inizializza dati test classifica', auth: true }
    ]
  }
]

const methodColors = {
  GET: 'bg-green-600',
  POST: 'bg-blue-600',
  PUT: 'bg-yellow-600',
  DELETE: 'bg-red-600'
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

      setResponse({
        status,
        headers: responseHeaders,
        data,
        ok: res.ok
      })
    } catch (err) {
      setResponse({
        status: 0,
        headers: {},
        data: { error: err.message },
        ok: false
      })
    } finally {
      setLoading(false)
    }
  }

  const selectEndpoint = (endpoint) => {
    setMethod(endpoint.method)
    setUrl(`http://localhost:3001${endpoint.path}`)
    setSelectedEndpoint(endpoint)
    if (endpoint.body) {
      setBody(JSON.stringify(endpoint.body, null, 2))
    } else {
      setBody('')
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-yellow-500 mb-8">API Documentation</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Endpoint Disponibili</h2>
          <div className="space-y-6">
            {endpoints.map(section => (
              <div key={section.category}>
                <h3 className="text-xl font-semibold text-[#D7CCC8] mb-2">{section.category}</h3>
                <div className="space-y-2">
                  {section.items.map((ep, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectEndpoint(ep)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedEndpoint === ep
                          ? 'bg-[#5D4037] border-yellow-500'
                          : 'bg-[#3E2723] border-[#4E342E] hover:bg-[#4E342E]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold text-white ${methodColors[ep.method]}`}>
                          {ep.method}
                        </span>
                        <code className="text-[#D7CCC8] text-sm">{ep.path}</code>
                        {ep.auth && <span className="text-xs text-yellow-500">[Auth]</span>}
                      </div>
                      <p className="text-[#BCAAA4] text-sm mt-1">{ep.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">API Tester</h2>
          <div className="bg-[#3E2723] rounded-lg p-4 space-y-4">
            <div className="flex gap-2">
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="bg-[#4E342E] text-white px-3 py-2 rounded-lg border border-[#5D4037]"
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
                className="flex-1 bg-[#4E342E] text-white px-3 py-2 rounded-lg border border-[#5D4037]"
                placeholder="URL"
              />
            </div>

            <div>
              <label className="text-[#D7CCC8] text-sm mb-1 block">Headers (JSON)</label>
              <textarea
                value={headers}
                onChange={e => setHeaders(e.target.value)}
                className="w-full bg-[#4E342E] text-white px-3 py-2 rounded-lg border border-[#5D4037] font-mono text-sm"
                rows={4}
              />
            </div>

            {['POST', 'PUT'].includes(method) && (
              <div>
                <label className="text-[#D7CCC8] text-sm mb-1 block">Body (JSON)</label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  className="w-full bg-[#4E342E] text-white px-3 py-2 rounded-lg border border-[#5D4037] font-mono text-sm"
                  rows={8}
                  placeholder='{"key": "value"}'
                />
              </div>
            )}

            <button
              onClick={sendRequest}
              disabled={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Invio...' : 'SEND'}
            </button>

            {response && (
              <div className="mt-4">
                <div className={`flex items-center gap-2 mb-2 ${response.ok ? 'text-green-400' : 'text-red-400'}`}>
                  <span className="font-bold">Status: {response.status}</span>
                  <span>{response.ok ? 'OK' : 'ERROR'}</span>
                </div>
                <div className="bg-[#2C1810] rounded-lg p-3">
                  <pre className="text-[#D7CCC8] text-sm overflow-x-auto whitespace-pre-wrap">
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
