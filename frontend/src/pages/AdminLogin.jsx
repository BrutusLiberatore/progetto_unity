import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:3001'

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Inserisci email e password')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Errore durante il login')
        return
      }

      localStorage.setItem('admin_token', data.token)
      onLogin(data.token)
      navigate('/admin')
    } catch (err) {
      setError('Impossibile connettersi al server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="pixel-modal w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="font-pixel text-game-gold text-2xl mb-2" style={{textShadow: '2px 2px 0 #0a0c10'}}>ADMIN LOGIN</h1>
          <div className="pixel-divider max-w-[120px] mx-auto mb-2"></div>
          <p className="text-game-text-dim text-[10px] uppercase tracking-wider">Accesso riservato agli amministratori</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">Email Admin</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="pixel-input w-full px-3 py-2 text-sm"
              placeholder="admin@esempio.com"
            />
          </div>

          <div>
            <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="pixel-input w-full px-3 py-2 text-sm"
              placeholder="Password admin"
            />
          </div>

          {error && (
            <div className="bg-game-red/10 border border-game-red p-2 text-game-red text-xs">
              {error}
            </div>
          )}

          <button type="submit" className="pixel-btn w-full py-3 text-xs" disabled={loading}>
            {loading ? 'LOADING...' : 'ACCEDI'}
          </button>
        </form>

        <p className="text-center mt-4 text-game-text-dim text-[10px]">
          <a href="/" className="text-game-gold hover:text-game-gold-light">TORNA AL NEGOZIO</a>
        </p>
      </div>
    </div>
  )
}
