/**
 * ALERT : Ce fichier de constantes est utilisé uniquement en tant que solution de secours (fallback)
 * au cas où le fichier global.css ne serait pas chargé, ou si certaines variables CSS
 * venaient à être absentes ou supprimées.
 */

export const COLORS = {
   light: {
      // Backgrounds
      background: '#fdfcfb',
      backgroundSecondary: '#f2f4f8',
      card: '#ffffff',
      cardHover: '#faf9f8',

      // Text
      foreground: '#31343a',
      foregroundSecondary: '#6b7280',
      foregroundMuted: '#9ca3af',
      foregroundInverse: '#f8f9fa',

      // Borders
      border: '#d1d5db',
      borderSubtle: '#e5e7eb',

      // Brand
      primary: '#f46d25',
      primaryHover: '#da5a1b',
      primarySoft: 'rgba(255, 219, 196, 0.3)', // oklch(90% 0.08 45 / 0.3)

      // Semantic
      danger: '#e62e1c',
      dangerSoft: 'rgba(255, 215, 209, 0.3)',
      success: '#2ec15e',
      successSoft: 'rgba(215, 245, 222, 0.3)',
      warning: '#e8c200',
      warningSoft: 'rgba(250, 240, 190, 0.3)',
      info: '#00a3f5',
      infoSoft: 'rgba(200, 235, 255, 0.3)',

      // Rating
      rating: '#f5bf1e',
      ratingInactive: '#dadada',
   },
   dark: {
      // Backgrounds
      background: '#2a2421',
      backgroundSecondary: '#36302d',
      card: '#3b2d2a',
      cardHover: '#433c39',

      // Text
      foreground: '#f7f2f0',
      foregroundSecondary: '#c2bab7',
      foregroundMuted: '#857c7a',
      foregroundInverse: '#2a2624',

      // Borders
      border: '#514946',
      borderSubtle: '#433c39',

      // Brand - Vibrant orange
      primary: '#ff844b',
      primaryHover: '#e6703e',
      primarySoft: 'rgba(135, 85, 65, 0.3)',

      // Semantic
      danger: '#ff5b49',
      dangerSoft: 'rgba(120, 60, 55, 0.3)',
      success: '#5ce68b',
      successSoft: 'rgba(60, 115, 80, 0.3)',
      warning: '#ffd64d',
      warningSoft: 'rgba(115, 100, 50, 0.3)',
      info: '#4dc8ff',
      infoSoft: 'rgba(55, 105, 130, 0.3)',

      // Rating
      rating: '#ffd64d',
      ratingInactive: '#5c504b',
   },
};
