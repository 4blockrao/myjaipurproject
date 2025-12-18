import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/settings/LanguageSwitcher";
import {
  User, Bell, Shield, CreditCard, HelpCircle,
  LogOut, ChevronRight, Moon, Globe, Crown, FileText
} from "lucide-react";

interface AccountSettingsProps {
  user: any;
  profile: any;
}

const AccountSettings = ({ user, profile }: AccountSettingsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
    toast({ title: t('common.signOut') + " successfully" });
  };

  const settingsSections = [
    {
      title: t('account.profile'),
      items: [
        {
          icon: User,
          label: "Edit Profile",
          subtitle: "Update your name, photo & details",
          onClick: () => navigate('/settings'),
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600"
        },
        {
          icon: Crown,
          label: "Pro Membership",
          subtitle: profile?.is_pro ? "You're a Pro member!" : "Upgrade for exclusive benefits",
          onClick: () => navigate('/pro'),
          iconBg: "bg-amber-100",
          iconColor: "text-amber-600"
        },
      ]
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          label: t('settings.notifications'),
          subtitle: "Manage push & email notifications",
          onClick: () => {},
          iconBg: "bg-purple-100",
          iconColor: "text-purple-600"
        },
      ]
    },
    {
      title: "Security",
      items: [
        {
          icon: Shield,
          label: t('settings.privacy'),
          subtitle: "Password, 2FA & data privacy",
          onClick: () => {},
          iconBg: "bg-red-100",
          iconColor: "text-red-600"
        },
        {
          icon: CreditCard,
          label: "Payment Methods",
          subtitle: "Manage saved payment options",
          onClick: () => {},
          iconBg: "bg-indigo-100",
          iconColor: "text-indigo-600"
        },
      ]
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          label: t('settings.help'),
          subtitle: "FAQs, contact us, report issues",
          onClick: () => navigate('/help'),
          iconBg: "bg-cyan-100",
          iconColor: "text-cyan-600"
        },
        {
          icon: FileText,
          label: "Sitemap",
          subtitle: "Generate XML sitemap for SEO",
          onClick: () => navigate('/sitemap'),
          iconBg: "bg-green-100",
          iconColor: "text-green-600"
        },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Language Switcher */}
      <LanguageSwitcher />

      {settingsSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
            {section.title}
          </h3>
          <Card>
            <CardContent className="p-0 divide-y">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={item.onClick}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.iconBg}`}>
                      <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}

      {/* Sign Out */}
      <Card>
        <CardContent className="p-0">
          <button
            onClick={handleSignOut}
            className="w-full p-4 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-red-100">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-600">{t('common.signOut')}</p>
              <p className="text-sm text-muted-foreground">Sign out of your account</p>
            </div>
          </button>
        </CardContent>
      </Card>

      {/* App Info */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">JaipurCircle v1.0.0</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link to="/about" className="text-xs text-primary">About</Link>
          <Link to="/privacy" className="text-xs text-primary">Privacy</Link>
          <Link to="/terms" className="text-xs text-primary">Terms</Link>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
