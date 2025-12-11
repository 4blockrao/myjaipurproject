import { useState, useEffect } from "react";
import { Download, Smartphone, Share, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import NativeDashboardLayout from "@/components/layout/NativeDashboardLayout";
import { NativeCard } from "@/components/ui/native-card";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
      setIsInstalled(isStandaloneMode);
    };

    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    checkInstalled();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    { icon: "⚡", title: "Lightning Fast", description: "Instant access without browser delays" },
    { icon: "📴", title: "Works Offline", description: "Browse saved deals even without internet" },
    { icon: "🔔", title: "Push Notifications", description: "Never miss a flash deal or expiring coupon" },
    { icon: "🏠", title: "Home Screen Access", description: "One tap to open from your home screen" },
  ];

  return (
    <NativeDashboardLayout title="Install App" subtitle="Get the best experience">
      <div className="space-y-6">
        {/* Hero Section */}
        <NativeCard variant="elevated" padding="lg" className="text-center bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl font-bold text-white">JC</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">JaipurCircle</h1>
          <p className="text-muted-foreground text-sm">Your Deals & Rewards Hub</p>
          
          {isStandalone && (
            <div className="flex items-center justify-center gap-2 mt-4 text-emerald-600">
              <Check className="w-5 h-5" />
              <span className="font-medium">Already Installed!</span>
            </div>
          )}
        </NativeCard>

        {/* Install Button */}
        {!isStandalone && (
          <NativeCard variant="default" padding="lg">
            {deferredPrompt ? (
              <Button
                onClick={handleInstall}
                className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-primary to-primary/90"
              >
                <Download className="w-5 h-5 mr-2" />
                Install JaipurCircle
              </Button>
            ) : isIOS ? (
              <div className="space-y-4">
                <p className="text-center font-medium">Install on iPhone/iPad:</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Share className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">1. Tap the Share button</p>
                      <p className="text-xs text-muted-foreground">At the bottom of Safari</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">2. Add to Home Screen</p>
                      <p className="text-xs text-muted-foreground">Scroll down and tap this option</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">3. Tap Add</p>
                      <p className="text-xs text-muted-foreground">Confirm to install the app</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-center font-medium">Install on your device:</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-lg">⋮</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">1. Tap browser menu</p>
                      <p className="text-xs text-muted-foreground">Three dots at top right</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">2. Install app / Add to Home</p>
                      <p className="text-xs text-muted-foreground">Look for install or add option</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </NativeCard>
        )}

        {/* Features */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Why Install?</h2>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <NativeCard key={index} variant="default" padding="md">
                <span className="text-2xl mb-2 block">{feature.icon}</span>
                <h3 className="text-sm font-semibold mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </NativeCard>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <NativeCard variant="filled" padding="md">
          <h3 className="font-semibold mb-2">Exclusive App Benefits</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Early access to flash deals</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Bonus JaiCoins on first install</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Faster checkout experience</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Offline coupon access</span>
            </li>
          </ul>
        </NativeCard>
      </div>
    </NativeDashboardLayout>
  );
};

export default InstallPage;
