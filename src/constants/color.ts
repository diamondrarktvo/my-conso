/**
 * Valeurs hexadécimales IDENTIQUES à celles de global.css (mêmes tokens, mêmes valeurs).
 * Elles servent aux consommateurs JS qui ne savent pas lire les variables CSS (graphiques SVG,
 * barre d'onglets, icônes, toasts) et de secours si une variable CSS est absente.
 * Toute modification de couleur se fait dans les DEUX fichiers.
 */

export const COLORS = {
   light: {
      // Backgrounds
      background: '#f8fafc',
      backgroundSecondary: '#f1f5f9',
      card: '#ffffff',
      cardHover: '#f8fafc',

      // Text
      foreground: '#0f172a',
      foregroundSecondary: '#475569',
      foregroundMuted: '#64748b',
      foregroundInverse: '#ffffff',

      // Borders
      border: '#cbd5e1',
      borderSubtle: '#e2e8f0',

      // Brand (deep orange: white text = 5.2:1)
      primary: '#c2410c',
      primaryHover: '#9a3412',
      primarySoft: '#fff1e0',

      // Semantic
      danger: '#dc2626',
      dangerSoft: '#fee2e2',
      success: '#15803d',
      successSoft: '#dcfce7',
      warning: '#92400e',
      warningSoft: '#fef3c7',
      info: '#1d4ed8',
      infoSoft: '#dbeafe',

      // Rating
      rating: '#fbbf24',
      ratingInactive: '#cbd5e1',
   },
   dark: {
      // Backgrounds (night blue)
      background: '#0f172a',
      backgroundSecondary: '#1a2438',
      card: '#1e293b',
      cardHover: '#273449',

      // Text
      foreground: '#f8fafc',
      foregroundSecondary: '#cbd5e1',
      foregroundMuted: '#94a3b8',
      foregroundInverse: '#0f172a',

      // Borders
      border: '#334155',
      borderSubtle: '#263248',

      // Brand (bright orange: navy text = 7.9:1)
      primary: '#fb923c',
      primaryHover: '#fdba74',
      primarySoft: '#4a2c17',

      // Semantic
      danger: '#f87171',
      dangerSoft: '#4c2026',
      success: '#4ade80',
      successSoft: '#173a27',
      warning: '#fbbf24',
      warningSoft: '#43361a',
      info: '#60a5fa',
      infoSoft: '#1e3a5f',

      // Rating
      rating: '#fbbf24',
      ratingInactive: '#475569',
   },
};
