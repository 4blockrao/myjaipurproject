import React, { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ModernNavigation from "@/components/home/ModernNavigation";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { PageLoading } from "@/components/ui/page-loading";
import { usePageTransition } from "@/hooks/usePageTransition";

interface AppLayoutProps {
  children: ReactNode;
  user?: any;
  profile?: any;
  onAuthModal?: () => void;
  showBottomNav?: boolean;
  hideNavigation?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  user,
  profile,
  onAuthModal,
  showBottomNav = true,
  hideNavigation = false
}) => {
  const { isLoading, progress } = usePageTransition();

  if (isLoading) {
    return <PageLoading progress={progress} showProgress />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Sonner />
      
      {!hideNavigation && (
        <ModernNavigation 
          user={user} 
          profile={profile} 
          onAuthModal={onAuthModal}
        />
      )}
      
      <main className={!hideNavigation ? "pt-16" : ""}>
        {children}
      </main>
      
      {showBottomNav && (
        <NativeBottomNav />
      )}
    </div>
  );
};

export default AppLayout;
