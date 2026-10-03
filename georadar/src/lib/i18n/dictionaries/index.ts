import { en, type TranslationDictionary } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { de } from "./de";
import { ja } from "./ja";
import { zh } from "./zh";
import { hi } from "./hi";
import { pt } from "./pt";
import type { SupportedLanguage } from "../languages";

export const dictionaries: Record<SupportedLanguage, TranslationDictionary> = {
  en,
  es,
  fr,
  de,
  ja,
  zh,
  hi,
  pt,
};

export type { TranslationDictionary };
export { en, es, fr, de, ja, zh, hi, pt };
