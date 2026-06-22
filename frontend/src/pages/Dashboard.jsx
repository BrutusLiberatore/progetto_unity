import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3001'

function Sprite({ src, size = 20, className = '' }) {
  return <img src={src} alt="" className={`inline-block ${className}`} style={{ width: size, height: size, imageRendering: 'pixelated' }} />
}

export default function Dashboard({ user, cart }) {
  const [orders, setOrders] = useState([])

  const fetchOrders = () => {
    if (!user?.id) return
    fetch(`${API_URL}/api/orders/user/${user.id}`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error('Error:', err))
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="pixel-card p-6 max-w-sm w-full text-center border-game-red border-2">
          <h2 className="font-pixel text-game-red text-sm mb-2">ACCESSO NEGATO</h2>
          <p className="text-game-text-dim text-[10px]">Effettua il login per accedere alla dashboard</p>
        </div>
      </div>
    )
  }

  const cartTotal = cart?.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0) || 0
  const completedOrders = orders.filter(o => o.status === 'COMPLETED')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 py-6">
        <h1 className="font-pixel text-game-gold text-2xl" style={{textShadow: '2px 2px 0 #0a0c10'}}>LA TUA DASHBOARD</h1>
        <button onClick={fetchOrders} className="pixel-btn px-4 py-2 text-[10px]">AGGIORNA</button>
      </div>

      {/* USER INFO */}
      <div className="pixel-card p-4 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-game-gold text-game-bg flex items-center justify-center font-pixel text-2xl border-2 border-game-gold-dark">
            {user.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="font-pixel text-game-text text-lg">{user.username}</h2>
            <p className="text-game-text-dim text-[10px]">{user.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-game-surface p-3 border border-game-border text-center">
            <Sprite src="/sprites/scepter.png" size={20} className="mx-auto mb-1" />
            <div className="font-pixel text-game-gold text-sm">{orders.length}</div>
            <div className="text-game-text-dim text-[8px] uppercase">Ordini</div>
          </div>
          <div className="bg-game-surface p-3 border border-game-border text-center">
            <Sprite src="/sprites/crossbow.png" size={20} className="mx-auto mb-1" />
            <div className="font-pixel text-game-gold text-sm">{completedOrders.length}</div>
            <div className="text-game-text-dim text-[8px] uppercase">Completati</div>
          </div>
          <div className="bg-game-surface p-3 border border-game-border text-center">
            <Sprite src="/sprites/sword.png" size={20} className="mx-auto mb-1" />
            <div className="font-pixel text-game-gold text-sm">{(completedOrders.reduce((sum, o) => sum + o.totalCents, 0) / 100).toFixed(2)} EUR</div>
            <div className="text-game-text-dim text-[8px] uppercase">Totale Speso</div>
          </div>
          <div className="bg-game-surface p-3 border border-game-border text-center">
            <Sprite src="/sprites/hammer.png" size={20} className="mx-auto mb-1" />
            <div className="font-pixel text-game-gold text-sm">{user.createdAt ? user.createdAt.split('T')[0] : '-'}</div>
            <div className="text-game-text-dim text-[8px] uppercase">Membro dal</div>
          </div>
        </div>
      </div>

      {/* CART INFO */}
      <div className="pixel-card p-4 mb-4">
        <h3 className="font-pixel text-game-text text-sm mb-2 uppercase">Carrello</h3>
        {cart && cart.length > 0 ? (
          <div className="text-game-text-dim text-[10px]">
            <span>Prodotti: {cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            <span className="mx-2">|</span>
            <span className="text-game-gold">Totale: {(cartTotal / 100).toFixed(2)} EUR</span>
          </div>
        ) : (
          <p className="text-game-text-dim text-[10px]">Carrello vuoto</p>
        )}
      </div>

      {/* ORDER HISTORY */}
      <div className="pixel-card p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-pixel text-game-text text-sm uppercase">Storico Acquisti</h3>
          <button onClick={fetchOrders} className="pixel-btn-dark px-3 py-1 text-[10px]">AGGIORNA</button>
        </div>
        {orders.length === 0 ? (
          <p className="text-game-text-dim text-[10px] text-center py-8">NESSUN ACQUISTO EFFETTUATO</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {orders.map(order => (
              <div key={order.id} className="bg-game-surface p-3 border border-game-border">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-pixel text-game-text text-xs">ORDINE #{order.id}</span>
                    <span className="text-game-text-dim text-[8px] ml-2">{order.createdAt ? order.createdAt.split('T')[0] : '-'}</span>
                  </div>
                  <span className={`pixel-badge text-[8px] ${
                    order.status === 'COMPLETED' ? 'bg-game-green/20 text-game-green border-game-green' :
                    order.status === 'PENDING' ? 'bg-game-gold/20 text-game-gold border-game-gold' :
                    'bg-game-red/20 text-game-red border-game-red'
                  }`}>
                    {order.status === 'COMPLETED' ? 'COMPLETATO' :
                     order.status === 'PENDING' ? 'IN ATTESA' : 'FALLITO'}
                  </span>
                </div>
                <div className="space-y-1">
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className="pixel-badge bg-game-gold/10 text-game-gold border-game-gold/30 text-[8px]">{item.productName}</span>
                        <span className="text-game-text-dim">x{item.quantity}</span>
                      </div>
                      <span className="text-game-text">{(item.priceCents * item.quantity / 100).toFixed(2)} EUR</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-game-border pt-2 mt-2">
                    <span className="font-pixel text-game-text text-xs">TOTALE</span>
                    <span className="pixel-price text-sm">{(order.totalCents / 100).toFixed(2)} EUR</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
