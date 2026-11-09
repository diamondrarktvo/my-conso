import i18next, { Module } from "i18next";
import "intl-pluralrules";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANGUAGE, DEFAULT_NS } from "./constant";
import { Locales } from "./locales";
import { cacheStorage, CACHE_KEYS } from "@/src/providers/cache-provider";

const languageDetector = {
  type: "languageDetector",
  detect: () => {
    try {
      const serialized = cacheStorage.getString(CACHE_KEYS.LANGUAGE);
      if (serialized) {
        const { value } = JSON.parse(serialized);
        if (value) return value;
      }
    } catch {}
    return DEFAULT_LANGUAGE;
  },
  init: () => {},
  cacheUserLanguage: (lng: string) => {
    cacheStorage.set(CACHE_KEYS.LANGUAGE, JSON.stringify({ value: lng, timestamp: Date.now() }));
  },
};


i18next
  .use(languageDetector as Module)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LANGUAGE,
    ns: Object.keys(Locales.fr),
    defaultNS: DEFAULT_NS,
    resources: Locales,
  });

  export default i18next;