"use client";

import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function SettingsPage() {
  const apiToken = useAppStore(state => state.apiToken);
  const setToken = useAppStore(state => state.setToken);
  const { t } = useTranslation();
  const [tokenInput, setTokenInput] = useState(apiToken || '');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSave = () => {
    setIsVerifying(true);
    // Mock API call to verify token
    setTimeout(() => {
      setToken(tokenInput);
      setIsVerifying(false);
    }, 1000);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('settings.title')}</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('settings.wbApiIntegration')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!apiToken ? (
            <div className="bg-orange-50 bg-orange-900/20 text-orange-800 text-orange-300 p-4 rounded-lg flex items-start gap-3 text-sm">
              <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">{t('settings.apiTokenNotSet')}</p>
                <p>{t('settings.apiTokenNotSetDesc')}</p>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 bg-green-900/20 text-green-800 text-green-300 p-4 rounded-lg flex items-center gap-3 text-sm">
              <CheckCircle2 size={20} className="flex-shrink-0" />
              <p className="font-medium">{t('settings.apiConnected')}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.apiToken')}</label>
              <input
                type="password"
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 bg-gray-900/50 border border-gray-300 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder=""
              />
              <p className="text-xs text-gray-500 mt-2">{t('settings.neverShareToken')}</p>
            </div>
            
            <Button onClick={handleSave} disabled={!tokenInput || isVerifying || (tokenInput === apiToken)}>
              {isVerifying ? t('settings.verifying') : (!apiToken ? t('settings.verifySave') : t('settings.updateToken'))}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.preferences')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100 border-gray-800">
            <div>
              <p className="font-medium">{t('settings.emailNotif')}</p>
              <p className="text-sm text-gray-500">{t('settings.emailNotifDesc')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 peer-focus:ring-purple-800 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">{t('settings.autoArchive')}</p>
              <p className="text-sm text-gray-500">{t('settings.autoArchiveDesc')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 peer-focus:ring-purple-800 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
