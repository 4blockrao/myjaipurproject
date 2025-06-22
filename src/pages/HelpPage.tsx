
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, MessageCircle, Phone, Mail, HelpCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const { toast } = useToast();

  const faqs = [
    {
      question: "How do I redeem a deal?",
      answer: "To redeem a deal, simply click on the deal you want, show the digital coupon at the store, or follow the online redemption instructions. You'll earn JaiCoins automatically after successful redemption."
    },
    {
      question: "What are JaiCoins and how do I use them?",
      answer: "JaiCoins are reward points you earn with every purchase. You can use them for exclusive deals, discounts, or exchange them for vouchers. Check your wallet to see your current balance."
    },
    {
      question: "How do I become a merchant partner?",
      answer: "Visit our 'For Business' section to start the merchant onboarding process. We'll review your application and help you set up your deals on our platform."
    },
    {
      question: "Are the deals really genuine?",
      answer: "Yes! All our merchant partners are verified and deals are authentic. Look for the verification badge on merchant profiles for added assurance."
    },
    {
      question: "Can I share deals with friends?",
      answer: "Absolutely! Use the share feature on any deal to share with friends via social media, messaging, or email. You might even earn referral rewards!"
    },
    {
      question: "What if a deal doesn't work?",
      answer: "If you encounter any issues with a deal, please contact our support team immediately. We'll investigate and resolve the issue promptly."
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We've received your message and will get back to you within 24 hours."
    });
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Help & Support
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're here to help you get the most out of HiJaipur
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle>Search for Help</CardTitle>
                <CardDescription>Find answers to your questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search FAQs, guides, and help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* FAQs */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Quick answers to common questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                {filteredFaqs.length === 0 && searchQuery && (
                  <div className="text-center py-8 text-gray-500">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No results found for "{searchQuery}"</p>
                    <p className="text-sm">Try different keywords or contact support</p>
                  </div>
                )}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <Input
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <Input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <Input
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <Textarea
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      required
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500"
                  >
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Help */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/deals" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Search className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium group-hover:text-pink-600">Browse Deals</h4>
                    <p className="text-sm text-gray-600">Explore available offers</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-pink-600" />
                </Link>

                <Link to="/wallet" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium group-hover:text-pink-600">Check Wallet</h4>
                    <p className="text-sm text-gray-600">View JaiCoins balance</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-pink-600" />
                </Link>

                <Link to="/merchant" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium group-hover:text-pink-600">Become Partner</h4>
                    <p className="text-sm text-gray-600">Join as merchant</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-pink-600" />
                </Link>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">+91 9876543210</p>
                    <p className="text-sm text-gray-600">Mon-Sat, 9am-6pm</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">support@hijaipur.com</p>
                    <p className="text-sm text-gray-600">24/7 email support</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
