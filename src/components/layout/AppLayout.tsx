
import { ReactNode } from "react";
import ModernNavigation from "@/components/home/ModernNavigation";
import StickyBottomNav from "@/components/home/StickyBottomNav";

interface AppLayoutProps {
  children: ReactNode;
  user?: any;
  profile?: any;
  onAuthModal: () => void;
  showBottomNav?: boolean;
}

const AppLayout = ({ children, user, profile, onAuthModal, showBottomNav = true }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-white">
      <ModernNavigation 
        user={user} 
        profile={profile} 
        onAuthModal={onAuthModal}
      />
      
      <main className={showBottomNav ? "pb-20 md:pb-0" : ""}>
        {children}
      </main>
      
      {showBottomNav && <StickyBottomNav />}
    </div>
  );
};

export default AppLayout;
