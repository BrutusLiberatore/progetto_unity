import { Link } from 'react-router-dom'

export default function Navbar({ cartCount, user, onCartClick, onLoginClick, onRegisterClick, onLogout }) {
  return (
    <nav className="navbar bg-[#3B2F2F] text-white shadow-lg border-b-2 border-[#3E2723] sticky top-0 z-40">
      <div className="container mx-auto">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-yellow-500 hover:bg-[#3E2723]" style={{fontFamily: "'Firlest', cursive", fontSize: '24px', fontWeight: 'normal'}}>
            Bolt & Bone
          </Link>
        </div>
        
        <div className="flex-none flex items-center gap-2">
          <Link to="/leaderboard" className="btn btn-ghost text-white hover:bg-[#3E2723]">
            Classifica
          </Link>
          <button onClick={onCartClick} className="btn btn-ghost btn-circle relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="badge badge-sm badge-primary absolute -top-1 -right-1">{cartCount}</span>
            )}
          </button>

          {user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} />
                  ) : (
                    <div className="bg-[#3E2723] text-yellow-500 rounded-full w-10 flex items-center justify-center font-bold">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              </div>
               <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-[#3B2F2F] rounded-box w-52 border border-[#3E2723]">
                  <li className="px-2 py-1 text-white/70 text-sm">{user.email}</li>
                  <li><Link to="/dashboard" className="text-white hover:bg-[#3E2723]">Dashboard</Link></li>
                  <li><Link to="/admin" className="text-white hover:bg-[#3E2723]">Admin</Link></li>
                  <li><button onClick={onLogout} className="text-white hover:bg-[#3E2723]">Logout</button></li>
                </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={onLoginClick} className="btn btn-ghost text-white hover:bg-[#3E2723]">Login</button>
              <button onClick={onRegisterClick} className="btn btn-gold text-black">Registrati</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}