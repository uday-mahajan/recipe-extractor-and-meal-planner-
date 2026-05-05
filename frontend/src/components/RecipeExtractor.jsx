import { useState } from 'react'
import { extractRecipe, listRecipes, deleteRecipe } from '../api/client'
import RecipeCard from './RecipeCard'
import {
  Search, Link2, Loader2, AlertCircle, ChevronRight,
  Clock, Users, ChefHat, Trash2, BookOpen
} from 'lucide-react'

export default function RecipeExtractor() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recipe, setRecipe] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  const handleExtract = async (e) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setRecipe(null)
    try {
      const data = await extractRecipe(url.trim())
      setRecipe(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to extract recipe. Please check the URL and try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    if (historyLoaded) return
    setLoadingHistory(true)
    try {
      const data = await listRecipes()
      setHistory(data)
      setHistoryLoaded(true)
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    await deleteRecipe(id)
    setHistory(h => h.filter(r => r.id !== id))
    if (recipe?.id === id) setRecipe(null)
  }

  const exampleUrls = [
    'https://www.allrecipes.com/recipe/23891/grilled-cheese-sandwich/',
    'https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/',
    'https://www.allrecipes.com/recipe/84334/slow-cooker-chicken-tikka-masala/',
  ]

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 80px' }}>

      {/* ── Hero input ─────────────────────────────────────────────────────── */}
      <div className="fade-up" style={{
        background: 'linear-gradient(135deg, var(--brown-dark) 0%, var(--brown) 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '48px 40px',
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, right: 80,
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <ChefHat size={28} color="var(--brown-light)" />
            <span style={{ color: 'var(--brown-light)', fontWeight: 600, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Recipe Extractor
            </span>
          </div>
          <h2 style={{ color: 'white', fontSize: 30, fontFamily: 'Playfair Display', marginBottom: 8 }}>
            Paste any recipe URL
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 28 }}>
            We'll scrape, structure, and enrich it with nutrition info, substitutions &amp; a shopping list.
          </p>

          <form onSubmit={handleExtract}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
                <Link2 size={16} style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--ink-faint)',
                }} />
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://www.allrecipes.com/recipe/..."
                  required
                  style={{
                    width: '100%', padding: '14px 14px 14px 40px',
                    border: 'none', borderRadius: 'var(--radius)',
                    fontSize: 14, fontFamily: 'DM Sans',
                    background: 'white', color: 'var(--ink)',
                    outline: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '14px 28px',
                  background: loading ? 'var(--brown-light)' : 'var(--amber)',
                  color: 'white', border: 'none',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'DM Sans', fontWeight: 600, fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {loading
                  ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Extracting…</>
                  : <><Search size={16} /> Extract Recipe</>
                }
              </button>
            </div>
          </form>

          {/* Example URLs */}
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: '26px' }}>Try:</span>
            {exampleUrls.map((u, i) => (
              <button key={i}
                onClick={() => setUrl(u)}
                style={{
                  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 20, padding: '3px 12px', fontSize: 11,
                  color: 'rgba(255,255,255,0.75)', cursor: 'pointer',
                  fontFamily: 'DM Sans',
                  transition: 'background 0.2s',
                }}
              >
                {u.split('/recipe/')[1]?.replace(/\//g, '').replace(/-/g, ' ').slice(0, 30) || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Loading skeleton ────────────────────────────────────────────────── */}
      {loading && <LoadingSkeleton />}

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {error && !loading && (
        <div className="fade-up" style={{
          background: 'var(--red-light)', border: '1px solid #f5c6c2',
          borderRadius: 'var(--radius)', padding: '16px 20px',
          display: 'flex', gap: 12, alignItems: 'flex-start',
          marginBottom: 32,
        }}>
          <AlertCircle size={18} color="var(--red)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 600, color: 'var(--red)', marginBottom: 2 }}>Extraction failed</p>
            <p style={{ color: '#7a2a22', fontSize: 14 }}>{error}</p>
          </div>
        </div>
      )}

      {/* ── Recipe result ───────────────────────────────────────────────────── */}
      {recipe && !loading && <RecipeCard recipe={recipe} />}

      {/* ── History panel ──────────────────────────────────────────────────── */}
      <div className="fade-up-delay-2" style={{ marginTop: 48 }}>
        <div
          onClick={loadHistory}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', marginBottom: historyLoaded ? 16 : 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={18} color="var(--brown)" />
            <h3 style={{ fontSize: 18, color: 'var(--brown-dark)' }}>Previously Extracted</h3>
          </div>
          <ChevronRight size={18} color="var(--ink-faint)"
            style={{ transform: historyLoaded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>

        {loadingHistory && (
          <p style={{ color: 'var(--ink-faint)', fontSize: 14 }}>Loading history…</p>
        )}

        {historyLoaded && history.length === 0 && (
          <p style={{ color: 'var(--ink-faint)', fontSize: 14 }}>No recipes extracted yet.</p>
        )}

        {historyLoaded && history.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {history.map(r => (
              <div key={r.id}
                onClick={() => getRecipe(r.id).then(setRecipe).catch(() => {})}
                style={{
                  background: 'white', borderRadius: 'var(--radius)',
                  padding: '18px 20px', cursor: 'pointer',
                  border: '1px solid var(--tan)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              >
                <button
                  onClick={e => handleDelete(r.id, e)}
                  style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--ink-faint)', padding: 4, borderRadius: 6,
                    display: 'flex', alignItems: 'center',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-faint)'}
                >
                  <Trash2 size={14} />
                </button>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, paddingRight: 24, color: 'var(--ink)' }}>
                  {r.title || 'Untitled Recipe'}
                </p>
                <div style={{ display: 'flex', gap: 14, color: 'var(--ink-faint)', fontSize: 12 }}>
                  {r.cuisine && <span>{r.cuisine}</span>}
                  {r.total_time && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {r.total_time}m
                    </span>
                  )}
                  {r.servings && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={11} /> {r.servings}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="fade-up" style={{ marginBottom: 32 }}>
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 32, boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div className="skeleton" style={{ width: 80, height: 24, borderRadius: 12 }} />
          <div className="skeleton" style={{ width: 60, height: 24, borderRadius: 12 }} />
        </div>
        <div className="skeleton" style={{ height: 36, width: '60%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 20, width: '80%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 32 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 24, width: 160, marginBottom: 16 }} />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 16, marginBottom: 10, width: `${85 - i * 5}%` }} />
        ))}
      </div>
      <p style={{
        textAlign: 'center', marginTop: 20, color: 'var(--ink-faint)', fontSize: 14,
        animation: 'pulse 1.5s ease infinite',
      }}>
        Scraping page · Sending to Claude · Structuring recipe data…
      </p>
    </div>
  )
}
