export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          category: string | null
          created_at: string | null
          current_redemptions: number | null
          description: string | null
          discount_percentage: number | null
          discounted_price: number | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          jaicoin_reward: number | null
          location: string | null
          max_redemptions: number | null
          merchant_id: string | null
          original_price: number | null
          start_date: string | null
          subcategory: string | null
          tags: string[] | null
          terms_conditions: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          current_redemptions?: number | null
          description?: string | null
          discount_percentage?: number | null
          discounted_price?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          jaicoin_reward?: number | null
          location?: string | null
          max_redemptions?: number | null
          merchant_id?: string | null
          original_price?: number | null
          start_date?: string | null
          subcategory?: string | null
          tags?: string[] | null
          terms_conditions?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          current_redemptions?: number | null
          description?: string | null
          discount_percentage?: number | null
          discounted_price?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          jaicoin_reward?: number | null
          location?: string | null
          max_redemptions?: number | null
          merchant_id?: string | null
          original_price?: number | null
          start_date?: string | null
          subcategory?: string | null
          tags?: string[] | null
          terms_conditions?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
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
      merchants: {
        Row: {
          address: string | null
          average_rating: number | null
          business_name: string
          business_type: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          phone: string | null
          total_deals: number | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          average_rating?: number | null
          business_name: string
          business_type?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          phone?: string | null
          total_deals?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          average_rating?: number | null
          business_name?: string
          business_type?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          phone?: string | null
          total_deals?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
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
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_pro: boolean | null
          phone: string | null
          pro_expires_at: string | null
          pro_tier: string | null
          rank: string | null
          referral_code: string | null
          referred_by: string | null
          subscription_status: string | null
          total_referrals: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_pro?: boolean | null
          phone?: string | null
          pro_expires_at?: string | null
          pro_tier?: string | null
          rank?: string | null
          referral_code?: string | null
          referred_by?: string | null
          subscription_status?: string | null
          total_referrals?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_pro?: boolean | null
          phone?: string | null
          pro_expires_at?: string | null
          pro_tier?: string | null
          rank?: string | null
          referral_code?: string | null
          referred_by?: string | null
          subscription_status?: string | null
          total_referrals?: number | null
          updated_at?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_badge: {
        Args: {
          user_uuid: string
          badge_type: string
          badge_name: string
          badge_description: string
        }
        Returns: undefined
      }
      generate_redemption_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_balance: {
        Args: { user_uuid: string }
        Returns: number
      }
      is_pro_member: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
