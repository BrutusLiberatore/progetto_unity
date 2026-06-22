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
      <div className="font-pixel text-game-gold animate-pulse">LOADING...</div>
    </div>
  )

  if (error) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="pixel-card p-6 border-game-red border-2 max-w-md text-center">
        <p className="font-pixel text-game-red text-sm mb-2">ERROR</p>
        <p className="text-game-text-dim text-[10px]">{error}</p>
      </div>
    </div>
  )

  const currencyProducts = products.filter(p => p.type === 'currency')
  const boostProducts = products.filter(p => p.type === 'boost')

  return (
    <div className="px-4 md:px-8 max-w-6xl mx-auto">
      {/* HERO */}
      <div className="text-center py-16 mb-12 relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <img src="/sprites/sword.png" alt="" className="w-64 h-64" style={{imageRendering: 'pixelated'}} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src="/sprites/sword.png" alt="" className="w-12 h-12 hidden sm:block" style={{imageRendering: 'pixelated'}} />
            <h1 className="game-title text-game-gold text-5xl md:text-7xl font-pixel">
              BOLT & BONE
            </h1>
            <img src="/sprites/axe.png" alt="" className="w-12 h-12 hidden sm:block" style={{imageRendering: 'pixelated'}} />
          </div>
          <p className="font-pixel text-game-text-dim text-xs uppercase tracking-widest mb-2">Negozio ufficiale</p>
          <div className="pixel-divider max-w-xs mx-auto"></div>
          <p className="text-game-text-dim text-sm mt-4">Acquista doboloni d'oro e potenziamenti per il tuo gioco</p>
        </div>
      </div>

      {/* CRISTALLI */}
      <section className="mb-16">
        <h2 className="pixel-section-title text-lg mb-8 flex items-center gap-3">
          <img src="/sprites/scepter.png" alt="" className="w-6 h-6" style={{imageRendering: 'pixelated'}} />
          DOBOLONI D'ORO
        </h2>
        {currencyProducts.length === 0 ? (
          <p className="text-game-text-dim font-pixel text-xs text-center py-8">NESSUN PRODOTTO DISPONIBILE</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
            {currencyProducts.map(product => (
              <ProductCard key={product.id} product={product} onAdd={handleAdd} />
            ))}
          </div>
        )}
      </section>

      {/* POTENZIAMENTI */}
      <section className="mb-16">
        <h2 className="pixel-section-title text-lg mb-8 flex items-center gap-3">
          <img src="/sprites/hammer.png" alt="" className="w-6 h-6" style={{imageRendering: 'pixelated'}} />
          POTENZIAMENTI
        </h2>
        {boostProducts.length === 0 ? (
          <p className="text-game-text-dim font-pixel text-xs text-center py-8">NESSUN PRODOTTO DISPONIBILE</p>
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
