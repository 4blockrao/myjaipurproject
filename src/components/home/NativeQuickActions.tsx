import { useNavigate } from "react-router-dom";
import { Gift, Coins, Trophy, Ticket, Sparkles, Target } from "lucide-react";

const NativeQuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { 
      icon: Coins, 
      label: "JAICoin Zone", 
      description: "Spin & earn coins",
      path: "/jaicoin-zone",
      color: "bg-gradient-to-br from-yellow-500 to-amber-600",
      highlight: true
    },
    { 
      icon: Gift, 
      label: "Refer & Earn", 
      description: "₹100 per referral",
      path: "/referral",
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      highlight: true
    },
    { 
      icon: Trophy, 
      label: "Leaderboard", 
      description: "Top earners",
      path: "/leaderboard",
      color: "bg-gradient-to-br from-purple-500 to-violet-600",
      highlight: false
    },
    { 
      icon: Target, 
      label: "Challenges", 
      description: "Complete & win",
      path: "/challenges",
      color: "bg-gradient-to-br from-blue-500 to-cyan-600",
      highlight: false
    },
  ];

  return (
    <section className="px-4 py-5 bg-background">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Earn & Win</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className={`relative flex items-center gap-3 p-4 bg-card rounded-2xl hover:bg-accent transition-all active:scale-[0.98] text-left shadow-sm ${
              action.highlight ? 'ring-1 ring-primary/20' : ''
            }`}
          >
            {action.highlight && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                HOT
              </span>
            )}
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
    </section>
  );
};

export default NativeQuickActions;
