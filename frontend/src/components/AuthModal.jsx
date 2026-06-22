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
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="pixel-modal w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-pixel text-game-gold text-lg" style={{textShadow: '2px 2px 0 #0a0c10'}}>RESET PASSWORD</h2>
            <button onClick={onClose} className="pixel-btn-dark px-2 py-1 text-[10px]">X</button>
          </div>

          <div className="space-y-4">
            <p className="text-game-text-dim text-xs">
              Inserisci la tua email e ti invieremo un codice per resettare la password.
            </p>

            <div>
              <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pixel-input w-full px-3 py-2 text-sm"
                placeholder="email@esempio.com"
              />
            </div>

            {error && (
              <div className="bg-game-red/10 border border-game-red p-2 text-game-red text-xs">
                {error}
              </div>
            )}

            <button onClick={handleForgotPassword} className="pixel-btn w-full py-3 text-xs" disabled={loading}>
              {loading ? 'LOADING...' : 'INVIA CODICE'}
            </button>

            <div className="text-center">
              <button onClick={() => setForgotPasswordMode(false)} className="text-game-gold text-[10px] hover:text-game-gold-light">
                TORNA AL LOGIN
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (verifyMode) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="pixel-modal w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-pixel text-game-gold text-lg" style={{textShadow: '2px 2px 0 #0a0c10'}}>VERIFICA EMAIL</h2>
            <button onClick={onClose} className="pixel-btn-dark px-2 py-1 text-[10px]">X</button>
          </div>

          <div className="space-y-4">
            <p className="text-game-text-dim text-xs">
              Abbiamo inviato un codice di verifica a <strong className="text-game-gold">{pendingEmail}</strong>.
              Inserisci il codice qui sotto.
            </p>

            <div>
              <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">Codice di verifica</label>
              <input
                type="text"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="pixel-input w-full px-3 py-3 text-center text-2xl tracking-[0.5em] font-pixel"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="bg-game-red/10 border border-game-red p-2 text-game-red text-xs">
                {error}
              </div>
            )}

            <button onClick={handleVerify} className="pixel-btn w-full py-3 text-xs" disabled={loading}>
              {loading ? 'LOADING...' : 'VERIFICA'}
            </button>

            <div className="flex justify-between text-[10px]">
              <button onClick={() => setVerifyMode(false)} className="text-game-gold hover:text-game-gold-light">
                TORNA INDIETRO
              </button>
              <button onClick={handleResend} className="text-game-gold hover:text-game-gold-light">
                REINVIA CODICE
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (resetMode) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="pixel-modal w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-pixel text-game-gold text-lg" style={{textShadow: '2px 2px 0 #0a0c10'}}>NUOVA PASSWORD</h2>
            <button onClick={onClose} className="pixel-btn-dark px-2 py-1 text-[10px]">X</button>
          </div>

          <div className="space-y-4">
            <p className="text-game-text-dim text-xs">
              Inserisci il codice inviato a <strong className="text-game-gold">{pendingEmail}</strong> e la nuova password.
            </p>

            <div>
              <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">Codice</label>
              <input
                type="text"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="pixel-input w-full px-3 py-2 text-center text-xl tracking-[0.5em] font-pixel"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <div>
              <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">Nuova Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="pixel-input w-full px-3 py-2 text-sm"
                placeholder="Nuova password"
              />
            </div>

            <div>
              <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">Conferma Password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                className="pixel-input w-full px-3 py-2 text-sm"
                placeholder="Conferma password"
              />
            </div>

            {error && (
              <div className="bg-game-red/10 border border-game-red p-2 text-game-red text-xs">
                {error}
              </div>
            )}

            <button onClick={handleResetPassword} className="pixel-btn w-full py-3 text-xs" disabled={loading}>
              {loading ? 'LOADING...' : 'RESETTA PASSWORD'}
            </button>

            <div className="text-center">
              <button onClick={() => setResetMode(false)} className="text-game-gold text-[10px] hover:text-game-gold-light">
                TORNA INDIETRO
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="pixel-modal w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-pixel text-game-gold text-lg" style={{textShadow: '2px 2px 0 #0a0c10'}}>
            {mode === 'login' ? 'ACCEDI' : 'REGISTRATI'}
          </h2>
          <button onClick={onClose} className="pixel-btn-dark px-2 py-1 text-[10px]">X</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="pixel-input w-full px-3 py-2 text-sm"
                placeholder="Il tuo username"
              />
            </div>
          )}

          <div>
            <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="pixel-input w-full px-3 py-2 text-sm"
              placeholder="email@esempio.com"
            />
          </div>

          <div>
            <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pixel-input w-full px-3 py-2 text-sm pr-16"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-game-text-dim text-[10px] hover:text-game-gold"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">Conferma Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="pixel-input w-full px-3 py-2 text-sm pr-16"
                  placeholder="Conferma password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-game-text-dim text-[10px] hover:text-game-gold"
                >
                  {showConfirmPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-game-red/10 border border-game-red p-2 text-game-red text-xs">
              {error}
            </div>
          )}

          <button type="submit" className="pixel-btn w-full py-3 text-xs" disabled={loading}>
            {loading ? 'LOADING...' : (mode === 'login' ? 'ACCEDI' : 'REGISTRATI')}
          </button>
        </form>

        {mode === 'login' && (
          <div className="text-center mt-3">
            <button onClick={() => setForgotPasswordMode(true)} className="text-game-gold text-[10px] hover:text-game-gold-light">
              PASSWORD DIMENTICATA?
            </button>
          </div>
        )}

        <p className="text-center mt-4 text-game-text-dim text-[10px]">
          {mode === 'login' ? (
            <>Non hai un account? <button onClick={handleSwitch} className="text-game-gold font-bold hover:text-game-gold-light">REGISTRATI</button></>
          ) : (
            <>Hai gia un account? <button onClick={handleSwitch} className="text-game-gold font-bold hover:text-game-gold-light">ACCEDI</button></>
          )}
        </p>
      </div>
    </div>
  )
}
