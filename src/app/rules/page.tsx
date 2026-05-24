"use client";

import { useAppStore, Rule } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function RulesPage() {
  const rules = useAppStore(state => state.rules);
  const products = useAppStore(state => state.products);
  const addRule = useAppStore(state => state.addRule);
  const deleteRule = useAppStore(state => state.deleteRule);
  const fetchProducts = useAppStore(state => state.fetchProducts);
  const { t } = useTranslation();

  const [isAdding, setIsAdding] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [newRule, setNewRule] = useState<Omit<Rule, 'id'>>({
    name: '',
    target: 'general',
    nmId: '',
    conditionRatingOperator: 'exact',
    conditionRating: 5,
    conditionKeyword: '',
    actionType: 'template',
    actionText: '',
    withVideo: false,
    withPhoto: false,
    withName: false
  });

  const handleAdd = () => {
    if (newRule.name && newRule.actionText) {
      addRule(newRule);
      setIsAdding(false);
      setNewRule({
        name: '',
        target: 'general',
        nmId: '',
        conditionRatingOperator: 'exact',
        conditionRating: 5,
        conditionKeyword: '',
        actionType: 'template',
        actionText: '',
        withVideo: false,
        withPhoto: false,
        withName: false
      });
    }
  };

  const formatOperator = (op: string) => {
    if (op === 'less_than') return t('rules.lessThan');
    if (op === 'more_than') return t('rules.moreThan');
    return t('rules.exactly');
  };

  const insertTagName = () => {
    const textarea = document.getElementById('action-text-area') as HTMLTextAreaElement;
    if (!textarea) {
      setNewRule({ ...newRule, actionText: newRule.actionText + '[name]' });
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const nextValue = before + '[name]' + after;
    setNewRule({ ...newRule, actionText: nextValue });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 6, start + 6);
    }, 0);
  };

  useEffect(() => {
    const run = async () => {
      await fetchProducts(true, false);
    };
    void run();
  }, [fetchProducts]);

  // Sort rules (newest is first by default)
  const sortedRules = [...rules].sort((a, b) => {
    if (sortOrder === 'newest') {
      return Number(b.id) - Number(a.id);
    } else {
      return Number(a.id) - Number(b.id);
    }
  });

  return (
    <div className="pt-24 px-4 pb-8 md:p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('rules.title')}</h1>
        <Button 
          onClick={() => setIsAdding(!isAdding)} 
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} />
          {isAdding ? t('common.cancel') : t('rules.createRule')}
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-8 border border-purple-100 shadow-lg rounded-2xl bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
            <CardTitle className="text-lg font-bold text-slate-800">{t('rules.createRule')}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('rules.ruleName')}</label>
              <input
                type="text"
                value={newRule.name}
                onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                placeholder="Например: Автоответ на 5 звезд"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('rules.target')}</label>
                <select
                  value={newRule.target}
                  onChange={e => setNewRule({ ...newRule, target: e.target.value as 'general' | 'specific_nm', nmId: e.target.value === 'general' ? '' : products[0]?.nmId || '' })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 outline-none text-slate-800 text-sm font-medium transition-all cursor-pointer"
                >
                  <option value="general">{t('rules.generalAll')}</option>
                  <option value="specific_nm">{t('rules.specificProduct')}</option>
                </select>
              </div>

              {newRule.target === 'specific_nm' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {t('rules.selectProduct')} ({newRule.nmId ? newRule.nmId.split(',').length : 0} выбрано)
                  </label>
                  <div className="border border-slate-200 rounded-xl p-3 max-h-44 overflow-y-auto space-y-2 bg-slate-50/50">
                    {products.map(p => {
                      const selectedIds = newRule.nmId ? newRule.nmId.split(',').map(x => x.trim()) : [];
                      const isChecked = selectedIds.includes(p.nmId);
                      return (
                        <label key={p.nmId} className="flex items-center gap-3 cursor-pointer hover:bg-slate-200/50 p-2 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              let nextIds;
                              if (isChecked) {
                                nextIds = selectedIds.filter(id => id !== p.nmId);
                              } else {
                                nextIds = [...selectedIds, p.nmId];
                              }
                              setNewRule({ ...newRule, nmId: nextIds.join(',') });
                            }}
                            className="rounded border-slate-350 text-purple-600 focus:ring-purple-500 h-4.5 w-4.5 cursor-pointer"
                          />
                          <span className="text-xs text-slate-700 leading-tight">
                            <span className="font-bold text-slate-900">{p.name}</span>{' '}
                            <span className="text-slate-500">({p.nmId})</span>
                          </span>
                        </label>
                      );
                    })}
                    {products.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">Нет доступных товаров</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('rules.condition')}</label>
                <select
                  value={newRule.conditionRatingOperator}
                  onChange={e => setNewRule({ ...newRule, conditionRatingOperator: e.target.value as 'exact' | 'less_than' | 'more_than' })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 outline-none text-slate-800 text-sm font-medium transition-all cursor-pointer"
                >
                  <option value="less_than">{t('rules.lessThan')}</option>
                  <option value="more_than">{t('rules.moreThan')}</option>
                  <option value="exact">{t('rules.exactly')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('rules.rating')}</label>
                <select
                  value={newRule.conditionRating || 5}
                  onChange={e => setNewRule({ ...newRule, conditionRating: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 outline-none text-slate-800 text-sm font-medium transition-all cursor-pointer"
                >
                  <option value={5}>5 {t('rules.stars')}</option>
                  <option value={4}>4 {t('rules.stars')}</option>
                  <option value={3}>3 {t('rules.stars')}</option>
                  <option value={2}>2 {t('rules.stars')}</option>
                  <option value={1}>1 {t('rules.stars')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('rules.keywordOptional')}</label>
                <input
                  type="text"
                  value={newRule.conditionKeyword}
                  onChange={e => setNewRule({ ...newRule, conditionKeyword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                  placeholder="Например: брак, ремонт"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 mt-2">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Дополнительные условия (отзыв должен содержать)</span>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700 hover:text-slate-900 transition-colors font-medium">
                  <input
                    type="checkbox"
                    checked={!!newRule.withVideo}
                    onChange={e => setNewRule({ ...newRule, withVideo: e.target.checked })}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4.5 w-4.5 cursor-pointer"
                  />
                  <span>С видео</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700 hover:text-slate-900 transition-colors font-medium">
                  <input
                    type="checkbox"
                    checked={!!newRule.withPhoto}
                    onChange={e => setNewRule({ ...newRule, withPhoto: e.target.checked })}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4.5 w-4.5 cursor-pointer"
                  />
                  <span>С фото</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700 hover:text-slate-900 transition-colors font-medium">
                  <input
                    type="checkbox"
                    checked={!!newRule.withName}
                    onChange={e => setNewRule({ ...newRule, withName: e.target.checked })}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4.5 w-4.5 cursor-pointer"
                  />
                  <span>С именем покупателя</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('rules.actionType')}</label>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 w-fit p-1 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setNewRule({ ...newRule, actionType: 'template' })}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${newRule.actionType === 'template'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                    }`}
                >
                  {t('rules.actionTypeTemplate')}
                </button>
                <button
                  type="button"
                  onClick={() => setNewRule({ ...newRule, actionType: 'gpt' })}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${newRule.actionType === 'gpt'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                    }`}
                >
                  {t('rules.actionTypeGpt')}
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {newRule.actionType === 'gpt' ? t('rules.actionPrompt') : t('rules.actionReplyText')}
                </label>
                <button
                  type="button"
                  onClick={insertTagName}
                  className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span>{'{ }'}</span>
                  <span>[name]</span>
                </button>
              </div>
              <textarea
                id="action-text-area"
                value={newRule.actionText}
                onChange={e => setNewRule({ ...newRule, actionText: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 outline-none h-28 resize-none text-slate-800 text-sm font-medium transition-all"
                placeholder={newRule.actionType === 'gpt' ? "Напишите инструкции для ИИ..." : "Здравствуйте, [name]! Спасибо..."}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button 
                onClick={handleAdd} 
                disabled={!newRule.name || !newRule.actionText} 
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {t('rules.saveRule')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules list header controls */}
      <div className="flex justify-between items-center mb-6 bg-slate-100 px-5 py-3.5 rounded-xl border border-slate-200/70 shadow-sm">
        <span className="text-sm font-semibold text-slate-700">
          Всего правил: <span className="font-extrabold text-slate-900 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg ml-1 shadow-sm">{rules.length}</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Сортировка:</span>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="text-xs px-3 py-1.5 bg-white border border-slate-250 rounded-lg focus:ring-2 focus:ring-purple-500/25 text-slate-700 font-semibold cursor-pointer shadow-sm outline-none transition-all"
          >
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {sortedRules.map(rule => (
          <Card key={rule.id} className="border border-slate-200 bg-white hover:border-purple-200 hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300 rounded-xl overflow-hidden">
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{rule.name}</h3>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${rule.target === 'general' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                    {rule.target === 'general' ? t('rules.general') : `${t('rules.productNm')} ${rule.nmId}`}
                  </span>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${rule.actionType === 'gpt'
                    ? 'bg-violet-50 text-violet-750 border-violet-100'
                    : 'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                    {rule.actionType === 'gpt' ? 'GPT' : t('rules.actionTypeTemplate')}
                  </span>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl text-sm border border-slate-100 flex flex-col gap-2">
                  <div>
                    <span className="font-bold text-slate-500">{t('rules.if')}</span> {t('rules.rating')}{' '}
                    <span className="font-extrabold text-slate-800">{formatOperator(rule.conditionRatingOperator).toLowerCase()} {rule.conditionRating} {t('rules.stars')}</span>
                    {rule.conditionKeyword && (
                      <span>
                        {' '}
                        {t('dashboard.andContains')}{' '}
                        <span className="font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-lg ml-1 shadow-sm">
                          "{rule.conditionKeyword}"
                        </span>
                      </span>
                    )}
                  </div>
                  
                  {(rule.withVideo || rule.withPhoto || rule.withName) && (
                    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-200/50">
                      {rule.withVideo && <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 rounded-lg text-xs font-bold shadow-sm">С видео</span>}
                      {rule.withPhoto && <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 rounded-lg text-xs font-bold shadow-sm">С фото</span>}
                      {rule.withName && <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 rounded-lg text-xs font-bold shadow-sm">С именем</span>}
                    </div>
                  )}
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-xl text-sm border border-emerald-100/60 shadow-sm">
                  <span className="font-bold text-emerald-700 block mb-1 text-xs uppercase tracking-wider">
                    {rule.actionType === 'gpt' ? t('rules.actionPrompt') : t('rules.thenReplyWith')}
                  </span>
                  <span className="text-slate-700 font-medium whitespace-pre-wrap">{rule.actionText}</span>
                </div>
              </div>

              <div className="sm:pl-6 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0">
                <Button 
                  variant="danger" 
                  onClick={() => deleteRule(rule.id)} 
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  <Trash2 size={16} />
                  {t('common.delete')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {rules.length === 0 && !isAdding && (
          <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-sm">
            <span className="text-4xl block mb-2">📋</span>
            <span className="text-sm font-semibold">{t('rules.noRules')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
