import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3001'

function Sprite({ src, size = 20, className = '' }) {
  return <img src={src} alt="" className={`inline-block ${className}`} style={{ width: size, height: size, imageRendering: 'pixelated' }} />
}

export default function Dashboard({ user, cart }) {
  const [orders, setOrders] = useState([])
  const [gameStats, setGameStats] = useState(null)

  const fetchOrders = () => {
    if (!user?.id) return
    fetch(`${API_URL}/api/orders/user/${user.id}`)
      .then(res => res.json())
      .then(data => {
        console.log('Orders:', data)
        setOrders(data)
      })
      .catch(err => console.error('Error:', err))
  }

  const fetchGameStats = () => {
    const testStats = {
      playerLevel: 42,
      totalCrystals: 15420,
      totalGames: 1250,
      wins: 876,
      winRate: 70.1,
      bestScore: 15420,
      currentRank: "Diamante II",
      rankSprite: "/sprites/scepter.png",
      playTime: "48h 32m",
      achievements: 28,
      favoriteMode: "Arena",
      streak: 12,
      lastPlayed: "2026-05-07"
    }
    setGameStats(testStats)
  }

  useEffect(() => {
    console.log('Dashboard mounted, fetching orders...')
    fetchOrders()
    fetchGameStats()
  }, [])

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="card-wood p-6 max-w-sm w-full text-center">
          <h2 className="text-xl font-bold text-black mb-2">Accesso Negato</h2>
          <p className="text-black/70 text-sm">Effettua il login per accedere alla dashboard</p>
        </div>
      </div>
    )
  }

  const cartTotal = cart?.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0) || 0
  const completedOrders = orders.filter(o => o.status === 'COMPLETED')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-500">La tua Dashboard</h1>
        <button onClick={() => {fetchOrders(); fetchGameStats();}} className="btn btn-gold btn-sm">
          Aggiorna
        </button>
      </div>

      {gameStats && (
        <div className="mb-6">
          <div className="card-wood p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-2xl font-bold text-black">
                  {gameStats.playerLevel}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black">{user.username}</h2>
                  <p className="text-sm text-black/60">Livello {gameStats.playerLevel}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="mb-1"><Sprite src={gameStats.rankSprite} size={28} /></div>
                <div className="font-bold text-black">{gameStats.currentRank}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#BCAAA4] p-3 rounded-lg text-center">
                <div className="mb-1"><Sprite src="/sprites/scepter.png" size={24} /></div>
                <div className="text-xl font-bold text-black">{gameStats.totalCrystals.toLocaleString()}</div>
                <div className="text-xs text-black/60">Cristalli Totali</div>
              </div>
              <div className="bg-[#BCAAA4] p-3 rounded-lg text-center">
                <div className="mb-1"><Sprite src="/sprites/crossbow.png" size={24} /></div>
                <div className="text-xl font-bold text-black">{gameStats.totalGames.toLocaleString()}</div>
                <div className="text-xs text-black/60">Partite Giocate</div>
              </div>
              <div className="bg-[#BCAAA4] p-3 rounded-lg text-center">
                <div className="mb-1"><Sprite src="/sprites/sword.png" size={24} /></div>
                <div className="text-xl font-bold text-black">{gameStats.winRate}%</div>
                <div className="text-xs text-black/60">Vittorie</div>
              </div>
              <div className="bg-[#BCAAA4] p-3 rounded-lg text-center">
                <div className="mb-1"><Sprite src="/sprites/hammer.png" size={24} /></div>
                <div className="text-xl font-bold text-black">{gameStats.bestScore.toLocaleString()}</div>
                <div className="text-xs text-black/60">Miglior Punteggio</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card-wood p-3 text-center">
              <div className="mb-1"><Sprite src="/sprites/pistol.png" size={22} /></div>
              <div className="font-bold text-black">{gameStats.playTime}</div>
              <div className="text-xs text-black/60">Tempo di gioco</div>
            </div>
            <div className="card-wood p-3 text-center">
              <div className="mb-1"><Sprite src="/sprites/ice_staff.png" size={22} /></div>
              <div className="font-bold text-black">{gameStats.achievements}</div>
              <div className="text-xs text-black/60">Achievement</div>
            </div>
            <div className="card-wood p-3 text-center">
              <div className="mb-1"><Sprite src="/sprites/shotgun.png" size={22} /></div>
              <div className="font-bold text-black">{gameStats.favoriteMode}</div>
              <div className="text-xs text-black/60">Modalita Preferita</div>
            </div>
            <div className="card-wood p-3 text-center">
              <div className="mb-1"><Sprite src="/sprites/heavygun.png" size={22} /></div>
              <div className="font-bold text-black">{gameStats.streak}</div>
              <div className="text-xs text-black/60">Serie Vittorie</div>
            </div>
          </div>
        </div>
      )}

      <div className="card-wood p-4 mb-6">
        <h2 className="text-lg font-bold text-black mb-2">Account</h2>
        <div className="space-y-1 text-sm text-black">
          <p><strong>Username:</strong> {user.username || '-'}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Account creato:</strong> {user.createdAt ? user.createdAt.split('T')[0] : '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card-wood p-4">
          <h2 className="text-lg font-bold text-black mb-2">Carrello</h2>
          {cart && cart.length > 0 ? (
            <div className="text-sm text-black">
              <p>Prodotti: {cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
              <p className="font-bold">Totale: {(cartTotal / 100).toFixed(2)} EUR</p>
            </div>
          ) : (
            <p className="text-black/70 text-sm">Carrello vuoto</p>
          )}
        </div>

        <div className="card-wood p-4">
          <h2 className="text-lg font-bold text-black mb-2">Statistiche Acquisti</h2>
          <div className="text-sm text-black">
            <p>Ordini totali: {orders.length}</p>
            <p>Ordini completati: {completedOrders.length}</p>
            <p>Totale speso: {(completedOrders.reduce((sum, o) => sum + o.totalCents, 0) / 100).toFixed(2)} EUR</p>
          </div>
        </div>
      </div>

      <div className="card-wood p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold text-black">Storico Acquisti</h2>
          <button onClick={fetchOrders} className="btn btn-gold btn-xs">Aggiorna</button>
        </div>
        {orders.length === 0 ? (
          <p className="text-black/70 text-sm text-center py-4">Nessun acquisto effettuato</p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {orders.map(order => (
              <div key={order.id} className="bg-[#BCAAA4] p-3 rounded-lg border border-[#8D6E63]">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-black">Ordine #{order.id}</span>
                    <span className="text-xs text-black/60">{order.createdAt ? order.createdAt.split('T')[0] : '-'}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${
                    order.status === 'COMPLETED' ? 'bg-green-500 text-white' :
                    order.status === 'PENDING' ? 'bg-yellow-600 text-black' :
                    'bg-red-500 text-white'
                  }`}>
                    {order.status === 'COMPLETED' ? 'Completato' : 
                     order.status === 'PENDING' ? 'In attesa' : 'Fallito'}
                  </span>
                </div>
                <div className="text-sm text-black space-y-1">
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-1 bg-yellow-500 text-black rounded">{item.productName}</span>
                        <span>x{item.quantity}</span>
                      </div>
                      <span className="font-bold">{(item.priceCents * item.quantity / 100).toFixed(2)} EUR</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-black/30 pt-2 mt-2">
                    <span className="font-bold">Totale</span>
                    <span className="font-bold text-lg">{(order.totalCents / 100).toFixed(2)} EUR</span>
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