"use client";

import Link from 'next/link';
import { useState, type CSSProperties } from 'react';

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
  const [activeScenarioTab, setActiveScenarioTab] = useState(1);

  const revealDelay = (ms: number): CSSProperties => ({ '--reveal-delay': `${ms}ms` } as CSSProperties);

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

  const renderScenarioVisual = (tabId: number) => {
    switch (tabId) {
      case 0:
        return (
          <div className="scenario-mockup-card">
            <div className="mockup-header">
              <span className="mockup-dot red" />
              <span className="mockup-dot yellow" />
              <span className="mockup-dot green" />
              <span className="mockup-header-title">{language === 'en' ? 'Filter by Products & Brands' : 'Фильтр по товарам и брендам'}</span>
            </div>
            <div className="mockup-body space-y-4">
              <div>
                <label className="mockup-label">{language === 'en' ? 'Brands to apply rule:' : 'Бренды для применения правила:'}</label>
                <div className="mockup-tags mt-1.5">
                  <span className="mockup-tag">
                    Xiaomi <button className="mockup-tag-remove">×</button>
                  </span>
                  <span className="mockup-tag">
                    Apple <button className="mockup-tag-remove">×</button>
                  </span>
                  <span className="mockup-tag-add">+ {language === 'en' ? 'Add brand' : 'Добавить бренд'}</span>
                </div>
              </div>
              <div>
                <label className="mockup-label">{language === 'en' ? 'WB Categories (Subjects):' : 'Предметы (Категории WB):'}</label>
                <div className="mockup-tags mt-1.5">
                  <span className="mockup-tag">
                    {language === 'en' ? 'Phone cases' : 'Чехлы для телефонов'} <button className="mockup-tag-remove">×</button>
                  </span>
                  <span className="mockup-tag-add">+ {language === 'en' ? 'Add category' : 'Добавить предмет'}</span>
                </div>
              </div>
              <div>
                <label className="mockup-label">{language === 'en' ? 'Articles (SKU):' : 'Артикулы (SKU):'}</label>
                <div className="mockup-tags mt-1.5">
                  <span className="mockup-tag">19284812 <button className="mockup-tag-remove">×</button></span>
                  <span className="mockup-tag">38472910 <button className="mockup-tag-remove">×</button></span>
                  <span className="mockup-tag-add">+ {language === 'en' ? 'Add SKU' : 'Добавить артикул'}</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="scenario-mockup-card">
            <div className="mockup-header">
              <span className="mockup-dot red" />
              <span className="mockup-dot yellow" />
              <span className="mockup-dot green" />
              <span className="mockup-header-title">{language === 'en' ? 'Scenario Behavior Settings' : 'Настройки поведения сценария'}</span>
            </div>
            <div className="mockup-body space-y-4">
              <div>
                <label className="mockup-label flex items-center gap-1">
                  {language === 'en' ? 'Rating' : 'Оценка'} <span className="text-red-500">*</span>
                  <span className="text-slate-400 text-xs">ⓘ</span>
                </label>
                <div className="mockup-checkboxes mt-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <label key={star} className="mockup-checkbox-label">
                      <input
                        type="checkbox"
                        className="mockup-checkbox"
                        checked={star >= 4}
                        readOnly
                      />
                      <span>{star} {language === 'en' ? (star === 1 ? 'star' : 'stars') : (star === 1 ? 'звезда' : star >= 5 ? 'звезд' : 'звезды')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mockup-divider" />
              <div className="mockup-foldable flex items-center justify-between text-indigo-600 font-semibold text-xs cursor-pointer">
                <span>{language === 'en' ? '∨ Additional settings' : '∨ Дополнительные настройки'}</span>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="scenario-mockup-card">
            <div className="mockup-header">
              <span className="mockup-dot red" />
              <span className="mockup-dot yellow" />
              <span className="mockup-dot green" />
              <span className="mockup-header-title">{language === 'en' ? 'Filter by Stop-Words' : 'Фильтрация по стоп-словам'}</span>
            </div>
            <div className="mockup-body space-y-3">
              <p className="mockup-subtext mb-2">
                {language === 'en' ? 'If any of these words are found in the review, the auto-reply will not be sent:' : 'При обнаружении этих слов автоответ отправлен не будет:'}
              </p>
              <div className="mockup-tags mt-2">
                {['брак', 'порван', 'возврат', 'подделка'].map((word, idx) => (
                  <span key={idx} className="mockup-tag bg-red-50 text-red-700 border-red-100">
                    {language === 'en' ? (word === 'брак' ? 'defect' : word === 'порван' ? 'torn' : word === 'возврат' ? 'return' : 'fake') : word}
                    <button className="mockup-tag-remove text-red-400 hover:text-red-600">×</button>
                  </span>
                ))}
                <span className="mockup-tag-add border-dashed border-red-200 text-red-500 hover:bg-red-50/50">+ {language === 'en' ? 'Add stop-word' : 'Добавить слово'}</span>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="scenario-mockup-card">
            <div className="mockup-header">
              <span className="mockup-dot red" />
              <span className="mockup-dot yellow" />
              <span className="mockup-dot green" />
              <span className="mockup-header-title">{language === 'en' ? 'Trigger Words Triggering' : 'Срабатывание по триггерам'}</span>
            </div>
            <div className="mockup-body space-y-3">
              <p className="mockup-subtext mb-2">
                {language === 'en' ? 'Keywords that activate this specific reply template:' : 'Ключевые слова для активации сценария:'}
              </p>
              <div className="mockup-tags mt-2">
                {['подарок', 'качество', 'быстро', 'спасибо'].map((word, idx) => (
                  <span key={idx} className="mockup-tag bg-green-50 text-green-700 border-green-100">
                    {language === 'en' ? (word === 'подарок' ? 'gift' : word === 'качество' ? 'quality' : word === 'быстро' ? 'fast' : 'thanks') : word}
                    <button className="mockup-tag-remove text-green-400 hover:text-green-600">×</button>
                  </span>
                ))}
                <span className="mockup-tag-add border-dashed border-green-200 text-green-500 hover:bg-green-50/50">+ {language === 'en' ? 'Add trigger word' : 'Добавить слово'}</span>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="scenario-mockup-card">
            <div className="mockup-header">
              <span className="mockup-dot red" />
              <span className="mockup-dot yellow" />
              <span className="mockup-dot green" />
              <span className="mockup-header-title">{language === 'en' ? 'Filter by Media Files' : 'Фильтр по медиафайлам'}</span>
            </div>
            <div className="mockup-body space-y-4">
              <p className="mockup-subtext mb-2">
                {language === 'en' ? 'Presence of photos or videos in the review:' : 'Наличие фотографий в отзыве:'}
              </p>
              <div className="mockup-radios space-y-2.5">
                <label className="mockup-radio-label">
                  <input type="radio" name="media_action" className="mockup-radio" checked={false} readOnly />
                  <span className="font-semibold text-slate-800 text-xs">{language === 'en' ? 'Not important' : 'Не важно'}</span>
                </label>
                <label className="mockup-radio-label">
                  <input type="radio" name="media_action" className="mockup-radio" checked readOnly />
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 text-xs">{language === 'en' ? 'Only with photos/videos' : 'Только с фото'}</span>
                    <span className="text-[10px] text-slate-400">{language === 'en' ? 'Use a template thanking for beautiful photos' : 'Для шаблонов с благодарностью за фото товара'}</span>
                  </div>
                </label>
                <label className="mockup-radio-label">
                  <input type="radio" name="media_action" className="mockup-radio" checked={false} readOnly />
                  <span className="font-semibold text-slate-800 text-xs">{language === 'en' ? 'Only without media' : 'Только без фото'}</span>
                </label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="scenarios-section">
      <div className="scenarios-container">
        <div className="scenarios-header" data-reveal="up">
          <h2 className="scenarios-title">{t('landing.scenariosTitle')}</h2>
          <p className="scenarios-subtitle">{t('landing.scenariosSubtitle')}</p>
        </div>

        <div className="scenarios-tabs-wrapper" data-reveal="up">
          <div className="scenarios-tabs">
            {scenariosTabs.map((tab) => (
              <button
                key={tab.id}
                className={`scenario-tab-btn ${activeScenarioTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveScenarioTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="scenarios-content-grid">
          <div className="scenarios-visual-column" data-reveal="zoom" style={revealDelay(120)}>
            <div className="mockup-outer-frame">
              {renderScenarioVisual(activeScenarioTab)}
            </div>
          </div>

          <div className="scenarios-text-column" data-reveal="right" style={revealDelay(180)}>
            <h3 className="scenario-detail-title">{scenariosTabs[activeScenarioTab].title}</h3>
            <p className="scenario-detail-description">
              {t(`landing.scenariosTab${activeScenarioTab}Description`)}
            </p>
            <Link href={isAuthenticated ? '/dashboard' : registerHref} className="btn-scenario-primary">
              {t('landing.scenariosBtn')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}