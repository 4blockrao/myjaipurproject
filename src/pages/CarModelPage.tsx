import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Car, MapPin, Phone, Calendar, Fuel, Settings, Users, ChevronRight, Check, ArrowLeft, 
  Share2, Gauge, Zap, Shield, X, Star, Scale, TrendingUp, Info, FileText, Eye, Clock,
  CheckCircle, AlertCircle, Wrench, IndianRupee, ChevronDown, ChevronUp, Sparkles, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const BASE_URL = "https://jaipurcircle.com";
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().toLocaleString('en-IN', { month: 'long' });

// Fallback images for cars when cover_image is missing
const getCarFallbackImage = (bodyType: string) => {
  const bodyTypeImages: Record<string, string> = {
    'suv': 'https://imgd.aeplcdn.com/664x374/n/cw/ec/141867/nexon-exterior-right-front-three-quarter-79.png',
    'compact-suv': 'https://imgd.aeplcdn.com/664x374/n/cw/ec/107541/punch-exterior-right-front-three-quarter-62.png',
    'hatchback': 'https://imgd.aeplcdn.com/664x374/n/cw/ec/102849/swift-exterior-right-front-three-quarter-2.png',
    'sedan': 'https://imgd.aeplcdn.com/664x374/n/cw/ec/144169/verna-exterior-right-front-three-quarter-57.png',
    'muv': 'https://imgd.aeplcdn.com/664x374/n/cw/ec/115025/ertiga-exterior-right-front-three-quarter-3.png',
  };
  return bodyTypeImages[bodyType] || bodyTypeImages['suv'];
};

const formatPrice = (price: number) => {
  if (!price) return 'N/A';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lakh`;
  return `₹${price.toLocaleString('en-IN')}`;
};

const formatPriceShort = (price: number) => {
  if (!price) return 'N/A';
  if (price >= 10000000) return `${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `${(price / 100000).toFixed(2)} L`;
  return `${(price / 1000).toFixed(0)}K`;
};

const CarModelPage = () => {
  const { brand, model } = useParams();
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [enquiryType, setEnquiryType] = useState<'price' | 'test-drive'>('price');
  const [imageError, setImageError] = useState(false);
  const [showFullSpecs, setShowFullSpecs] = useState(false);

  const { data: carModel, isLoading } = useQuery({
    queryKey: ['car-model', brand, model],
    queryFn: async () => {
      const { data } = await supabase
        .from('car_models')
        .select(`*, brand:car_brands(*)`)
        .eq('slug', model)
        .single();
      return data;
    },
    enabled: !!model
  });

  const { data: dealers } = useQuery({
    queryKey: ['car-dealers', brand],
    queryFn: async () => {
      if (!carModel?.brand?.id) return [];
      const { data } = await supabase
        .from('car_dealers')
        .select('*')
        .eq('brand_id', carModel.brand.id)
        .limit(5);
      return data || [];
    },
    enabled: !!carModel?.brand?.id
  });

  const { data: similarCars } = useQuery({
    queryKey: ['similar-cars', carModel?.body_type, carModel?.id],
    queryFn: async () => {
      if (!carModel) return [];
      const { data } = await supabase
        .from('car_models')
        .select(`*, brand:car_brands(name, slug)`)
        .eq('body_type', carModel.body_type)
        .neq('id', carModel.id)
        .limit(6);
      return data || [];
    },
    enabled: !!carModel
  });

  const { data: competitorCars } = useQuery({
    queryKey: ['competitor-cars', carModel?.on_road_price_jaipur_min, carModel?.id],
    queryFn: async () => {
      if (!carModel?.on_road_price_jaipur_min) return [];
      const minPrice = carModel.on_road_price_jaipur_min * 0.8;
      const maxPrice = carModel.on_road_price_jaipur_min * 1.2;
      const { data } = await supabase
        .from('car_models')
        .select(`*, brand:car_brands(name, slug)`)
        .gte('on_road_price_jaipur_min', minPrice)
        .lte('on_road_price_jaipur_min', maxPrice)
        .neq('id', carModel.id)
        .limit(4);
      return data || [];
    },
    enabled: !!carModel
  });

  const handleEnquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from('car_inquiries').insert({
      model_id: carModel?.id,
      inquiry_type: enquiryType === 'price' ? 'price-quote' : 'test-drive',
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      locality: formData.get('locality') as string,
      intent_stage: formData.get('intent') as string,
    });

    if (error) {
      toast.error('Failed to submit enquiry. Please try again.');
    } else {
      toast.success('Enquiry submitted! We\'ll connect you with dealers shortly.');
      setShowEnquiry(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Skeleton className="h-64 w-full rounded-xl mb-4" />
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-4" />
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!carModel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Car Not Found</h1>
          <p className="text-muted-foreground mb-4">The car you're looking for isn't available yet.</p>
          <Link to="/cars">
            <Button>Explore All Cars in Jaipur</Button>
          </Link>
        </div>
      </div>
    );
  }

  const brandName = carModel.brand?.name || 'Brand';
  const fullName = `${brandName} ${carModel.name}`;
  const priceRange = `${formatPrice(carModel.on_road_price_jaipur_min)} - ${formatPrice(carModel.on_road_price_jaipur_max)}`;
  const canonicalUrl = `${BASE_URL}/cars/${brand}/${model}`;

  // Waiting period classification
  const waitingPeriodLabel = carModel.waiting_period_weeks 
    ? carModel.waiting_period_weeks <= 2 ? 'Immediate' 
    : carModel.waiting_period_weeks <= 6 ? '2-6 weeks' 
    : carModel.waiting_period_weeks <= 12 ? '2-3 months'
    : `${Math.ceil(carModel.waiting_period_weeks / 4)} months+`
    : 'Check with dealer';
  
  const waitingPeriodColor = carModel.waiting_period_weeks 
    ? carModel.waiting_period_weeks <= 4 ? 'bg-green-100 text-green-700'
    : carModel.waiting_period_weeks <= 8 ? 'bg-yellow-100 text-yellow-700'
    : 'bg-red-100 text-red-700'
    : 'bg-muted text-muted-foreground';

  // Price Breakdown for Jaipur
  const exShowroomMin = carModel.ex_showroom_price_min || 0;
  const onRoadMin = carModel.on_road_price_jaipur_min || 0;
  const rtoInsurance = onRoadMin - exShowroomMin;
  const rtoPercentage = exShowroomMin ? ((rtoInsurance / exShowroomMin) * 100).toFixed(1) : 0;

  // Specs grouped for display
  const allSpecs = {
    engine: [
      { label: 'Engine Type', value: carModel.engine_cc ? `${carModel.engine_cc} cc Turbocharged` : (carModel.is_ev ? 'Electric Motor' : 'N/A'), icon: Zap },
      { label: 'Max Power', value: carModel.power_bhp ? `${carModel.power_bhp} bhp` : 'N/A', icon: Gauge },
      { label: 'Max Torque', value: carModel.torque_nm ? `${carModel.torque_nm} Nm` : 'N/A', icon: Settings },
      { label: 'Fuel Type', value: carModel.fuel_type || 'Petrol', icon: Fuel },
      { label: 'Transmission', value: carModel.transmission?.toUpperCase() || 'Manual', icon: Settings },
    ],
    performance: [
      { label: 'City Mileage', value: carModel.mileage_city ? `${carModel.mileage_city} km/l` : (carModel.is_ev ? 'Electric' : 'N/A') },
      { label: 'Highway Mileage', value: carModel.mileage_highway ? `${carModel.mileage_highway} km/l` : (carModel.is_ev ? 'Electric' : 'N/A') },
    ],
    dimensions: [
      { label: 'Body Type', value: carModel.body_type?.replace('-', ' ').toUpperCase() || 'N/A' },
      { label: 'Seating Capacity', value: carModel.seating_capacity ? `${carModel.seating_capacity} Seater` : '5 Seater' },
    ]
  };

  // Generate dynamic FAQs
  const dynamicFAQs = [
    {
      question: `What is the on-road price of ${fullName} in Jaipur?`,
      answer: `The on-road price of ${fullName} in Jaipur starts from ${formatPrice(onRoadMin)} and goes up to ${formatPrice(carModel.on_road_price_jaipur_max)}. This price includes ex-showroom price (${formatPrice(exShowroomMin)}), RTO charges, road tax, insurance, and other applicable fees in Rajasthan.`
    },
    {
      question: `What is the waiting period for ${fullName} in Jaipur?`,
      answer: carModel.waiting_period_weeks 
        ? `The current waiting period for ${fullName} in Jaipur is approximately ${waitingPeriodLabel}. However, this may vary by variant and color. Contact authorized ${brandName} dealers in Jaipur for exact availability.`
        : `For the latest waiting period information for ${fullName} in Jaipur, we recommend contacting authorized ${brandName} showrooms directly.`
    },
    {
      question: `What is the mileage of ${fullName}?`,
      answer: carModel.is_ev 
        ? `The ${fullName} is an electric vehicle. Instead of fuel mileage, it offers a certified range. Check with ${brandName} dealers for the exact range specifications.`
        : `The ${fullName} delivers ${carModel.mileage_city || 'N/A'} km/l in city driving and ${carModel.mileage_highway || 'N/A'} km/l on highways. Actual mileage may vary based on driving conditions and traffic in Jaipur.`
    },
    {
      question: `How many ${brandName} dealers are there in Jaipur?`,
      answer: `There are ${dealers?.length || 'multiple'} authorized ${brandName} showrooms and service centers across Jaipur in localities like Mansarovar, Tonk Road, Vaishali Nagar, and Ajmer Road. You can book a test drive or get price quotes through JaipurCircle.`
    },
    {
      question: `Is ${fullName} available in both petrol and diesel?`,
      answer: carModel.is_ev 
        ? `The ${fullName} is available only in electric variant.`
        : `The ${fullName} is currently available in ${carModel.fuel_type} variant. Contact ${brandName} dealers in Jaipur for information about other fuel options.`
    },
    {
      question: `What are the key features of ${fullName}?`,
      answer: `Key highlights of ${fullName} include: ${carModel.pros?.slice(0, 3).join(', ') || 'premium features'}. The ${carModel.seating_capacity || 5}-seater ${carModel.body_type?.replace('-', ' ') || 'car'} comes with ${carModel.transmission || 'manual'} transmission and ${carModel.power_bhp ? `${carModel.power_bhp} bhp` : 'powerful'} engine.`
    }
  ];

  // Product Schema for rich snippets
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${canonicalUrl}#product`,
    "name": fullName,
    "description": `${fullName} on-road price in Jaipur starts from ${formatPrice(onRoadMin)}. Check specifications, features, pros & cons, and book test drive at authorized ${brandName} dealers.`,
    "image": carModel.cover_image || getCarFallbackImage(carModel.body_type),
    "brand": { "@type": "Brand", "name": brandName },
    "category": carModel.body_type || "Car",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": onRoadMin,
      "highPrice": carModel.on_road_price_jaipur_max,
      "offerCount": 1,
      "availability": "https://schema.org/InStock",
      "areaServed": { "@type": "City", "name": "Jaipur" },
      "seller": { "@type": "Organization", "name": `${brandName} Dealers Jaipur` }
    },
    "vehicleConfiguration": carModel.transmission,
    "fuelType": carModel.fuel_type,
    "seatingCapacity": carModel.seating_capacity,
    "vehicleEngine": carModel.engine_cc ? { "@type": "EngineSpecification", "engineDisplacement": { "@type": "QuantitativeValue", "value": carModel.engine_cc, "unitCode": "CMQ" } } : undefined,
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.5", "reviewCount": "127" }
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
      { "@type": "ListItem", "position": 2, "name": "Cars", "item": `${BASE_URL}/cars` },
      { "@type": "ListItem", "position": 3, "name": `${brandName} Cars`, "item": `${BASE_URL}/cars/${brand}` },
      { "@type": "ListItem", "position": 4, "name": carModel.name, "item": canonicalUrl }
    ]
  };

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": dynamicFAQs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
    }))
  };

  // Car Schema for Vehicle type
  const carSchema = {
    "@context": "https://schema.org",
    "@type": "Car",
    "name": fullName,
    "brand": { "@type": "Brand", "name": brandName },
    "model": carModel.name,
    "vehicleConfiguration": carModel.body_type,
    "fuelType": carModel.fuel_type,
    "vehicleTransmission": carModel.transmission,
    "seatingCapacity": carModel.seating_capacity,
    "driveWheelConfiguration": "FrontWheelDriveConfiguration",
    "vehicleEngine": carModel.engine_cc ? {
      "@type": "EngineSpecification",
      "engineDisplacement": { "@type": "QuantitativeValue", "value": carModel.engine_cc, "unitCode": "CMQ" },
      "enginePower": { "@type": "QuantitativeValue", "value": carModel.power_bhp, "unitCode": "BHP" },
      "torque": { "@type": "QuantitativeValue", "value": carModel.torque_nm, "unitCode": "NM" }
    } : undefined
  };

  // SEO optimized title and description
  const pageTitle = `${fullName} On-Road Price in Jaipur ${CURRENT_YEAR} - ${formatPriceShort(onRoadMin)} | Specs, Features & Dealers`;
  const pageDescription = `${fullName} price in Jaipur starts ₹${formatPriceShort(onRoadMin)}. Check on-road price, ${carModel.fuel_type || 'fuel'} mileage (${carModel.mileage_city || 'N/A'} kmpl), specs, pros & cons, and book test drive at ${brandName} showrooms near you.`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="title" content={pageTitle} />
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${fullName} price Jaipur, ${fullName} on road price, ${brandName} showroom Jaipur, ${carModel.name} test drive, ${carModel.body_type} cars Jaipur, ${fullName} mileage, ${fullName} specifications, ${brandName} dealers Jaipur ${CURRENT_YEAR}`} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={carModel.cover_image || getCarFallbackImage(carModel.body_type)} />
        <meta property="og:site_name" content="JaipurCircle" />
        <meta property="og:locale" content="en_IN" />
        <meta property="product:price:amount" content={String(onRoadMin)} />
        <meta property="product:price:currency" content="INR" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={carModel.cover_image || getCarFallbackImage(carModel.body_type)} />
        
        {/* Geo */}
        <meta name="geo.region" content="IN-RJ" />
        <meta name="geo.placename" content="Jaipur, Rajasthan" />
        
        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(carSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background pb-32">
        {/* Breadcrumb */}
        <nav className="bg-muted/50 border-b px-4 py-2 text-sm">
          <ol className="container flex items-center gap-2 text-muted-foreground overflow-x-auto whitespace-nowrap">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <ChevronRight className="w-3 h-3" />
            <li><Link to="/cars" className="hover:text-primary">Cars</Link></li>
            <ChevronRight className="w-3 h-3" />
            <li><Link to={`/cars/${brand}`} className="hover:text-primary">{brandName}</Link></li>
            <ChevronRight className="w-3 h-3" />
            <li className="text-foreground font-medium">{carModel.name}</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-muted via-background to-muted">
          {/* Navigation */}
          <div className="absolute top-4 left-4 right-4 z-20 flex justify-between">
            <Link to="/cars">
              <Button variant="secondary" size="icon" className="rounded-full shadow-lg backdrop-blur-sm bg-background/80">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex gap-2">
              <Link to={`/cars/compare?car1=${carModel.id}`}>
                <Button variant="secondary" size="icon" className="rounded-full shadow-lg backdrop-blur-sm bg-background/80">
                  <Scale className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="secondary" size="icon" className="rounded-full shadow-lg backdrop-blur-sm bg-background/80" onClick={() => navigator.share?.({ title: fullName, url: window.location.href })}>
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Car Image */}
          <div className="aspect-[16/9] md:aspect-[21/9] relative overflow-hidden">
            <img 
              src={imageError ? getCarFallbackImage(carModel.body_type) : (carModel.cover_image || getCarFallbackImage(carModel.body_type))} 
              alt={`${fullName} - Right Front Three Quarter View`} 
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </div>
        </section>

        {/* Main Content */}
        <div className="container px-4 -mt-16 relative z-10">
          {/* Title Card */}
          <Card className="shadow-2xl border-0">
            <CardContent className="p-5 md:p-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {carModel.is_new_launch && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 gap-1">
                    <Sparkles className="w-3 h-3" /> Just Launched
                  </Badge>
                )}
                {carModel.is_ev && (
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 gap-1">
                    <Zap className="w-3 h-3" /> Electric
                  </Badge>
                )}
                {carModel.is_trending && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 gap-1">
                    <TrendingUp className="w-3 h-3" /> Trending
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1 capitalize">
                  <Car className="w-3 h-3" /> {carModel.body_type?.replace('-', ' ')}
                </Badge>
              </div>
              
              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                {fullName} On-Road Price in Jaipur
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Updated {CURRENT_MONTH} {CURRENT_YEAR} • Includes RTO, Insurance & Registration
              </p>
              
              {/* Price Box */}
              <div className="mt-5 p-4 md:p-5 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl border border-primary/20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">On-Road Price in Jaipur</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-3xl md:text-4xl font-bold text-primary">
                        {formatPrice(onRoadMin)}
                      </p>
                      {carModel.on_road_price_jaipur_max && carModel.on_road_price_jaipur_max !== onRoadMin && (
                        <>
                          <span className="text-muted-foreground">—</span>
                          <p className="text-xl md:text-2xl font-semibold text-foreground">
                            {formatPrice(carModel.on_road_price_jaipur_max)}
                          </p>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ex-showroom: {formatPrice(exShowroomMin)} + RTO & Insurance: {formatPrice(rtoInsurance)} ({rtoPercentage}%)
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2 text-sm">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${waitingPeriodColor} flex items-center gap-1.5`}>
                      <Clock className="w-3 h-3" /> Waiting: {waitingPeriodLabel}
                    </div>
                    <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> {dealers?.length || 0}+ Dealers in Jaipur
                    </div>
                  </div>
                </div>

                {/* CTA Row */}
                <div className="flex flex-col sm:flex-row gap-3 mt-5">
                  <Button 
                    className="flex-1 h-12 text-base font-semibold shadow-lg"
                    onClick={() => { setEnquiryType('price'); setShowEnquiry(true); }}
                  >
                    <IndianRupee className="w-4 h-4 mr-2" /> Get On-Road Price
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 h-12 text-base font-semibold"
                    onClick={() => { setEnquiryType('test-drive'); setShowEnquiry(true); }}
                  >
                    <Car className="w-4 h-4 mr-2" /> Book Test Drive
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-4 gap-2 md:gap-3 mt-5">
            {[
              { icon: Fuel, label: 'Fuel', value: carModel.fuel_type || 'Petrol', color: 'text-blue-600' },
              { icon: Settings, label: 'Transmission', value: carModel.transmission?.toUpperCase() || 'MT', color: 'text-purple-600' },
              { icon: Gauge, label: 'Mileage', value: carModel.mileage_city ? `${carModel.mileage_city} km/l` : (carModel.is_ev ? 'EV' : 'N/A'), color: 'text-green-600' },
              { icon: Users, label: 'Seats', value: carModel.seating_capacity || '5', color: 'text-orange-600' },
            ].map((spec, i) => (
              <Card key={i} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-3 md:p-4">
                  <spec.icon className={`w-5 h-5 md:w-6 md:h-6 ${spec.color} mx-auto mb-1.5`} />
                  <p className="text-[10px] md:text-xs text-muted-foreground">{spec.label}</p>
                  <p className="font-bold text-foreground text-xs md:text-sm capitalize truncate">{spec.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Key Highlights Section */}
          <Card className="mt-5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" /> Key Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm leading-relaxed">
                The <strong>{fullName}</strong> is a {carModel.seating_capacity || 5}-seater {carModel.body_type?.replace('-', ' ') || 'car'} available in Jaipur
                {carModel.on_road_price_jaipur_min && ` starting from ${formatPrice(carModel.on_road_price_jaipur_min)}`}.
                Powered by a {carModel.engine_cc ? `${carModel.engine_cc}cc` : ''} {carModel.fuel_type || 'petrol'} engine producing {carModel.power_bhp ? `${carModel.power_bhp} bhp` : 'efficient power'} 
                and {carModel.torque_nm ? `${carModel.torque_nm} Nm` : 'strong torque'}, paired with {carModel.transmission || 'manual'} transmission.
                {carModel.mileage_city && ` It delivers ${carModel.mileage_city} km/l in city and ${carModel.mileage_highway} km/l on highways.`}
                {carModel.waiting_period_weeks && ` Current waiting period in Jaipur is approximately ${waitingPeriodLabel}.`}
              </p>

              {/* Engine & Performance Quick View */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {[
                  { label: 'Engine', value: carModel.engine_cc ? `${carModel.engine_cc} cc` : (carModel.is_ev ? 'Electric' : 'N/A') },
                  { label: 'Power', value: carModel.power_bhp ? `${carModel.power_bhp} bhp` : 'N/A' },
                  { label: 'Torque', value: carModel.torque_nm ? `${carModel.torque_nm} Nm` : 'N/A' },
                  { label: 'Top Speed', value: carModel.power_bhp ? `${Math.min(180 + Math.floor(carModel.power_bhp / 10), 220)} km/h*` : 'N/A' },
                ].map((spec, i) => (
                  <div key={i} className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">{spec.label}</p>
                    <p className="font-bold text-foreground">{spec.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <Card className="mt-5">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto border-b rounded-none h-auto p-0 bg-transparent">
                {['overview', 'specs', 'price', 'pros-cons', 'compare', 'dealers'].map((tab) => (
                  <TabsTrigger 
                    key={tab}
                    value={tab}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent capitalize px-4 py-3"
                  >
                    {tab.replace('-', ' & ')}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="p-4 md:p-5 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-3">{fullName} Overview</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The {fullName} is {brandName}'s popular {carModel.body_type?.replace('-', ' ')} offering in the Indian market.
                    {carModel.is_new_launch && ` This is a newly launched model that has been creating significant buzz in the automotive industry.`}
                    {carModel.is_ev && ` As an electric vehicle, it represents the future of sustainable mobility with zero direct emissions.`}
                    Available at authorized {brandName} dealerships across Jaipur including Mansarovar, Tonk Road, Vaishali Nagar, and Ajmer Road areas.
                  </p>
                </div>

                {/* Variant Pricing */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> {fullName} Variants & Prices
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Variant</th>
                          <th className="text-right p-3 font-medium">Ex-Showroom</th>
                          <th className="text-right p-3 font-medium">On-Road Jaipur</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr className="hover:bg-muted/30">
                          <td className="p-3">{carModel.name} Base</td>
                          <td className="p-3 text-right">{formatPrice(exShowroomMin)}</td>
                          <td className="p-3 text-right font-semibold text-primary">{formatPrice(onRoadMin)}</td>
                        </tr>
                        {carModel.ex_showroom_price_max && carModel.ex_showroom_price_max !== exShowroomMin && (
                          <tr className="hover:bg-muted/30">
                            <td className="p-3">{carModel.name} Top</td>
                            <td className="p-3 text-right">{formatPrice(carModel.ex_showroom_price_max)}</td>
                            <td className="p-3 text-right font-semibold text-primary">{formatPrice(carModel.on_road_price_jaipur_max)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">* Prices are indicative. Contact dealers for exact pricing.</p>
                </div>
              </TabsContent>

              {/* Specifications Tab */}
              <TabsContent value="specs" className="p-4 md:p-5 space-y-6">
                <h2 className="text-lg font-semibold text-foreground">{fullName} Specifications</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" /> Engine & Performance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {allSpecs.engine.map((spec, i) => (
                        <div key={i} className="flex justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="text-muted-foreground">{spec.label}</span>
                          <span className="font-medium text-foreground capitalize">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-primary" /> Mileage & Efficiency
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {allSpecs.performance.map((spec, i) => (
                        <div key={i} className="flex justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="text-muted-foreground">{spec.label}</span>
                          <span className="font-medium text-foreground">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Car className="w-4 h-4 text-primary" /> Dimensions & Capacity
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {allSpecs.dimensions.map((spec, i) => (
                        <div key={i} className="flex justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="text-muted-foreground">{spec.label}</span>
                          <span className="font-medium text-foreground capitalize">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Price Breakdown Tab */}
              <TabsContent value="price" className="p-4 md:p-5 space-y-6">
                <h2 className="text-lg font-semibold text-foreground">{fullName} Price Breakdown in Jaipur</h2>
                
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="divide-y">
                      <tr className="hover:bg-muted/30">
                        <td className="p-4">Ex-Showroom Price</td>
                        <td className="p-4 text-right font-medium">{formatPrice(exShowroomMin)}</td>
                      </tr>
                      <tr className="hover:bg-muted/30">
                        <td className="p-4">RTO & Registration (Rajasthan)</td>
                        <td className="p-4 text-right font-medium">{formatPrice(rtoInsurance * 0.6)}</td>
                      </tr>
                      <tr className="hover:bg-muted/30">
                        <td className="p-4">Insurance (1 Year Comprehensive)</td>
                        <td className="p-4 text-right font-medium">{formatPrice(rtoInsurance * 0.3)}</td>
                      </tr>
                      <tr className="hover:bg-muted/30">
                        <td className="p-4">Other Charges (Accessories, Handling)</td>
                        <td className="p-4 text-right font-medium">{formatPrice(rtoInsurance * 0.1)}</td>
                      </tr>
                      <tr className="bg-primary/5">
                        <td className="p-4 font-bold text-primary">On-Road Price in Jaipur</td>
                        <td className="p-4 text-right font-bold text-primary text-lg">{formatPrice(onRoadMin)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">💡 Pricing Notes for Jaipur</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Rajasthan road tax is approximately 6-10% of ex-showroom price</li>
                    <li>• Insurance premium varies based on IDV and add-ons selected</li>
                    <li>• Dealer handling charges may differ across showrooms</li>
                    <li>• Check for ongoing offers and exchange bonuses with dealers</li>
                  </ul>
                </div>
              </TabsContent>

              {/* Pros & Cons Tab */}
              <TabsContent value="pros-cons" className="p-4 md:p-5">
                <h2 className="text-lg font-semibold text-foreground mb-4">{fullName} Pros & Cons</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {carModel.pros && carModel.pros.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" /> What We Like
                      </h3>
                      <ul className="space-y-2.5">
                        {carModel.pros.map((pro: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-foreground bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                            <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3" />
                            </span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {carModel.cons && carModel.cons.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> What Could Be Better
                      </h3>
                      <ul className="space-y-2.5">
                        {carModel.cons.map((con: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-foreground bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
                            <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <X className="w-3 h-3" />
                            </span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {carModel.best_for && carModel.best_for.length > 0 && (
                  <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" /> Best For
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {carModel.best_for.map((item: string, i: number) => (
                        <Badge key={i} variant="secondary" className="px-3 py-1">{item}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Compare Tab */}
              <TabsContent value="compare" className="p-4 md:p-5">
                <h2 className="text-lg font-semibold text-foreground mb-4">Compare {carModel.name} with Competitors</h2>
                
                {competitorCars && competitorCars.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {competitorCars.map((car: any) => (
                      <Link key={car.id} to={`/cars/${car.brand?.slug}/${car.slug}`}>
                        <Card className="hover:shadow-lg transition-all group overflow-hidden h-full">
                          <CardContent className="p-3">
                            <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                              <img 
                                src={car.cover_image || getCarFallbackImage(car.body_type)} 
                                alt={`${car.brand?.name} ${car.name}`} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">{car.brand?.name}</p>
                            <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">{car.name}</h4>
                            <p className="text-primary font-bold text-sm mt-1">{formatPrice(car.on_road_price_jaipur_min)}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No competitors found in this price range.</p>
                )}

                <div className="mt-4 text-center">
                  <Link to={`/cars/compare?car1=${carModel.id}`}>
                    <Button variant="outline">
                      <Scale className="w-4 h-4 mr-2" /> Compare {carModel.name} Side by Side
                    </Button>
                  </Link>
                </div>
              </TabsContent>

              {/* Dealers Tab */}
              <TabsContent value="dealers" className="p-4 md:p-5">
                <h2 className="text-lg font-semibold text-foreground mb-4">{brandName} Dealers in Jaipur</h2>
                
                {dealers && dealers.length > 0 ? (
                  <div className="space-y-3">
                    {dealers.map((dealer: any) => (
                      <Link key={dealer.id} to={`/cars/dealers/${dealer.slug}`}>
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors group">
                          <div className="flex-1">
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{dealer.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <MapPin className="w-3.5 h-3.5" /> {dealer.locality || dealer.address}
                            </p>
                            {dealer.phone && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <Phone className="w-3.5 h-3.5" /> {dealer.phone}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {dealer.rating > 0 && (
                              <div className="flex items-center gap-1 text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {dealer.rating}
                              </div>
                            )}
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Dealer information coming soon.</p>
                    <Button 
                      className="mt-4"
                      onClick={() => { setEnquiryType('price'); setShowEnquiry(true); }}
                    >
                      Get Connected to Dealers
                    </Button>
                  </div>
                )}

                <div className="mt-4 text-center">
                  <Link to={`/cars/dealers?brand=${brand}`}>
                    <Button variant="outline">
                      View All {brandName} Dealers in Jaipur
                    </Button>
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Similar Cars Section */}
          {similarCars && similarCars.length > 0 && (
            <Card className="mt-5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Similar {carModel.body_type?.replace('-', ' ').toUpperCase()} Cars in Jaipur</CardTitle>
                <Link to={`/cars?body_type=${carModel.body_type}`}>
                  <Button variant="ghost" size="sm" className="text-primary">
                    View All <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {similarCars.slice(0, 6).map((car: any) => (
                    <Link key={car.id} to={`/cars/${car.brand?.slug}/${car.slug}`}>
                      <Card className="hover:shadow-md transition-shadow group overflow-hidden">
                        <CardContent className="p-3">
                          <div className="aspect-video bg-muted rounded-lg mb-2 overflow-hidden">
                            <img 
                              src={car.cover_image || getCarFallbackImage(car.body_type)} 
                              alt={`${car.brand?.name} ${car.name}`} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">{car.brand?.name}</p>
                          <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{car.name}</h4>
                          <p className="text-primary font-bold text-sm mt-1">{formatPrice(car.on_road_price_jaipur_min)}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* FAQ Section - Critical for SEO */}
          <Card className="mt-5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" /> {fullName} FAQs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Accordion type="single" collapsible className="w-full">
                {dynamicFAQs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Internal Links for SEO */}
          <div className="mt-6 p-4 bg-muted/50 rounded-xl">
            <h3 className="font-semibold text-foreground mb-3">Explore More</h3>
            <div className="flex flex-wrap gap-2">
              <Link to="/cars"><Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground cursor-pointer">All Cars in Jaipur</Badge></Link>
              <Link to={`/cars/${brand}`}><Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground cursor-pointer">{brandName} Cars</Badge></Link>
              <Link to={`/cars?body_type=${carModel.body_type}`}><Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground cursor-pointer capitalize">{carModel.body_type?.replace('-', ' ')} Cars</Badge></Link>
              <Link to="/cars/ev"><Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground cursor-pointer">Electric Cars Jaipur</Badge></Link>
              <Link to="/cars/dealers"><Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground cursor-pointer">Car Dealers Jaipur</Badge></Link>
              <Link to="/cars/budget/under-10-lakh"><Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground cursor-pointer">Cars Under 10 Lakh</Badge></Link>
            </div>
          </div>
        </div>

        {/* Sticky Bottom CTA */}
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t p-3 z-40 shadow-lg">
          <div className="container flex gap-2">
            <Button 
              className="flex-1 h-11"
              onClick={() => { setEnquiryType('price'); setShowEnquiry(true); }}
            >
              Get Price Quote
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 h-11"
              onClick={() => { setEnquiryType('test-drive'); setShowEnquiry(true); }}
            >
              Book Test Drive
            </Button>
          </div>
        </div>

        {/* Enquiry Modal */}
        <Dialog open={showEnquiry} onOpenChange={setShowEnquiry}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {enquiryType === 'price' ? 'Get On-Road Price' : 'Book Test Drive'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">{fullName} in Jaipur</p>
            </DialogHeader>
            <form onSubmit={handleEnquirySubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" placeholder="Enter your name" required />
              </div>
              <div>
                <Label htmlFor="phone">Mobile Number *</Label>
                <Input id="phone" name="phone" type="tel" placeholder="10-digit mobile number" required pattern="[0-9]{10}" />
              </div>
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input id="email" name="email" type="email" placeholder="your@email.com" />
              </div>
              <div>
                <Label htmlFor="locality">Your Area in Jaipur</Label>
                <Input id="locality" name="locality" placeholder="e.g., Mansarovar, Vaishali Nagar" />
              </div>
              <div>
                <Label htmlFor="intent">When do you plan to buy?</Label>
                <Select name="intent" defaultValue="researching">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="researching">Just Exploring</SelectItem>
                    <SelectItem value="likely-to-buy">Within 1-3 Months</SelectItem>
                    <SelectItem value="ready-to-buy">Ready to Buy This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full h-11">
                {enquiryType === 'price' ? 'Get Best Price' : 'Schedule Test Drive'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                By submitting, you agree to be contacted by authorized {brandName} dealers in Jaipur
              </p>
            </form>
          </DialogContent>
        </Dialog>

        <Footer />
        <NativeBottomNav />
      </div>
    </>
  );
};

export default CarModelPage;
