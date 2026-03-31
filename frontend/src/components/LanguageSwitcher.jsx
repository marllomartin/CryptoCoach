import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' }
];

export const LanguageSwitcher = ({ variant = 'default' }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update document direction when language changes
  useEffect(() => {
    const lang = languages.find(l => l.code === i18n.language);
    if (lang) {
      document.documentElement.dir = lang.dir;
      document.documentElement.lang = lang.code;
    }
  }, [i18n.language]);

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
    
    // Update document direction
    const lang = languages.find(l => l.code === langCode);
    if (lang) {
      document.documentElement.dir = lang.dir;
      document.documentElement.lang = langCode;
    }
  };

  if (variant === 'minimal') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors text-sm"
          data-testid="language-switcher-btn"
        >
          <span>{currentLang.flag}</span>
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute top-full right-0 mt-1 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-1 min-w-[120px] z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-800 transition-colors ${
                  i18n.language === lang.code ? 'text-primary' : 'text-gray-300'
                }`}
                data-testid={`lang-option-${lang.code}`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {i18n.language === lang.code && <Check className="w-3 h-3 ml-auto" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
        data-testid="language-switcher-btn"
      >
        <Globe className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-300">{currentLang.flag} {currentLang.name}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-xl py-2 min-w-[160px] z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors ${
                i18n.language === lang.code ? 'text-primary bg-primary/10' : 'text-gray-300'
              }`}
              data-testid={`lang-option-${lang.code}`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="flex-1 text-left">{lang.name}</span>
              {i18n.language === lang.code && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
