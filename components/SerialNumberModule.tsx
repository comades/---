import React, { useState } from 'react';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Key } from 'lucide-react';

interface SerialNumberModuleProps {
  data: {
    serialNumber?: string;
    validSerialNumbers?: string[];
  };
  onComplete: () => void;
}

export const SerialNumberModule: React.FC<SerialNumberModuleProps> = ({ data, onComplete }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle');

  const handleSubmit = () => {
    const isValid = (data.validSerialNumbers || []).includes(input.trim()) || (data.serialNumber && input.trim() === data.serialNumber);
    if (isValid) {
      setStatus('success');
      setTimeout(onComplete, 1000);
    } else {
      setStatus('fail');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Key className="text-indigo-600" size={20} />
        {t('modules.serialNumber.title')}
      </h3>
      <input
        type="text"
        className="w-full p-3 border rounded-xl mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
        placeholder={t('modules.serialNumber.placeholder')}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Button fullWidth onClick={handleSubmit} disabled={status !== 'idle'}>
        {t('modules.serialNumber.submit')}
      </Button>
      
      {status === 'success' && (
        <div className="mt-4 flex items-center gap-2 text-green-600 font-bold animate-in fade-in">
          <CheckCircle2 size={18} /> {t('modules.serialNumber.success')}
        </div>
      )}
      {status === 'fail' && (
        <div className="mt-4 flex items-center gap-2 text-red-600 font-bold animate-in fade-in">
          <XCircle size={18} /> {t('modules.serialNumber.fail')}
        </div>
      )}
    </div>
  );
};
