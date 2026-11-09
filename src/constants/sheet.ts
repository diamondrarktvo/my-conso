export const SHEETS = {
   LANGUAGE_PICKER: 'language-picker-sheet',
   THEME_PICKER: 'theme-picker-sheet',
} as const;

export type SheetIds = (typeof SHEETS)[keyof typeof SHEETS];
