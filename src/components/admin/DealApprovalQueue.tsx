
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DealForApproval {
  id: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  approval_status: string;
  created_by: string;
  created_at: string;
  merchant: {
    business_name: string;
  };
  creator: {
    full_name: string;
    email: string;
  };
}

const DealApprovalQueue = () => {
  const [deals, setDeals] = useState<DealForApproval[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDealsForApproval();
  }, []);

  const fetchDealsForApproval = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select(`
          id,
          title,
          description,
          original_price,
          discounted_price,
          discount_percentage,
          approval_status,
          created_by,
          created_at,
          merchants!inner(business_name),
          profiles!deals_created_by_fkey(full_name, email)
        `)
        .in('approval_status', ['draft', 'pending_approval'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDeals = data?.map(deal => ({
        ...deal,
        merchant: { business_name: deal.merchants?.business_name || 'Unknown Merchant' },
        creator: {
          full_name: (deal.profiles as any)?.full_name || 'Unknown User',
          email: (deal.profiles as any)?.email || 'Unknown Email'
        }
      })) || [];

      setDeals(formattedDeals);
    } catch (error: any) {
      console.error('Error fetching deals for approval:', error);
      toast({
        title: "Error",
        description: "Failed to fetch deals for approval",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const approveDeal = async (dealId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('deals')
        .update({
          approval_status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          is_active: true
        })
        .eq('id', dealId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Deal approved successfully",
      });

      fetchDealsForApproval();
    } catch (error: any) {
      console.error('Error approving deal:', error);
      toast({
        title: "Error",
        description: `Failed to approve deal: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const rejectDeal = async (dealId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('deals')
        .update({
          approval_status: 'rejected',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
          is_active: false
        })
        .eq('id', dealId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Deal rejected",
      });

      setSelectedDeal(null);
      setRejectionReason('');
      fetchDealsForApproval();
    } catch (error: any) {
      console.error('Error rejecting deal:', error);
      toast({
        title: "Error",
        description: `Failed to reject deal: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Deal Approval Queue ({deals.length})
          </CardTitle>
          <CardDescription>
            Review and approve deals submitted by merchants and listing agents
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {deals.map((deal) => (
          <Card key={deal.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{deal.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {deal.merchant.business_name} • Created by {deal.creator.full_name}
                  </CardDescription>
                </div>
                <Badge 
                  variant={deal.approval_status === 'draft' ? 'secondary' : 'default'}
                  className="ml-4"
                >
                  {deal.approval_status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{deal.description}</p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-pink-600">
                    ₹{deal.discounted_price?.toLocaleString()}
                  </span>
                  {deal.original_price && (
                    <span className="text-lg text-gray-500 line-through">
                      ₹{deal.original_price.toLocaleString()}
                    </span>
                  )}
                  {deal.discount_percentage > 0 && (
                    <Badge variant="destructive">
                      {deal.discount_percentage}% OFF
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Created: {new Date(deal.created_at).toLocaleString()}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => approveDeal(deal.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => setSelectedDeal(deal.id)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>

                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>

              {selectedDeal === deal.id && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <label className="block text-sm font-medium mb-2">
                    Rejection Reason
                  </label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    className="mb-3"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => rejectDeal(deal.id)}
                      disabled={!rejectionReason.trim()}
                    >
                      Confirm Rejection
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedDeal(null);
                        setRejectionReason('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {deals.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Deals Pending Approval</h3>
            <p className="text-gray-500">All deals have been reviewed</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DealApprovalQueue;
