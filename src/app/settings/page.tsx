"use client";

import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function SettingsPage() {
  const apiToken = useAppStore(state => state.apiToken);
  const setToken = useAppStore(state => state.setToken);
  const { t } = useTranslation();
  const [tokenInput, setTokenInput] = useState(apiToken || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);

  const handleTokenChange = (val: string) => {
    setTokenInput(val);
    if (errorMsg) setErrorMsg(null);
  };

  const handleSave = async () => {
    setIsVerifying(true);
    setErrorMsg(null);
    try {
      await setToken(tokenInput);
    } catch (e: any) {
      setErrorMsg(e.message || 'An error occurred while saving the token');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="pt-24 px-4 pb-8 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('settings.title')}</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('settings.wbApiIntegration')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!apiToken ? (
            <div className="bg-orange-50 bg-orange-900/20 text-black p-4 rounded-lg flex items-start gap-3 text-sm">
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
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  value={tokenInput || apiToken || ''}
                  onChange={e => handleTokenChange(e.target.value)}
                  className="w-full pl-4 pr-12 py-2 border border-gray-300 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder=""
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 focus:outline-none"
                >
                  {showToken ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">{t('settings.neverShareToken')}</p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 bg-red-900/20 text-red-800 text-red-300 p-4 rounded-lg flex items-start gap-3 text-sm">
                <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-red-500" />
                <div>
                  <p className="font-semibold mb-1">{t('settings.tokenError')}</p>
                  <p>{errorMsg}</p>
                </div>
              </div>
            )}

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
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">{t('settings.emailNotif')}</p>
              <p className="text-sm text-gray-500">{t('settings.emailNotifDesc')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 peer-focus:ring-purple-800 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
