import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ApiDocs from './pages/ApiDocs'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import Leaderboard from './pages/Leaderboard'
import CartModal from './components/CartModal'
import AuthModal from './components/AuthModal'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || 'pk_test_your_key_here')

function ProtectedAdminRoute({ children, adminToken }) {
  if (!adminToken) {
    return <Navigate to="/admin-login" replace />
  }
  return children
}

export default function App() {
  const [cart, setCart] = useState([])
  const [user, setUser] = useState(null)
  const [showCart, setShowCart] = useState(false)
  const [showAuth, setShowAuth] = useState(null)
  const [adminToken, setAdminToken] = useState(localStorage.getItem('admin_token') || null)
  const [pendingCheckout, setPendingCheckout] = useState(false)

  useEffect(() => {
    const savedCart = localStorage.getItem('game_shop_cart')
    if (savedCart) setCart(JSON.parse(savedCart))
    
    const savedUser = localStorage.getItem('game_shop_auth')
    if (savedUser) setUser(JSON.parse(savedUser).user)
  }, [])

  useEffect(() => {
    if (user && pendingCheckout && !showAuth) {
      setPendingCheckout(false)
      setShowCart(true)
    }
  }, [user, pendingCheckout, showAuth])

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id)
    let newCart
    if (existing) {
      newCart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      newCart = [...cart, { ...product, quantity: 1 }]
    }
    setCart(newCart)
    localStorage.setItem('game_shop_cart', JSON.stringify(newCart))
    setShowCart(true)
  }

  const removeFromCart = (id) => {
    const newCart = cart.filter(item => item.id !== id)
    setCart(newCart)
    localStorage.setItem('game_shop_cart', JSON.stringify(newCart))
  }

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    const newCart = cart.map(item =>
      item.id === id ? { ...item, quantity } : item
    )
    setCart(newCart)
    localStorage.setItem('game_shop_cart', JSON.stringify(newCart))
  }

  const login = (userData, token) => {
    setUser(userData)
    localStorage.setItem('game_shop_auth', JSON.stringify({ user: userData, token }))
    
    if (pendingCheckout) {
      setPendingCheckout(false)
      setShowAuth(null)
      setShowCart(false)
      setTimeout(() => setShowCart(true), 100)
    } else {
      setShowAuth(null)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('game_shop_auth')
  }

  const adminLogin = (token) => {
    setAdminToken(token)
  }

  const adminLogout = () => {
    setAdminToken(null)
    localStorage.removeItem('admin_token')
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('game_shop_cart')
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        cartCount={cartCount}
        user={user}
        onCartClick={() => setShowCart(true)}
        onLoginClick={() => setShowAuth('login')}
        onRegisterClick={() => setShowAuth('register')}
        onLogout={logout}
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/dashboard" element={<Dashboard user={user} cart={cart} />} />
          <Route path="/admin-login" element={<AdminLogin onLogin={adminLogin} />} />
          <Route path="/admin" element={
            <ProtectedAdminRoute adminToken={adminToken}>
              <Admin onLogout={adminLogout} />
            </ProtectedAdminRoute>
          } />
        </Routes>
      </main>

      <Footer />

      {showCart && (
        <Elements stripe={stripePromise}>
          <CartModal 
            cart={cart}
            total={cartTotal}
            onClose={() => setShowCart(false)}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onLogin={() => {
              setPendingCheckout(true)
              setShowCart(false)
              setShowAuth('login')
            }}
            onClearCart={clearCart}
            user={user}
          />
        </Elements>
      )}

      {showAuth === 'login' && (
        <AuthModal 
          mode="login"
          onClose={() => setShowAuth(null)}
          onSwitch={() => setShowAuth('register')}
          onLogin={login}
        />
      )}

      {showAuth === 'register' && (
        <AuthModal 
          mode="register"
          onClose={() => setShowAuth(null)}
          onSwitch={() => setShowAuth('login')}
          onLogin={login}
        />
      )}
    </div>
  )
}