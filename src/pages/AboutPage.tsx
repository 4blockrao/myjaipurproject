import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Mail, MapPin, Users, Shield, Target, Heart, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import GlobalSEO from '@/components/seo/GlobalSEO';

const SITE_URL = 'https://jaipurcircle.com';

const AboutPage = () => {
  // Organization + AboutPage Schema
  const aboutPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${SITE_URL}/about#webpage`,
    url: `${SITE_URL}/about`,
    name: 'About JaipurCircle',
    description: "Learn about JaipurCircle, a community-driven platform built to connect Jaipur citizens with local news, events, deals, jobs, and trusted services.",
    isPartOf: {
      '@id': `${SITE_URL}/#website`
    },
    about: {
      '@id': `${SITE_URL}/#organization`
    },
    mainEntity: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'JaipurCircle',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description: "Jaipur's leading local discovery platform for news, events, deals, jobs, and community updates.",
      foundingDate: '2024',
      areaServed: {
        '@type': 'City',
        name: 'Jaipur',
        containedInPlace: {
          '@type': 'State',
          name: 'Rajasthan',
          containedInPlace: {
            '@type': 'Country',
            name: 'India'
          }
        }
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Jaipur',
        addressRegion: 'Rajasthan',
        addressCountry: 'IN',
        postalCode: '302001'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'hello@jaipurcircle.com',
        availableLanguage: ['English', 'Hindi']
      },
      sameAs: [
        'https://twitter.com/jaipurcircle',
        'https://facebook.com/jaipurcircle',
        'https://instagram.com/jaipurcircle'
      ]
    }
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: `${SITE_URL}/about`
      }
    ]
  };

  const features = [
    {
      icon: Building,
      title: 'Jaipur Local News & Civic Updates',
      description: 'Stay informed about what matters most in your city'
    },
    {
      icon: Users,
      title: 'Events, Concerts & Workshops',
      description: 'Discover exhibitions, cultural events, and community gatherings'
    },
    {
      icon: Heart,
      title: 'Local Business Deals & Offers',
      description: 'Exclusive discounts from verified Jaipur merchants'
    },
    {
      icon: Target,
      title: 'Jobs, Services & Opportunities',
      description: 'Find local employment and professional services'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <GlobalSEO 
        title="About JaipurCircle – Jaipur's Local News, Events & Discovery Platform"
        description="Learn about JaipurCircle, a community-driven platform built to connect Jaipur citizens with local news, events, deals, jobs, and trusted services."
        canonical="/about"
        keywords={[
          'about JaipurCircle',
          'Jaipur local platform',
          'Jaipur community',
          'Jaipur news platform',
          'local discovery Jaipur'
        ]}
      />
      
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(aboutPageSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-lg">About</h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            About JaipurCircle
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            JaipurCircle is a community-first digital platform built to bring everything 
            happening in Jaipur into one trusted place.
          </p>
        </section>

        {/* AI-Friendly Summary */}
        <Card className="bg-muted/30 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed">
              From local news and events to exclusive deals, jobs, and neighborhood updates, 
              JaipurCircle helps citizens discover, engage, and participate in their city. 
              Founded in 2024, JaipurCircle serves as Jaipur's comprehensive local discovery 
              platform, connecting residents with verified information about their community.
            </p>
          </CardContent>
        </Card>

        {/* Mission Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Our Mission
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            To make Jaipur more connected, informed, and accessible by empowering citizens, 
            businesses, and communities through trusted local information.
          </p>
        </section>

        {/* What We Cover */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">What We Cover</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Built for Jaipur */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            Built for Jaipur, By Jaipur
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            JaipurCircle is designed as an open platform where verified contributors, 
            local businesses, and everyday citizens can share meaningful updates that 
            matter to Jaipur. Our community-driven approach ensures that the content 
            you see is relevant, timely, and valuable.
          </p>
        </section>

        {/* Trust Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Trust, Transparency & Quality
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            All content on JaipurCircle follows strict editorial and moderation guidelines 
            to ensure accuracy, neutrality, and relevance for Jaipur residents. We verify 
            businesses, moderate user-generated content, and maintain high standards for 
            all published information.
          </p>
        </section>

        {/* Contact Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Contact & Collaboration</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            We welcome partnerships with event organizers, local businesses, institutions, 
            and community groups. Get in touch to explore collaboration opportunities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Card className="flex-1">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a 
                      href="mailto:hello@jaipurcircle.com" 
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      hello@jaipurcircle.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="flex-1">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">Jaipur, Rajasthan, India</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Internal Links */}
        <section className="border-t pt-8">
          <h2 className="text-lg font-semibold mb-4">Explore JaipurCircle</h2>
          <div className="flex flex-wrap gap-2">
            <Link to="/news">
              <Button variant="outline" size="sm">Latest News</Button>
            </Link>
            <Link to="/events">
              <Button variant="outline" size="sm">Events</Button>
            </Link>
            <Link to="/deals">
              <Button variant="outline" size="sm">Deals</Button>
            </Link>
            <Link to="/merchant-onboarding">
              <Button variant="outline" size="sm">For Businesses</Button>
            </Link>
          </div>
        </section>
      </main>

      <div className="h-24" />
      <NativeBottomNav />
    </div>
  );
};

export default AboutPage;
