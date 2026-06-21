import { useState } from 'react'

const API_URL = 'http://localhost:3001'

export default function AuthModal({ mode, onClose, onSwitch, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifyMode, setVerifyMode] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Inserisci email e password')
      return
    }

    if (mode === 'register') {
      if (!username) {
        setError('Inserisci un username')
        return
      }
      if (password !== confirmPassword) {
        setError('Le password non corrispondono')
        return
      }
      if (password.length < 6) {
        setError('La password deve essere di almeno 6 caratteri')
        return
      }
    }

    setLoading(true)

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login' 
        ? { email, password }
        : { email, password, username }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Errore durante l\'autenticazione')
        setLoading(false)
        return
      }

      if (mode === 'login') {
        const userWithAvatar = {
          ...data.user,
          avatarUrl: data.user.avatarUrl || ''
        }
        onLogin(userWithAvatar, data.token)
      } else {
        if (data.needsVerification) {
          setPendingEmail(email)
          setVerifyMode(true)
          setError('')
        } else {
          alert('Registrazione completata! Ora effettua il login.')
          onSwitch()
        }
      }
    } catch (err) {
      setError('Impossibile connettersi al server')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')

    if (!verificationCode || verificationCode.length !== 6) {
      setError('Inserisci il codice a 6 cifre')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, code: verificationCode })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Codice non valido')
        setLoading(false)
        return
      }

      const userWithAvatar = {
        ...data.user,
        avatarUrl: data.user.avatarUrl || ''
      }
      onLogin(userWithAvatar, data.token)
    } catch (err) {
      setError('Impossibile connettersi al server')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')

    try {
      const res = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail })
      })

      const data = await res.json()

      if (res.ok) {
        alert('Codice reinviato! Controlla la tua email.')
      } else {
        setError(data.message || 'Errore')
      }
    } catch (err) {
      setError('Impossibile connettersi al server')
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Inserisci la tua email')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (res.ok) {
        setForgotPasswordMode(false)
        setResetMode(true)
        setPendingEmail(email)
        setError('')
      } else {
        setError(data.message || 'Errore')
      }
    } catch (err) {
      setError('Impossibile connettersi al server')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (!verificationCode || verificationCode.length !== 6) {
      setError('Inserisci il codice a 6 cifre')
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError('Le password non corrispondono')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, code: verificationCode, newPassword })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Errore')
        setLoading(false)
        return
      }

      alert('Password resettata! Ora accedi con la nuova password.')
      onClose()
    } catch (err) {
      setError('Impossibile connettersi al server')
    } finally {
      setLoading(false)
    }
  }

  const handleSwitch = () => {
    setError('')
    setEmail('')
    setPassword('')
    setUsername('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setVerifyMode(false)
    setVerificationCode('')
    setPendingEmail('')
    setResetMode(false)
    setForgotPasswordMode(false)
    setNewPassword('')
    setConfirmNewPassword('')
    onSwitch()
  }

  if (forgotPasswordMode) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="modal-wood w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">Reset Password</h2>
            <button onClick={onClose} className="btn btn-sm btn-circle bg-[#3E2723] text-white">X</button>
          </div>

          <div className="space-y-4">
            <p className="text-black">
              Inserisci la tua email e ti invieremo un codice per resettare la password.
            </p>

            <div>
              <label className="block text-black font-semibold mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input input-bordered w-full bg-[#8D6E63] border-[#5D4037] text-black placeholder:text-black/50"
                placeholder="email@esempio.com"
              />
            </div>

            {error && (
              <div className="alert alert-error text-sm">
                <span>{error}</span>
              </div>
            )}

            <button onClick={handleForgotPassword} className="btn btn-gold w-full" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : 'Invia Codice'}
            </button>

            <div className="text-center">
              <button onClick={() => setForgotPasswordMode(false)} className="text-yellow-600 hover:underline">
                Torna al login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (verifyMode) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="modal-wood w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">Verifica Email</h2>
            <button onClick={onClose} className="btn btn-sm btn-circle bg-[#3E2723] text-white">X</button>
          </div>

          <div className="space-y-4">
            <p className="text-black">
              Abbiamo inviato un codice di verifica a <strong>{pendingEmail}</strong>.
              <br />Inserisci il codice qui sotto.
            </p>

            <div>
              <label className="block text-black font-semibold mb-1">Codice di verifica</label>
              <input 
                type="text" 
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input input-bordered w-full bg-[#8D6E63] border-[#5D4037] text-black text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="alert alert-error text-sm">
                <span>{error}</span>
              </div>
            )}

            <button onClick={handleVerify} className="btn btn-gold w-full" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : 'Verifica'}
            </button>

            <div className="flex justify-between text-sm">
              <button onClick={() => setVerifyMode(false)} className="text-yellow-600 hover:underline">
                Torna indietro
              </button>
              <button onClick={handleResend} className="text-yellow-600 hover:underline">
                Reinvia codice
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (resetMode) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="modal-wood w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">Nuova Password</h2>
            <button onClick={onClose} className="btn btn-sm btn-circle bg-[#3E2723] text-white">X</button>
          </div>

          <div className="space-y-4">
            <p className="text-black">
              Inserisci il codice inviato a <strong>{pendingEmail}</strong> e la nuova password.
            </p>

            <div>
              <label className="block text-black font-semibold mb-1">Codice</label>
              <input 
                type="text" 
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input input-bordered w-full bg-[#8D6E63] border-[#5D4037] text-black text-center text-xl tracking-widest font-mono"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <div>
              <label className="block text-black font-semibold mb-1">Nuova Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="input input-bordered w-full bg-[#8D6E63] border-[#5D4037] text-black"
                placeholder="Nuova password"
              />
            </div>

            <div>
              <label className="block text-black font-semibold mb-1">Conferma Password</label>
              <input 
                type="password" 
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                className="input input-bordered w-full bg-[#8D6E63] border-[#5D4037] text-black"
                placeholder="Conferma password"
              />
            </div>

            {error && (
              <div className="alert alert-error text-sm">
                <span>{error}</span>
              </div>
            )}

            <button onClick={handleResetPassword} className="btn btn-gold w-full" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : 'Resetta Password'}
            </button>

            <div className="text-center">
              <button onClick={() => setResetMode(false)} className="text-yellow-600 hover:underline">
                Torna indietro
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="modal-wood w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">
            {mode === 'login' ? 'Accedi' : 'Registrati'}
          </h2>
          <button onClick={onClose} className="btn btn-sm btn-circle bg-[#3E2723] text-white">X</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-black font-semibold mb-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input input-bordered w-full bg-[#8D6E63] border-[#5D4037] text-black placeholder:text-black/50"
                placeholder="Il tuo username"
              />
            </div>
          )}
          
          <div>
            <label className="block text-black font-semibold mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input input-bordered w-full bg-[#8D6E63] border-[#5D4037] text-black placeholder:text-black/50"
              placeholder="email@esempio.com"
            />
          </div>
          
          <div>
            <label className="block text-black font-semibold mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input input-bordered w-full bg-[#8D6E63] border-[#5D4037] text-black placeholder:text-black/50 pr-10"
                placeholder="Password"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-black/60 hover:text-black"
              >
                {showPassword ? 'Nascondi' : 'Mostra'}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-black font-semibold mb-1">Conferma Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="input input-bordered w-full bg-[#8D6E63] border-[#5D4037] text-black placeholder:text-black/50 pr-10"
                  placeholder="Conferma password"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-black/60 hover:text-black"
                >
                  {showConfirmPassword ? 'Nascondi' : 'Mostra'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn btn-gold w-full" disabled={loading}>
            {loading ? <span className="loading loading-spinner"></span> : (mode === 'login' ? 'Accedi' : 'Registrati')}
          </button>
        </form>

        {mode === 'login' && (
          <div className="text-center mt-2">
            <button onClick={() => setForgotPasswordMode(true)} className="text-sm text-yellow-600 hover:underline">
              Password dimenticata?
            </button>
          </div>
        )}

        <p className="text-center mt-4 text-[#3E2723]">
          {mode === 'login' ? (
            <>Non hai un account? <button onClick={handleSwitch} className="text-yellow-600 font-bold hover:underline">Registrati</button></>
          ) : (
            <>Hai gia un account? <button onClick={handleSwitch} className="text-yellow-600 font-bold hover:underline">Accedi</button></>
          )}
        </p>
      </div>
    </div>
  )
}