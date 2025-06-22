
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";
import { Link } from "react-router-dom";

const JaiCoinWallet = () => {
  const userCoins = 280; // This would come from user data

  return (
    <Link to="/wallet">
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-white hover:bg-white/20 transition-colors flex items-center space-x-2 px-3 py-2"
      >
        <div className="flex items-center space-x-1">
          <Coins className="w-4 h-4 text-yellow-300" />
          <span className="font-semibold text-sm">{userCoins}</span>
        </div>
        <Badge className="bg-yellow-500 text-yellow-900 text-xs px-2 py-0.5 font-bold">
          JAI
        </Badge>
      </Button>
    </Link>
  );
};

export default JaiCoinWallet;
