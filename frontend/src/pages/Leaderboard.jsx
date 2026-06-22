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
    <div className="pixel-card p-3 text-center min-w-[90px]">
      <Sprite src={sprite} size={24} className="mx-auto mb-1" />
      <span className="block font-pixel text-game-gold text-sm leading-tight">{value}</span>
      <span className="block text-game-text-dim text-[8px] uppercase tracking-wider mt-1">{label}</span>
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
        <div className="pixel-modal p-8" onClick={e => e.stopPropagation()}>
          <div className="font-pixel text-game-gold animate-pulse">LOADING...</div>
        </div>
      </div>
    )
  }

  if (!profile || !profile.user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
        <div className="pixel-modal p-8" onClick={e => e.stopPropagation()}>
          <p className="font-pixel text-game-red text-sm mb-4">PROFILO NON TROVATO</p>
          <button className="pixel-btn-dark px-4 py-2 text-[10px]" onClick={onClose}>CHIUDI</button>
        </div>
      </div>
    )
  }

  const { user, stats, recentRuns } = profile

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="pixel-modal max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-game-surface p-4 border-b-2 border-game-border flex items-center gap-4 z-10">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-12 h-12 border-2 border-game-gold" style={{imageRendering: 'pixelated'}} />
          ) : (
            <div className="w-12 h-12 bg-game-gold text-game-bg flex items-center justify-center font-pixel text-lg border-2 border-game-gold-dark">
              {user.username?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div className="flex-1">
            <h2 className="font-pixel text-game-gold text-lg" style={{textShadow: '2px 2px 0 #0a0c10'}}>{user.username}</h2>
            <p className="text-game-text-dim text-[10px]">{stats.totalRuns} partite giocate</p>
          </div>
          <button className="pixel-btn-dark px-2 py-1 text-[10px]" onClick={onClose}>X</button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
            <StatBox sprite="/sprites/sword.png" label="Score" value={stats.totalScore?.toLocaleString() || '0'} />
            <StatBox sprite="/sprites/axe.png" label="Nemici" value={(stats.totalEnemiesKilled || 0).toLocaleString()} />
            <StatBox sprite="/sprites/spear.png" label="Wave" value={stats.bestWave || 0} />
            <StatBox sprite="/sprites/scepter.png" label="Gold" value={(stats.totalGoldEarned || 0).toLocaleString()} />
            <StatBox sprite="/sprites/katana.png" label="Tempo" value={formatDuration(stats.bestDurationSeconds)} />
            <StatBox sprite="/sprites/warhammer.png" label="Vittorie" value={`${stats.victories || 0}/${stats.totalRuns || 0}`} />
            <StatBox sprite="/sprites/flail.png" label="Boss" value={stats.totalBossesKilled || 0} />
            <StatBox sprite="/sprites/sniper.png" label="Best" value={stats.bestScore?.toLocaleString() || '0'} />
            <StatBox sprite="/sprites/revolver.png" label="Media" value={formatDuration(stats.avgDurationSeconds)} />
            <StatBox sprite="/sprites/arcane_staff.png" label="Main" value={stats.mostPlayedCharacter || '-'} />
          </div>

          {recentRuns && recentRuns.length > 0 && (
            <div>
              <h3 className="font-pixel text-game-text-dim text-[10px] uppercase tracking-wider mb-3">ULTIME PARTITE</h3>
              <div className="space-y-2">
                {recentRuns.map((run, i) => (
                  <div key={i} className="pixel-card p-3 flex flex-wrap items-center gap-2">
                    <span className={`pixel-badge text-[8px] ${
                      run.outcome === 'victory'
                        ? 'bg-game-green/20 text-game-green border-game-green'
                        : 'bg-game-red/20 text-game-red border-game-red'
                    }`}>
                      {run.outcome === 'victory' ? 'VITTORIA' : 'MORTE'}
                    </span>
                    <span className="font-pixel text-game-gold text-sm">{(run.score || 0).toLocaleString()}</span>
                    <span className="text-game-border">|</span>
                    <span className="text-game-text text-[10px]">W{run.wavesReached}</span>
                    <span className="text-game-text text-[10px]">{run.enemiesKilled} kill</span>
                    <span className="text-game-text text-[10px]">Lv{run.levelReached}</span>
                    <span className="text-game-text-dim text-[10px]">{run.characterName}</span>
                    <span className="text-game-text-dim text-[10px] ml-auto">{formatDuration(run.durationSeconds)}</span>
                    {run.weapons && (
                      <span className="text-game-text-dim text-[8px] w-full">Armi: {run.weapons}</span>
                    )}
                    <span className="text-game-text-dim text-[8px] w-full">{formatDate(run.createdAt)}</span>
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
      <div className="text-center mb-8 py-8">
        <h1 className="game-title text-game-gold text-3xl md:text-4xl mb-2 font-pixel">CLASSIFICA</h1>
        <div className="pixel-divider max-w-xs mx-auto mb-2"></div>
        <p className="text-game-text-dim text-xs uppercase tracking-wider">I migliori giocatori di Bolt & Bone</p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {[['monthly', 'MESE'], ['global', 'MONDIALE']].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setLeaderboardTab(tab)}
            className={`pixel-btn px-6 py-2 text-xs ${leaderboardTab !== tab ? 'pixel-btn-dark' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="pixel-card p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="font-pixel text-game-gold animate-pulse">LOADING...</div>
          </div>
        ) : leaderboard.length === 0 ? (
          <p className="text-game-text-dim text-center py-12 font-pixel text-xs">NESSUN GIOCATORE IN CLASSIFICA</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-game-surface border border-game-border hover:border-game-gold/50 cursor-pointer transition-all group"
                onClick={() => entry.user?.id && setSelectedUserId(entry.user.id)}
              >
                <div className={`w-8 h-8 flex items-center justify-center shrink-0 border ${
                  entry.rank === 1 ? 'bg-game-gold/20 border-game-gold text-game-gold' :
                  entry.rank === 2 ? 'bg-game-text-dim/20 border-game-text-dim text-game-text-dim' :
                  entry.rank === 3 ? 'bg-game-gold-dark/20 border-game-gold-dark text-game-gold-dark' :
                  'bg-game-card border-game-border text-game-text-dim'
                }`}>
                  {entry.rank <= 3 ? (
                    <Sprite src={RANK_SPRITES[entry.rank - 1]} size={18} />
                  ) : (
                    <span className="font-pixel text-xs">{entry.rank}</span>
                  )}
                </div>
                {entry.user && (
                  <>
                    {entry.user.avatarUrl ? (
                      <img src={entry.user.avatarUrl} alt="" className="w-8 h-8 shrink-0 border border-game-border" style={{imageRendering: 'pixelated'}} />
                    ) : (
                      <div className="w-8 h-8 bg-game-gold/20 border border-game-gold flex items-center justify-center font-pixel text-xs text-game-gold shrink-0">
                        {entry.user.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </>
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-pixel text-game-text text-sm block truncate">{entry.user?.username || '???'}</span>
                  <div className="flex flex-wrap gap-x-3 gap-y-0 text-[9px] text-game-text-dim">
                    {entry.mostPlayedCharacter && <span>{entry.mostPlayedCharacter}</span>}
                    {entry.totalRuns > 0 && <span>{entry.totalRuns} partite</span>}
                    {entry.totalEnemiesKilled > 0 && <span>{entry.totalEnemiesKilled.toLocaleString()} nemici</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-pixel text-game-gold text-sm">
                    {(leaderboardTab === 'monthly' ? entry.monthlyScore : entry.totalScore || 0).toLocaleString()}
                  </span>
                  <span className="block text-[8px] text-game-text-dim">punti</span>
                </div>
                <span className="text-game-text-dim group-hover:text-game-gold transition-colors text-xs">&#9654;</span>
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
