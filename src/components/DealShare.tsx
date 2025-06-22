
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  Copy, 
  MessageCircle, 
  Mail, 
  Phone,
  Facebook,
  Twitter,
  Coins
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DealShareProps {
  dealId: string;
  dealTitle: string;
  dealPrice: number;
  isOpen: boolean;
  onClose: () => void;
}

const DealShare = ({ dealId, dealTitle, dealPrice, isOpen, onClose }: DealShareProps) => {
  const [shareToken, setShareToken] = useState<string>('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useState(() => {
    checkUser();
  });

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
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

    setIsGeneratingLink(true);
    try {
      // Generate unique share token
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Record the share link creation
      const { error } = await supabase
        .from('shared_deal_links')
        .insert({
          user_id: user.id,
          deal_id: dealId,
          token: token
        });

      if (error) throw error;

      setShareToken(token);
      toast({
        title: "Share Link Generated!",
        description: "Earn 20 JaiCoins when someone purchases or redeems this deal through your link",
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
    const baseUrl = window.location.origin;
    return `${baseUrl}/deals?deal=${dealId}&shared_by=${shareToken}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      toast({
        title: "Link Copied!",
        description: "Share link has been copied to clipboard",
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
    const message = `Check out this amazing deal: ${dealTitle}${dealPrice > 0 ? ` for just ₹${dealPrice}` : ' - FREE'}! ${getShareUrl()}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaTelegram = () => {
    const message = `Check out this amazing deal: ${dealTitle}${dealPrice > 0 ? ` for just ₹${dealPrice}` : ' - FREE'}! ${getShareUrl()}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `Amazing Deal: ${dealTitle}`;
    const body = `I found this great deal and thought you'd be interested!\n\n${dealTitle}${dealPrice > 0 ? ` - Only ₹${dealPrice}` : ' - FREE'}\n\nCheck it out: ${getShareUrl()}`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl);
  };

  const shareViaSMS = () => {
    const message = `Check out this deal: ${dealTitle}${dealPrice > 0 ? ` for ₹${dealPrice}` : ' - FREE'}! ${getShareUrl()}`;
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    window.open(smsUrl);
  };

  const shareViaFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareViaTwitter = () => {
    const message = `Check out this amazing deal: ${dealTitle}${dealPrice > 0 ? ` for just ₹${dealPrice}` : ' - FREE'}!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
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
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-100 text-yellow-800">
              <Coins className="w-3 h-3 mr-1" />
              Earn 20 JaiCoins
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Share "{dealTitle}" and earn 20 JaiCoins when someone {dealPrice > 0 ? 'purchases' : 'redeems'} it!
            </p>
            
            {!shareToken ? (
              <Button 
                onClick={generateShareLink} 
                disabled={isGeneratingLink}
                className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600"
              >
                {isGeneratingLink ? 'Generating...' : 'Generate Share Link'}
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Share Link */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Input 
                      value={getShareUrl()} 
                      readOnly 
                      className="text-xs"
                    />
                    <Button 
                      onClick={copyToClipboard} 
                      size="sm"
                      variant="outline"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
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

                <div className="text-xs text-gray-500 text-center">
                  Reward triggers when deal is {dealPrice > 0 ? 'purchased' : 'redeemed'}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DealShare;
