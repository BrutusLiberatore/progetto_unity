import { useState, useEffect } from 'react'
import ApiDocs from './ApiDocs'

const API_URL = 'http://localhost:3001'

export default function Admin({ onLogout }) {
  const [activeTab, setActiveTab] = useState('products')
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const [formData, setFormData] = useState({
    name: '', description: '', type: 'currency', priceCents: 99, imageUrl: ''
  })

  const [userFormData, setUserFormData] = useState({
    username: '', email: '', isAdmin: false, password: ''
  })

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/orders`)
      const data = await res.json()
      setOrders(data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/products`)
      const data = await res.json()
      setProducts(data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      })
      const data = await res.json()
      setUsers(data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const confirmOrder = async (id) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/payments/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id })
      })
      if (res.ok) {
        alert('Ordine confermato!')
        fetchOrders()
      } else {
        alert('Errore nella conferma')
      }
    } catch (err) { alert('Errore: ' + err.message) }
    setLoading(false)
  }

  const openUserModal = (user) => {
    setEditingUser(user)
    setUserFormData({ username: user.username, email: user.email, isAdmin: user.isAdmin, password: '' })
    setShowUserModal(true)
  }

  const saveUser = async () => {
    setLoading(true)
    try {
      const updates = { username: userFormData.username, email: userFormData.email, isAdmin: userFormData.isAdmin }
      if (userFormData.password) { updates.password = userFormData.password }

      const res = await fetch(`${API_URL}/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (res.ok) { alert('Utente salvato!'); setShowUserModal(false); fetchUsers() }
      else { alert('Errore nel salvare utente') }
    } catch (err) { alert('Errore: ' + err.message) }
    setLoading(false)
  }

  const deleteUser = async (id) => {
    if (!confirm('Disattivare questo utente?')) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${id}`, { method: 'DELETE' })
      if (res.ok) { alert('Utente disattivato!'); fetchUsers() }
      else { alert('Errore nel disattivare utente') }
    } catch (err) { alert('Errore: ' + err.message) }
    setLoading(false)
  }

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({ name: product.name, description: product.description, type: product.type, priceCents: product.priceCents, imageUrl: product.imageUrl || '' })
    } else {
      setEditingProduct(null)
      setFormData({ name: '', description: '', type: 'currency', priceCents: 99, imageUrl: '' })
    }
    setShowModal(true)
  }

  const saveProduct = async () => {
    setLoading(true)
    try {
      const url = editingProduct ? `${API_URL}/api/products/${editingProduct.id}` : `${API_URL}/api/products`
      const method = editingProduct ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (res.ok) { alert('Prodotto salvato!'); setShowModal(false); fetchProducts() }
      else { alert('Errore nel salvare prodotto') }
    } catch (err) { alert('Errore: ' + err.message) }
    setLoading(false)
  }

  const deleteProduct = async (id) => {
    if (!confirm('Eliminare questo prodotto?')) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) { alert('Prodotto eliminato!'); fetchProducts() }
      else { alert('Errore') }
    } catch (err) { alert('Errore: ' + err.message) }
    setLoading(false)
  }

  useEffect(() => {
    if (activeTab === 'products') fetchProducts()
    else if (activeTab === 'orders') fetchOrders()
    else if (activeTab === 'users') fetchUsers()
  }, [activeTab])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4 py-6">
        <h1 className="font-pixel text-game-gold text-2xl" style={{textShadow: '2px 2px 0 #0a0c10'}}>PANNELLO ADMIN</h1>
        <div className="flex gap-2">
          <button onClick={() => { if (activeTab === 'products') fetchProducts(); else if (activeTab === 'orders') fetchOrders(); else if (activeTab === 'users') fetchUsers(); }} className="pixel-btn px-4 py-2 text-[10px]">RICARICA</button>
          <button onClick={onLogout} className="pixel-btn-red px-4 py-2 text-[10px]">LOGOUT</button>
        </div>
      </div>

      <div className="flex gap-1 mb-6">
        {[['products', 'PRODOTTI'], ['users', 'UTENTI'], ['orders', 'ORDINI'], ['api', 'API']].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pixel-btn px-4 py-2 text-[10px] ${activeTab !== tab ? 'pixel-btn-dark' : ''}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-pixel text-game-text text-sm uppercase">Gestione Prodotti</h2>
            <button onClick={() => openModal()} className="pixel-btn px-4 py-2 text-[10px]">+ AGGIUNGI</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {products.map(product => (
              <div key={product.id} className="pixel-card p-3 flex justify-between items-center">
                <div>
                  <div className="font-pixel text-game-text text-sm">{product.name}</div>
                  <div className="text-game-text-dim text-[10px]">{product.type}</div>
                  <div className="pixel-price text-xs">{(product.priceCents / 100).toFixed(2)} EUR</div>
                  <span className={`pixel-badge text-[8px] mt-1 ${product.isActive ? 'bg-game-green/20 text-game-green border-game-green' : 'bg-game-text-dim/20 text-game-text-dim border-game-text-dim'}`}>
                    {product.isActive ? 'ATTIVO' : 'DISATTIVO'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openModal(product)} className="pixel-btn px-3 py-1 text-[10px]">MOD</button>
                  <button onClick={() => deleteProduct(product.id)} className="pixel-btn-red px-3 py-1 text-[10px]">X</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h2 className="font-pixel text-game-text text-sm uppercase mb-4">Gestione Utenti</h2>
          <div className="space-y-2">
            {users.map(user => (
              <div key={user.id} className="pixel-card p-3 flex justify-between items-center">
                <div>
                  <div className="font-pixel text-game-text text-sm">{user.username}</div>
                  <div className="text-game-text-dim text-[10px]">{user.email}</div>
                  <div className="flex gap-2 mt-1">
                    <span className={`pixel-badge text-[8px] ${user.isAdmin ? 'bg-game-gold/20 text-game-gold border-game-gold' : 'bg-game-text-dim/20 text-game-text-dim border-game-text-dim'}`}>
                      {user.isAdmin ? 'ADMIN' : 'USER'}
                    </span>
                    <span className={`pixel-badge text-[8px] ${user.isVerified ? 'bg-game-green/20 text-game-green border-game-green' : 'bg-game-gold/20 text-game-gold border-game-gold'}`}>
                      {user.isVerified ? 'VERIFICATO' : 'NON VERIFICATO'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openUserModal(user)} className="pixel-btn px-3 py-1 text-[10px]">MOD</button>
                  <button onClick={() => deleteUser(user.id)} className="pixel-btn-red px-3 py-1 text-[10px]">X</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-3">
          <h2 className="font-pixel text-game-text text-sm uppercase">Ordini</h2>
          {orders.length === 0 ? (
            <p className="text-game-text-dim text-[10px] font-pixel text-center py-8">NESSUN ORDINE</p>
          ) : (
            orders.map(order => (
              <div key={order.id} className="pixel-card p-3">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-pixel text-game-text text-sm">ORDINE #{order.id}</span>
                    <span className="text-game-text-dim text-[10px] ml-2">{order.createdAt || '-'}</span>
                  </div>
                  <span className={`pixel-badge text-[8px] ${
                    order.status === 'COMPLETED' ? 'bg-game-green/20 text-game-green border-game-green' :
                    order.status === 'PENDING' ? 'bg-game-gold/20 text-game-gold border-game-gold' :
                    'bg-game-red/20 text-game-red border-game-red'
                  }`}>
                    {order.status}
                  </span>
                </div>
                {order.user && (
                  <p className="text-game-text text-[10px] mb-1">
                    <span className="font-pixel">Acquirente:</span> {order.user.username} ({order.user.email})
                  </p>
                )}
                <p className="pixel-price text-xs">Totale: {(order.totalCents / 100).toFixed(2)} EUR</p>
                {order.status === 'PENDING' && (
                  <button onClick={() => confirmOrder(order.id)} disabled={loading} className="pixel-btn px-3 py-1 text-[10px] mt-2">
                    CONFERMA
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'api' && <ApiDocs />}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="pixel-modal w-full max-w-md p-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-pixel text-game-gold text-lg mb-3">{editingProduct ? 'MODIFICA PRODOTTO' : 'NUOVO PRODOTTO'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">Nome</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="pixel-input w-full px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">Descrizione</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="pixel-input w-full px-3 py-2 text-sm resize-none" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">Tipo</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="pixel-input w-full px-3 py-2 text-sm">
                    <option value="currency">Cristalli</option>
                    <option value="boost">Potenziamento</option>
                  </select>
                </div>
                <div>
                  <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">Prezzo (EUR)</label>
                  <input type="number" value={formData.priceCents / 100} onChange={e => setFormData({...formData, priceCents: Math.round(e.target.value * 100)})} className="pixel-input w-full px-3 py-2 text-sm" step="0.01" />
                </div>
              </div>
              <div>
                <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">URL Immagine</label>
                <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="pixel-input w-full px-3 py-2 text-sm" placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveProduct} disabled={loading} className="pixel-btn flex-1 py-2 text-xs">{loading ? 'LOADING...' : 'SALVA'}</button>
              <button onClick={() => setShowModal(false)} className="pixel-btn-dark px-4 py-2 text-xs">ANNULLA</button>
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowUserModal(false)}>
          <div className="pixel-modal w-full max-w-md p-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-pixel text-game-gold text-lg mb-3">MODIFICA UTENTE</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">Username</label>
                <input type="text" value={userFormData.username} onChange={e => setUserFormData({...userFormData, username: e.target.value})} className="pixel-input w-full px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">Email</label>
                <input type="email" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} className="pixel-input w-full px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block font-pixel text-game-text-dim text-[10px] mb-1 uppercase">Nuova Password (opzionale)</label>
                <input type="password" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} className="pixel-input w-full px-3 py-2 text-sm" placeholder="Lascia vuoto per mantenere" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isAdmin" checked={userFormData.isAdmin} onChange={e => setUserFormData({...userFormData, isAdmin: e.target.checked})} className="accent-game-gold" />
                <label htmlFor="isAdmin" className="font-pixel text-game-text text-[10px] uppercase">Amministratore</label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveUser} disabled={loading} className="pixel-btn flex-1 py-2 text-xs">{loading ? 'LOADING...' : 'SALVA'}</button>
              <button onClick={() => setShowUserModal(false)} className="pixel-btn-dark px-4 py-2 text-xs">ANNULLA</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
