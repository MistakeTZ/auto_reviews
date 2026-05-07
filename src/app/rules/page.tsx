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
  const [newRule, setNewRule] = useState<Omit<Rule, 'id'>>({
    name: '',
    target: 'general',
    nmId: '',
    conditionRatingOperator: 'exact',
    conditionRating: 5,
    conditionKeyword: '',
    actionType: 'template',
    actionText: ''
  });

  const handleAdd = () => {
    if (newRule.name && newRule.actionText) {
      addRule(newRule);
      setIsAdding(false);
      setNewRule({ name: '', target: 'general', nmId: '', conditionRatingOperator: 'exact', conditionRating: 5, conditionKeyword: '', actionType: 'template', actionText: '' });
    }
  };

  const formatOperator = (op: string) => {
    if (op === 'less_than') return t('rules.lessThan');
    if (op === 'more_than') return t('rules.moreThan');
    return t('rules.exactly');
  };

  useEffect(() => {
    // After initial page data load, do one extra additive refresh from WB.
    const run = async () => {
      await fetchProducts(true, false);
    };
    void run();
  }, [fetchProducts]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('rules.title')}</h1>
        <Button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2">
          <Plus size={16} />
          {isAdding ? t('common.cancel') : t('rules.createRule')}
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-8 border-purple-200 dark:border-purple-900/50 shadow-md">
          <CardHeader>
            <CardTitle>{t('rules.createRule')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('rules.ruleName')}</label>
              <input
                type="text"
                value={newRule.name}
                onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder=""
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('rules.target')}</label>
                <select
                  value={newRule.target}
                  onChange={e => setNewRule({ ...newRule, target: e.target.value as 'general' | 'specific_nm', nmId: e.target.value === 'general' ? '' : products[0]?.nmId || '' })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="general">{t('rules.generalAll')}</option>
                  <option value="specific_nm">{t('rules.specificProduct')}</option>
                </select>
              </div>

              {newRule.target === 'specific_nm' && (
                <div>
                  <label className="block text-sm font-medium mb-1">{t('rules.selectProduct')}</label>
                  <select
                    value={newRule.nmId}
                    onChange={e => setNewRule({ ...newRule, nmId: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {products.map(p => (
                      <option key={p.nmId} value={p.nmId}>{p.name} ({p.nmId})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('rules.condition')}</label>
                <select
                  value={newRule.conditionRatingOperator}
                  onChange={e => setNewRule({ ...newRule, conditionRatingOperator: e.target.value as 'exact' | 'less_than' | 'more_than' })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="exact">{t('rules.exactly')}</option>
                  <option value="less_than">{t('rules.lessThan')}</option>
                  <option value="more_than">{t('rules.moreThan')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('rules.rating')}</label>
                <select
                  value={newRule.conditionRating || 5}
                  onChange={e => setNewRule({ ...newRule, conditionRating: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value={5}>5 {t('rules.stars')}</option>
                  <option value={4}>4 {t('rules.stars')}</option>
                  <option value={3}>3 {t('rules.stars')}</option>
                  <option value={2}>2 {t('rules.stars')}</option>
                  <option value={1}>1 {t('rules.stars')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('rules.keywordOptional')}</label>
                <input
                  type="text"
                  value={newRule.conditionKeyword}
                  onChange={e => setNewRule({ ...newRule, conditionKeyword: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder=""
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('rules.actionType')}</label>
              <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 w-fit">
                <button
                  type="button"
                  onClick={() => setNewRule({ ...newRule, actionType: 'template' })}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    newRule.actionType === 'template'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {t('rules.actionTypeTemplate')}
                </button>
                <button
                  type="button"
                  onClick={() => setNewRule({ ...newRule, actionType: 'gpt' })}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    newRule.actionType === 'gpt'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {t('rules.actionTypeGpt')}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {newRule.actionType === 'gpt' ? t('rules.actionPrompt') : t('rules.actionReplyText')}
              </label>
              <textarea
                value={newRule.actionText}
                onChange={e => setNewRule({ ...newRule, actionText: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                placeholder=""
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleAdd} disabled={!newRule.name || !newRule.actionText}>
                {t('rules.saveRule')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {rules.map(rule => (
          <Card key={rule.id}>
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400">{rule.name}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${rule.target === 'general' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'}`}>
                    {rule.target === 'general' ? t('rules.general') : `${t('rules.productNm')} ${rule.nmId}`}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    rule.actionType === 'gpt'
                      ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {rule.actionType === 'gpt' ? 'GPT' : t('rules.actionTypeTemplate')}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-sm mb-3 border border-gray-100 dark:border-gray-800">
                  <span className="font-medium text-gray-500 dark:text-gray-400">{t('rules.if')}</span> {t('rules.rating')} <span className="font-bold">{formatOperator(rule.conditionRatingOperator).toLowerCase()} {rule.conditionRating} {t('rules.stars')}</span>
                  {rule.conditionKeyword && <span> {t('dashboard.andContains')} "{rule.conditionKeyword}"</span>}
                </div>
                <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg text-sm border border-green-100 dark:border-green-900/30">
                  <span className="font-medium text-green-600 dark:text-green-500 block mb-1">
                    {rule.actionType === 'gpt' ? t('rules.actionPrompt') : t('rules.thenReplyWith')}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{rule.actionText}</span>
                </div>
              </div>
              <div className="sm:pl-6 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 pt-4 sm:pt-0">
                <Button variant="danger" onClick={() => deleteRule(rule.id)} className="w-full sm:w-auto flex items-center justify-center gap-2">
                  <Trash2 size={16} />
                  {t('common.delete')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {rules.length === 0 && !isAdding && (
          <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            {t('rules.noRules')}
          </div>
        )}
      </div>
    </div>
  );
}
