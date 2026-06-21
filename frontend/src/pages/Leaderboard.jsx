import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3001'

function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '0s'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function Sprite({ src, size = 24, className = '' }) {
  return <img src={src} alt="" className={`inline-block ${className}`} style={{ width: size, height: size, imageRendering: 'pixelated' }} />
}

function StatBox({ label, value, sprite }) {
  return (
    <div className="flex flex-col items-center bg-[#5D4037] rounded-xl p-3 min-w-[100px]">
      <Sprite src={sprite} size={28} className="mb-1" />
      <span className="text-yellow-400 font-bold text-lg leading-tight">{value}</span>
      <span className="text-white/50 text-[10px] uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  )
}

function ProfileCard({ userId, onClose }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`${API_URL}/api/runs/profile/${userId}`)
      .then(res => res.json())
      .then(data => { setProfile(data); setLoading(false) })
      .catch(() => { setProfile(null); setLoading(false) })
  }, [userId])

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
        <div className="bg-[#3B2F2F] rounded-2xl p-8 border-2 border-yellow-500/30" onClick={e => e.stopPropagation()}>
          <span className="loading loading-spinner loading-lg text-yellow-500"></span>
        </div>
      </div>
    )
  }

  if (!profile || !profile.user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
        <div className="bg-[#3B2F2F] rounded-2xl p-8 border-2 border-red-500/30" onClick={e => e.stopPropagation()}>
          <p className="text-white/70">Profilo non trovato</p>
          <button className="btn btn-sm mt-4" onClick={onClose}>Chiudi</button>
        </div>
      </div>
    )
  }

  const { user, stats, recentRuns } = profile

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="bg-[#3B2F2F] rounded-2xl border-2 border-yellow-500/30 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#3B2F2F] p-6 pb-4 border-b border-white/10 flex items-center gap-4 z-10">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-full border-2 border-yellow-500" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#5D4037] flex items-center justify-center text-2xl font-bold text-yellow-500 border-2 border-yellow-500">
              {user.username?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-yellow-400">{user.username}</h2>
            <p className="text-white/50 text-sm">{stats.totalRuns} partite giocate</p>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost text-white/50 hover:text-white" onClick={onClose}>&#10005;</button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
            <StatBox sprite="/sprites/sword.png" label="Punteggio" value={stats.totalScore?.toLocaleString() || '0'} />
            <StatBox sprite="/sprites/axe.png" label="Nemici" value={(stats.totalEnemiesKilled || 0).toLocaleString()} />
            <StatBox sprite="/sprites/spear.png" label="Miglior Wave" value={stats.bestWave || 0} />
            <StatBox sprite="/sprites/scepter.png" label="Gold Totali" value={(stats.totalGoldEarned || 0).toLocaleString()} />
            <StatBox sprite="/sprites/katana.png" label="Miglior Tempo" value={formatDuration(stats.bestDurationSeconds)} />
            <StatBox sprite="/sprites/warhammer.png" label="Vittorie" value={`${stats.victories || 0}/${stats.totalRuns || 0}`} />
            <StatBox sprite="/sprites/flail.png" label="Boss Uccisi" value={stats.totalBossesKilled || 0} />
            <StatBox sprite="/sprites/sniper.png" label="Miglior Score" value={stats.bestScore?.toLocaleString() || '0'} />
            <StatBox sprite="/sprites/revolver.png" label="Tempo Medio" value={formatDuration(stats.avgDurationSeconds)} />
            <StatBox sprite="/sprites/arcane_staff.png" label="Personaggio" value={stats.mostPlayedCharacter || '-'} />
          </div>

          {recentRuns && recentRuns.length > 0 && (
            <div>
              <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 font-bold">Ultime Partite</h3>
              <div className="space-y-2">
                {recentRuns.map((run, i) => (
                  <div key={i} className="bg-[#2C1F1F] rounded-xl p-3 flex flex-wrap items-center gap-3 border border-white/5">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${
                      run.outcome === 'victory' ? 'bg-green-800 text-green-200' : 'bg-red-800/70 text-red-200'
                    }`}>
                      {run.outcome === 'victory' ? 'Vittoria' : 'Morte'}
                    </span>
                    <span className="text-yellow-400 font-bold text-base">{(run.score || 0).toLocaleString()}</span>
                    <span className="text-white/40">|</span>
                    <span className="text-white/70 text-sm">W{run.wavesReached}</span>
                    <span className="text-white/70 text-sm">{run.enemiesKilled} kill</span>
                    <span className="text-white/70 text-sm">Lv{run.levelReached}</span>
                    <span className="text-white/40 text-sm">{run.characterName}</span>
                    <span className="text-white/30 text-xs ml-auto">{formatDuration(run.durationSeconds)}</span>
                    {run.weapons && (
                      <span className="text-white/25 text-xs w-full">Armi: {run.weapons}</span>
                    )}
                    {run.items && (
                      <span className="text-white/25 text-xs w-full">Item: {run.items}</span>
                    )}
                    <span className="text-white/20 text-[10px] w-full">{formatDate(run.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const RANK_SPRITES = ['/sprites/sword.png', '/sprites/dagger.png', '/sprites/mace.png']

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [leaderboardTab, setLeaderboardTab] = useState('monthly')
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`${API_URL}/api/leaderboard/${leaderboardTab}`)
      .then(res => res.json())
      .then(data => { setLeaderboard(data); setLoading(false) })
      .catch(() => { setLeaderboard([]); setLoading(false) })
  }, [leaderboardTab])

  return (
    <div className="px-4 md:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-500 mb-2">CLASSIFICA</h1>
        <p className="text-white/80">I migliori giocatori di Bolt & Bone</p>
      </div>

      <div className="tabs tabs-boxed bg-[#3E2723] mb-6 justify-center">
        {[['monthly', 'Mese'], ['global', 'Mondiale']].map(([tab, label]) => (
          <button 
            key={tab}
            className={`tab ${leaderboardTab === tab ? 'tab-active bg-yellow-500 text-black' : 'text-white'}`}
            onClick={() => setLeaderboardTab(tab)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card-wood p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-yellow-500"></span>
          </div>
        ) : leaderboard.length === 0 ? (
          <p className="text-black/60 text-center py-12">Nessun giocatore in classifica</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 p-3 bg-[#BCAAA4] rounded-xl cursor-pointer hover:bg-[#A1887F] hover:scale-[1.01] transition-all duration-150 group"
                onClick={() => entry.user?.id && setSelectedUserId(entry.user.id)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  entry.rank === 1 ? 'bg-yellow-500' : 
                  entry.rank === 2 ? 'bg-gray-400' : 
                  entry.rank === 3 ? 'bg-amber-700' : 
                  'bg-[#5D4037]'
                }`}>
                  {entry.rank <= 3 ? (
                    <Sprite src={RANK_SPRITES[entry.rank - 1]} size={22} />
                  ) : (
                    <span className="font-bold text-lg text-white">{entry.rank}</span>
                  )}
                </div>
                {entry.user && (
                  <>
                    {entry.user.avatarUrl ? (
                      <img src={entry.user.avatarUrl} alt="" className="w-10 h-10 rounded-full shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#5D4037] flex items-center justify-center text-sm font-bold text-yellow-400 shrink-0">
                        {entry.user.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </>
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-black text-lg block truncate">{entry.user?.username || '???'}</span>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-black/60">
                    {entry.mostPlayedCharacter && <span>{entry.mostPlayedCharacter}</span>}
                    {entry.totalRuns > 0 && <span>{entry.totalRuns} partite</span>}
                    {entry.totalEnemiesKilled > 0 && <span>{entry.totalEnemiesKilled.toLocaleString()} nemici</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-black text-xl">
                    {(leaderboardTab === 'monthly' ? entry.monthlyScore : entry.totalScore || 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-black/50 block">punti</span>
                </div>
                <svg className="w-5 h-5 text-black/30 group-hover:text-black/60 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedUserId && (
        <ProfileCard userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  )
}
