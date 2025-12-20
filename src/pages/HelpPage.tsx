
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FAQSchema } from "@/components/seo/SchemaInjector";
import { 
  Search, MessageCircle, Phone, Mail, Clock, 
  HelpCircle, Book, Video, Users, Star,
  Send, FileText, Smartphone, CreditCard
} from "lucide-react";

const HelpPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const faqCategories = [
    {
      title: "Getting Started",
      icon: Book,
      faqs: [
        {
          question: "How do I create an account on JaipurCircle?",
          answer: "Click on 'Sign In Securely' at the top of the page, then choose 'Sign Up' to create a new account with your email and password. You'll receive a verification email to confirm your account."
        },
        {
          question: "How do I find deals near me?",
          answer: "Set your locality in your profile settings, and our app will automatically show you deals in your area. You can also use the search function to find specific locations or browse by categories."
        },
        {
          question: "What is JaiCoin and how do I earn it?",
          answer: "JaiCoin is our reward currency. You earn JaiCoins by purchasing deals, referring friends, completing challenges, and being an active member. Use JaiCoins for exclusive discounts and special offers."
        }
      ]
    },
    {
      title: "Deals & Purchases",
      icon: CreditCard,
      faqs: [
        {
          question: "How do I purchase a deal?",
          answer: "Browse deals, click on one you like, and follow the purchase process. You'll receive a digital coupon that you can show at the merchant location to redeem your discount."
        },
        {
          question: "Can I get a refund for my purchase?",
          answer: "Refunds are available within 24 hours of purchase for unused coupons. Contact our support team with your order details for assistance."
        },
        {
          question: "How long are deals valid?",
          answer: "Each deal has its own expiration date clearly mentioned. Most deals are valid for 30-90 days from purchase. Check the deal details before purchasing."
        },
        {
          question: "What if a merchant doesn't accept my coupon?",
          answer: "Contact our support team immediately with details. We'll resolve the issue with the merchant and ensure you get your discount or provide a full refund."
        }
      ]
    },
    {
      title: "Account & Profile",
      icon: Users,
      faqs: [
        {
          question: "How do I update my profile information?",
          answer: "Go to your Profile page from the main menu. You can edit your name, phone number, locality, and notification preferences. Changes are saved automatically."
        },
        {
          question: "How do I change my password?",
          answer: "In your Profile page, go to the Security tab and use the 'Change Password' section. You'll need to enter your current password and set a new one."
        },
        {
          question: "Can I delete my account?",
          answer: "Yes, you can delete your account from the Profile page under the Data tab. This action is permanent and will remove all your data, including JaiCoins."
        }
      ]
    },
    {
      title: "Technical Issues",
      icon: Smartphone,
      faqs: [
        {
          question: "The app is loading slowly. What should I do?",
          answer: "Try refreshing the page or clearing your browser cache. If the issue persists, check your internet connection or try accessing from a different device."
        },
        {
          question: "I'm not receiving email notifications",
          answer: "Check your spam folder and ensure your email is correct in your profile. You can also adjust notification preferences in your Profile settings."
        },
        {
          question: "My coupon QR code isn't scanning",
          answer: "Ensure your screen brightness is high and the QR code is clearly visible. You can also show the coupon code number to the merchant manually."
        }
      ]
    }
  ];

  const contactOptions = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: MessageCircle,
      action: "Start Chat",
      availability: "Available 9 AM - 9 PM",
      color: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      title: "Phone Support",
      description: "Call us for immediate assistance",
      icon: Phone,
      action: "+91 141-555-0123",
      availability: "Available 9 AM - 6 PM",
      color: "bg-green-50 text-green-700 border-green-200"
    },
    {
      title: "Email Support",
      description: "Send us your questions and concerns",
      icon: Mail,
      action: "support@jaipurcircle.com",
      availability: "Response within 24 hours",
      color: "bg-purple-50 text-purple-700 border-purple-200"
    }
  ];

  const helpResources = [
    {
      title: "Video Tutorials",
      description: "Watch step-by-step guides",
      icon: Video,
      count: "12 videos"
    },
    {
      title: "User Guide",
      description: "Comprehensive documentation",
      icon: FileText,
      count: "15 articles"
    },
    {
      title: "Community Forum",
      description: "Connect with other users",
      icon: Users,
      count: "500+ members"
    }
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We'll get back to you within 24 hours"
    });
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  // Prepare FAQ data for schema
  const allFaqs = faqCategories.flatMap(cat => cat.faqs);

  return (
    <DashboardLayout user={user} profile={profile} pageTitle="Help & Support" showBackButton>
      <FAQSchema faqs={allFaqs} />
      <div className="space-y-6 p-4 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
          <p className="text-gray-600">Find answers to your questions and get support</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for help articles, FAQs, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-4 text-lg"
            />
          </div>
        </div>

        {/* Quick Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {contactOptions.map((option, index) => (
            <Card key={index} className={`border-2 ${option.color} hover:shadow-lg transition-shadow cursor-pointer`}>
              <CardContent className="p-6 text-center">
                <option.icon className="w-12 h-12 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                <p className="text-sm mb-4">{option.description}</p>
                <Button variant="outline" className="mb-2">
                  {option.action}
                </Button>
                <div className="flex items-center justify-center gap-1 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{option.availability}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="w-6 h-6 text-pink-600" />
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            </div>

            {filteredFAQs.length === 0 ? (
              <Card className="p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No results found</h3>
                <p className="text-gray-500">Try adjusting your search terms</p>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredFAQs.map((category, categoryIndex) => (
                  <Card key={categoryIndex}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <category.icon className="w-5 h-5 text-pink-600" />
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="space-y-2">
                        {category.faqs.map((faq, faqIndex) => (
                          <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                            <AccordionTrigger className="text-left hover:text-pink-600">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Help Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Help Resources</CardTitle>
                <CardDescription>Additional ways to get help</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {helpResources.map((resource, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <resource.icon className="w-8 h-8 text-pink-600" />
                    <div className="flex-1">
                      <h4 className="font-medium">{resource.title}</h4>
                      <p className="text-sm text-gray-600">{resource.description}</p>
                    </div>
                    <Badge variant="outline">{resource.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Still Need Help?</CardTitle>
                <CardDescription>Send us a message and we'll get back to you</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Your Name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Describe your issue or question..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-orange-400">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-lg">4.8/5</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Customer Satisfaction</p>
                <p className="text-xs text-gray-500">Based on 1,200+ reviews</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HelpPage;
