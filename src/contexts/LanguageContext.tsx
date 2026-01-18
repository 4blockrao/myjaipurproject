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
  'nav.categories': { en: 'Categories', hi: 'श्रेणियां' },
  'nav.merchants': { en: 'Merchants', hi: 'व्यापारी' },
  'nav.wallet': { en: 'Wallet', hi: 'वॉलेट' },
  'nav.favorites': { en: 'Favorites', hi: 'पसंदीदा' },
  'nav.orders': { en: 'Orders', hi: 'ऑर्डर' },
  'nav.coupons': { en: 'Coupons', hi: 'कूपन' },
  'nav.profile': { en: 'Profile', hi: 'प्रोफ़ाइल' },
  'nav.settings': { en: 'Settings', hi: 'सेटिंग्स' },
  'nav.help': { en: 'Help', hi: 'मदद' },
  
  // Common
  'common.loading': { en: 'Loading...', hi: 'लोड हो रहा है...' },
  'common.error': { en: 'Error', hi: 'त्रुटि' },
  'common.success': { en: 'Success', hi: 'सफलता' },
  'common.save': { en: 'Save', hi: 'सेव करें' },
  'common.cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'common.confirm': { en: 'Confirm', hi: 'पुष्टि करें' },
  'common.share': { en: 'Share', hi: 'शेयर करें' },
  'common.copy': { en: 'Copy', hi: 'कॉपी करें' },
  'common.copied': { en: 'Copied!', hi: 'कॉपी हो गया!' },
  'common.search': { en: 'Search', hi: 'खोजें' },
  'common.viewAll': { en: 'View All', hi: 'सभी देखें' },
  'common.signIn': { en: 'Sign In', hi: 'साइन इन करें' },
  'common.signUp': { en: 'Sign Up', hi: 'साइन अप करें' },
  'common.signOut': { en: 'Sign Out', hi: 'साइन आउट करें' },
  'common.submit': { en: 'Submit', hi: 'जमा करें' },
  'common.close': { en: 'Close', hi: 'बंद करें' },
  'common.back': { en: 'Back', hi: 'वापस' },
  'common.next': { en: 'Next', hi: 'आगे' },
  'common.previous': { en: 'Previous', hi: 'पिछला' },
  'common.yes': { en: 'Yes', hi: 'हाँ' },
  'common.no': { en: 'No', hi: 'नहीं' },
  'common.ok': { en: 'OK', hi: 'ठीक है' },
  'common.delete': { en: 'Delete', hi: 'हटाएं' },
  'common.edit': { en: 'Edit', hi: 'संपादित करें' },
  'common.add': { en: 'Add', hi: 'जोड़ें' },
  'common.remove': { en: 'Remove', hi: 'हटाएं' },
  'common.update': { en: 'Update', hi: 'अपडेट करें' },
  'common.refresh': { en: 'Refresh', hi: 'रिफ्रेश करें' },
  'common.pullToRefresh': { en: 'Pull to refresh', hi: 'रिफ्रेश के लिए खींचें' },
  'common.releaseToRefresh': { en: 'Release to refresh', hi: 'रिफ्रेश के लिए छोड़ें' },
  'common.refreshing': { en: 'Refreshing...', hi: 'रिफ्रेश हो रहा है...' },
  'common.noData': { en: 'No data found', hi: 'कोई डेटा नहीं मिला' },
  'common.retry': { en: 'Retry', hi: 'पुनः प्रयास करें' },
  'common.today': { en: 'Today', hi: 'आज' },
  'common.yesterday': { en: 'Yesterday', hi: 'कल' },
  'common.tomorrow': { en: 'Tomorrow', hi: 'कल' },
  'common.all': { en: 'All', hi: 'सभी' },
  'common.filter': { en: 'Filter', hi: 'फ़िल्टर' },
  'common.sort': { en: 'Sort', hi: 'क्रमबद्ध करें' },
  'common.apply': { en: 'Apply', hi: 'लागू करें' },
  'common.reset': { en: 'Reset', hi: 'रीसेट करें' },
  'common.clear': { en: 'Clear', hi: 'साफ़ करें' },
  'common.download': { en: 'Download', hi: 'डाउनलोड करें' },
  'common.upload': { en: 'Upload', hi: 'अपलोड करें' },
  'common.select': { en: 'Select', hi: 'चुनें' },
  'common.selected': { en: 'Selected', hi: 'चयनित' },
  'common.price': { en: 'Price', hi: 'कीमत' },
  'common.quantity': { en: 'Quantity', hi: 'मात्रा' },
  'common.total': { en: 'Total', hi: 'कुल' },
  'common.free': { en: 'Free', hi: 'मुफ़्त' },
  'common.off': { en: 'OFF', hi: 'छूट' },
  'common.new': { en: 'New', hi: 'नया' },
  'common.hot': { en: 'Hot', hi: 'हॉट' },
  'common.popular': { en: 'Popular', hi: 'लोकप्रिय' },
  'common.recommended': { en: 'Recommended', hi: 'अनुशंसित' },
  'common.verified': { en: 'Verified', hi: 'सत्यापित' },
  
  // Auth
  'auth.email': { en: 'Email', hi: 'ईमेल' },
  'auth.password': { en: 'Password', hi: 'पासवर्ड' },
  'auth.fullName': { en: 'Full Name', hi: 'पूरा नाम' },
  'auth.phone': { en: 'Phone Number', hi: 'फ़ोन नंबर' },
  'auth.forgotPassword': { en: 'Forgot Password?', hi: 'पासवर्ड भूल गए?' },
  'auth.noAccount': { en: "Don't have an account?", hi: 'खाता नहीं है?' },
  'auth.haveAccount': { en: 'Already have an account?', hi: 'पहले से खाता है?' },
  'auth.createAccount': { en: 'Create Account', hi: 'खाता बनाएं' },
  'auth.loginSuccess': { en: 'Logged in successfully', hi: 'सफलतापूर्वक लॉगिन हुआ' },
  'auth.logoutSuccess': { en: 'Logged out successfully', hi: 'सफलतापूर्वक लॉगआउट हुआ' },
  'auth.invalidCredentials': { en: 'Invalid email or password', hi: 'अमान्य ईमेल या पासवर्ड' },
  'auth.resetPassword': { en: 'Reset Password', hi: 'पासवर्ड रीसेट करें' },
  'auth.verifyEmail': { en: 'Verify Email', hi: 'ईमेल सत्यापित करें' },
  'auth.enterOTP': { en: 'Enter OTP', hi: 'OTP दर्ज करें' },
  'auth.resendOTP': { en: 'Resend OTP', hi: 'OTP पुनः भेजें' },
  
  // Home
  'home.welcome': { en: 'Welcome', hi: 'स्वागत है' },
  'home.topDeals': { en: 'Top Deals', hi: 'टॉप डील्स' },
  'home.nearYou': { en: 'Near You', hi: 'आपके पास' },
  'home.trending': { en: 'Trending', hi: 'ट्रेंडिंग' },
  'home.featured': { en: 'Featured', hi: 'फीचर्ड' },
  'home.categories': { en: 'Categories', hi: 'श्रेणियां' },
  'home.seeMore': { en: 'See More', hi: 'और देखें' },
  'home.todaysDeals': { en: "Today's Deals", hi: 'आज की डील्स' },
  'home.flashSale': { en: 'Flash Sale', hi: 'फ्लैश सेल' },
  'home.bestSellers': { en: 'Best Sellers', hi: 'बेस्ट सेलर' },
  'home.newArrivals': { en: 'New Arrivals', hi: 'नए आगमन' },
  'home.upcomingEvents': { en: 'Upcoming Events', hi: 'आने वाले इवेंट' },
  'home.latestNews': { en: 'Latest News', hi: 'ताज़ा खबरें' },
  'home.topMerchants': { en: 'Top Merchants', hi: 'टॉप व्यापारी' },
  'home.discoverDeals': { en: 'Discover Deals', hi: 'डील्स खोजें' },
  'home.exploreCities': { en: 'Explore Cities', hi: 'शहर खोजें' },
  'home.searchPlaceholder': { en: 'Search deals, events...', hi: 'डील्स, इवेंट्स खोजें...' },
  
  // JAICoin
  'jaicoin.zone': { en: 'JAICoin Zone', hi: 'JAICoin ज़ोन' },
  'jaicoin.balance': { en: 'JAICoin Balance', hi: 'JAICoin बैलेंस' },
  'jaicoin.earn': { en: 'Earn JAICoins', hi: 'JAICoin कमाएं' },
  'jaicoin.spend': { en: 'Spend JAICoins', hi: 'JAICoin खर्च करें' },
  'jaicoin.history': { en: 'Transaction History', hi: 'लेन-देन इतिहास' },
  'jaicoin.referFriend': { en: 'Refer a Friend', hi: 'दोस्त को रेफर करें' },
  'jaicoin.dailyScratch': { en: 'Daily Scratch Card', hi: 'डेली स्क्रैच कार्ड' },
  'jaicoin.spinWheel': { en: 'Spin the Wheel', hi: 'व्हील घुमाएं' },
  'jaicoin.earnMore': { en: 'Earn More', hi: 'और कमाएं' },
  'jaicoin.redeemNow': { en: 'Redeem Now', hi: 'अभी रिडीम करें' },
  'jaicoin.availableBalance': { en: 'Available Balance', hi: 'उपलब्ध बैलेंस' },
  'jaicoin.lifetimeEarned': { en: 'Lifetime Earned', hi: 'कुल कमाई' },
  'jaicoin.thisMonth': { en: 'This Month', hi: 'इस महीने' },
  'jaicoin.credited': { en: 'Credited', hi: 'क्रेडिट हुआ' },
  'jaicoin.debited': { en: 'Debited', hi: 'डेबिट हुआ' },
  
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
  'referral.inviteFriends': { en: 'Invite Friends', hi: 'दोस्तों को आमंत्रित करें' },
  'referral.shareNow': { en: 'Share Now', hi: 'अभी शेयर करें' },
  'referral.totalReferred': { en: 'Total Referred', hi: 'कुल रेफर किए' },
  'referral.pendingRewards': { en: 'Pending Rewards', hi: 'लंबित पुरस्कार' },
  
  // Deals
  'deals.title': { en: 'Deals', hi: 'डील्स' },
  'deals.discount': { en: 'Discount', hi: 'छूट' },
  'deals.buyNow': { en: 'Buy Now', hi: 'अभी खरीदें' },
  'deals.addToCart': { en: 'Add to Cart', hi: 'कार्ट में जोड़ें' },
  'deals.expired': { en: 'Expired', hi: 'समाप्त' },
  'deals.limited': { en: 'Limited Time', hi: 'सीमित समय' },
  'deals.soldOut': { en: 'Sold Out', hi: 'बिक गया' },
  'deals.available': { en: 'Available', hi: 'उपलब्ध' },
  'deals.ending': { en: 'Ending Soon', hi: 'जल्द समाप्त' },
  'deals.claimDeal': { en: 'Claim Deal', hi: 'डील क्लेम करें' },
  'deals.viewDetails': { en: 'View Details', hi: 'विवरण देखें' },
  'deals.termsConditions': { en: 'Terms & Conditions', hi: 'नियम और शर्तें' },
  'deals.validUntil': { en: 'Valid Until', hi: 'तक मान्य' },
  'deals.usageLimit': { en: 'Usage Limit', hi: 'उपयोग सीमा' },
  'deals.originalPrice': { en: 'Original Price', hi: 'मूल कीमत' },
  'deals.dealPrice': { en: 'Deal Price', hi: 'डील कीमत' },
  'deals.youSave': { en: 'You Save', hi: 'आप बचाते हैं' },
  'deals.redeemNow': { en: 'Redeem Now', hi: 'अभी रिडीम करें' },
  'deals.shareThisDeal': { en: 'Share this Deal', hi: 'यह डील शेयर करें' },
  
  // Events
  'events.title': { en: 'Events', hi: 'इवेंट्स' },
  'events.upcoming': { en: 'Upcoming Events', hi: 'आने वाले इवेंट्स' },
  'events.register': { en: 'Register Now', hi: 'अभी रजिस्टर करें' },
  'events.free': { en: 'Free', hi: 'मुफ़्त' },
  'events.paid': { en: 'Paid', hi: 'सशुल्क' },
  'events.online': { en: 'Online', hi: 'ऑनलाइन' },
  'events.offline': { en: 'Offline', hi: 'ऑफलाइन' },
  'events.location': { en: 'Location', hi: 'स्थान' },
  'events.date': { en: 'Date', hi: 'तारीख' },
  'events.time': { en: 'Time', hi: 'समय' },
  'events.organizer': { en: 'Organizer', hi: 'आयोजक' },
  'events.attendees': { en: 'Attendees', hi: 'उपस्थित' },
  'events.interested': { en: 'Interested', hi: 'रुचि रखने वाले' },
  'events.going': { en: 'Going', hi: 'जा रहे हैं' },
  'events.notGoing': { en: 'Not Going', hi: 'नहीं जा रहे' },
  'events.createEvent': { en: 'Create Event', hi: 'इवेंट बनाएं' },
  'events.eventDetails': { en: 'Event Details', hi: 'इवेंट विवरण' },
  'events.shareEvent': { en: 'Share Event', hi: 'इवेंट शेयर करें' },
  'events.ticketPrice': { en: 'Ticket Price', hi: 'टिकट की कीमत' },
  'events.registrationClosed': { en: 'Registration Closed', hi: 'पंजीकरण बंद' },
  'events.soldOut': { en: 'Sold Out', hi: 'बिक गया' },
  'events.limitedSeats': { en: 'Limited Seats', hi: 'सीमित सीटें' },
  
  // News
  'news.title': { en: 'News', hi: 'समाचार' },
  'news.latest': { en: 'Latest News', hi: 'ताज़ा खबरें' },
  'news.trending': { en: 'Trending', hi: 'ट्रेंडिंग' },
  'news.city': { en: 'City', hi: 'शहर' },
  'news.food': { en: 'Food', hi: 'खाना' },
  'news.culture': { en: 'Culture', hi: 'संस्कृति' },
  'news.business': { en: 'Business', hi: 'व्यापार' },
  'news.sports': { en: 'Sports', hi: 'खेल' },
  'news.readMore': { en: 'Read More', hi: 'और पढ़ें' },
  'news.shareArticle': { en: 'Share Article', hi: 'लेख शेयर करें' },
  'news.publishedOn': { en: 'Published on', hi: 'प्रकाशित' },
  'news.author': { en: 'Author', hi: 'लेखक' },
  'news.views': { en: 'Views', hi: 'व्यूज' },
  'news.likes': { en: 'Likes', hi: 'लाइक्स' },
  
  // Account
  'account.profile': { en: 'Profile', hi: 'प्रोफ़ाइल' },
  'account.wallet': { en: 'Wallet', hi: 'वॉलेट' },
  'account.orders': { en: 'Orders', hi: 'ऑर्डर्स' },
  'account.settings': { en: 'Settings', hi: 'सेटिंग्स' },
  'account.refer': { en: 'Refer & Earn', hi: 'रेफर करें और कमाएं' },
  'account.language': { en: 'Language', hi: 'भाषा' },
  'account.myDeals': { en: 'My Deals', hi: 'मेरी डील्स' },
  'account.myCoupons': { en: 'My Coupons', hi: 'मेरे कूपन' },
  'account.myOrders': { en: 'My Orders', hi: 'मेरे ऑर्डर' },
  'account.savedDeals': { en: 'Saved Deals', hi: 'सेव की गई डील्स' },
  'account.notifications': { en: 'Notifications', hi: 'सूचनाएं' },
  'account.editProfile': { en: 'Edit Profile', hi: 'प्रोफ़ाइल संपादित करें' },
  'account.changePassword': { en: 'Change Password', hi: 'पासवर्ड बदलें' },
  'account.deleteAccount': { en: 'Delete Account', hi: 'खाता हटाएं' },
  'account.proMember': { en: 'Pro Member', hi: 'प्रो सदस्य' },
  'account.upgradeToPro': { en: 'Upgrade to Pro', hi: 'प्रो में अपग्रेड करें' },
  
  // Leaderboard
  'leaderboard.title': { en: 'Leaderboard', hi: 'लीडरबोर्ड' },
  'leaderboard.rank': { en: 'Your Rank', hi: 'आपकी रैंक' },
  'leaderboard.topEarners': { en: 'Top Earners', hi: 'टॉप अर्नर्स' },
  'leaderboard.thisWeek': { en: 'This Week', hi: 'इस सप्ताह' },
  'leaderboard.thisMonth': { en: 'This Month', hi: 'इस महीने' },
  'leaderboard.allTime': { en: 'All Time', hi: 'ऑल टाइम' },
  'leaderboard.points': { en: 'Points', hi: 'पॉइंट्स' },
  
  // Settings
  'settings.language': { en: 'Language', hi: 'भाषा' },
  'settings.notifications': { en: 'Notifications', hi: 'नोटिफिकेशन' },
  'settings.privacy': { en: 'Privacy & Security', hi: 'गोपनीयता और सुरक्षा' },
  'settings.help': { en: 'Help & Support', hi: 'मदद और सहायता' },
  'settings.about': { en: 'About', hi: 'जानकारी' },
  'settings.termsOfService': { en: 'Terms of Service', hi: 'सेवा की शर्तें' },
  'settings.privacyPolicy': { en: 'Privacy Policy', hi: 'गोपनीयता नीति' },
  'settings.darkMode': { en: 'Dark Mode', hi: 'डार्क मोड' },
  'settings.pushNotifications': { en: 'Push Notifications', hi: 'पुश नोटिफिकेशन' },
  'settings.emailNotifications': { en: 'Email Notifications', hi: 'ईमेल नोटिफिकेशन' },
  'settings.smsNotifications': { en: 'SMS Notifications', hi: 'SMS नोटिफिकेशन' },
  'settings.locationServices': { en: 'Location Services', hi: 'लोकेशन सर्विसेज' },
  
  // Merchant
  'merchant.dashboard': { en: 'Merchant Dashboard', hi: 'व्यापारी डैशबोर्ड' },
  'merchant.becomeMerchant': { en: 'Become a Merchant', hi: 'व्यापारी बनें' },
  'merchant.myDeals': { en: 'My Deals', hi: 'मेरी डील्स' },
  'merchant.analytics': { en: 'Analytics', hi: 'एनालिटिक्स' },
  'merchant.customers': { en: 'Customers', hi: 'ग्राहक' },
  'merchant.revenue': { en: 'Revenue', hi: 'राजस्व' },
  'merchant.createDeal': { en: 'Create Deal', hi: 'डील बनाएं' },
  'merchant.manageDeal': { en: 'Manage Deals', hi: 'डील्स प्रबंधित करें' },
  'merchant.businessName': { en: 'Business Name', hi: 'व्यापार का नाम' },
  'merchant.businessType': { en: 'Business Type', hi: 'व्यापार का प्रकार' },
  'merchant.contactInfo': { en: 'Contact Information', hi: 'संपर्क जानकारी' },
  
  // Categories
  'category.food': { en: 'Food & Dining', hi: 'खाना और भोजन' },
  'category.shopping': { en: 'Shopping', hi: 'शॉपिंग' },
  'category.beauty': { en: 'Beauty & Spa', hi: 'ब्यूटी और स्पा' },
  'category.health': { en: 'Health & Fitness', hi: 'स्वास्थ्य और फिटनेस' },
  'category.entertainment': { en: 'Entertainment', hi: 'मनोरंजन' },
  'category.travel': { en: 'Travel', hi: 'यात्रा' },
  'category.services': { en: 'Services', hi: 'सेवाएं' },
  'category.electronics': { en: 'Electronics', hi: 'इलेक्ट्रॉनिक्स' },
  'category.fashion': { en: 'Fashion', hi: 'फैशन' },
  'category.home': { en: 'Home & Living', hi: 'होम और लिविंग' },
  
  // Checkout
  'checkout.title': { en: 'Checkout', hi: 'चेकआउट' },
  'checkout.orderSummary': { en: 'Order Summary', hi: 'ऑर्डर सारांश' },
  'checkout.paymentMethod': { en: 'Payment Method', hi: 'भुगतान विधि' },
  'checkout.placeOrder': { en: 'Place Order', hi: 'ऑर्डर करें' },
  'checkout.applyCoupon': { en: 'Apply Coupon', hi: 'कूपन लगाएं' },
  'checkout.useJaicoins': { en: 'Use JAICoins', hi: 'JAICoin इस्तेमाल करें' },
  'checkout.subtotal': { en: 'Subtotal', hi: 'उप-कुल' },
  'checkout.discount': { en: 'Discount', hi: 'छूट' },
  'checkout.grandTotal': { en: 'Grand Total', hi: 'कुल योग' },
  'checkout.payNow': { en: 'Pay Now', hi: 'अभी भुगतान करें' },
  'checkout.orderConfirmed': { en: 'Order Confirmed', hi: 'ऑर्डर की पुष्टि हो गई' },
  'checkout.orderNumber': { en: 'Order Number', hi: 'ऑर्डर नंबर' },
  
  // Gamification
  'gamification.challenges': { en: 'Challenges', hi: 'चुनौतियां' },
  'gamification.dailyTasks': { en: 'Daily Tasks', hi: 'दैनिक कार्य' },
  'gamification.achievements': { en: 'Achievements', hi: 'उपलब्धियां' },
  'gamification.badges': { en: 'Badges', hi: 'बैज' },
  'gamification.rewards': { en: 'Rewards', hi: 'पुरस्कार' },
  'gamification.streak': { en: 'Streak', hi: 'स्ट्रीक' },
  'gamification.level': { en: 'Level', hi: 'लेवल' },
  'gamification.xp': { en: 'XP', hi: 'XP' },
  
  // Membership
  'membership.pro': { en: 'Pro Membership', hi: 'प्रो सदस्यता' },
  'membership.benefits': { en: 'Membership Benefits', hi: 'सदस्यता लाभ' },
  'membership.subscribe': { en: 'Subscribe Now', hi: 'अभी सब्सक्राइब करें' },
  'membership.monthly': { en: 'Monthly', hi: 'मासिक' },
  'membership.yearly': { en: 'Yearly', hi: 'वार्षिक' },
  'membership.cancel': { en: 'Cancel Membership', hi: 'सदस्यता रद्द करें' },
  'membership.renew': { en: 'Renew Membership', hi: 'सदस्यता नवीनीकृत करें' },
  
  // Messages
  'message.welcome': { en: 'Welcome to Jaipur Circle!', hi: 'जयपुर सर्कल में आपका स्वागत है!' },
  'message.loginRequired': { en: 'Please login to continue', hi: 'जारी रखने के लिए कृपया लॉगिन करें' },
  'message.orderSuccess': { en: 'Order placed successfully!', hi: 'ऑर्डर सफलतापूर्वक किया गया!' },
  'message.paymentSuccess': { en: 'Payment successful!', hi: 'भुगतान सफल!' },
  'message.copied': { en: 'Copied to clipboard!', hi: 'क्लिपबोर्ड में कॉपी किया गया!' },
  'message.saved': { en: 'Saved successfully!', hi: 'सफलतापूर्वक सेव हो गया!' },
  'message.deleted': { en: 'Deleted successfully!', hi: 'सफलतापूर्वक हटाया गया!' },
  'message.updated': { en: 'Updated successfully!', hi: 'सफलतापूर्वक अपडेट हो गया!' },
  'message.error': { en: 'Something went wrong!', hi: 'कुछ गड़बड़ हो गई!' },
  'message.noInternet': { en: 'No internet connection', hi: 'इंटरनेट कनेक्शन नहीं है' },
  'message.comingSoon': { en: 'Coming Soon!', hi: 'जल्द आ रहा है!' },
  
  // Localities
  'locality.jaipur': { en: 'Jaipur', hi: 'जयपुर' },
  'locality.malviyanagar': { en: 'Malviya Nagar', hi: 'मालवीय नगर' },
  'locality.mansarovar': { en: 'Mansarovar', hi: 'मानसरोवर' },
  'locality.vaishaliNagar': { en: 'Vaishali Nagar', hi: 'वैशाली नगर' },
  'locality.cScheme': { en: 'C-Scheme', hi: 'सी-स्कीम' },
  'locality.rambagh': { en: 'Rambagh', hi: 'रामबाग' },
  'locality.baniPark': { en: 'Bani Park', hi: 'बानी पार्क' },
  'locality.tonkRoad': { en: 'Tonk Road', hi: 'टोंक रोड' },
  'locality.sitapura': { en: 'Sitapura', hi: 'सीतापुरा' },
  'locality.jawaharNagar': { en: 'Jawahar Nagar', hi: 'जवाहर नगर' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return 'en';
    }
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    localStorage.setItem('app-language', language);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
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
