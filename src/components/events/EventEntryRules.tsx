import { 
  Shield, AlertTriangle, CheckCircle, XCircle, 
  CreditCard, Camera, UtensilsCrossed, DoorClosed,
  Baby, FileCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EventEntryRulesProps {
  event: {
    category: string;
    is_free?: boolean | null;
    venue_name?: string | null;
  };
}

/**
 * Entry Rules & Restrictions Block
 * Checklist style - age requirement, ID proof, re-entry policy, bags/cameras, food policy
 * Very few sites include this → huge ranking differentiator
 */
export const EventEntryRules = ({ event }: EventEntryRulesProps) => {
  const category = event.category.toLowerCase();
  
  // Determine age requirement
  const getAgeRequirement = () => {
    if (category.includes('nightlife') || category.includes('club')) {
      return { text: '21+ Only', icon: AlertTriangle, color: 'text-orange-600' };
    }
    if (category.includes('comedy')) {
      return { text: '16+ Recommended', icon: AlertTriangle, color: 'text-yellow-600' };
    }
    if (category.includes('kids') || category.includes('family')) {
      return { text: 'All Ages, Family Friendly', icon: Baby, color: 'text-green-600' };
    }
    return { text: 'All Ages Welcome', icon: Baby, color: 'text-green-600' };
  };

  const ageReq = getAgeRequirement();

  const allowedItems = [
    { text: 'Valid ID proof (Aadhaar, DL, Passport)', required: true },
    { text: 'E-ticket or registration confirmation', required: true },
    { text: 'Mobile phones', required: false },
    { text: 'Small purses/clutches', required: false },
  ];

  const prohibitedItems = [
    'Outside food & beverages',
    'Professional cameras (DSLRs)',
    'Large bags & backpacks',
    'Weapons or sharp objects',
    'Drugs or illegal substances',
    'Laser pointers',
  ];

  const policies = [
    {
      icon: <DoorClosed className="w-4 h-4" />,
      label: 'Re-entry Policy',
      value: 'No re-entry once you exit the venue',
      type: 'warning' as const,
    },
    {
      icon: <Camera className="w-4 h-4" />,
      label: 'Photography',
      value: 'Personal photos allowed, no professional equipment',
      type: 'info' as const,
    },
    {
      icon: <UtensilsCrossed className="w-4 h-4" />,
      label: 'Food & Drinks',
      value: 'Available for purchase inside venue',
      type: 'success' as const,
    },
    {
      icon: <CreditCard className="w-4 h-4" />,
      label: 'Payment',
      value: 'Cash & UPI accepted at venue',
      type: 'info' as const,
    },
  ];

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Entry Rules & Restrictions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Age Requirement */}
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${
          ageReq.color === 'text-green-600' 
            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
            : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
        }`}>
          <ageReq.icon className={`w-5 h-5 ${ageReq.color}`} />
          <div>
            <p className="font-medium">Age Requirement</p>
            <p className={`text-sm ${ageReq.color}`}>{ageReq.text}</p>
          </div>
        </div>

        {/* What to Bring */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            What to Bring
          </h4>
          <div className="grid gap-2">
            {allowedItems.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800"
              >
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                <span className="text-sm">
                  {item.text}
                  {item.required && (
                    <span className="text-xs text-green-600 ml-1">(Required)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Prohibited Items */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2 text-red-700 dark:text-red-400">
            <XCircle className="w-4 h-4" />
            Not Allowed
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {prohibitedItems.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800"
              >
                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Policies Grid */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-primary" />
            Event Policies
          </h4>
          <div className="grid gap-2">
            {policies.map((policy, idx) => (
              <div 
                key={idx} 
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  policy.type === 'warning' 
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' 
                    : policy.type === 'success'
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                    : 'bg-muted/50 border-border/50'
                }`}
              >
                <span className={`mt-0.5 shrink-0 ${
                  policy.type === 'warning' ? 'text-amber-600' :
                  policy.type === 'success' ? 'text-green-600' : 'text-primary'
                }`}>
                  {policy.icon}
                </span>
                <div>
                  <p className="font-medium text-sm">{policy.label}</p>
                  <p className="text-sm text-muted-foreground">{policy.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Note */}
        <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Security Check:</strong> All attendees will undergo 
            security screening at entry. Please cooperate with security personnel for a smooth experience.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventEntryRules;
