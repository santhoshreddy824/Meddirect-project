// Currency utilities for Indian Rupee focused pricing system
// Price range: ₹500-1000 with proper support for Indian payment methods

// Exchange rates (INR focused - you should update these regularly or use a real-time API)
const EXCHANGE_RATES = {
  USD: 83.25,    // 1 USD = 83.25 INR (base to INR)
  INR: 1.00,     // Base currency - Indian Rupee
  EUR: 90.15,    // 1 EUR = 90.15 INR
  GBP: 105.40,   // 1 GBP = 105.40 INR
  CAD: 61.20,    // 1 CAD = 61.20 INR
  AUD: 54.50,    // 1 AUD = 54.50 INR
  JPY: 0.56,     // 1 JPY = 0.56 INR
  SGD: 61.70,    // 1 SGD = 61.70 INR
  AED: 22.65,    // 1 AED = 22.65 INR
  SAR: 22.20,    // 1 SAR = 22.20 INR
};

// Currency configurations by country (INR focused)
const CURRENCY_CONFIG = {
  // Primary market - India
  'IN': { currency: 'INR', symbol: '₹', name: 'Indian Rupee', primary: true },
  
  // Other supported countries (converted from INR)
  'US': { currency: 'USD', symbol: '$', name: 'US Dollar' },
  'CA': { currency: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  'GB': { currency: 'GBP', symbol: '£', name: 'British Pound' },
  'DE': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'FR': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'IT': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'ES': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'NL': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'AU': { currency: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  'JP': { currency: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  'SG': { currency: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  'MY': { currency: 'USD', symbol: '$', name: 'US Dollar' }, // Fallback
  'TH': { currency: 'USD', symbol: '$', name: 'US Dollar' }, // Fallback
  'AE': { currency: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  'SA': { currency: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
  'QA': { currency: 'USD', symbol: '$', name: 'US Dollar' }, // Fallback
  
  // Default fallback
  'DEFAULT': { currency: 'INR', symbol: '₹', name: 'Indian Rupee' }
};

// Payment methods by country (enhanced for India)
const PAYMENT_METHODS_CONFIG = {
  'IN': {
    primary: ['instamojo'],
    secondary: ['razorpay', 'stripe'],
    currencies: ['INR'],
    features: {
      upi: true,
      cards: true,
      netbanking: true,
      wallets: true,
      emi: false
    }
  },
  'US': {
    primary: ['stripe'],
    secondary: ['paypal'],
    currencies: ['USD'],
    features: {
      cards: true,
      paypal: true,
      applepay: true,
      googlepay: false // Different from Indian Google Pay
    }
  },
  'GB': {
    primary: ['stripe'],
    secondary: ['paypal'],
    currencies: ['GBP'],
    features: {
      cards: true,
      paypal: true,
      applepay: true
    }
  },
  'CA': {
    primary: ['stripe'],
    secondary: ['paypal'],
    currencies: ['CAD'],
    features: {
      cards: true,
      paypal: true
    }
  },
  'AU': {
    primary: ['stripe'],
    secondary: ['paypal'],
    currencies: ['AUD'],
    features: {
      cards: true,
      paypal: true
    }
  },
  'DEFAULT': {
    primary: ['instamojo'],
    secondary: ['razorpay', 'stripe'],
    currencies: ['INR'],
    features: {
      upi: true,
      cards: true,
      netbanking: true,
      wallets: true
    }
  }
};

// Indian Rupee pricing tiers (₹500-1000 range)
const PRICING_TIERS_INR = {
  'basic': { price: 500, name: 'Basic Consultation', description: 'General consultation' },
  'standard': { price: 650, name: 'Standard Consultation', description: 'Detailed consultation with follow-up' },
  'premium': { price: 800, name: 'Premium Consultation', description: 'Comprehensive consultation with reports' },
  'specialist': { price: 950, name: 'Specialist Consultation', description: 'Expert specialist consultation' },
  'emergency': { price: 1000, name: 'Emergency Consultation', description: 'Urgent medical consultation' }
};

// Convert INR to other currencies
export const convertFromINR = (amountINR, targetCurrency) => {
  if (targetCurrency === 'INR') return amountINR;
  
  const rate = EXCHANGE_RATES[targetCurrency];
  if (!rate) {
    console.warn(`Exchange rate not found for ${targetCurrency}, using INR`);
    return amountINR;
  }
  
  // Convert INR to target currency
  const convertedAmount = amountINR / rate;
  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
};

// Format currency with proper symbols and formatting
export const formatCurrency = (amount, countryCode) => {
  const config = getCurrencyConfig(countryCode);
  
  // Special formatting for different currencies
  switch (config.currency) {
    case 'INR':
      // Indian numbering system with proper formatting
      return `${config.symbol}${amount.toLocaleString('en-IN')}`;
    case 'JPY':
      // No decimal places for Yen
      return `${config.symbol}${Math.round(amount).toLocaleString()}`;
    default:
      return `${config.symbol}${amount.toFixed(2)}`;
  }
};

// Get currency configuration for country
export const getCurrencyConfig = (countryCode) => {
  return CURRENCY_CONFIG[countryCode] || CURRENCY_CONFIG.DEFAULT;
};

// Get payment methods configuration for country
export const getPaymentMethodsConfig = (countryCode) => {
  return PAYMENT_METHODS_CONFIG[countryCode] || PAYMENT_METHODS_CONFIG.DEFAULT;
};

// Check if UPI is available for the country
export const isUPIAvailable = (countryCode) => {
  const config = getPaymentMethodsConfig(countryCode);
  return config.features.upi === true;
};

// Get localized pricing based on country (all prices derived from INR ₹500-1000 range)
export const getLocalizedPricing = (tierOrAmount, countryCode) => {
  const currencyConfig = getCurrencyConfig(countryCode);
  
  let baseAmountINR;
  let tierInfo = null;
  
  // If tier name is provided, get the INR amount from predefined tiers
  if (typeof tierOrAmount === 'string' && PRICING_TIERS_INR[tierOrAmount]) {
    tierInfo = PRICING_TIERS_INR[tierOrAmount];
    baseAmountINR = tierInfo.price;
  } else {
    // If amount is provided, ensure it's within ₹500-1000 range
    baseAmountINR = Math.max(500, Math.min(1000, Number(tierOrAmount) || 650));
  }
  
  // Convert to target currency
  const convertedAmount = convertFromINR(baseAmountINR, currencyConfig.currency);
  const formattedAmount = formatCurrency(convertedAmount, countryCode);
  
  return {
    amount: convertedAmount,
    currency: currencyConfig.currency,
    symbol: currencyConfig.symbol,
    formatted: formattedAmount,
    inrEquivalent: baseAmountINR,
    inrFormatted: formatCurrency(baseAmountINR, 'IN'),
    tier: tierInfo,
    countryCode
  };
};

// Get all available pricing tiers for a country
export const getPricingTiers = (countryCode) => {
  return Object.keys(PRICING_TIERS_INR).map(tierKey => {
    return {
      key: tierKey,
      ...getLocalizedPricing(tierKey, countryCode)
    };
  });
};

// Indian payment methods details
export const getIndianPaymentMethods = () => {
  return {
    upi: {
      name: 'UPI',
      description: 'Pay using any UPI app - Instant & Secure',
      icon: '📱',
      apps: [
        { id: 'googlepay', name: 'Google Pay', icon: '🟢', popular: true },
        { id: 'phonepe', name: 'PhonePe', icon: '🟣', popular: true },
        { id: 'paytm', name: 'Paytm', icon: '🔵', popular: true },
        { id: 'amazonpay', name: 'Amazon Pay', icon: '🟠', popular: false },
        { id: 'bhim', name: 'BHIM UPI', icon: '🇮🇳', popular: false },
        { id: 'mobikwik', name: 'MobiKwik', icon: '🔴', popular: false }
      ]
    },
    cards: {
      name: 'Cards',
      description: 'Credit/Debit Cards - Visa, Mastercard, RuPay',
      icon: '💳',
      types: ['Visa', 'Mastercard', 'RuPay', 'American Express']
    },
    // Removed netbanking as per requirement
    wallets: {
      name: 'Wallets',
      description: 'Digital wallets',
      icon: '💰',
      options: ['Paytm Wallet', 'PhonePe Wallet', 'Amazon Pay', 'MobiKwik', 'Freecharge']
    }
  };
};

// Default export with all utilities
export default {
  convertFromINR,
  formatCurrency,
  getCurrencyConfig,
  getPaymentMethodsConfig,
  isUPIAvailable,
  getLocalizedPricing,
  getPricingTiers,
  getIndianPaymentMethods,
  PRICING_TIERS_INR,
  EXCHANGE_RATES
};
