export default function ProductCard({ product, onAdd }) {
  const isCurrency = product.type === 'currency'
  const badgeColor = isCurrency ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
  const price = (product.priceCents / 100).toFixed(2) + ' EUR'

  return (
    <div className="card-wood shadow-xl overflow-hidden hover:scale-105 transition-transform duration-300 w-full">
      <figure className="bg-[#5D4037] h-48 flex items-center justify-center p-2">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
        ) : (
          <div className="text-white">Nessuna immagine</div>
        )}
      </figure>
      <div className="card-body p-4">
        <div className={`badge ${badgeColor} mb-2`}>
          {isCurrency ? 'Valuta' : 'Potenziamento'}
        </div>
        <h3 className="card-title text-black text-lg">{product.name}</h3>
        <p className="text-black/70 text-sm mb-3">{product.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-2xl font-bold text-black">{price}</span>
          <button onClick={() => onAdd(product)} className="btn btn-gold btn-sm">
            Aggiungi
          </button>
        </div>
      </div>
    </div>
  )
}