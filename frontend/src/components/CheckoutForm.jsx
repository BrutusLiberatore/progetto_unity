import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '14px',
      fontFamily: 'BoldPixels, monospace',
      color: '#d0d0d0',
      backgroundColor: '#0e1016',
      '::placeholder': {
        color: '#4a4d55',
      },
    },
    invalid: {
      color: '#c0392b',
    },
  },
}

export default function CheckoutForm({ clientSecret, total, onSuccess, onBack }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!stripe || !elements) {
      setLoading(false)
      return
    }

    const cardElement = elements.getElement(CardElement)

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      }
    })

    if (stripeError) {
      setError(stripeError.message)
      setLoading(false)
    } else if (paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-game-surface p-4 border-2 border-game-border">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {error && (
        <div className="bg-game-red/10 border border-game-red p-3 text-game-red text-xs">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button type="button" onClick={onBack} className="pixel-btn-dark flex-1 py-3 text-xs">
          INDIETRO
        </button>
        <button type="submit" disabled={!stripe || loading} className="pixel-btn flex-1 py-3 text-xs">
          {loading ? 'LOADING...' : `PAGA ${(total / 100).toFixed(2)} EUR`}
        </button>
      </div>
    </form>
  )
}
