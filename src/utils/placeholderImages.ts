// Category-based placeholder images for professional appearance
export const categoryPlaceholders: Record<string, string> = {
  // Food & Dining
  'Food & Dining': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
  'food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
  'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
  'cafe': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
  
  // Beauty & Wellness
  'Beauty & Wellness': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
  'beauty': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
  'spa': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80',
  'salon': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
  
  // Shopping
  'Shopping': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80',
  'retail': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80',
  'fashion': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80',
  
  // Electronics
  'Electronics': 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&q=80',
  'tech': 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&q=80',
  'gadgets': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80',
  
  // Health & Fitness
  'Health & Fitness': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
  'gym': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
  'fitness': 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80',
  
  // Automotive
  'Automotive': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80',
  'cars': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80',
  'automobile': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80',
  
  // Services
  'Services': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=80',
  'professional': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=80',
  
  // Travel & Hotels
  'Travel': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80',
  'hotel': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
  
  // Entertainment
  'Entertainment': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
  'events': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80',
  'concert': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
  
  // Property
  'Property': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
  'real-estate': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
  
  // Education
  'Education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
  'learning': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
  
  // Default fallback
  'default': 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80',
};

export const getPlaceholderImage = (category?: string | null): string => {
  if (!category) return categoryPlaceholders.default;
  
  // Try exact match first
  if (categoryPlaceholders[category]) {
    return categoryPlaceholders[category];
  }
  
  // Try lowercase match
  const lowerCategory = category.toLowerCase();
  if (categoryPlaceholders[lowerCategory]) {
    return categoryPlaceholders[lowerCategory];
  }
  
  // Try partial match
  for (const [key, url] of Object.entries(categoryPlaceholders)) {
    if (lowerCategory.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCategory)) {
      return url;
    }
  }
  
  return categoryPlaceholders.default;
};

// Event-specific placeholders
export const eventPlaceholders: Record<string, string> = {
  'concert': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
  'music': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
  'workshop': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80',
  'conference': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80',
  'exhibition': 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=400&q=80',
  'sports': 'https://images.unsplash.com/photo-1461896836934- voices=0c7ca86efa?w=400&q=80',
  'comedy': 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&q=80',
  'theater': 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=400&q=80',
  'festival': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80',
  'networking': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&q=80',
  'default': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80',
};

export const getEventPlaceholder = (category?: string | null): string => {
  if (!category) return eventPlaceholders.default;
  
  const lowerCategory = category.toLowerCase();
  
  for (const [key, url] of Object.entries(eventPlaceholders)) {
    if (lowerCategory.includes(key) || key.includes(lowerCategory)) {
      return url;
    }
  }
  
  return eventPlaceholders.default;
};

// Merchant logo placeholders based on business type
export const merchantPlaceholders: Record<string, string> = {
  'Food & Dining': 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=200&q=80',
  'Beauty & Wellness': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80',
  'Shopping': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&q=80',
  'Electronics': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200&q=80',
  'Health & Fitness': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&q=80',
  'default': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&q=80',
};

export const getMerchantPlaceholder = (businessType?: string | null): string => {
  if (!businessType) return merchantPlaceholders.default;
  return merchantPlaceholders[businessType] || merchantPlaceholders.default;
};
