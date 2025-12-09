import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import Spanish translations (only language)
import es from '../../locales/es.json';

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
  },
  lng: 'es', // Spanish as default and only language
  fallbackLng: 'es',
  debug: false,
  interpolation: {
    escapeValue: false, // React Native already escapes
  },
  react: {
    useSuspense: false, // Important for React Native
  },
});

export default i18n;
