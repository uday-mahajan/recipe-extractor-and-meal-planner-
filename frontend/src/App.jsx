import { useState } from 'react'
import './index.css'
import RecipeExtractor from './components/RecipeExtractor'
import { ChefHat, Utensils, CalendarDays } from 'lucide-react'

export default function App() {
  const [tab, setTab] = useState('extract')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>

      {/* ── Top Nav ──────────────────────────────────────────────────────────── */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid var(--tan)',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{
          maxWidth: 960, margin: '0 auto',
          padding: '0 24px',
          display: 'flex', alignItems: 'center', gap: 32,
          height: 64,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--brown-dark), var(--brown))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChefHat size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 700, color: 'var(--brown-dark)' }}>
              RecipeAI
            </span>
          </div>

          {/* Tab buttons */}
          <nav style={{ display: 'flex', gap: 4 }}>
            <NavTab
              active={tab === 'extract'}
              onClick={() => setTab('extract')}
              icon={<Utensils size={15} />}
              label="Extract Recipe"
            />
            <NavTab
              active={tab === 'meal-plan'}
              onClick={() => setTab('meal-plan')}
              icon={<CalendarDays size={15} />}
              label="Meal Planner"
              badge="Tab 2"
            />
          </nav>
        </div>
      </header>

      {/* ── Page header ───────────────────────────────────────────────────────── */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid var(--tan)',
        padding: '32px 24px 28px',
        marginBottom: 32,
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p style={{ fontSize: 13, color: 'var(--brown)', fontWeight: 600, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Powered by Claude AI + BeautifulSoup
          </p>
          <h1 style={{ fontSize: 38, color: 'var(--ink)', marginBottom: 10 }}>
            {tab === 'extract' ? 'Recipe Extractor' : 'Meal Planner'}
          </h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: 16, maxWidth: 600 }}>
            {tab === 'extract'
              ? 'Paste any recipe blog URL to automatically extract structured data, nutrition info, substitutions & a shopping list.'
              : 'Generate a personalised weekly meal plan using your saved recipes.'}
          </p>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <main>
        {tab === 'extract' && <RecipeExtractor />}
        {tab === 'meal-plan' && (
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
            <div style={{
              background: 'white', borderRadius: 'var(--radius-lg)',
              padding: '48px', textAlign: 'center',
              border: '2px dashed var(--tan)',
            }}>
              <CalendarDays size={40} color="var(--brown-light)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 22, marginBottom: 8 }}>Meal Planner — Coming Next</h3>
              <p style={{ color: 'var(--ink-faint)', fontSize: 15 }}>
                Tab 2 will let you generate a full 7-day meal plan from your saved recipes using Claude AI.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function NavTab({ active, onClick, icon, label, badge }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '8px 16px', borderRadius: 8, border: 'none',
      cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 500, fontSize: 14,
      background: active ? 'var(--parchment)' : 'transparent',
      color: active ? 'var(--brown-dark)' : 'var(--ink-muted)',
      transition: 'all 0.18s',
      position: 'relative',
    }}>
      {icon} {label}
      {badge && (
        <span style={{
          fontSize: 10, background: 'var(--amber)', color: 'white',
          padding: '1px 6px', borderRadius: 10, marginLeft: 2,
        }}>{badge}</span>
      )}
    </button>
  )
}
