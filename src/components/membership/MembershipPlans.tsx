
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: 'monthly' | 'yearly';
  features: string[];
  popularBadge?: boolean;
  savingsPercent?: number;
}

interface MembershipPlansProps {
  plans: MembershipPlan[];
  currentPlan: string | null;
  onSubscribe: (planId: string) => void;
  user: any;
}

const MembershipPlans = ({ plans, currentPlan, onSubscribe, user }: MembershipPlansProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plans.map((plan) => (
        <Card 
          key={plan.id} 
          className={`relative ${
            plan.popularBadge ? 'border-2 border-pink-500 shadow-lg scale-105' : ''
          } ${currentPlan === plan.id ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
        >
          {plan.popularBadge && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-pink-500 text-white px-3 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>
          )}
          
          {currentPlan === plan.id && (
            <div className="absolute -top-3 right-4">
              <Badge className="bg-green-500 text-white">
                <Check className="w-3 h-3 mr-1" />
                Current Plan
              </Badge>
            </div>
          )}

          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                ₹{plan.price}
                <span className="text-sm font-normal text-gray-600">
                  /{plan.duration === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              {plan.savingsPercent && (
                <Badge className="bg-green-100 text-green-700">
                  Save {plan.savingsPercent}%
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-0">
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              className={`w-full ${
                plan.popularBadge 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700' 
                  : ''
              }`}
              variant={plan.id === 'basic' ? 'outline' : 'default'}
              onClick={() => plan.id !== 'basic' && plan.id !== currentPlan && onSubscribe(plan.id)}
              disabled={plan.id === currentPlan || (plan.id === 'basic' && !user)}
              size="sm"
            >
              {plan.id === currentPlan 
                ? 'Current Plan' 
                : plan.id === 'basic' 
                  ? 'Free Plan' 
                  : `Upgrade to ${plan.name}`
              }
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MembershipPlans;
