import React, { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import NativeBottomNav from "@/components/home/NativeBottomNav";

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
  showBottomNav = true,
  hideNavigation = false
}) => {
  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Sonner />
      
      <main>
        {children}
      </main>
      
      {showBottomNav && !hideNavigation && (
        <>
          <div className="h-20" />
          <NativeBottomNav />
        </>
      )}
    </div>
  );
};

export default AppLayout;
