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
    name: '',
    description: '',
    type: 'currency',
    priceCents: 99,
    imageUrl: ''
  })

  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    isAdmin: false,
    password: ''
  })

  const fetchOrders = () => {
    fetch(`${API_URL}/api/orders`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err))
  }

  const fetchProducts = () => {
    fetch(`${API_URL}/api/products/all`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err))
  }

  const fetchUsers = () => {
    fetch(`${API_URL}/api/admin/users`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error(err))
  }

  const confirmOrder = async (orderId) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/confirm-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })
      if (res.ok) {
        alert('Ordine confermato!')
        fetchOrders()
      } else {
        alert('Errore nel confermare ordine')
      }
    } catch (err) {
      alert('Errore: ' + err.message)
    }
    setLoading(false)
  }

  const openUserModal = (user = null) => {
    if (user) {
      setEditingUser(user)
      setUserFormData({
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin || false,
        password: ''
      })
    } else {
      setEditingUser(null)
      setUserFormData({
        username: '',
        email: '',
        isAdmin: false,
        password: ''
      })
    }
    setShowUserModal(true)
  }

  const saveUser = async () => {
    setLoading(true)
    try {
      const updates = {
        username: userFormData.username,
        email: userFormData.email,
        isAdmin: userFormData.isAdmin
      }
      if (userFormData.password) {
        updates.password = userFormData.password
      }
      
      const res = await fetch(`${API_URL}/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (res.ok) {
        alert('Utente salvato!')
        setShowUserModal(false)
        fetchUsers()
      } else {
        alert('Errore nel salvare utente')
      }
    } catch (err) {
      alert('Errore: ' + err.message)
    }
    setLoading(false)
  }

  const deleteUser = async (id) => {
    if (!confirm('Disattivare questo utente?')) return
    
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        alert('Utente disattivato!')
        fetchUsers()
      } else {
        alert('Errore nel disattivare utente')
      }
    } catch (err) {
      alert('Errore: ' + err.message)
    }
    setLoading(false)
  }

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description,
        type: product.type,
        priceCents: product.priceCents,
        imageUrl: product.imageUrl || ''
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        type: 'currency',
        priceCents: 99,
        imageUrl: ''
      })
    }
    setShowModal(true)
  }

  const saveProduct = async () => {
    setLoading(true)
    try {
      const url = editingProduct 
        ? `${API_URL}/api/products/${editingProduct.id}`
        : `${API_URL}/api/products`
      const method = editingProduct ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        alert('Prodotto salvato!')
        setShowModal(false)
        fetchProducts()
      } else {
        alert('Errore nel salvare prodotto')
      }
    } catch (err) {
      alert('Errore: ' + err.message)
    }
    setLoading(false)
  }

  const deleteProduct = async (id) => {
    if (!confirm('Eliminare questo prodotto?')) return
    
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        alert('Prodotto eliminato!')
        fetchProducts()
      } else {
        alert('Errore nel eliminare prodotto')
      }
    } catch (err) {
      alert('Errore: ' + err.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders()
    } else if (activeTab === 'products') {
      fetchProducts()
    } else if (activeTab === 'users') {
      fetchUsers()
    }
  }, [activeTab])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-yellow-500">Pannello Admin</h1>
        <div className="flex gap-2">
          <button onClick={() => {
            if (activeTab === 'products') fetchProducts()
            else if (activeTab === 'orders') fetchOrders()
            else if (activeTab === 'users') fetchUsers()
          }} className="btn btn-gold btn-sm">
            Ricarica
          </button>
          <button onClick={onLogout} className="btn btn-error btn-sm text-white">
            Logout
          </button>
        </div>
      </div>

      <div className="tabs tabs-boxed bg-[#3E2723] mb-4 text-sm">
        <button 
          className={`tab ${activeTab === 'products' ? 'tab-active bg-yellow-500 text-black' : 'text-white'}`}
          onClick={() => setActiveTab('products')}
        >
          Prodotti
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'tab-active bg-yellow-500 text-black' : 'text-white'}`}
          onClick={() => setActiveTab('users')}
        >
          Utenti
        </button>
        <button 
          className={`tab ${activeTab === 'orders' ? 'tab-active bg-yellow-500 text-black' : 'text-white'}`}
          onClick={() => setActiveTab('orders')}
        >
          Ordini
        </button>
        <button 
          className={`tab ${activeTab === 'api' ? 'tab-active bg-yellow-500 text-black' : 'text-white'}`}
          onClick={() => setActiveTab('api')}
        >
          API
        </button>
      </div>

      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-black">Gestione Prodotti</h2>
            <button onClick={() => openModal()} className="btn btn-gold btn-sm">
              + Aggiungi Prodotto
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {products.map(product => (
              <div key={product.id} className="card-wood p-3 flex justify-between">
                <div className="flex-1">
                  <div className="font-bold text-black">{product.name}</div>
                  <div className="text-sm text-black/60">{product.type}</div>
                  <div className="text-sm text-black">{(product.priceCents / 100).toFixed(2)} EUR</div>
                  <span className={`text-xs px-2 py-0.5 rounded ${product.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {product.isActive ? 'Attivo' : 'Disattivo'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openModal(product)} className="btn btn-xs btn-gold">Modifica</button>
                  <button onClick={() => deleteProduct(product.id)} className="btn btn-xs btn-error text-white">X</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-black">Gestione Utenti</h2>
          </div>
          
          <div className="space-y-2">
            {users.map(user => (
              <div key={user.id} className="card-wood p-3 flex justify-between items-center">
                <div>
                  <div className="font-bold text-black">{user.username}</div>
                  <div className="text-sm text-black/60">{user.email}</div>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${user.isAdmin ? 'bg-purple-500 text-white' : 'bg-gray-500 text-white'}`}>
                      {user.isAdmin ? 'Admin' : 'Utente'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${user.isVerified ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'}`}>
                      {user.isVerified ? 'Verificato' : 'Non verificato'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openUserModal(user)} className="btn btn-xs btn-gold">Modifica</button>
                  <button onClick={() => deleteUser(user.id)} className="btn btn-xs btn-error text-white">X</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-black">Ordini</h2>
          {orders.length === 0 ? (
            <p className="text-black/70 text-sm">Nessun ordine</p>
          ) : (
            orders.map(order => (
              <div key={order.id} className="card-wood p-3">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-bold text-black">Ordine #{order.id}</span>
                    <span className="text-black/60 text-sm ml-2">- {order.createdAt || '-'}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    order.status === 'COMPLETED' ? 'bg-green-500 text-white' :
                    order.status === 'PENDING' ? 'bg-yellow-500 text-black' :
                    'bg-red-500 text-white'
                  }`}>
                    {order.status}
                  </span>
                </div>
                {order.user && (
                  <p className="text-sm text-black mb-1">
                    <span className="font-bold">Acquirente:</span> {order.user.username} ({order.user.email})
                  </p>
                )}
                <p className="text-sm text-black">Totale: {(order.totalCents / 100).toFixed(2)} EUR</p>
                {order.status === 'PENDING' && (
                  <button 
                    onClick={() => confirmOrder(order.id)} 
                    disabled={loading}
                    className="btn btn-gold btn-xs mt-2"
                  >
                    Conferma Pagamento
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'api' && (
        <ApiDocs />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="modal-wood w-full max-w-md p-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-black mb-3">
              {editingProduct ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-black text-sm mb-1">Nome</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="input input-bordered w-full bg-[#8D6E63] border-[#5D4037] text-black"
                />
              </div>
              
              <div>
                <label className="block text-black text-sm mb-1">Descrizione</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="textarea textarea-bordered w-full bg-[#8D6E63] border-[#5D4037] text-black"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-black text-sm mb-1">Tipo</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="select select-bordered w-full bg-[#8D6E63] border-[#5D4037] text-black"
                  >
                    <option value="currency">Cristalli</option>
                    <option value="boost">Potenziamento</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-black text-sm mb-1">Prezzo (EUR)</label>
                  <input 
                    type="number" 
                    value={formData.priceCents / 100}
                    onChange={e => setFormData({...formData, priceCents: Math.round(e.target.value * 100)})}
                    className="input input-bordered w-full bg-[#8D6E63] border-[#5D4037] text-black"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-black text-sm mb-1">URL Immagine</label>
                <input 
                  type="text" 
                  value={formData.imageUrl}
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  className="input input-bordered w-full bg-[#8D6E63] border-[#5D4037] text-black"
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button onClick={saveProduct} disabled={loading} className="btn btn-gold flex-1">
                {loading ? 'Salvando...' : 'Salva'}
              </button>
              <button onClick={() => setShowModal(false)} className="btn btn-error text-white">
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowUserModal(false)}>
          <div className="modal-wood w-full max-w-md p-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-black mb-3">
              Modifica Utente
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-black text-sm mb-1">Username</label>
                <input 
                  type="text" 
                  value={userFormData.username}
                  onChange={e => setUserFormData({...userFormData, username: e.target.value})}
                  className="input input-bordered w-full bg-[#8D6E63] border-[#5D4037] text-black"
                />
              </div>
              
              <div>
                <label className="block text-black text-sm mb-1">Email</label>
                <input 
                  type="email" 
                  value={userFormData.email}
                  onChange={e => setUserFormData({...userFormData, email: e.target.value})}
                  className="input input-bordered w-full bg-[#8D6E63] border-[#5D4037] text-black"
                />
              </div>
              
              <div>
                <label className="block text-black text-sm mb-1">Nuova Password (opzionale)</label>
                <input 
                  type="password" 
                  value={userFormData.password}
                  onChange={e => setUserFormData({...userFormData, password: e.target.value})}
                  className="input input-bordered w-full bg-[#8D6E63] border-[#5D4037] text-black"
                  placeholder="Lascia vuoto per mantenere"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isAdmin"
                  checked={userFormData.isAdmin}
                  onChange={e => setUserFormData({...userFormData, isAdmin: e.target.checked})}
                  className="checkbox checkbox-gold"
                />
                <label htmlFor="isAdmin" className="text-black">Amministratore</label>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button onClick={saveUser} disabled={loading} className="btn btn-gold flex-1">
                {loading ? 'Salvando...' : 'Salva'}
              </button>
              <button onClick={() => setShowUserModal(false)} className="btn btn-error text-white">
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}