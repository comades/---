
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { db, auth } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

import { useAuth } from './AuthContext';
import { TranslationData } from '../types';

interface LanguageContextType {
  translations: TranslationData;
  updateTranslation: (key: string, lang: string, value: string) => Promise<void>;
  updateTranslations: (newTranslations: TranslationData) => Promise<void>;
  languages: string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [translations, setTranslations] = useState<TranslationData>({});
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const languages = ['zh-TW', 'zh-CN', 'en'];

  useEffect(() => {
    if (user?.language) {
      i18n.changeLanguage(user.language);
    }
  }, [user?.language, i18n]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'system', 'translations'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as TranslationData;
        setTranslations(data);
        
        // Update i18next resources
        languages.forEach(lang => {
          const langResources: { [key: string]: string } = {};
          Object.keys(data).forEach(key => {
            const val = data[key][lang];
            if (val) {
              langResources[key] = val;
            } else if (lang === 'zh-TW') {
              langResources[key] = key;
            }
          });
          // Use overwrite: true to ensure we have the latest from DB
          i18n.addResourceBundle(lang, 'translation', langResources, true, true);
        });
      }
    });

    return () => unsub();
  }, [i18n]);

  const updateTranslation = async (key: string, lang: string, value: string) => {
    const newTranslations = { ...translations };
    if (!newTranslations[key]) newTranslations[key] = {};
    newTranslations[key][lang] = value;
    
    await setDoc(doc(db, 'system', 'translations'), newTranslations);
  };

  const updateTranslations = async (newTranslations: TranslationData) => {
    await setDoc(doc(db, 'system', 'translations'), newTranslations);
  };

  return (
    <LanguageContext.Provider value={{ translations, updateTranslation, updateTranslations, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
