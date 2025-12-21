export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      challenge_participants: {
        Row: {
          challenge_id: string | null
          completed_at: string | null
          current_progress: number | null
          id: string
          is_completed: boolean | null
          joined_at: string | null
          reward_claimed: boolean | null
          user_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          completed_at?: string | null
          current_progress?: number | null
          id?: string
          is_completed?: boolean | null
          joined_at?: string | null
          reward_claimed?: boolean | null
          user_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          completed_at?: string | null
          current_progress?: number | null
          id?: string
          is_completed?: boolean | null
          joined_at?: string | null
          reward_claimed?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "group_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          content: string
          created_at: string | null
          deal_id: string | null
          id: string
          image_url: string | null
          likes_count: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          deal_id?: string | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          deal_id?: string | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          coupon_code: string
          coupon_type: string
          created_at: string | null
          deal_id: string
          discount_amount: number
          expires_at: string
          id: string
          merchant_id: string
          min_order_value: number | null
          payment_id: string | null
          purchase_amount: number | null
          purchased_at: string | null
          qr_code: string | null
          redeemed_at: string | null
          redeemed_by: string | null
          status: string | null
          usage_terms: string | null
          user_id: string
        }
        Insert: {
          coupon_code: string
          coupon_type: string
          created_at?: string | null
          deal_id: string
          discount_amount: number
          expires_at: string
          id?: string
          merchant_id: string
          min_order_value?: number | null
          payment_id?: string | null
          purchase_amount?: number | null
          purchased_at?: string | null
          qr_code?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: string | null
          usage_terms?: string | null
          user_id: string
        }
        Update: {
          coupon_code?: string
          coupon_type?: string
          created_at?: string | null
          deal_id?: string
          discount_amount?: number
          expires_at?: string
          id?: string
          merchant_id?: string
          min_order_value?: number | null
          payment_id?: string | null
          purchase_amount?: number | null
          purchased_at?: string | null
          qr_code?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: string | null
          usage_terms?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupons_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_redemptions: {
        Row: {
          created_at: string | null
          deal_id: string | null
          id: string
          is_used: boolean | null
          jaicoin_earned: number | null
          merchant_id: string | null
          redeemed_at: string | null
          redemption_code: string | null
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deal_id?: string | null
          id?: string
          is_used?: boolean | null
          jaicoin_earned?: number | null
          merchant_id?: string | null
          redeemed_at?: string | null
          redemption_code?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deal_id?: string | null
          id?: string
          is_used?: boolean | null
          jaicoin_earned?: number | null
          merchant_id?: string | null
          redeemed_at?: string | null
          redemption_code?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_redemptions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_redemptions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          category: string | null
          coupon_type: string | null
          created_at: string | null
          created_by: string | null
          current_redemptions: number | null
          deal_type: string | null
          description: string | null
          discount_percentage: number | null
          discounted_price: number | null
          end_date: string | null
          id: string
          image_url: string | null
          inventory_count: number | null
          is_active: boolean | null
          is_featured: boolean | null
          is_product_sale: boolean | null
          jaicoin_reward: number | null
          location: string | null
          max_redemptions: number | null
          merchant_id: string | null
          min_order_value: number | null
          original_price: number | null
          product_details: Json | null
          product_id: string | null
          purchase_price: number | null
          rejection_reason: string | null
          start_date: string | null
          subcategory: string | null
          tags: string[] | null
          terms_conditions: string | null
          title: string
          updated_at: string | null
          usage_terms: string | null
          validity_days: number | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          coupon_type?: string | null
          created_at?: string | null
          created_by?: string | null
          current_redemptions?: number | null
          deal_type?: string | null
          description?: string | null
          discount_percentage?: number | null
          discounted_price?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          inventory_count?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_product_sale?: boolean | null
          jaicoin_reward?: number | null
          location?: string | null
          max_redemptions?: number | null
          merchant_id?: string | null
          min_order_value?: number | null
          original_price?: number | null
          product_details?: Json | null
          product_id?: string | null
          purchase_price?: number | null
          rejection_reason?: string | null
          start_date?: string | null
          subcategory?: string | null
          tags?: string[] | null
          terms_conditions?: string | null
          title: string
          updated_at?: string | null
          usage_terms?: string | null
          validity_days?: number | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          coupon_type?: string | null
          created_at?: string | null
          created_by?: string | null
          current_redemptions?: number | null
          deal_type?: string | null
          description?: string | null
          discount_percentage?: number | null
          discounted_price?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          inventory_count?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_product_sale?: boolean | null
          jaicoin_reward?: number | null
          location?: string | null
          max_redemptions?: number | null
          merchant_id?: string | null
          min_order_value?: number | null
          original_price?: number | null
          product_details?: Json | null
          product_id?: string | null
          purchase_price?: number | null
          rejection_reason?: string | null
          start_date?: string | null
          subcategory?: string | null
          tags?: string[] | null
          terms_conditions?: string | null
          title?: string
          updated_at?: string | null
          usage_terms?: string | null
          validity_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      event_interests: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_interests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          attended_at: string | null
          cancelled_at: string | null
          email: string
          event_id: string
          id: string
          name: string
          phone: string | null
          registered_at: string | null
          registration_code: string
          status: string | null
          ticket_count: number | null
          total_amount: number | null
          user_id: string | null
        }
        Insert: {
          attended_at?: string | null
          cancelled_at?: string | null
          email: string
          event_id: string
          id?: string
          name: string
          phone?: string | null
          registered_at?: string | null
          registration_code: string
          status?: string | null
          ticket_count?: number | null
          total_amount?: number | null
          user_id?: string | null
        }
        Update: {
          attended_at?: string | null
          cancelled_at?: string | null
          email?: string
          event_id?: string
          id?: string
          name?: string
          phone?: string | null
          registered_at?: string | null
          registration_code?: string
          status?: string | null
          ticket_count?: number | null
          total_amount?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string
          city: string | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          gallery_images: string[] | null
          id: string
          interested_count: number | null
          is_all_day: boolean | null
          is_featured: boolean | null
          is_free: boolean | null
          is_online: boolean | null
          latitude: number | null
          locality: string | null
          longitude: number | null
          max_tickets: number | null
          meta_description: string | null
          meta_title: string | null
          online_url: string | null
          organizer_email: string | null
          organizer_id: string | null
          organizer_name: string | null
          organizer_phone: string | null
          published_at: string | null
          registration_deadline: string | null
          registration_url: string | null
          short_description: string | null
          slug: string
          start_date: string
          status: string | null
          tags: string[] | null
          ticket_price: number | null
          tickets_sold: number | null
          timezone: string | null
          title: string
          updated_at: string | null
          venue_address: string | null
          venue_name: string | null
          view_count: number | null
        }
        Insert: {
          category?: string
          city?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          gallery_images?: string[] | null
          id?: string
          interested_count?: number | null
          is_all_day?: boolean | null
          is_featured?: boolean | null
          is_free?: boolean | null
          is_online?: boolean | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          max_tickets?: number | null
          meta_description?: string | null
          meta_title?: string | null
          online_url?: string | null
          organizer_email?: string | null
          organizer_id?: string | null
          organizer_name?: string | null
          organizer_phone?: string | null
          published_at?: string | null
          registration_deadline?: string | null
          registration_url?: string | null
          short_description?: string | null
          slug: string
          start_date: string
          status?: string | null
          tags?: string[] | null
          ticket_price?: number | null
          tickets_sold?: number | null
          timezone?: string | null
          title: string
          updated_at?: string | null
          venue_address?: string | null
          venue_name?: string | null
          view_count?: number | null
        }
        Update: {
          category?: string
          city?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          gallery_images?: string[] | null
          id?: string
          interested_count?: number | null
          is_all_day?: boolean | null
          is_featured?: boolean | null
          is_free?: boolean | null
          is_online?: boolean | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          max_tickets?: number | null
          meta_description?: string | null
          meta_title?: string | null
          online_url?: string | null
          organizer_email?: string | null
          organizer_id?: string | null
          organizer_name?: string | null
          organizer_phone?: string | null
          published_at?: string | null
          registration_deadline?: string | null
          registration_url?: string | null
          short_description?: string | null
          slug?: string
          start_date?: string
          status?: string | null
          tags?: string[] | null
          ticket_price?: number | null
          tickets_sold?: number | null
          timezone?: string | null
          title?: string
          updated_at?: string | null
          venue_address?: string | null
          venue_name?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      group_challenges: {
        Row: {
          challenge_type: string
          created_at: string | null
          created_by: string | null
          current_participants: number | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          max_participants: number | null
          reward_amount: number
          reward_type: string | null
          start_date: string | null
          target_value: number
          title: string
          updated_at: string | null
        }
        Insert: {
          challenge_type: string
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          reward_amount: number
          reward_type?: string | null
          start_date?: string | null
          target_value: number
          title: string
          updated_at?: string | null
        }
        Update: {
          challenge_type?: string
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          reward_amount?: number
          reward_type?: string | null
          start_date?: string | null
          target_value?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      jaicoin_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          source: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          source: string
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          source?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      localities: {
        Row: {
          adjacent_localities: string[] | null
          assembly_constituency: string | null
          connectivity: Json | null
          created_at: string | null
          geo_lat: number | null
          geo_lng: number | null
          id: number
          major_landmarks: Json | null
          micro_localities: string[] | null
          municipality: string | null
          name: string
          nearby_localities: string[] | null
          pin_codes: string[] | null
          police_station: string | null
          population_estimate: number | null
          slug: string
          tags: string[] | null
          updated_at: string | null
          ward_name: string | null
          ward_number: string | null
          zone: string | null
        }
        Insert: {
          adjacent_localities?: string[] | null
          assembly_constituency?: string | null
          connectivity?: Json | null
          created_at?: string | null
          geo_lat?: number | null
          geo_lng?: number | null
          id?: number
          major_landmarks?: Json | null
          micro_localities?: string[] | null
          municipality?: string | null
          name: string
          nearby_localities?: string[] | null
          pin_codes?: string[] | null
          police_station?: string | null
          population_estimate?: number | null
          slug: string
          tags?: string[] | null
          updated_at?: string | null
          ward_name?: string | null
          ward_number?: string | null
          zone?: string | null
        }
        Update: {
          adjacent_localities?: string[] | null
          assembly_constituency?: string | null
          connectivity?: Json | null
          created_at?: string | null
          geo_lat?: number | null
          geo_lng?: number | null
          id?: number
          major_landmarks?: Json | null
          micro_localities?: string[] | null
          municipality?: string | null
          name?: string
          nearby_localities?: string[] | null
          pin_codes?: string[] | null
          police_station?: string | null
          population_estimate?: number | null
          slug?: string
          tags?: string[] | null
          updated_at?: string | null
          ward_name?: string | null
          ward_number?: string | null
          zone?: string | null
        }
        Relationships: []
      }
      merchant_analytics: {
        Row: {
          average_rating: number | null
          created_at: string | null
          date: string
          deals_created: number | null
          deals_redeemed: number | null
          deals_viewed: number | null
          id: string
          merchant_id: string | null
          new_customers: number | null
          reviews_received: number | null
          total_revenue: number | null
        }
        Insert: {
          average_rating?: number | null
          created_at?: string | null
          date: string
          deals_created?: number | null
          deals_redeemed?: number | null
          deals_viewed?: number | null
          id?: string
          merchant_id?: string | null
          new_customers?: number | null
          reviews_received?: number | null
          total_revenue?: number | null
        }
        Update: {
          average_rating?: number | null
          created_at?: string | null
          date?: string
          deals_created?: number | null
          deals_redeemed?: number | null
          deals_viewed?: number | null
          id?: string
          merchant_id?: string | null
          new_customers?: number | null
          reviews_received?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_analytics_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_applications: {
        Row: {
          address: string
          admin_notes: string | null
          business_type: string
          contact_email: string
          contact_phone: string
          created_at: string | null
          deals_data: Json | null
          description: string | null
          id: string
          location: string
          merchant_name: string
          photos: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          social_handles: Json | null
          status: string | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          admin_notes?: string | null
          business_type: string
          contact_email: string
          contact_phone: string
          created_at?: string | null
          deals_data?: Json | null
          description?: string | null
          id?: string
          location: string
          merchant_name: string
          photos?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_handles?: Json | null
          status?: string | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          admin_notes?: string | null
          business_type?: string
          contact_email?: string
          contact_phone?: string
          created_at?: string | null
          deals_data?: Json | null
          description?: string | null
          id?: string
          location?: string
          merchant_name?: string
          photos?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_handles?: Json | null
          status?: string | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      merchant_referral_rewards: {
        Row: {
          amount: number
          awarded_at: string | null
          coupon_id: string | null
          id: string
          merchant_id: string
          milestone_count: number | null
          referrer_id: string
          reward_type: string
        }
        Insert: {
          amount: number
          awarded_at?: string | null
          coupon_id?: string | null
          id?: string
          merchant_id: string
          milestone_count?: number | null
          referrer_id: string
          reward_type: string
        }
        Update: {
          amount?: number
          awarded_at?: string | null
          coupon_id?: string | null
          id?: string
          merchant_id?: string
          milestone_count?: number | null
          referrer_id?: string
          reward_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_referral_rewards_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_referral_rewards_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          address: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          average_rating: number | null
          business_name: string
          business_type: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          listing_fee_paid: boolean | null
          listing_payment_id: string | null
          listing_tier: string | null
          logo_url: string | null
          phone: string | null
          photos: string[] | null
          referred_by: string | null
          social_handles: Json | null
          total_deals: number | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          average_rating?: number | null
          business_name: string
          business_type?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          listing_fee_paid?: boolean | null
          listing_payment_id?: string | null
          listing_tier?: string | null
          logo_url?: string | null
          phone?: string | null
          photos?: string[] | null
          referred_by?: string | null
          social_handles?: Json | null
          total_deals?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          average_rating?: number | null
          business_name?: string
          business_type?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          listing_fee_paid?: boolean | null
          listing_payment_id?: string | null
          listing_tier?: string | null
          logo_url?: string | null
          phone?: string | null
          photos?: string[] | null
          referred_by?: string | null
          social_handles?: Json | null
          total_deals?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          ai_prompt: string | null
          author_id: string | null
          canonical_url: string | null
          category: Database["public"]["Enums"]["news_category"]
          content: string
          cover_image: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          is_ai_generated: boolean | null
          is_featured: boolean | null
          like_count: number | null
          locality: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          og_image: string | null
          published_at: string | null
          share_count: number | null
          slug: string
          status: Database["public"]["Enums"]["article_status"]
          structured_data: Json | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          ai_prompt?: string | null
          author_id?: string | null
          canonical_url?: string | null
          category?: Database["public"]["Enums"]["news_category"]
          content: string
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_ai_generated?: boolean | null
          is_featured?: boolean | null
          like_count?: number | null
          locality?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          share_count?: number | null
          slug: string
          status?: Database["public"]["Enums"]["article_status"]
          structured_data?: Json | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          ai_prompt?: string | null
          author_id?: string | null
          canonical_url?: string | null
          category?: Database["public"]["Enums"]["news_category"]
          content?: string
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_ai_generated?: boolean | null
          is_featured?: boolean | null
          like_count?: number | null
          locality?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          share_count?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["article_status"]
          structured_data?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      news_likes: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          deal_id: string | null
          discount_applied: number | null
          id: string
          item_type: string
          jaicoin_used: number | null
          order_id: string
          product_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          deal_id?: string | null
          discount_applied?: number | null
          id?: string
          item_type: string
          jaicoin_used?: number | null
          order_id: string
          product_id?: string | null
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          deal_id?: string | null
          discount_applied?: number | null
          id?: string
          item_type?: string
          jaicoin_used?: number | null
          order_id?: string
          product_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          deal_id: string | null
          delivery_address: string | null
          id: string
          jaicoin_used: number | null
          merchant_id: string | null
          order_code: string | null
          order_notes: string | null
          payment_method: string | null
          quantity: number
          status: string | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          deal_id?: string | null
          delivery_address?: string | null
          id?: string
          jaicoin_used?: number | null
          merchant_id?: string | null
          order_code?: string | null
          order_notes?: string | null
          payment_method?: string | null
          quantity?: number
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          deal_id?: string | null
          delivery_address?: string | null
          id?: string
          jaicoin_used?: number | null
          merchant_id?: string | null
          order_code?: string | null
          order_notes?: string | null
          payment_method?: string | null
          quantity?: number
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          created_at: string | null
          helpful_votes: number | null
          id: string
          images: string[] | null
          jaicoin_rewarded: boolean | null
          merchant_id: string
          product_id: string
          rating: number
          review_text: string | null
          review_title: string | null
          user_id: string | null
          verified_purchase: boolean | null
        }
        Insert: {
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          images?: string[] | null
          jaicoin_rewarded?: boolean | null
          merchant_id: string
          product_id: string
          rating: number
          review_text?: string | null
          review_title?: string | null
          user_id?: string | null
          verified_purchase?: boolean | null
        }
        Update: {
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          images?: string[] | null
          jaicoin_rewarded?: boolean | null
          merchant_id?: string
          product_id?: string
          rating?: number
          review_text?: string | null
          review_title?: string | null
          user_id?: string | null
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          average_rating: number | null
          brand: string | null
          category: string
          created_at: string | null
          description: string | null
          dimensions: Json | null
          discount_percentage: number | null
          discounted_price: number | null
          id: string
          images: string[] | null
          inventory_count: number | null
          is_active: boolean | null
          is_featured: boolean | null
          jaicoin_reward: number | null
          max_order_quantity: number | null
          merchant_id: string
          min_order_quantity: number | null
          model: string | null
          name: string
          original_price: number
          return_policy: string | null
          shipping_required: boolean | null
          shipping_weight: number | null
          sku: string | null
          specifications: Json | null
          subcategory: string | null
          tags: string[] | null
          total_reviews: number | null
          total_sales: number | null
          updated_at: string | null
          warranty_period: string | null
          weight: number | null
        }
        Insert: {
          average_rating?: number | null
          brand?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          discount_percentage?: number | null
          discounted_price?: number | null
          id?: string
          images?: string[] | null
          inventory_count?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          jaicoin_reward?: number | null
          max_order_quantity?: number | null
          merchant_id: string
          min_order_quantity?: number | null
          model?: string | null
          name: string
          original_price: number
          return_policy?: string | null
          shipping_required?: boolean | null
          shipping_weight?: number | null
          sku?: string | null
          specifications?: Json | null
          subcategory?: string | null
          tags?: string[] | null
          total_reviews?: number | null
          total_sales?: number | null
          updated_at?: string | null
          warranty_period?: string | null
          weight?: number | null
        }
        Update: {
          average_rating?: number | null
          brand?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          discount_percentage?: number | null
          discounted_price?: number | null
          id?: string
          images?: string[] | null
          inventory_count?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          jaicoin_reward?: number | null
          max_order_quantity?: number | null
          merchant_id?: string
          min_order_quantity?: number | null
          model?: string | null
          name?: string
          original_price?: number
          return_policy?: string | null
          shipping_required?: boolean | null
          shipping_weight?: number | null
          sku?: string | null
          specifications?: Json | null
          subcategory?: string | null
          tags?: string[] | null
          total_reviews?: number | null
          total_sales?: number | null
          updated_at?: string | null
          warranty_period?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_pro: boolean | null
          locality: string | null
          phone: string | null
          pro_expires_at: string | null
          pro_tier: string | null
          rank: string | null
          referral_code: string | null
          referred_by: string | null
          subscription_status: string | null
          total_referrals: number | null
          updated_at: string | null
          user_id_code: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_pro?: boolean | null
          locality?: string | null
          phone?: string | null
          pro_expires_at?: string | null
          pro_tier?: string | null
          rank?: string | null
          referral_code?: string | null
          referred_by?: string | null
          subscription_status?: string | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id_code?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_pro?: boolean | null
          locality?: string | null
          phone?: string | null
          pro_expires_at?: string | null
          pro_tier?: string | null
          rank?: string | null
          referral_code?: string | null
          referred_by?: string | null
          subscription_status?: string | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id_code?: string | null
        }
        Relationships: []
      }
      referral_earnings: {
        Row: {
          created_at: string | null
          earnings: number
          id: string
          level: number
          referred_id: string | null
          referrer_id: string | null
          source: string
        }
        Insert: {
          created_at?: string | null
          earnings: number
          id?: string
          level: number
          referred_id?: string | null
          referrer_id?: string | null
          source: string
        }
        Update: {
          created_at?: string | null
          earnings?: number
          id?: string
          level?: number
          referred_id?: string | null
          referrer_id?: string | null
          source?: string
        }
        Relationships: []
      }
      referral_tracking: {
        Row: {
          clicked_at: string
          coupon_purchased: boolean
          coupon_redeemed: boolean
          id: string
          purchased_at: string | null
          redeemed_at: string | null
          share_token: string | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string
          coupon_purchased?: boolean
          coupon_redeemed?: boolean
          id?: string
          purchased_at?: string | null
          redeemed_at?: string | null
          share_token?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string
          coupon_purchased?: boolean
          coupon_redeemed?: boolean
          id?: string
          purchased_at?: string | null
          redeemed_at?: string | null
          share_token?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_tracking_share_token_fkey"
            columns: ["share_token"]
            isOneToOne: false
            referencedRelation: "shared_deal_links"
            referencedColumns: ["token"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string | null
          deal_id: string | null
          id: string
          image_url: string | null
          jaicoin_rewarded: boolean | null
          merchant_name: string
          rating: number
          review_text: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deal_id?: string | null
          id?: string
          image_url?: string | null
          jaicoin_rewarded?: boolean | null
          merchant_name: string
          rating: number
          review_text?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deal_id?: string | null
          id?: string
          image_url?: string | null
          jaicoin_rewarded?: boolean | null
          merchant_name?: string
          rating?: number
          review_text?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shared_deal_links: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          link_clicks: number
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          link_clicks?: number
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          link_clicks?: number
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_deal_links_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      spin_attempts: {
        Row: {
          created_at: string | null
          id: string
          reward_amount: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          reward_amount: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          reward_amount?: number
          user_id?: string | null
        }
        Relationships: []
      }
      test: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          created_at: string | null
          date: string
          deals_redeemed: number | null
          deals_saved: number | null
          deals_viewed: number | null
          id: string
          jaicoin_earned: number | null
          jaicoin_spent: number | null
          posts_created: number | null
          referrals_made: number | null
          reviews_written: number | null
          spin_attempts: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          deals_redeemed?: number | null
          deals_saved?: number | null
          deals_viewed?: number | null
          id?: string
          jaicoin_earned?: number | null
          jaicoin_spent?: number | null
          posts_created?: number | null
          referrals_made?: number | null
          reviews_written?: number | null
          spin_attempts?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          deals_redeemed?: number | null
          deals_saved?: number | null
          deals_viewed?: number | null
          id?: string
          jaicoin_earned?: number | null
          jaicoin_spent?: number | null
          posts_created?: number | null
          referrals_made?: number | null
          reviews_written?: number | null
          spin_attempts?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_description: string | null
          badge_name: string
          badge_type: string
          earned_at: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          badge_description?: string | null
          badge_name: string
          badge_type: string
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          badge_description?: string | null
          badge_name?: string
          badge_type?: string
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_badge: {
        Args: {
          badge_description: string
          badge_name: string
          badge_type: string
          user_uuid: string
        }
        Returns: undefined
      }
      award_referral_reward: {
        Args: {
          coupon_uuid?: string
          merchant_uuid: string
          milestone_count_param?: number
          referrer_uuid: string
          reward_amount: number
          reward_type_param: string
        }
        Returns: undefined
      }
      generate_coupon_code: { Args: never; Returns: string }
      generate_event_slug: { Args: { title: string }; Returns: string }
      generate_news_slug: { Args: { title: string }; Returns: string }
      generate_redemption_code: { Args: never; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      generate_registration_code: { Args: never; Returns: string }
      get_order_details: {
        Args: { order_uuid: string }
        Returns: {
          customer_name: string
          deal_discounted_price: number
          deal_is_product_sale: boolean
          deal_jaicoin_reward: number
          deal_title: string
          id: string
          jaicoin_used: number
          merchant_address: string
          merchant_business_name: string
          order_code: string
          payment_method: string
          quantity: number
          status: string
          total_amount: number
        }[]
      }
      get_user_balance: { Args: { user_uuid: string }; Returns: number }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: {
          assigned_at: string
          metadata: Json
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_article_views: {
        Args: { article_id: string }
        Returns: undefined
      }
      increment_event_views: { Args: { event_id: string }; Returns: undefined }
      is_pro_member: { Args: { user_uuid: string }; Returns: boolean }
      upgrade_to_pro_user: { Args: { _user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role:
        | "user"
        | "pro_user"
        | "merchant"
        | "listing_agent"
        | "listing_supervisor"
        | "admin"
      article_status: "draft" | "published" | "archived"
      news_category:
        | "city"
        | "events"
        | "food"
        | "culture"
        | "business"
        | "sports"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "user",
        "pro_user",
        "merchant",
        "listing_agent",
        "listing_supervisor",
        "admin",
      ],
      article_status: ["draft", "published", "archived"],
      news_category: [
        "city",
        "events",
        "food",
        "culture",
        "business",
        "sports",
      ],
    },
  },
} as const
