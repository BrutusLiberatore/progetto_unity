import { useState } from 'react'
import CheckoutForm from './CheckoutForm'

const API_URL = 'http://localhost:3001'

export default function CartModal({ cart, total, onClose, onUpdateQuantity, onRemove, onLogin, onClearCart, user }) {
  const [checkout, setCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [needsLogin, setNeedsLogin] = useState(false)

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="pixel-modal w-full max-w-lg p-8 text-center" onClick={e => e.stopPropagation()}>
          <img src="/sprites/sword.png" alt="" className="w-16 h-16 mx-auto mb-4" style={{imageRendering: 'pixelated'}} />
          <h2 className="font-pixel text-game-gold text-xl mb-3" style={{textShadow: '2px 2px 0 #0a0c10'}}>PAGAMENTO RIUSCITO!</h2>
          <p className="text-game-text-dim text-sm mb-6">Grazie per il tuo acquisto. I doboloni d'oro verranno aggiunti al tuo account.</p>
          <button onClick={onClose} className="pixel-btn px-8 py-3 text-xs">CHIUDI</button>
        </div>
      </div>
    )
  }

  if (needsLogin) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="pixel-modal w-full max-w-md p-8 text-center" onClick={e => e.stopPropagation()}>
          <h2 className="font-pixel text-game-gold text-lg mb-3" style={{textShadow: '2px 2px 0 #0a0c10'}}>ACCESSO RICHIESTO</h2>
          <p className="text-game-text-dim text-sm mb-6">Devi effettuare il login per completare l'acquisto.</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => { onLogin(); onClose(); }} className="pixel-btn px-6 py-2 text-xs">ACCEDI</button>
            <button onClick={onClose} className="pixel-btn-dark px-6 py-2 text-xs">ANNULLA</button>
          </div>
        </div>
      </div>
    )
  }

  if (cart.length === 0 && !checkout) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="pixel-modal w-full max-w-md p-8 text-center" onClick={e => e.stopPropagation()}>
          <h2 className="font-pixel text-game-gold text-lg mb-3" style={{textShadow: '2px 2px 0 #0a0c10'}}>CARRELLO VUOTO</h2>
          <p className="text-game-text-dim text-sm mb-6">Aggiungi dei prodotti!</p>
          <button onClick={onClose} className="pixel-btn px-8 py-3 text-xs">CHIUDI</button>
        </div>
      </div>
    )
  }

  const handleCheckout = async () => {
    if (!user) {
      setNeedsLogin(true)
      return
    }

    setLoading(true)
    try {
      const items = cart.map(item => ({
        id: item.id,
        quantity: item.quantity
      }))

      const orderRes = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, userId: user.id })
      })

      if (!orderRes.ok) {
        const err = await orderRes.json()
        throw new Error(err.error || 'Errore nella creazione dell\'ordine')
      }

      const orderData = await orderRes.json()
      const orderId = orderData.orderId

      const intentRes = await fetch(`${API_URL}/api/payments/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })

      if (!intentRes.ok) {
        const err = await intentRes.json()
        throw new Error(err.error || 'Errore nella creazione del pagamento')
      }

      const intentData = await intentRes.json()
      setClientSecret(intentData.clientSecret)
      setCheckout(true)
    } catch (err) {
      alert('Errore: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      await fetch(`${API_URL}/api/payments/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId })
      })
    } catch (e) {
      console.warn('Confirm fallback:', e)
    }
    if (onClearCart) onClearCart()
    setSuccess(true)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="pixel-modal w-full max-w-3xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b-2 border-game-border">
          <h2 className="font-pixel text-game-gold text-lg" style={{textShadow: '2px 2px 0 #0a0c10'}}>
            {checkout ? 'PAGAMENTO' : 'IL TUO CARRELLO'}
          </h2>
          <button onClick={onClose} className="pixel-btn-dark px-2 py-1 text-[10px]">X</button>
        </div>

        {!checkout ? (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="pixel-card p-4 flex items-center gap-4">
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-contain border border-game-border p-1 bg-game-surface" style={{imageRendering: 'pixelated'}} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-pixel text-game-text text-sm truncate">{item.name}</h3>
                      <p className="text-game-text-dim text-[10px] truncate">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="pixel-btn-dark w-8 h-8 flex items-center justify-center text-xs">-</button>
                      <span className="font-pixel text-game-text text-sm w-8 text-center">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="pixel-btn-dark w-8 h-8 flex items-center justify-center text-xs">+</button>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="pixel-price text-sm">{((item.priceCents * item.quantity) / 100).toFixed(2)} EUR</p>
                      <button onClick={() => onRemove(item.id)} className="text-game-red text-[10px] hover:text-game-red/80 mt-1">RIMUOVI</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t-2 border-game-border p-4 bg-game-surface">
              <div className="flex justify-between items-center mb-4">
                <span className="text-game-text-dim text-xs font-pixel">PRODOTTI: {cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                <span className="pixel-price text-lg">TOTALE: {(total / 100).toFixed(2)} EUR</span>
              </div>
              <button onClick={handleCheckout} disabled={loading} className="pixel-btn w-full py-3 text-sm">
                {loading ? 'LOADING...' : "PROCEDI ALL'ACQUISTO"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <CheckoutForm
              clientSecret={clientSecret}
              total={total}
              onSuccess={handlePaymentSuccess}
              onBack={() => setCheckout(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
