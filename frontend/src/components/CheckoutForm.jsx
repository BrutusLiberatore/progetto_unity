import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#000000',
      '::placeholder': {
        color: '#5D4037',
      },
    },
    invalid: {
      color: '#d32f2f',
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
      <div className="bg-white p-4 rounded-lg border-2 border-[#5D4037]">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-md bg-[#5D4037] text-white flex-1"
        >
          Indietro
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="btn btn-gold flex-1 text-xl"
        >
          {loading ? 'Elaborazione...' : `Paga ${(total / 100).toFixed(2)} EUR`}
        </button>
      </div>
    </form>
  )
}