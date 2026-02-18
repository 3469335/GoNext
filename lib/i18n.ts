import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ru from "../locales/ru.json";
import en from "../locales/en.json";

export const LANG_STORAGE_KEY = "@gonext_lang";

export const SUPPORTED_LANGUAGES = ["ru", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: "ru",
  fallbackLng: "ru",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
