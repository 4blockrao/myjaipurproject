import { Users, Gift, Trophy, Star } from "lucide-react";

const NativeStatsBar = () => {
  const stats = [
    { icon: Users, value: "50K+", label: "Users" },
    { icon: Gift, value: "1.5K+", label: "Deals" },
    { icon: Trophy, value: "800+", label: "Merchants" },
    { icon: Star, value: "4.8", label: "Rating" },
  ];

  return (
    <div className="px-4 py-4 bg-gradient-to-r from-primary/5 to-primary/10">
      <div className="flex items-center justify-around">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center">
            <stat.icon className="w-5 h-5 text-primary mb-1" />
            <span className="text-lg font-bold text-foreground">{stat.value}</span>
            <span className="text-[10px] text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NativeStatsBar;
