/**
 * ============================================================
 *  THEME CONFIG — the one file to edit to re-skin this app
 * ============================================================
 *
 * To rebrand this template for a new restaurant / cafe / bar:
 *   1. Change `restaurant` below (name, tagline, currency).
 *   2. Pick one of the PRESETS, or copy one and tweak the colors.
 *   3. Set ACTIVE_PRESET to that key.
 * Nothing else in the codebase needs to change — every component
 * reads colors through Tailwind classes (bg-primary, text-ink, ...)
 * which are wired to the CSS variables set here.
 */

export const restaurant = {
  name: 'Dijivoo menu',
  tagline: {
    en: 'Modern flavors, timeless recipes',
    ar: 'نكهات عصرية ووصفات خالدة',
    tr: 'Modern lezzetler, zamansız tarifler',
  },
  currency: '₺',
}

// Each preset is a full set of CSS variables. Add your own by copying
// one of these blocks and changing the values.
export const PRESETS = {
  // Warm modern bistro — the default look for this template.
  modern: {
    '--color-bg': '#FAF6EF',
    '--color-surface': '#FFFFFF',
    '--color-ink': '#211C14',
    '--color-muted': '#8A8071',
    '--color-primary': '#D9A441',
    '--color-primary-dark': '#B9852B',
    '--color-secondary': '#79815F',
    '--color-accent': '#C1573B',
    '--color-border': '#EAE3D6',
    '--font-display': "'Fraunces', serif",
    '--font-body': "'Manrope', sans-serif",
    '--radius-card': '20px',
    '--radius-pill': '999px',
  },

  // Dark, high-contrast, gold accents — fine dining / lounges.
  luxury: {
    '--color-bg': '#14120F',
    '--color-surface': '#1E1B16',
    '--color-ink': '#F3EDE2',
    '--color-muted': '#9C9384',
    '--color-primary': '#C9A24B',
    '--color-primary-dark': '#A9822F',
    '--color-secondary': '#8A6E4B',
    '--color-accent': '#8E3B3B',
    '--color-border': '#2C2820',
    '--font-display': "'Fraunces', serif",
    '--font-body': "'Manrope', sans-serif",
    '--radius-card': '6px',
    '--radius-pill': '999px',
  },

  // Bright, pastel, friendly — coffee shops / bakeries.
  cafe: {
    '--color-bg': '#FFF8F1',
    '--color-surface': '#FFFFFF',
    '--color-ink': '#3B2A20',
    '--color-muted': '#A4907C',
    '--color-primary': '#E8886B',
    '--color-primary-dark': '#D06A4C',
    '--color-secondary': '#8FAE8B',
    '--color-accent': '#E0A23B',
    '--color-border': '#F1E2D3',
    '--font-display': "'Fraunces', serif",
    '--font-body': "'Manrope', sans-serif",
    '--radius-card': '28px',
    '--radius-pill': '999px',
  },

  // Bold and playful — casual / fast food.
  casual: {
    '--color-bg': '#FFFFFF',
    '--color-surface': '#FFF9F2',
    '--color-ink': '#22201D',
    '--color-muted': '#8D8983',
    '--color-primary': '#E5482F',
    '--color-primary-dark': '#C13A24',
    '--color-secondary': '#2E8B57',
    '--color-accent': '#F2B705',
    '--color-border': '#F0EAE2',
    '--font-display': "'Fraunces', serif",
    '--font-body': "'Manrope', sans-serif",
    '--radius-card': '18px',
    '--radius-pill': '999px',
  },
}

// 👉 Change this one line to switch the whole app's look.
export const ACTIVE_PRESET = 'modern'

export function applyTheme(presetKey = ACTIVE_PRESET) {
  const preset = PRESETS[presetKey] || PRESETS.modern
  const root = document.documentElement
  Object.entries(preset).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}
