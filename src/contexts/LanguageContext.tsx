import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': { en: 'Home', hi: 'होम' },
  'nav.deals': { en: 'Deals', hi: 'डील्स' },
  'nav.events': { en: 'Events', hi: 'इवेंट्स' },
  'nav.news': { en: 'News', hi: 'समाचार' },
  'nav.account': { en: 'Account', hi: 'खाता' },
  'nav.explore': { en: 'Explore', hi: 'खोजें' },
  
  // Common
  'common.loading': { en: 'Loading...', hi: 'लोड हो रहा है...' },
  'common.error': { en: 'Error', hi: 'त्रुटि' },
  'common.success': { en: 'Success', hi: 'सफलता' },
  'common.save': { en: 'Save', hi: 'सेव करें' },
  'common.cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'common.confirm': { en: 'Confirm', hi: 'पुष्टि करें' },
  'common.share': { en: 'Share', hi: 'शेयर करें' },
  'common.copy': { en: 'Copy', hi: 'कॉपी करें' },
  'common.search': { en: 'Search', hi: 'खोजें' },
  'common.viewAll': { en: 'View All', hi: 'सभी देखें' },
  'common.signIn': { en: 'Sign In', hi: 'साइन इन करें' },
  'common.signUp': { en: 'Sign Up', hi: 'साइन अप करें' },
  'common.signOut': { en: 'Sign Out', hi: 'साइन आउट करें' },
  
  // Auth
  'auth.email': { en: 'Email', hi: 'ईमेल' },
  'auth.password': { en: 'Password', hi: 'पासवर्ड' },
  'auth.fullName': { en: 'Full Name', hi: 'पूरा नाम' },
  'auth.phone': { en: 'Phone Number', hi: 'फ़ोन नंबर' },
  'auth.forgotPassword': { en: 'Forgot Password?', hi: 'पासवर्ड भूल गए?' },
  'auth.noAccount': { en: "Don't have an account?", hi: 'खाता नहीं है?' },
  'auth.haveAccount': { en: 'Already have an account?', hi: 'पहले से खाता है?' },
  
  // Home
  'home.topDeals': { en: 'Top Deals', hi: 'टॉप डील्स' },
  'home.nearYou': { en: 'Near You', hi: 'आपके पास' },
  'home.trending': { en: 'Trending', hi: 'ट्रेंडिंग' },
  'home.featured': { en: 'Featured', hi: 'फीचर्ड' },
  'home.categories': { en: 'Categories', hi: 'श्रेणियां' },
  'home.seeMore': { en: 'See More', hi: 'और देखें' },
  
  // JAICoin
  'jaicoin.zone': { en: 'JAICoin Zone', hi: 'JAICoin ज़ोन' },
  'jaicoin.balance': { en: 'JAICoin Balance', hi: 'JAICoin बैलेंस' },
  'jaicoin.earn': { en: 'Earn JAICoins', hi: 'JAICoin कमाएं' },
  'jaicoin.spend': { en: 'Spend JAICoins', hi: 'JAICoin खर्च करें' },
  'jaicoin.history': { en: 'Transaction History', hi: 'लेन-देन इतिहास' },
  'jaicoin.referFriend': { en: 'Refer a Friend', hi: 'दोस्त को रेफर करें' },
  'jaicoin.dailyScratch': { en: 'Daily Scratch Card', hi: 'डेली स्क्रैच कार्ड' },
  'jaicoin.spinWheel': { en: 'Spin the Wheel', hi: 'व्हील घुमाएं' },
  
  // Referral
  'referral.program': { en: 'Referral Program', hi: 'रेफरल प्रोग्राम' },
  'referral.code': { en: 'Referral Code', hi: 'रेफरल कोड' },
  'referral.link': { en: 'Referral Link', hi: 'रेफरल लिंक' },
  'referral.earnings': { en: 'Referral Earnings', hi: 'रेफरल कमाई' },
  'referral.friends': { en: 'Friends Referred', hi: 'रेफर किए गए दोस्त' },
  'referral.howItWorks': { en: 'How It Works', hi: 'यह कैसे काम करता है' },
  'referral.shareCode': { en: 'Share your code', hi: 'अपना कोड शेयर करें' },
  'referral.friendSignsUp': { en: 'Friend signs up', hi: 'दोस्त साइन अप करे' },
  'referral.bothEarn': { en: 'Both earn rewards!', hi: 'दोनों को इनाम मिलें!' },
  
  // Deals
  'deals.title': { en: 'Deals', hi: 'डील्स' },
  'deals.discount': { en: 'Discount', hi: 'छूट' },
  'deals.buyNow': { en: 'Buy Now', hi: 'अभी खरीदें' },
  'deals.addToCart': { en: 'Add to Cart', hi: 'कार्ट में जोड़ें' },
  'deals.expired': { en: 'Expired', hi: 'समाप्त' },
  'deals.limited': { en: 'Limited Time', hi: 'सीमित समय' },
  
  // Events
  'events.title': { en: 'Events', hi: 'इवेंट्स' },
  'events.upcoming': { en: 'Upcoming Events', hi: 'आने वाले इवेंट्स' },
  'events.register': { en: 'Register Now', hi: 'अभी रजिस्टर करें' },
  'events.free': { en: 'Free', hi: 'मुफ़्त' },
  
  // Account
  'account.profile': { en: 'Profile', hi: 'प्रोफ़ाइल' },
  'account.wallet': { en: 'Wallet', hi: 'वॉलेट' },
  'account.orders': { en: 'Orders', hi: 'ऑर्डर्स' },
  'account.settings': { en: 'Settings', hi: 'सेटिंग्स' },
  'account.refer': { en: 'Refer & Earn', hi: 'रेफर करें और कमाएं' },
  'account.language': { en: 'Language', hi: 'भाषा' },
  
  // Leaderboard
  'leaderboard.title': { en: 'Leaderboard', hi: 'लीडरबोर्ड' },
  'leaderboard.rank': { en: 'Your Rank', hi: 'आपकी रैंक' },
  'leaderboard.topEarners': { en: 'Top Earners', hi: 'टॉप अर्नर्स' },
  
  // Settings
  'settings.language': { en: 'Language', hi: 'भाषा' },
  'settings.notifications': { en: 'Notifications', hi: 'नोटिफिकेशन' },
  'settings.privacy': { en: 'Privacy', hi: 'गोपनीयता' },
  'settings.help': { en: 'Help & Support', hi: 'मदद और सहायता' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language] || translation.en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
