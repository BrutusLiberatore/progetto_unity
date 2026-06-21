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

      // Salva il token JWT admin
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#6D4C41] to-[#4E342E] p-4">
      <div className="card-wood w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-[#3E2723] text-center mb-2">Admin Login</h1>
        <p className="text-[#3E2723]/70 text-center mb-6">Accesso riservato agli amministratori</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#3E2723] font-semibold mb-1">Email Admin</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input input-bordered w-full bg-[#4E342E] border-[#3E2723] text-[#3E2723]"
              placeholder="admin@esempio.com"
            />
          </div>
          
          <div>
            <label className="block text-[#3E2723] font-semibold mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input input-bordered w-full bg-[#4E342E] border-[#3E2723] text-[#3E2723]"
              placeholder="Password admin"
            />
          </div>

          {error && (
            <div className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn btn-gold w-full" disabled={loading}>
            {loading ? <span className="loading loading-spinner"></span> : 'Accedi'}
          </button>
        </form>

        <p className="text-center mt-4 text-[#3E2723]/70 text-sm">
          <a href="/" className="hover:underline">Torna al negozio</a>
        </p>
      </div>
    </div>
  )
}