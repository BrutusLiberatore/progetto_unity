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
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="modal-wood w-full max-w-lg p-10 text-center" onClick={e => e.stopPropagation()}>
          <img src="/sprites/sword.png" alt="" className="w-16 h-16 mx-auto mb-6" style={{ imageRendering: 'pixelated' }} />
          <h2 className="text-3xl font-bold text-black mb-4">Pagamento Riuscito!</h2>
          <p className="text-black/70 text-lg mb-6">Grazie per il tuo acquisto. I cristalli verranno aggiunti al tuo account.</p>
          <button onClick={onClose} className="btn btn-gold btn-lg">Chiudi</button>
        </div>
      </div>
    )
  }

  if (needsLogin) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="modal-wood w-full max-w-md p-8 text-center" onClick={e => e.stopPropagation()}>
          <h2 className="text-2xl font-bold text-black mb-4">Accesso Richiesto</h2>
          <p className="text-black/70 mb-6">Devi effettuare il login per completare l'acquisto.</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => {
                onLogin()
                onClose()
              }} 
              className="btn btn-gold"
            >
              Accedi
            </button>
            <button onClick={onClose} className="btn btn-outline border-black text-black">Annulla</button>
          </div>
        </div>
      </div>
    )
  }

  if (cart.length === 0 && !checkout) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="modal-wood w-full max-w-md p-8 text-center" onClick={e => e.stopPropagation()}>
          <h2 className="text-2xl font-bold text-black mb-4">Carrello Vuoto</h2>
          <p className="text-black/70 mb-6">Aggiungi dei prodotti!</p>
          <button onClick={onClose} className="btn btn-gold">Chiudi</button>
        </div>
      </div>
    )
  }

  const handleCheckout = async () => {
    // Check if user is logged in first
    if (!user) {
      setNeedsLogin(true)
      return
    }

    console.log('Starting checkout for user:', user.id, user)

    setLoading(true)
    try {
      // 1. Crea l'ordine nel database (include userId)
      const items = cart.map(item => ({
        id: item.id,
        quantity: item.quantity
      }))

      console.log('Creating order with items:', items, 'and userId:', user.id)

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
      console.log('Order created:', orderData)
      const orderId = orderData.orderId

      // 2. Crea il PaymentIntent di Stripe
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
      console.log('PaymentIntent created:', intentData)
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
      <div 
        className="modal-wood w-full max-w-3xl h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b-4 border-[#5D4037]">
          <h2 className="text-3xl font-bold text-black">
            {checkout ? 'Pagamento' : 'Il tuo Carrello'}
          </h2>
          <button onClick={onClose} className="btn btn-lg btn-circle bg-[#3E2723] text-white">X</button>
        </div>

        {!checkout ? (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="card-wood p-4 flex items-center gap-4">
                    <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h3 className="font-bold text-black text-lg">{item.name}</h3>
                      <p className="text-black/70">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="btn btn-md bg-[#3E2723] text-white">-</button>
                      <span className="font-bold text-black text-xl w-12 text-center">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="btn btn-md bg-[#3E2723] text-white">+</button>
                    </div>
                    <div className="text-right min-w-[140px]">
                      <p className="text-black font-bold text-2xl">{((item.priceCents * item.quantity) / 100).toFixed(2)} EUR</p>
                      <button onClick={() => onRemove(item.id)} className="text-red-600 text-sm hover:underline">Rimuovi</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t-4 border-[#5D4037] p-6 bg-[#BCAAA4]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-black text-lg">Numero prodotti: {cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                <span className="text-3xl font-bold text-black">Totale: <span className="text-black text-4xl">{(total / 100).toFixed(2)} EUR</span></span>
              </div>
              <button 
                onClick={handleCheckout} 
                disabled={loading}
                className="btn btn-gold w-full text-xl py-4"
              >
                {loading ? 'Elaborazione...' : "Procedi all'acquisto"}
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