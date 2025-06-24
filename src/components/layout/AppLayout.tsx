
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
      
      {/* Main Content with proper mobile spacing */}
      <main className="pb-20 md:pb-8 pt-2">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      {showBottomNav && <StickyBottomNav />}
    </div>
  );
};

export default AppLayout;
