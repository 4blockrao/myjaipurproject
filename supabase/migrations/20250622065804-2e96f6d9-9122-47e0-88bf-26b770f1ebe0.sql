
-- Create shared_deal_links table for tracking deal shares
CREATE TABLE public.shared_deal_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  deal_id UUID NOT NULL REFERENCES public.deals(id),
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  link_clicks INTEGER NOT NULL DEFAULT 0
);

-- Create referral_tracking table for tracking shared deal interactions
CREATE TABLE public.referral_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_token TEXT REFERENCES public.shared_deal_links(token),
  user_id UUID,
  coupon_purchased BOOLEAN NOT NULL DEFAULT false,
  coupon_redeemed BOOLEAN NOT NULL DEFAULT false,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  purchased_at TIMESTAMP WITH TIME ZONE,
  redeemed_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for shared_deal_links
ALTER TABLE public.shared_deal_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shared links" 
ON public.shared_deal_links 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shared links" 
ON public.shared_deal_links 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shared links" 
ON public.shared_deal_links 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add RLS policies for referral_tracking
ALTER TABLE public.referral_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view referral tracking for their shares" 
ON public.referral_tracking 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.shared_deal_links 
    WHERE token = share_token AND user_id = auth.uid()
  )
);

CREATE POLICY "Allow inserting referral tracking data" 
ON public.referral_tracking 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow updating referral tracking data" 
ON public.referral_tracking 
FOR UPDATE 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_shared_deal_links_token ON public.shared_deal_links(token);
CREATE INDEX idx_shared_deal_links_user_id ON public.shared_deal_links(user_id);
CREATE INDEX idx_referral_tracking_share_token ON public.referral_tracking(share_token);
