import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Deal Card Skeleton
export const DealCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("rounded-xl border border-border/50 bg-card p-3 space-y-3", className)}>
    <Skeleton className="w-full h-32 rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

// Event Card Skeleton
export const EventCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("rounded-xl border border-border/50 bg-card overflow-hidden", className)}>
    <Skeleton className="w-full h-40" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-4/5" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  </div>
);

// News Card Skeleton
export const NewsCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex gap-3 p-3 rounded-lg border border-border/50 bg-card", className)}>
    <Skeleton className="w-24 h-20 rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  </div>
);

// Profile Card Skeleton
export const ProfileCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("rounded-xl border border-border/50 bg-card p-4", className)}>
    <div className="flex items-center gap-4">
      <Skeleton className="w-16 h-16 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  </div>
);

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("rounded-xl border border-border/50 bg-card p-4 text-center", className)}>
    <Skeleton className="h-8 w-16 mx-auto mb-2" />
    <Skeleton className="h-3 w-20 mx-auto" />
  </div>
);

// List Item Skeleton
export const ListItemSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card", className)}>
    <Skeleton className="w-10 h-10 rounded-lg" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="w-6 h-6 rounded" />
  </div>
);

// Category Grid Skeleton
export const CategoryGridSkeleton: React.FC<{ count?: number; className?: string }> = ({ 
  count = 8, 
  className 
}) => (
  <div className={cn("grid grid-cols-4 gap-3", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex flex-col items-center gap-2">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <Skeleton className="h-3 w-12" />
      </div>
    ))}
  </div>
);

// Hero Banner Skeleton
export const HeroBannerSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("w-full", className)}>
    <Skeleton className="w-full h-48 md:h-64 rounded-xl" />
  </div>
);

// Wallet Balance Skeleton
export const WalletBalanceSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-6", className)}>
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 bg-primary/20" />
        <Skeleton className="h-8 w-32 bg-primary/20" />
      </div>
      <Skeleton className="w-12 h-12 rounded-full bg-primary/20" />
    </div>
    <div className="flex gap-4 mt-4">
      <Skeleton className="h-10 flex-1 rounded-lg bg-primary/20" />
      <Skeleton className="h-10 flex-1 rounded-lg bg-primary/20" />
    </div>
  </div>
);

// Transaction List Skeleton
export const TransactionListSkeleton: React.FC<{ count?: number; className?: string }> = ({ 
  count = 5, 
  className 
}) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
    ))}
  </div>
);

// Order Card Skeleton
export const OrderCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("rounded-xl border border-border/50 bg-card p-4 space-y-3", className)}>
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <div className="flex gap-3">
      <Skeleton className="w-16 h-16 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
    <div className="flex justify-between items-center pt-2 border-t border-border/50">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  </div>
);

// Coupon Card Skeleton
export const CouponCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("rounded-xl border border-border/50 bg-card overflow-hidden", className)}>
    <div className="flex">
      <div className="w-24 bg-gradient-to-br from-primary/20 to-primary/5 p-3 flex flex-col items-center justify-center">
        <Skeleton className="h-6 w-12 bg-primary/20" />
        <Skeleton className="h-3 w-8 mt-1 bg-primary/20" />
      </div>
      <div className="flex-1 p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-16 rounded" />
        </div>
      </div>
    </div>
  </div>
);

export default {
  DealCardSkeleton,
  EventCardSkeleton,
  NewsCardSkeleton,
  ProfileCardSkeleton,
  StatsCardSkeleton,
  ListItemSkeleton,
  CategoryGridSkeleton,
  HeroBannerSkeleton,
  WalletBalanceSkeleton,
  TransactionListSkeleton,
  OrderCardSkeleton,
  CouponCardSkeleton
};
