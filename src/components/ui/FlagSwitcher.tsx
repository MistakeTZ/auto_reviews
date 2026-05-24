"use client";

import { useTranslation } from '@/hooks/useTranslation';

export default function FlagSwitcher() {
  const { language } = useTranslation();

  return (
    <div className="relative w-7 h-7 select-none">
      <span
        className={`absolute transition-all duration-300 leading-none ${
          language === 'en'
            ? 'z-10 text-xl top-0 left-0 drop-shadow-md scale-100'
            : 'z-0 text-xl bottom-0 right-0 opacity-60 scale-90'
        }`}
      >
        🇬🇧
      </span>
      <span
        className={`absolute transition-all duration-300 leading-none ${
          language === 'ru'
            ? 'z-10 text-xl top-0 left-0 drop-shadow-md scale-100'
            : 'z-0 text-xl bottom-0 right-0 opacity-60 scale-90'
        }`}
      >
        🇷🇺
      </span>
    </div>
  );
}
