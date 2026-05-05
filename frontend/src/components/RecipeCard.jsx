import {
  Clock, Flame, Users, ChefHat, Leaf, ShoppingCart,
  Lightbulb, BookOpen, Star, CheckCircle2, Circle,
  Zap, Droplets, Wheat, Activity
} from 'lucide-react'
import { useState } from 'react'

const DIFFICULTY_COLOR = {
  easy:   { bg: 'var(--green-light)',  text: 'var(--green)' },
  medium: { bg: 'var(--amber-light)',  text: 'var(--amber)' },
  hard:   { bg: 'var(--red-light)',    text: 'var(--red)' },
}

const CATEGORY_ICON = {
  produce: '🥦', dairy: '🧀', meat_seafood: '🥩', pantry: '🫙',
  spices_herbs: '🌿', bakery: '🍞', frozen: '🧊', other: '📦',
}

export default function RecipeCard({ recipe }) {
  const [checkedSteps, setCheckedSteps] = useState(new Set())
  const [checkedIngredients, setCheckedIngredients] = useState(new Set())
  const [activeTab, setActiveTab] = useState('overview')

  const toggleStep = (i) => setCheckedSteps(prev => {
    const n = new Set(prev)
    n.has(i) ? n.delete(i) : n.add(i)
    return n
  })
  const toggleIngredient = (i) => setCheckedIngredients(prev => {
    const n = new Set(prev)
    n.has(i) ? n.delete(i) : n.add(i)
    return n
  })

  const diff = recipe.difficulty?.toLowerCase()
  const diffColor = DIFFICULTY_COLOR[diff] || DIFFICULTY_COLOR.medium

  const tabs = ['overview', 'instructions', 'shopping', 'nutrition', 'related']

  return (
    <div className="fade-up" style={{
      background: 'white', borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
      marginBottom: 32,
    }}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--parchment) 0%, var(--tan) 100%)',
        padding: '32px 36px 28px',
        borderBottom: '1px solid var(--tan)',
      }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          {recipe.cuisine && (
            <Pill bg="var(--brown-dark)" text="white">{recipe.cuisine}</Pill>
          )}
          {diff && (
            <Pill bg={diffColor.bg} text={diffColor.text} style={{ textTransform: 'capitalize' }}>
              {recipe.difficulty}
            </Pill>
          )}
          {recipe.tags?.slice(0, 3).map(t => (
            <Pill key={t} bg="white" text="var(--ink-muted)">{t}</Pill>
          ))}
        </div>

        <h2 style={{ fontSize: 30, color: 'var(--ink)', marginBottom: 10, fontFamily: 'Playfair Display' }}>
          {recipe.title || 'Extracted Recipe'}
        </h2>
        {recipe.description && (
          <p style={{ color: 'var(--ink-muted)', fontSize: 15, lineHeight: 1.7, maxWidth: 680 }}>
            {recipe.description}
          </p>
        )}

        {/* Time + servings */}
        <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
          {recipe.prep_time && <TimeChip icon={<Clock size={14}/>} label="Prep" value={`${recipe.prep_time}m`} />}
          {recipe.cook_time && <TimeChip icon={<Flame size={14}/>} label="Cook" value={`${recipe.cook_time}m`} />}
          {recipe.total_time && <TimeChip icon={<Activity size={14}/>} label="Total" value={`${recipe.total_time}m`} />}
          {recipe.servings && <TimeChip icon={<Users size={14}/>} label="Serves" value={recipe.servings} />}
        </div>
      </div>

      {/* ── Tabs nav ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', borderBottom: '1px solid var(--tan)',
        overflowX: 'auto', padding: '0 8px',
        background: 'white',
      }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{
              padding: '14px 20px', background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 500,
              fontSize: 14, whiteSpace: 'nowrap',
              color: activeTab === t ? 'var(--brown-dark)' : 'var(--ink-faint)',
              borderBottom: activeTab === t ? '2px solid var(--brown-dark)' : '2px solid transparent',
              transition: 'all 0.2s',
              textTransform: 'capitalize',
            }}
          >{t}</button>
        ))}
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      <div style={{ padding: '28px 36px' }}>

        {/* OVERVIEW TAB: ingredients + substitutions */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

            {/* Ingredients */}
            <div>
              <SectionHeader icon={<Leaf size={16} />} title="Ingredients" />
              {recipe.ingredients?.length > 0
                ? recipe.ingredients.map((ing, i) => (
                    <div key={i}
                      onClick={() => toggleIngredient(i)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '8px 0', cursor: 'pointer',
                        borderBottom: '1px solid var(--parchment)',
                        opacity: checkedIngredients.has(i) ? 0.4 : 1,
                        transition: 'opacity 0.2s',
                      }}>
                      {checkedIngredients.has(i)
                        ? <CheckCircle2 size={16} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
                        : <Circle size={16} color="var(--brown-light)" style={{ flexShrink: 0, marginTop: 2 }} />
                      }
                      <span style={{ fontSize: 14, color: 'var(--ink)' }}>
                        {[ing.quantity, ing.unit].filter(Boolean).join(' ')}
                        {' '}
                        <strong>{ing.item}</strong>
                      </span>
                    </div>
                  ))
                : <Empty />}
            </div>

            {/* Substitutions */}
            <div>
              <SectionHeader icon={<Lightbulb size={16} />} title="Substitutions" />
              {recipe.substitutions?.length > 0
                ? recipe.substitutions.map((s, i) => (
                    <div key={i} style={{
                      background: 'var(--amber-light)',
                      border: '1px solid #f8e0b0',
                      borderRadius: 10, padding: '12px 14px', marginBottom: 10,
                    }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
                        <span style={{ color: 'var(--amber)' }}>Replace</span> {s.original}{' '}
                        <span style={{ color: 'var(--amber)' }}>→</span> {s.substitute}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{s.reason}</p>
                    </div>
                  ))
                : <Empty />}
            </div>
          </div>
        )}

        {/* INSTRUCTIONS TAB */}
        {activeTab === 'instructions' && (
          <div style={{ maxWidth: 680 }}>
            <SectionHeader icon={<ChefHat size={16} />} title="Step-by-Step Instructions" />
            {recipe.steps?.length > 0
              ? recipe.steps.map((step, i) => (
                  <div key={i}
                    onClick={() => toggleStep(i)}
                    style={{
                      display: 'flex', gap: 16, marginBottom: 20,
                      cursor: 'pointer',
                      opacity: checkedSteps.has(i) ? 0.45 : 1,
                      transition: 'opacity 0.2s',
                    }}>
                    <div style={{
                      width: 32, height: 32, flexShrink: 0,
                      borderRadius: '50%',
                      background: checkedSteps.has(i) ? 'var(--green)' : 'var(--brown-dark)',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, transition: 'background 0.2s',
                    }}>
                      {checkedSteps.has(i) ? '✓' : step.step_number}
                    </div>
                    <p style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.7, paddingTop: 5 }}>
                      {step.instruction}
                    </p>
                  </div>
                ))
              : <Empty />}
          </div>
        )}

        {/* SHOPPING TAB */}
        {activeTab === 'shopping' && (
          <div>
            <SectionHeader icon={<ShoppingCart size={16} />} title="Shopping List by Category" />
            {recipe.shopping_list && Object.keys(recipe.shopping_list).length > 0
              ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                  {Object.entries(recipe.shopping_list)
                    .filter(([, items]) => items?.length > 0)
                    .map(([cat, items]) => (
                      <div key={cat} style={{
                        background: 'var(--parchment)', borderRadius: 12,
                        padding: '16px 18px',
                        border: '1px solid var(--tan)',
                      }}>
                        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 16 }}>{CATEGORY_ICON[cat] || '📦'}</span>
                          {cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </p>
                        {items.map((item, i) => (
                          <p key={i} style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 4 }}>
                            • {item}
                          </p>
                        ))}
                      </div>
                    ))}
                </div>
              )
              : <Empty />}
          </div>
        )}

        {/* NUTRITION TAB */}
        {activeTab === 'nutrition' && (
          <div style={{ maxWidth: 560 }}>
            <SectionHeader icon={<Activity size={16} />} title="Nutritional Estimate (per serving)" />
            <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginBottom: 20 }}>
              * These are AI-generated approximations, not exact values.
            </p>
            {recipe.nutrition
              ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  <NutritionCard icon={<Zap size={20} />} label="Calories" value={recipe.nutrition.calories} unit="kcal" color="var(--amber)" />
                  <NutritionCard icon={<Activity size={20} />} label="Protein" value={recipe.nutrition.protein_g} unit="g" color="var(--blue)" />
                  <NutritionCard icon={<Wheat size={20} />} label="Carbohydrates" value={recipe.nutrition.carbs_g} unit="g" color="var(--green)" />
                  <NutritionCard icon={<Droplets size={20} />} label="Fat" value={recipe.nutrition.fat_g} unit="g" color="var(--red)" />
                </div>
              )
              : <Empty />}
          </div>
        )}

        {/* RELATED TAB */}
        {activeTab === 'related' && (
          <div>
            <SectionHeader icon={<BookOpen size={16} />} title="Recipes That Pair Well" />
            {recipe.related_recipes?.length > 0
              ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                  {recipe.related_recipes.map((r, i) => (
                    <div key={i} style={{
                      background: 'var(--parchment)', borderRadius: 12,
                      padding: '20px', border: '1px solid var(--tan)',
                    }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                        <Star size={15} color="var(--amber)" style={{ marginTop: 3, flexShrink: 0 }} />
                        <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{r.title}</p>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 8 }}>{r.description}</p>
                      <p style={{ fontSize: 12, color: 'var(--green)', fontStyle: 'italic' }}>
                        ↳ {r.why_it_pairs}
                      </p>
                    </div>
                  ))}
                </div>
              )
              : <Empty />}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Helper components ──────────────────────────────────────────────────────────

function Pill({ bg, text, children, style = {} }) {
  return (
    <span style={{
      background: bg, color: text, padding: '4px 12px',
      borderRadius: 20, fontSize: 12, fontWeight: 600,
      display: 'inline-block', ...style,
    }}>{children}</span>
  )
}

function TimeChip({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 11, color: 'var(--ink-faint)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon} {label}
      </span>
      <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>{value}</span>
    </div>
  )
}

function SectionHeader({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <span style={{ color: 'var(--brown)' }}>{icon}</span>
      <h3 style={{ fontSize: 17, color: 'var(--brown-dark)' }}>{title}</h3>
    </div>
  )
}

function NutritionCard({ icon, label, value, unit, color }) {
  return (
    <div style={{
      background: 'var(--parchment)', borderRadius: 12,
      padding: '20px', textAlign: 'center',
      border: '1px solid var(--tan)',
    }}>
      <div style={{ color, marginBottom: 8 }}>{icon}</div>
      <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Playfair Display' }}>
        {value ?? '—'}
        <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--ink-muted)', marginLeft: 4 }}>{unit}</span>
      </p>
      <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 4 }}>{label}</p>
    </div>
  )
}

function Empty() {
  return <p style={{ color: 'var(--ink-faint)', fontSize: 14, fontStyle: 'italic' }}>No data available.</p>
}
