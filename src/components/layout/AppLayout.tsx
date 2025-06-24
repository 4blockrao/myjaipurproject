
import { ReactNode } from "react";
import ModernNavigation from "@/components/home/ModernNavigation";
import StickyBottomNav from "@/components/home/StickyBottomNav";

interface AppLayoutProps {
  children: ReactNode;
  user?: any;
  profile?: any;
  onAuthModal?: () => void;
  showBottomNav?: boolean;
}

const AppLayout = ({ 
  children, 
  user, 
  profile, 
  onAuthModal, 
  showBottomNav = true 
}: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Header - Always Present */}
      <ModernNavigation 
        user={user} 
        profile={profile} 
        onAuthModal={onAuthModal || (() => {})} 
      />
      
      {/* Main Content */}
      <main className="pb-20 md:pb-0">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      {showBottomNav && <StickyBottomNav />}
    </div>
  );
};

export default AppLayout;
