export default function ProductCard({ product, onAdd }) {
  const isCurrency = product.type === 'currency'
  const price = (product.priceCents / 100).toFixed(2) + ' EUR'

  return (
    <div className="pixel-card overflow-hidden w-full">
      <div className="bg-game-surface h-48 flex items-center justify-center p-4 border-b-2 border-game-border relative">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" style={{imageRendering: 'pixelated'}} />
        ) : (
          <div className="text-game-text-dim font-pixel text-xs">NO IMAGE</div>
        )}
        <div className={`absolute top-2 left-2 pixel-badge ${
          isCurrency
            ? 'bg-game-gold/20 text-game-gold border-game-gold'
            : 'bg-game-red/20 text-game-red border-game-red'
        }`}>
          {isCurrency ? 'DOBOLONI' : 'BOOST'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-pixel text-game-text text-sm mb-1 uppercase">{product.name}</h3>
        <p className="text-game-text-dim text-[10px] mb-3 leading-relaxed">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="pixel-price">{price}</span>
          <button onClick={() => onAdd(product)} className="pixel-btn px-4 py-2 text-[10px]">
            AGGIUNGI
          </button>
        </div>
      </div>
    </div>
  )
}
