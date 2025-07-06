import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Share2, 
  Copy, 
  MessageCircle, 
  Mail, 
  Phone,
  Facebook,
  Twitter,
  Coins,
  TrendingUp,
  Users,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Deal {
  id: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  category: string;
  image_url?: string;
  share_rewards: {
    share_coins: number;
    click_coins: number;
    purchase_coins: number;
    redemption_coins: number;
    commission_percentage: number;
  };
  merchants: {
    business_name: string;
    is_verified: boolean;
  };
}

interface DealShareProps {
  isOpen: boolean;
  onClose: () => void;
}

const DealShare = ({ isOpen, onClose }: DealShareProps) => {
  const [availableDeals, setAvailableDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [shareToken, setShareToken] = useState<string>('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isLoadingDeals, setIsLoadingDeals] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      checkUser();
      fetchActiveDeals();
    }
  }, [isOpen]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchActiveDeals = async () => {
    try {
      setIsLoadingDeals(true);
      const { data, error } = await supabase
        .from('deals')
        .select(`
          id,
          title,
          description,
          original_price,
          discounted_price,
          discount_percentage,
          category,
          image_url,
          jaicoin_reward,
          merchants!inner(
            business_name,
            is_verified
          )
        `)
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedDeals = data?.map(deal => ({
        id: deal.id,
        title: deal.title,
        description: deal.description || '',
        original_price: deal.original_price || 0,
        discounted_price: deal.discounted_price || 0,
        discount_percentage: deal.discount_percentage || 0,
        category: deal.category || 'General',
        image_url: deal.image_url,
        share_rewards: {
          share_coins: 10,
          click_coins: 5,
          purchase_coins: deal.jaicoin_reward || 20,
          redemption_coins: deal.jaicoin_reward || 20,
          commission_percentage: 8
        },
        merchants: {
          business_name: deal.merchants?.business_name || 'Unknown Merchant',
          is_verified: deal.merchants?.is_verified || false
        }
      })) || [];

      setAvailableDeals(formattedDeals);
      if (formattedDeals.length > 0) {
        setSelectedDeal(formattedDeals[0]);
      }
    } catch (error) {
      console.error('Error fetching active deals:', error);
      toast({
        title: "Error",
        description: "Failed to load active deals",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDeals(false);
    }
  };

  const generateShareLink = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to share deals and earn rewards",
        variant: "destructive"
      });
      return;
    }

    if (!selectedDeal) {
      toast({
        title: "No Deal Selected",
        description: "Please select a deal to share",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingLink(true);
    try {
      // Generate unique share token
      const token = `${user.id.substring(0, 8)}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      
      // Record the share link creation
      const { error: shareError } = await supabase
        .from('shared_deal_links')
        .insert({
          user_id: user.id,
          deal_id: selectedDeal.id,
          token: token
        });

      if (shareError) throw shareError;

      // Award sharing coins
      const { error: rewardError } = await supabase
        .from('jaicoin_transactions')
        .insert({
          user_id: user.id,
          amount: selectedDeal.share_rewards.share_coins,
          type: 'earned',
          source: 'deal_share',
          description: `Shared "${selectedDeal.title}" - earn more when friends click & purchase!`,
          metadata: { deal_id: selectedDeal.id, share_token: token }
        });

      if (rewardError) throw rewardError;

      setShareToken(token);
      toast({
        title: "🎉 Share Link Generated!",
        description: `Earned ${selectedDeal.share_rewards.share_coins} JaiCoins! Get ${selectedDeal.share_rewards.click_coins} more per click, ${selectedDeal.share_rewards.purchase_coins} per purchase!`,
      });

    } catch (error) {
      console.error('Error generating share link:', error);
      toast({
        title: "Error",
        description: "Failed to generate share link",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const getShareUrl = () => {
    if (!selectedDeal || !shareToken) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/deal/${selectedDeal.id}?ref=${shareToken}&utm_source=friend_share`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      toast({
        title: "Link Copied! 📋",
        description: "Share this link to earn rewards when friends purchase",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually",
        variant: "destructive"
      });
    }
  };

  const shareViaWhatsApp = () => {
    if (!selectedDeal) return;
    const savings = selectedDeal.original_price - selectedDeal.discounted_price;
    const message = `🔥 Amazing ${selectedDeal.category} Deal!\n\n"${selectedDeal.title}"\n💰 Save ₹${savings} (${selectedDeal.discount_percentage}% OFF)\n🏪 ${selectedDeal.merchants.business_name}\n\nGet it here: ${getShareUrl()}\n\nShared via MyJaipur 🎯`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaTelegram = () => {
    if (!selectedDeal) return;
    const savings = selectedDeal.original_price - selectedDeal.discounted_price;
    const message = `🔥 Amazing ${selectedDeal.category} Deal!\n\n"${selectedDeal.title}"\n💰 Save ₹${savings} (${selectedDeal.discount_percentage}% OFF)\n🏪 ${selectedDeal.merchants.business_name}\n\nGet it here: ${getShareUrl()}\n\nShared via MyJaipur 🎯`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  };

  const shareViaEmail = () => {
    if (!selectedDeal) return;
    const subject = `🔥 Amazing Deal: ${selectedDeal.title} - Save ${selectedDeal.discount_percentage}%!`;
    const body = `Hey,\n\nI found this amazing deal and thought you'd love it!\n\n${selectedDeal.title} from ${selectedDeal.merchants.business_name} - Save ₹${selectedDeal.original_price - selectedDeal.discounted_price} (${selectedDeal.discount_percentage}% OFF)!\n\nGet it here: ${getShareUrl()}\n\nShared via MyJaipur 🎯`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl);
  };

  const shareViaSMS = () => {
    if (!selectedDeal) return;
    const savings = selectedDeal.original_price - selectedDeal.discounted_price;
    const message = `🔥 Amazing ${selectedDeal.category} Deal!\n\n"${selectedDeal.title}"\n💰 Save ₹${savings} (${selectedDeal.discount_percentage}% OFF)\n🏪 ${selectedDeal.merchants.business_name}\n\nGet it here: ${getShareUrl()}\n\nShared via MyJaipur 🎯`;
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    window.open(smsUrl);
  };

  const shareViaFacebook = () => {
    if (!selectedDeal) return;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareViaTwitter = () => {
    if (!selectedDeal) return;
    const message = `🔥 Amazing ${selectedDeal.category} Deal!\n\n"${selectedDeal.title}"\n💰 Save ₹${selectedDeal.original_price - selectedDeal.discounted_price} (${selectedDeal.discount_percentage}% OFF)\n🏪 ${selectedDeal.merchants.business_name}\n\nGet it here: ${getShareUrl()}\n\nShared via MyJaipur 🎯`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share & Earn
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Deal Selection */}
          {isLoadingDeals ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading active deals...</p>
            </div>
          ) : availableDeals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No active deals available to share</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Deal to Share
                </label>
                <Select
                  value={selectedDeal?.id || ''}
                  onValueChange={(dealId) => {
                    const deal = availableDeals.find(d => d.id === dealId);
                    setSelectedDeal(deal || null);
                    setShareToken(''); // Reset share token when deal changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a deal to share" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDeals.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id}>
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate">{deal.title}</span>
                          <Badge className="ml-2 bg-green-100 text-green-700">
                            {deal.discount_percentage}% OFF
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Deal Preview */}
              {selectedDeal && (
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center text-white text-2xl">
                        🎯
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{selectedDeal.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{selectedDeal.merchants.business_name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">₹{selectedDeal.discounted_price}</span>
                          <span className="text-sm line-through text-gray-500">₹{selectedDeal.original_price}</span>
                          <Badge className="bg-red-500 text-white">
                            {selectedDeal.discount_percentage}% OFF
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Reward Structure */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="bg-white rounded p-2 text-center">
                        <Share2 className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                        <div className="font-bold text-blue-600">+{selectedDeal.share_rewards.share_coins}</div>
                        <div className="text-gray-600">Share</div>
                      </div>
                      <div className="bg-white rounded p-2 text-center">
                        <Users className="w-4 h-4 mx-auto mb-1 text-green-500" />
                        <div className="font-bold text-green-600">+{selectedDeal.share_rewards.click_coins}</div>
                        <div className="text-gray-600">Click</div>
                      </div>
                      <div className="bg-white rounded p-2 text-center">
                        <Target className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                        <div className="font-bold text-purple-600">+{selectedDeal.share_rewards.purchase_coins}</div>
                        <div className="text-gray-600">Purchase</div>
                      </div>
                      <div className="bg-white rounded p-2 text-center">
                        <TrendingUp className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                        <div className="font-bold text-yellow-600">{selectedDeal.share_rewards.commission_percentage}%</div>
                        <div className="text-gray-600">Commission</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Generate/Share Section */}
              <div className="text-center">
                {!shareToken ? (
                  <Button 
                    onClick={generateShareLink} 
                    disabled={isGeneratingLink || !selectedDeal}
                    className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white font-bold py-3"
                  >
                    {isGeneratingLink ? 'Generating...' : `Generate Share Link & Earn ${selectedDeal?.share_rewards.share_coins || 0} Coins`}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    {/* Share Link */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Input 
                          value={getShareUrl()} 
                          readOnly 
                          className="text-xs bg-white"
                        />
                        <Button 
                          onClick={copyToClipboard} 
                          size="sm"
                          variant="outline"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <Coins className="w-3 h-3 mr-1" />
                        Earned {selectedDeal?.share_rewards.share_coins} JaiCoins!
                      </Badge>
                    </div>

                    {/* Share Options */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={shareViaWhatsApp}
                        variant="outline"
                        className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </Button>
                      
                      <Button 
                        onClick={shareViaTelegram}
                        variant="outline"
                        className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Telegram
                      </Button>
                      
                      <Button 
                        onClick={shareViaEmail}
                        variant="outline"
                        className="flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </Button>
                      
                      <Button 
                        onClick={shareViaSMS}
                        variant="outline"
                        className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        <Phone className="w-4 h-4" />
                        SMS
                      </Button>
                      
                      <Button 
                        onClick={shareViaFacebook}
                        variant="outline"
                        className="flex items-center gap-2 text-blue-800 border-blue-200 hover:bg-blue-50"
                      >
                        <Facebook className="w-4 h-4" />
                        Facebook
                      </Button>
                      
                      <Button 
                        onClick={shareViaTwitter}
                        variant="outline"
                        className="flex items-center gap-2 text-sky-600 border-sky-200 hover:bg-sky-50"
                      >
                        <Twitter className="w-4 h-4" />
                        Twitter
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500 text-center bg-yellow-50 p-3 rounded">
                      💡 <strong>Pro Tip:</strong> You'll earn {selectedDeal?.share_rewards.click_coins} JaiCoins per click, 
                      {selectedDeal?.share_rewards.purchase_coins} per purchase, plus {selectedDeal?.share_rewards.commission_percentage}% commission on sales!
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DealShare;
