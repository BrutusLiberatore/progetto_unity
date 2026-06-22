import { Link } from 'react-router-dom'

export default function Navbar({ cartCount, user, onCartClick, onLoginClick, onRegisterClick, onLogout }) {
  return (
    <nav className="bg-game-surface border-b-2 border-game-border sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <div className="flex-1">
          <Link to="/" className="text-game-gold text-2xl hover:text-game-gold-light transition-colors game-title font-pixel">
            BOLT & BONE
          </Link>
        </div>

        <div className="flex-none flex items-center gap-1">
          <Link to="/leaderboard" className="pixel-btn-dark px-3 py-2 text-xs">
            CLASSIFICA
          </Link>
          <button onClick={onCartClick} className="pixel-btn-dark px-3 py-2 text-xs relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-game-red text-game-text-bright text-[10px] font-pixel px-1.5 py-0.5 border border-game-border leading-none">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="pixel-btn-dark px-3 py-2 text-xs cursor-pointer">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-5 h-5 inline-block mr-1 rounded-none border border-game-border" style={{imageRendering: 'pixelated'}} />
                ) : (
                  <span className="inline-block w-5 h-5 bg-game-gold text-game-bg text-[10px] leading-5 text-center mr-1 border border-game-gold-dark">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
                {user.username}
              </div>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow-pixel-lg bg-game-surface border-2 border-game-border w-52 mt-2 z-50">
                <li className="px-3 py-2 text-game-text-dim text-[10px] border-b border-game-border mb-1">{user.email}</li>
                <li><Link to="/dashboard" className="text-game-text hover:text-game-gold hover:bg-game-card text-xs py-2">DASHBOARD</Link></li>
                <li><Link to="/admin" className="text-game-text hover:text-game-gold hover:bg-game-card text-xs py-2">ADMIN</Link></li>
                <li className="border-t border-game-border mt-1 pt-1">
                  <button onClick={onLogout} className="text-game-red hover:bg-game-card text-xs py-2">LOGOUT</button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button onClick={onLoginClick} className="pixel-btn-dark px-3 py-2 text-xs">LOGIN</button>
              <button onClick={onRegisterClick} className="pixel-btn px-3 py-2 text-xs">REGISTRATI</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
