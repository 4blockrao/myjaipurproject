import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Clock, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Deal {
  id: string;
  title: string;
  description: string | null;
  original_price: number | null;
  discounted_price: number | null;
  discount_percentage: number | null;
  category: string | null;
  location: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  approval_status: string | null;
  jaicoin_reward: number | null;
  start_date: string | null;
  end_date: string | null;
  image_url: string | null;
  merchant_id: string | null;
  created_at: string | null;
  merchants?: { business_name: string } | null;
}

interface Merchant {
  id: string;
  business_name: string;
}

const DealsManagement = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    original_price: "",
    discounted_price: "",
    category: "",
    location: "",
    merchant_id: "",
    jaicoin_reward: "10",
    image_url: "",
    start_date: "",
    end_date: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDeals();
    fetchMerchants();
  }, []);

  const fetchDeals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*, merchants(business_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast({ title: "Error", description: "Failed to fetch deals", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMerchants = async () => {
    const { data } = await supabase
      .from('merchants')
      .select('id, business_name')
      .eq('is_active', true)
      .order('business_name');
    if (data) setMerchants(data);
  };

  const createDeal = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const discountPercentage = formData.original_price && formData.discounted_price
        ? Math.round(((parseFloat(formData.original_price) - parseFloat(formData.discounted_price)) / parseFloat(formData.original_price)) * 100)
        : 0;

      const { error } = await supabase.from('deals').insert({
        title: formData.title,
        description: formData.description,
        original_price: parseFloat(formData.original_price) || null,
        discounted_price: parseFloat(formData.discounted_price) || null,
        discount_percentage: discountPercentage,
        category: formData.category,
        location: formData.location,
        merchant_id: formData.merchant_id || null,
        jaicoin_reward: parseInt(formData.jaicoin_reward) || 10,
        image_url: formData.image_url,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: true,
        approval_status: 'approved',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
        created_by: user?.id
      });

      if (error) throw error;

      toast({ title: "Success", description: "Deal created successfully" });
      setIsCreateOpen(false);
      resetForm();
      fetchDeals();
    } catch (error: any) {
      console.error('Error creating deal:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateDeal = async () => {
    if (!editingDeal) return;
    
    try {
      const discountPercentage = formData.original_price && formData.discounted_price
        ? Math.round(((parseFloat(formData.original_price) - parseFloat(formData.discounted_price)) / parseFloat(formData.original_price)) * 100)
        : 0;

      const { error } = await supabase
        .from('deals')
        .update({
          title: formData.title,
          description: formData.description,
          original_price: parseFloat(formData.original_price) || null,
          discounted_price: parseFloat(formData.discounted_price) || null,
          discount_percentage: discountPercentage,
          category: formData.category,
          location: formData.location,
          merchant_id: formData.merchant_id || null,
          jaicoin_reward: parseInt(formData.jaicoin_reward) || 10,
          image_url: formData.image_url,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingDeal.id);

      if (error) throw error;

      toast({ title: "Success", description: "Deal updated successfully" });
      setEditingDeal(null);
      resetForm();
      fetchDeals();
    } catch (error: any) {
      console.error('Error updating deal:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleDealActive = async (id: string, currentStatus: boolean | null) => {
    const { error } = await supabase
      .from('deals')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to update deal", variant: "destructive" });
    } else {
      setDeals(deals.map(d => d.id === id ? { ...d, is_active: !currentStatus } : d));
      toast({ title: "Updated", description: `Deal ${!currentStatus ? 'activated' : 'deactivated'}` });
    }
  };

  const toggleDealFeatured = async (id: string, currentStatus: boolean | null) => {
    const { error } = await supabase
      .from('deals')
      .update({ is_featured: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to update deal", variant: "destructive" });
    } else {
      setDeals(deals.map(d => d.id === id ? { ...d, is_featured: !currentStatus } : d));
      toast({ title: "Updated", description: `Featured status updated` });
    }
  };

  const approveDeal = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('deals')
      .update({ 
        approval_status: 'approved',
        is_active: true,
        approved_by: user?.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to approve deal", variant: "destructive" });
    } else {
      fetchDeals();
      toast({ title: "Success", description: "Deal approved" });
    }
  };

  const rejectDeal = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('deals')
      .update({ 
        approval_status: 'rejected',
        is_active: false,
        approved_by: user?.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to reject deal", variant: "destructive" });
    } else {
      fetchDeals();
      toast({ title: "Success", description: "Deal rejected" });
    }
  };

  const deleteDeal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    
    const { error } = await supabase.from('deals').delete().eq('id', id);
    
    if (error) {
      toast({ title: "Error", description: "Failed to delete deal", variant: "destructive" });
    } else {
      setDeals(deals.filter(d => d.id !== id));
      toast({ title: "Deleted", description: "Deal deleted successfully" });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      original_price: "",
      discounted_price: "",
      category: "",
      location: "",
      merchant_id: "",
      jaicoin_reward: "10",
      image_url: "",
      start_date: "",
      end_date: ""
    });
  };

  const openEditDialog = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      description: deal.description || "",
      original_price: deal.original_price?.toString() || "",
      discounted_price: deal.discounted_price?.toString() || "",
      category: deal.category || "",
      location: deal.location || "",
      merchant_id: deal.merchant_id || "",
      jaicoin_reward: deal.jaicoin_reward?.toString() || "10",
      image_url: deal.image_url || "",
      start_date: deal.start_date?.split('T')[0] || "",
      end_date: deal.end_date?.split('T')[0] || ""
    });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      case 'pending_approval': return <Badge variant="secondary">Pending</Badge>;
      default: return <Badge variant="outline">Draft</Badge>;
    }
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.merchants?.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || deal.approval_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingDeals = deals.filter(d => d.approval_status === 'pending_approval' || d.approval_status === 'draft');
  const activeDeals = deals.filter(d => d.is_active);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const DealForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Title *</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Deal title"
          />
        </div>
        <div className="col-span-2">
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Deal description"
          />
        </div>
        <div>
          <Label>Original Price (₹)</Label>
          <Input
            type="number"
            value={formData.original_price}
            onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
          />
        </div>
        <div>
          <Label>Discounted Price (₹)</Label>
          <Input
            type="number"
            value={formData.discounted_price}
            onChange={(e) => setFormData({ ...formData, discounted_price: e.target.value })}
          />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="food">Food & Dining</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="health">Health & Wellness</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Location</Label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Malviya Nagar"
          />
        </div>
        <div>
          <Label>Merchant</Label>
          <Select value={formData.merchant_id} onValueChange={(v) => setFormData({ ...formData, merchant_id: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select merchant" />
            </SelectTrigger>
            <SelectContent>
              {merchants.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>JaiCoin Reward</Label>
          <Input
            type="number"
            value={formData.jaicoin_reward}
            onChange={(e) => setFormData({ ...formData, jaicoin_reward: e.target.value })}
          />
        </div>
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>
        <div className="col-span-2">
          <Label>Image URL</Label>
          <Input
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{deals.length}</div>
            <div className="text-sm text-muted-foreground">Total Deals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{activeDeals.length}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{pendingDeals.length}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{deals.filter(d => d.is_featured).length}</div>
            <div className="text-sm text-muted-foreground">Featured</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Management Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Deals Management
              </CardTitle>
              <CardDescription>Create, edit, approve or disable deals</CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={() => { resetForm(); }}>
                  <Plus className="w-4 h-4" />
                  Create Deal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Deal</DialogTitle>
                  <DialogDescription>Add a new deal to the platform</DialogDescription>
                </DialogHeader>
                <DealForm />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button onClick={createDeal} disabled={!formData.title}>Create Deal</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending_approval">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Deals Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {deal.image_url && (
                          <img src={deal.image_url} alt="" className="w-10 h-10 object-cover rounded" />
                        )}
                        <div>
                          <div className="font-medium max-w-[200px] truncate">{deal.title}</div>
                          <div className="text-xs text-muted-foreground">{deal.category}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{deal.merchants?.business_name || 'N/A'}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium text-primary">₹{deal.discounted_price?.toLocaleString()}</span>
                        {deal.original_price && (
                          <span className="text-xs text-muted-foreground line-through ml-1">
                            ₹{deal.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(deal.approval_status)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={deal.is_active || false}
                        onCheckedChange={() => toggleDealActive(deal.id, deal.is_active)}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={deal.is_featured || false}
                        onCheckedChange={() => toggleDealFeatured(deal.id, deal.is_featured)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {(deal.approval_status === 'pending_approval' || deal.approval_status === 'draft') && (
                          <>
                            <Button size="icon" variant="ghost" className="text-green-600" onClick={() => approveDeal(deal.id)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-red-600" onClick={() => rejectDeal(deal.id)}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={() => openEditDialog(deal)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Deal</DialogTitle>
                            </DialogHeader>
                            <DealForm />
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditingDeal(null)}>Cancel</Button>
                              <Button onClick={updateDeal}>Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button size="icon" variant="ghost" className="text-red-600" onClick={() => deleteDeal(deal.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDeals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No deals found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DealsManagement;
