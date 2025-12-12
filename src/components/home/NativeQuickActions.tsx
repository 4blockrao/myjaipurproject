import { useNavigate } from "react-router-dom";
import { Gift, Users, Coins, Trophy, Ticket, Sparkles } from "lucide-react";

const NativeQuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { 
      icon: Coins, 
      label: "Earn Coins", 
      description: "Complete tasks",
      path: "/jai-coins",
      color: "bg-yellow-500",
      iconColor: "text-yellow-500"
    },
    { 
      icon: Gift, 
      label: "Refer & Earn", 
      description: "₹100 per referral",
      path: "/referral",
      color: "bg-green-500",
      iconColor: "text-green-500"
    },
    { 
      icon: Trophy, 
      label: "Leaderboard", 
      description: "Win prizes",
      path: "/leaderboard",
      color: "bg-purple-500",
      iconColor: "text-purple-500"
    },
    { 
      icon: Ticket, 
      label: "My Coupons", 
      description: "View saved",
      path: "/coupons",
      color: "bg-blue-500",
      iconColor: "text-blue-500"
    },
  ];

  return (
    <div className="px-4 py-5 bg-background">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="flex items-center gap-3 p-4 bg-card rounded-2xl hover:bg-accent transition-all active:scale-[0.98] text-left shadow-sm"
          >
            <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center shadow-sm`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NativeQuickActions;
