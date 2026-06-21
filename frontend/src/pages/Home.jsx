import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'

const API_URL = 'http://localhost:3001'

export default function Home({ addToCart }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => {
        if (!res.ok) throw new Error('Errore nel caricamento')
        return res.json()
      })
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const handleAdd = (product) => {
    addToCart(product)
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <span className="loading loading-spinner loading-lg text-yellow-500"></span>
    </div>
  )
  
  if (error) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="alert alert-error max-w-md">
        <span>{error}</span>
      </div>
    </div>
  )

  const currencyProducts = products.filter(p => p.type === 'currency')
  const boostProducts = products.filter(p => p.type === 'boost')

  return (
    <div className="px-4 md:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-yellow-500 mb-4" style={{fontFamily: "'Firlest', cursive", letterSpacing: '2px'}}>BOLT & BONE</h1>
        <p className="text-xl text-white/80">Acquista cristalli e potenziamenti per il tuo gioco</p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 border-b border-yellow-600 pb-2">Cristalli</h2>
        {currencyProducts.length === 0 ? (
          <p className="text-white/60">Nessun prodotto disponibile</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
            {currencyProducts.map(product => (
              <ProductCard key={product.id} product={product} onAdd={handleAdd} />
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 border-b border-yellow-600 pb-2">Potenziamenti</h2>
        {boostProducts.length === 0 ? (
          <p className="text-white/60">Nessun prodotto disponibile</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
            {boostProducts.map(product => (
              <ProductCard key={product.id} product={product} onAdd={handleAdd} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}