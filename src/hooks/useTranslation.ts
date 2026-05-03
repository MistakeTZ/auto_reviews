import { useAppStore } from '@/store/useAppStore';
import { en } from '@/locales/en';
import { ru } from '@/locales/ru';

const dictionaries = { en, ru };

type Dictionary = typeof en;

export function useTranslation() {
  const language = useAppStore(state => state.language);
  const dict = dictionaries[language] || dictionaries.en;

  // Simple dot notation accessor: t('common.login')
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = dict;
    for (const k of keys) {
      if (value[k] === undefined) {
        return key; // return key itself if not found
      }
      value = value[k];
    }
    return value as string;
  };

  return { t, language, setLanguage: useAppStore.getState().setLanguage };
}
