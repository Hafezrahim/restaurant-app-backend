import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  nameAr: string;
  nameEn: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'SAR', symbol: 'ر.س', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', nameAr: 'درهم إماراتي', nameEn: 'UAE Dirham' },
  { code: 'KWD', symbol: 'د.ك', nameAr: 'دينار كويتي', nameEn: 'Kuwaiti Dinar' },
  { code: 'BHD', symbol: 'د.ب', nameAr: 'دينار بحريني', nameEn: 'Bahraini Dinar' },
  { code: 'QAR', symbol: 'ر.ق', nameAr: 'ريال قطري', nameEn: 'Qatari Riyal' },
  { code: 'OMR', symbol: 'ر.ع', nameAr: 'ريال عماني', nameEn: 'Omani Rial' },
  { code: 'EGP', symbol: 'ج.م', nameAr: 'جنيه مصري', nameEn: 'Egyptian Pound' },
  { code: 'JOD', symbol: 'د.أ', nameAr: 'دينار أردني', nameEn: 'Jordanian Dinar' },
  { code: 'USD', symbol: '$', nameAr: 'دولار أمريكي', nameEn: 'US Dollar' },
  { code: 'EUR', symbol: '€', nameAr: 'يورو', nameEn: 'Euro' },
  { code: 'GBP', symbol: '£', nameAr: 'جنيه إسترليني', nameEn: 'British Pound' },
];

const STORAGE_KEY = 'mazaj_currency';

function loadCurrency(): Currency {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const found = CURRENCIES.find(c => c.code === stored);
    if (found) return found;
  }
  return CURRENCIES[0]; // SAR default
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amount: number | string) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: CURRENCIES[0],
  setCurrency: () => {},
  formatPrice: () => '',
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(loadCurrency);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, c.code);
  }, []);

  const formatPrice = useCallback((amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return `0 ${currency.symbol}`;
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency.symbol}`;
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};
