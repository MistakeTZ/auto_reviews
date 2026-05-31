import { useCallback, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { en } from '@/locales/en';
import { ru } from '@/locales/ru';

const dictionaries = { en, ru };

type Dictionary = typeof en;

export function useTranslation() {
  const language = useAppStore(state => state.language);
  const dict = useMemo(() => dictionaries[language] || dictionaries.en, [language]);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: any = dict;
    for (const k of keys) {
      if (value[k] === undefined) {
        return key;
      }
      value = value[k];
    }
    return value as string;
  }, [dict]);

  return { t, language, setLanguage: useAppStore.getState().setLanguage };
}
