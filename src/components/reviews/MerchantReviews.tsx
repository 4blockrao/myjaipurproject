import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "./StarRating";
import { BadgeCheck, MessageSquare, PenLine } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

// merchant_reviews isn't in the generated types yet — access untyped.
const sb = supabase as any;

interface MerchantReview {
  id: string;
  user_id: string;
  rating: number;
  reviewer_name: string | null;
  title: string | null;
  body: string | null;
  is_verified: boolean;
  created_at: string;
}

interface Props {
  merchantId: string;
  merchantName: string;
}

export function MerchantReviews({ merchantId, merchantName }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["merchant-reviews", merchantId],
    queryFn: async (): Promise<MerchantReview[]> => {
      const { data, error } = await sb
        .from("merchant_reviews")
        .select("id,user_id,rating,reviewer_name,title,body,is_verified,created_at")
        .eq("merchant_id", merchantId)
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MerchantReview[];
    },
  });

  const myReview = useMemo(
    () => reviews.find((r) => r.user_id === user?.id),
    [reviews, user?.id]
  );

  // Prefill the form when editing an existing review.
  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setTitle(myReview.title ?? "");
      setBody(myReview.body ?? "");
    }
  }, [myReview]);

  const summary = useMemo(() => {
    const count = reviews.length;
    const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
    const dist = [5, 4, 3, 2, 1].map((star) => ({
      star,
      n: reviews.filter((r) => r.rating === star).length,
    }));
    return { count, avg, dist };
  }, [reviews]);

  const submit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("not-authenticated");
      if (rating < 1) throw new Error("Please select a star rating.");
      const reviewerName =
        (user.user_metadata as any)?.full_name || user.email?.split("@")[0] || "Anonymous";
      const { error } = await sb.from("merchant_reviews").upsert(
        {
          merchant_id: merchantId,
          user_id: user.id,
          rating,
          reviewer_name: reviewerName,
          title: title.trim() || null,
          body: body.trim() || null,
          status: "published",
        },
        { onConflict: "merchant_id,user_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(myReview ? "Review updated" : "Thanks for reviewing!", {
        description: "Your review is now live and helps others in Jaipur.",
      });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["merchant-reviews", merchantId] });
      queryClient.invalidateQueries({ queryKey: ["merchant", merchantId] });
    },
    onError: (e: any) => {
      if (e?.message === "not-authenticated") return;
      toast.error("Couldn't save your review", { description: e?.message ?? "Please try again." });
    },
  });

  const initials = (name?: string | null) =>
    (name ?? "?")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <section className="space-y-4" id="reviews">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" /> Reviews
        </h2>
        {user && !showForm && (
          <Button size="sm" variant={myReview ? "outline" : "default"} onClick={() => setShowForm(true)}>
            <PenLine className="w-4 h-4 mr-1.5" />
            {myReview ? "Edit your review" : "Write a review"}
          </Button>
        )}
      </div>

      {/* Aggregate summary */}
      <Card>
        <CardContent className="p-5">
          {summary.count === 0 ? (
            <div className="text-center py-2">
              <StarRating value={0} readOnly size={22} className="justify-center mb-2" />
              <p className="text-sm text-muted-foreground">
                No reviews yet — be the first to review <span className="font-medium">{merchantName}</span>.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="text-center shrink-0">
                <div className="text-3xl font-bold leading-none">{summary.avg.toFixed(1)}</div>
                <StarRating value={Math.round(summary.avg)} readOnly size={16} className="justify-center my-1.5" />
                <div className="text-xs text-muted-foreground">
                  {summary.count} review{summary.count > 1 ? "s" : ""}
                </div>
              </div>
              <div className="flex-1 space-y-1">
                {summary.dist.map(({ star, n }) => (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-muted-foreground">{star}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-amber-400"
                        style={{ width: `${summary.count ? (n / summary.count) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-muted-foreground tabular-nums">{n}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission form / sign-in prompt */}
      {!user ? (
        <Card className="border-dashed">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Sign in to share your honest experience — every review stays public.
            </p>
            <Button asChild size="sm">
              <Link to="/auth">Sign in to write a review</Link>
            </Button>
          </CardContent>
        </Card>
      ) : showForm ? (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Your rating</label>
              <StarRating value={rating} onChange={setRating} size={28} />
            </div>
            <Input
              placeholder="Title (optional) — e.g. Great coffee, slow service"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder={`Tell others about your visit to ${merchantName}…`}
              value={body}
              rows={4}
              maxLength={2000}
              onChange={(e) => setBody(e.target.value)}
            />
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} disabled={submit.isPending}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => submit.mutate()} disabled={submit.isPending || rating < 1}>
                {submit.isPending ? "Saving…" : myReview ? "Update review" : "Post review"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Review list — publish-all: every published review shown, including low ratings */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="text-xs">{initials(r.reviewer_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{r.reviewer_name || "Anonymous"}</span>
                      {r.is_verified && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                          <BadgeCheck className="w-3.5 h-3.5" /> Verified visit
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <StarRating value={r.rating} readOnly size={14} className="my-1" />
                    {r.title && <p className="font-medium text-sm">{r.title}</p>}
                    {r.body && <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-line">{r.body}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
