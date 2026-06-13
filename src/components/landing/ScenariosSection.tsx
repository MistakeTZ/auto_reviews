"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type ScenariosSectionProps = {
  t: (key: string) => string;
  language: string;
  isAuthenticated: boolean;
  registerHref: string;
};

export default function ScenariosSection({
  t,
  language,
  isAuthenticated,
  registerHref,
}: ScenariosSectionProps) {
  const scenariosTabs = [
    {
      id: 0,
      label: t('landing.scenariosTab0'),
      title: t('landing.scenariosTab0Title'),
    },
    {
      id: 1,
      label: t('landing.scenariosTab1'),
      title: t('landing.scenariosTab1Title'),
    },
    {
      id: 2,
      label: t('landing.scenariosTab2'),
      title: t('landing.scenariosTab2Title'),
    },
    {
      id: 3,
      label: t('landing.scenariosTab3'),
      title: t('landing.scenariosTab3Title'),
    },
    {
      id: 4,
      label: t('landing.scenariosTab4'),
      title: t('landing.scenariosTab4Title'),
    },
  ];

  const [activeScenarioTab, setActiveScenarioTab] = useState(0);
  const [maxScenarioHeight, setMaxScenarioHeight] = useState<number>(0);
  const measureRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const nextSlide = () => {
    setActiveScenarioTab((prev) => (prev + 1) % scenariosTabs.length);
  };

  const prevSlide = () => {
    setActiveScenarioTab((prev) => (prev - 1 + scenariosTabs.length) % scenariosTabs.length);
  };

  const goToSlide = (id: number) => {
    setActiveScenarioTab(id);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };


  const renderScenarioVisual = (tabId: number) => {
    switch (tabId) {
      case 0:
        return (
          <div className="w-full max-w-[440px] overflow-hidden rounded-[12px] border border-black/5 bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.03)] transition duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
            <div className="flex items-center gap-1 border-b border-[#f0f0f0] bg-[#fafafa] px-3 py-2.5 sm:px-4 sm:py-3.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="ml-2 text-[0.7rem] font-bold uppercase tracking-[0.5px] text-slate-400">{language === 'en' ? 'Filter by Products & Brands' : 'Фильтр по товарам и брендам'}</span>
            </div>
            <div className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div>
                <label className="text-[0.8rem] font-bold text-[#0A192F]">{language === 'en' ? 'Brands to apply rule:' : 'Бренды для применения правила:'}</label>
                <div className="mt-1 sm:mt-1.5 flex flex-wrap gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md border border-[#edf2f7] bg-[#f7fafc] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-[#4a5568]">
                    Xiaomi <button className="leading-none text-[#cbd5e0] cursor-pointer">×</button>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-[#edf2f7] bg-[#f7fafc] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-[#4a5568]">
                    Apple <button className="leading-none text-[#cbd5e0] cursor-pointer">×</button>
                  </span>
                  <span className="inline-flex cursor-pointer items-center rounded-md border border-dashed border-[#e2e8f0] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-[#4f46e5] transition-colors hover:bg-[#fafafa]">+ {language === 'en' ? 'Add brand' : 'Добавить бренд'}</span>
                </div>
              </div>
              <div>
                <label className="text-[0.8rem] font-bold text-[#0A192F]">{language === 'en' ? 'WB Categories (Subjects):' : 'Предметы (Категории WB):'}</label>
                <div className="mt-1 sm:mt-1.5 flex flex-wrap gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md border border-[#edf2f7] bg-[#f7fafc] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-[#4a5568]">
                    {language === 'en' ? 'Phone cases' : 'Чехлы для телефонов'} <button className="leading-none text-[#cbd5e0] cursor-pointer">×</button>
                  </span>
                  <span className="inline-flex cursor-pointer items-center rounded-md border border-dashed border-[#e2e8f0] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-[#4f46e5] transition-colors hover:bg-[#fafafa]">+ {language === 'en' ? 'Add category' : 'Добавить предмет'}</span>
                </div>
              </div>
              <div>
                <label className="text-[0.8rem] font-bold text-[#0A192F]">{language === 'en' ? 'Articles (SKU):' : 'Артикулы (SKU):'}</label>
                <div className="mt-1 sm:mt-1.5 flex flex-wrap gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md border border-[#edf2f7] bg-[#f7fafc] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-[#4a5568]">19284812 <button className="leading-none text-[#cbd5e0] cursor-pointer">×</button></span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-[#edf2f7] bg-[#f7fafc] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-[#4a5568]">38472910 <button className="leading-none text-[#cbd5e0] cursor-pointer">×</button></span>
                  <span className="inline-flex cursor-pointer items-center rounded-md border border-dashed border-[#e2e8f0] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-[#4f46e5] transition-colors hover:bg-[#fafafa]">+ {language === 'en' ? 'Add SKU' : 'Добавить артикул'}</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="w-full max-w-[440px] overflow-hidden rounded-[12px] border border-black/5 bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.03)] transition duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
            <div className="flex items-center gap-1 border-b border-[#f0f0f0] bg-[#fafafa] px-3 py-2.5 sm:px-4 sm:py-3.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="ml-2 text-[0.7rem] font-bold uppercase tracking-[0.5px] text-slate-400">{language === 'en' ? 'Scenario Behavior Settings' : 'Настройки поведения сценария'}</span>
            </div>
            <div className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div>
                <label className="flex items-center gap-1 text-[0.8rem] font-bold text-[#0A192F]">
                  {language === 'en' ? 'Rating' : 'Оценка'} <span className="text-red-500">*</span>
                  <span className="text-xs text-slate-400">ⓘ</span>
                </label>
                <div className="mt-2 sm:mt-3 flex flex-col gap-1.5 sm:gap-2.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <label key={star} className="flex cursor-pointer items-center gap-2 text-[0.75rem] font-semibold text-[#4a5568]">
                      <input
                        type="checkbox"
                        className="h-[14px] w-[14px] rounded-[4px] border border-[#cbd5e1] accent-[#4f46e5]"
                        checked={star >= 4}
                        readOnly
                      />
                      <span>{star} {language === 'en' ? (star === 1 ? 'star' : 'stars') : (star === 1 ? 'звезда' : star >= 5 ? 'звезд' : 'звезды')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="h-px bg-[#edf2f7]" />
              <div className="flex cursor-pointer items-center justify-between text-xs font-semibold text-indigo-600">
                <span>{language === 'en' ? '∨ Additional settings' : '∨ Дополнительные настройки'}</span>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="w-full max-w-[440px] overflow-hidden rounded-[12px] border border-black/5 bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.03)] transition duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
            <div className="flex items-center gap-1 border-b border-[#f0f0f0] bg-[#fafafa] px-3 py-2.5 sm:px-4 sm:py-3.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="ml-2 text-[0.7rem] font-bold uppercase tracking-[0.5px] text-slate-400">{language === 'en' ? 'Filter by Stop-Words' : 'Фильтрация по стоп-словам'}</span>
            </div>
            <div className="space-y-2.5 p-4 sm:p-6">
              <p className="mb-2 text-[0.8rem] leading-[1.5] text-[#4a5568]">
                {language === 'en' ? 'If any of these words are found in the review, the auto-reply will not be sent:' : 'При обнаружении этих слов автоответ отправлен не будет:'}
              </p>
              <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                {['брак', 'порван', 'возврат', 'подделка'].map((word, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 rounded-md border border-red-100 bg-red-50 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-red-700">
                    {language === 'en' ? (word === 'брак' ? 'defect' : word === 'порван' ? 'torn' : word === 'возврат' ? 'return' : 'fake') : word}
                    <button className="leading-none text-red-400 hover:text-red-600 cursor-pointer">×</button>
                  </span>
                ))}
                <span className="inline-flex cursor-pointer items-center rounded-md border border-dashed border-red-200 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-red-500 transition-colors hover:bg-red-50/50">+ {language === 'en' ? 'Add stop-word' : 'Добавить слово'}</span>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full max-w-[440px] overflow-hidden rounded-[12px] border border-black/5 bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.03)] transition duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
            <div className="flex items-center gap-1 border-b border-[#f0f0f0] bg-[#fafafa] px-3 py-2.5 sm:px-4 sm:py-3.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="ml-2 text-[0.7rem] font-bold uppercase tracking-[0.5px] text-slate-400">{language === 'en' ? 'Trigger Words Triggering' : 'Срабатывание по триггерам'}</span>
            </div>
            <div className="space-y-2.5 p-4 sm:p-6">
              <p className="mb-2 text-[0.8rem] leading-[1.5] text-[#4a5568]">
                {language === 'en' ? 'Keywords that activate this specific reply template:' : 'Ключевые слова для активации сценария:'}
              </p>
              <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                {['подарок', 'качество', 'быстро', 'спасибо'].map((word, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 rounded-md border border-green-100 bg-green-50 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-green-700">
                    {language === 'en' ? (word === 'подарок' ? 'gift' : word === 'качество' ? 'quality' : word === 'быстро' ? 'fast' : 'thanks') : word}
                    <button className="leading-none text-green-400 hover:text-green-600 cursor-pointer">×</button>
                  </span>
                ))}
                <span className="inline-flex cursor-pointer items-center rounded-md border border-dashed border-green-200 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-green-500 transition-colors hover:bg-green-50/50">+ {language === 'en' ? 'Add trigger word' : 'Добавить слово'}</span>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="w-full max-w-[440px] overflow-hidden rounded-[12px] border border-black/5 bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.03)] transition duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
            <div className="flex items-center gap-1 border-b border-[#f0f0f0] bg-[#fafafa] px-3 py-2.5 sm:px-4 sm:py-3.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="ml-2 text-[0.7rem] font-bold uppercase tracking-[0.5px] text-slate-400">{language === 'en' ? 'Filter by Media Files' : 'Фильтр по медиафайлам'}</span>
            </div>
            <div className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <p className="mb-2 text-[0.8rem] leading-[1.5] text-[#4a5568]">
                {language === 'en' ? 'Presence of photos or videos in the review:' : 'Наличие фотографий в отзыве:'}
              </p>
              <div className="flex flex-col gap-2 sm:gap-3">
                <label className="flex cursor-pointer items-start gap-2">
                  <input type="radio" name="media_action" className="mt-0.5 h-[14px] w-[14px] rounded-full border border-[#cbd5e1] accent-[#4f46e5]" checked={false} readOnly />
                  <span className="text-xs font-semibold text-slate-800">{language === 'en' ? 'Not important' : 'Не важно'}</span>
                </label>
                <label className="flex cursor-pointer items-start gap-2">
                  <input type="radio" name="media_action" className="mt-0.5 h-[14px] w-[14px] rounded-full border border-[#cbd5e1] accent-[#4f46e5]" checked readOnly />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-800">{language === 'en' ? 'Only with photos/videos' : 'Только с фото'}</span>
                    <span className="text-[10px] text-slate-400">{language === 'en' ? 'Use a template thanking for beautiful photos' : 'Для шаблонов с благодарностью за фото товара'}</span>
                  </div>
                </label>
                <label className="flex cursor-pointer items-start gap-2">
                  <input type="radio" name="media_action" className="mt-0.5 h-[14px] w-[14px] rounded-full border border-[#cbd5e1] accent-[#4f46e5]" checked={false} readOnly />
                  <span className="text-xs font-semibold text-slate-800">{language === 'en' ? 'Only without media' : 'Только без фото'}</span>
                </label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const calculateMaxHeight = () => {
      const heights = measureRefs.current
        .map((el) => el?.getBoundingClientRect().height ?? 0)
        .filter((height) => height > 0);

      if (heights.length === 0) {
        return;
      }

      const nextMaxHeight = Math.ceil(Math.max(...heights));
      setMaxScenarioHeight((prev) => (nextMaxHeight !== prev ? nextMaxHeight : prev));
    };

    const rafId = window.requestAnimationFrame(calculateMaxHeight);
    window.addEventListener('resize', calculateMaxHeight);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', calculateMaxHeight);
    };
  }, [language]);

  return (
    <section className="overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20" style={{ contentVisibility: 'auto', containIntrinsicSize: '850px' }}>
      <div className="relative mx-auto max-w-[1200px]">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-0" aria-hidden="true">
          {scenariosTabs.map((tab, idx) => (
            <div
              key={`measure-${tab.id}`}
              className="w-full max-w-[440px]"
              ref={(el) => {
                measureRefs.current[idx] = el;
              }}
            >
              {renderScenarioVisual(tab.id)}
            </div>
          ))}
        </div>

        <div className="mb-10 text-center" data-reveal="up">
          <h2 className="m-0 mb-4 text-[clamp(1.8rem,3.2vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-0.5px] text-[#0A192F]">{t('landing.scenariosTitle')}</h2>
          <p className="m-0 text-[clamp(1rem,1.8vw,1.125rem)] font-medium text-[#4A5568]">{t('landing.scenariosSubtitle')}</p>
        </div>

        <div className="relative w-full px-0 sm:px-12 lg:px-16" data-reveal="up">
          {/* Navigation Arrows (hidden on mobile/tablet, swipe is used instead) */}
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-0 lg:left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 backdrop-blur-sm text-slate-600 shadow-sm transition-all hover:bg-white hover:text-indigo-600 hover:shadow-md active:scale-95 cursor-pointer"
            aria-label="Previous scenario"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-0 lg:right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 backdrop-blur-sm text-slate-600 shadow-sm transition-all hover:bg-white hover:text-indigo-600 hover:shadow-md active:scale-95 cursor-pointer"
            aria-label="Next scenario"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Carousel Track Wrapper */}
          <div
            className="overflow-hidden w-full"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeScenarioTab * 100}%)` }}
            >
              {scenariosTabs.map((tab) => (
                <div key={tab.id} className="w-full shrink-0 px-4 sm:px-6">
                  <div className="grid items-center gap-4 sm:gap-8 lg:gap-12 lg:grid-cols-[1.2fr_1fr]">
                    
                    {/* Header on Mobile: Visible only on mobile */}
                    <div className="flex flex-col items-center lg:hidden w-full text-center mb-1">
                      <h3 className="text-[clamp(1.3rem,2.2vw,1.6rem)] font-extrabold tracking-[-0.5px] text-[#0A192F] mb-2 sm:mb-4">
                        {tab.title}
                      </h3>
                    </div>

                    {/* Column 1: Visual representation */}
                    <div className="w-full flex justify-center">
                      <div className="w-full flex items-center justify-center rounded-[24px] bg-[#f3f4f6] p-4 sm:p-8 lg:p-12 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_10px_15px_-3px_rgba(0,0,0,0.02)]">
                        <div style={maxScenarioHeight > 0 ? { minHeight: `${maxScenarioHeight}px` } : undefined}>
                          {renderScenarioVisual(tab.id)}
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Text description and CTA button */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full px-2 sm:px-6 lg:px-0 mt-2 lg:mt-0">
                      {/* Title on Desktop */}
                      <h3 className="hidden lg:block mb-4 text-[clamp(1.5rem,2.5vw,2.2rem)] font-extrabold tracking-[-0.5px] text-[#0A192F]">
                        {tab.title}
                      </h3>
                      {/* Description on both Mobile and Desktop */}
                      <p className="mb-4 sm:mb-6 lg:mb-8 text-[clamp(0.95rem,1.6vw,1.1rem)] font-medium leading-[1.6] text-[#4A5568]">
                        {t(`landing.scenariosTab${tab.id}Desc`)}
                      </p>
                      {/* CTA Button on both Mobile and Desktop */}
                      <Link href={isAuthenticated ? '/dashboard' : registerHref} className="inline-flex min-h-[3.25rem] items-center justify-center rounded-[0.625rem] border-0 bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 text-base font-bold text-white shadow-[0_10px_20px_rgba(99,102,241,0.15)] transition duration-200 hover:-translate-y-0.5 hover:from-indigo-600 hover:to-indigo-700 hover:shadow-[0_14px_26px_rgba(99,102,241,0.25)]">
                        {t('landing.scenariosBtn')}
                      </Link>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="mt-4 sm:mt-8 flex justify-center gap-2">
            {scenariosTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => goToSlide(tab.id)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${activeScenarioTab === tab.id ? 'w-8 bg-indigo-600' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
                aria-label={`Go to slide ${tab.id + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}