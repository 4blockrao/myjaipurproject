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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          page_url: string | null
          referrer: string | null
          user_phone: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          referrer?: string | null
          user_phone?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          referrer?: string | null
          user_phone?: string | null
        }
        Relationships: []
      }
      article_merchants: {
        Row: {
          article_id: string | null
          created_at: string | null
          id: string
          mention_context: string | null
          merchant_id: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          mention_context?: string | null
          merchant_id?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          mention_context?: string | null
          merchant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_merchants_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_merchants_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_merchants_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      article_relationships: {
        Row: {
          child_article_id: string | null
          created_at: string | null
          id: string
          parent_article_id: string | null
          relationship_type: string | null
        }
        Insert: {
          child_article_id?: string | null
          created_at?: string | null
          id?: string
          parent_article_id?: string | null
          relationship_type?: string | null
        }
        Update: {
          child_article_id?: string | null
          created_at?: string | null
          id?: string
          parent_article_id?: string | null
          relationship_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_relationships_child_article_id_fkey"
            columns: ["child_article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_relationships_parent_article_id_fkey"
            columns: ["parent_article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          article_type: string | null
          author: string | null
          author_id: string | null
          campaign_slug: string | null
          canonical_url: string | null
          category: string | null
          content: string | null
          content_hindi: string | null
          content_type: string | null
          excerpt: string | null
          excerpt_hindi: string | null
          expires_at: string | null
          focus_keyword: string | null
          id: string
          is_evergreen: boolean | null
          last_refresh_check: string | null
          match_slug: string | null
          meta_description: string | null
          meta_title: string | null
          noindex_after_expiry: boolean | null
          published_at: string | null
          refresh_priority: number | null
          slug: string
          status: string | null
          title: string
          title_hindi: string | null
          type: string | null
          updated_at: string | null
          view_count: number | null
          whatsapp_share_count: number | null
        }
        Insert: {
          article_type?: string | null
          author?: string | null
          author_id?: string | null
          campaign_slug?: string | null
          canonical_url?: string | null
          category?: string | null
          content?: string | null
          content_hindi?: string | null
          content_type?: string | null
          excerpt?: string | null
          excerpt_hindi?: string | null
          expires_at?: string | null
          focus_keyword?: string | null
          id?: string
          is_evergreen?: boolean | null
          last_refresh_check?: string | null
          match_slug?: string | null
          meta_description?: string | null
          meta_title?: string | null
          noindex_after_expiry?: boolean | null
          published_at?: string | null
          refresh_priority?: number | null
          slug: string
          status?: string | null
          title: string
          title_hindi?: string | null
          type?: string | null
          updated_at?: string | null
          view_count?: number | null
          whatsapp_share_count?: number | null
        }
        Update: {
          article_type?: string | null
          author?: string | null
          author_id?: string | null
          campaign_slug?: string | null
          canonical_url?: string | null
          category?: string | null
          content?: string | null
          content_hindi?: string | null
          content_type?: string | null
          excerpt?: string | null
          excerpt_hindi?: string | null
          expires_at?: string | null
          focus_keyword?: string | null
          id?: string
          is_evergreen?: boolean | null
          last_refresh_check?: string | null
          match_slug?: string | null
          meta_description?: string | null
          meta_title?: string | null
          noindex_after_expiry?: boolean | null
          published_at?: string | null
          refresh_priority?: number | null
          slug?: string
          status?: string | null
          title?: string
          title_hindi?: string | null
          type?: string | null
          updated_at?: string | null
          view_count?: number | null
          whatsapp_share_count?: number | null
        }
        Relationships: []
      }
      artists: {
        Row: {
          awards: string[] | null
          bio: string | null
          canonical_url: string | null
          cover_image: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          editorial_status: string | null
          follower_count: number | null
          genre: string[] | null
          h1_override: string | null
          id: string
          image_url: string | null
          index_status: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          published_at: string | null
          rating: number | null
          seo_blurb: string | null
          seo_content: string | null
          slug: string
          social_links: Json | null
          source_label: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["status_enum"] | null
          total_events: number | null
          updated_at: string | null
          updated_by: string | null
          website: string | null
        }
        Insert: {
          awards?: string[] | null
          bio?: string | null
          canonical_url?: string | null
          cover_image?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          editorial_status?: string | null
          follower_count?: number | null
          genre?: string[] | null
          h1_override?: string | null
          id?: string
          image_url?: string | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          published_at?: string | null
          rating?: number | null
          seo_blurb?: string | null
          seo_content?: string | null
          slug: string
          social_links?: Json | null
          source_label?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          total_events?: number | null
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          awards?: string[] | null
          bio?: string | null
          canonical_url?: string | null
          cover_image?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          editorial_status?: string | null
          follower_count?: number | null
          genre?: string[] | null
          h1_override?: string | null
          id?: string
          image_url?: string | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          published_at?: string | null
          rating?: number | null
          seo_blurb?: string | null
          seo_content?: string | null
          slug?: string
          social_links?: Json | null
          source_label?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          total_events?: number | null
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Relationships: []
      }
      authors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          expertise: string[] | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          expertise?: string[] | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          expertise?: string[] | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          hero_image: string | null
          id: string
          is_active: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          show_locality_links: boolean | null
          show_upcoming_events: boolean | null
          show_venue_info: boolean | null
          slug: string
          start_date: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          hero_image?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          show_locality_links?: boolean | null
          show_upcoming_events?: boolean | null
          show_venue_info?: boolean | null
          slug: string
          start_date?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          hero_image?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          show_locality_links?: boolean | null
          show_upcoming_events?: boolean | null
          show_venue_info?: boolean | null
          slug?: string
          start_date?: string | null
        }
        Relationships: []
      }
      car_brands: {
        Row: {
          display_order: number | null
          id: string
          is_popular: boolean | null
          logo_url: string | null
          name: string
          slug: string | null
        }
        Insert: {
          display_order?: number | null
          id?: string
          is_popular?: boolean | null
          logo_url?: string | null
          name: string
          slug?: string | null
        }
        Update: {
          display_order?: number | null
          id?: string
          is_popular?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      car_dealers: {
        Row: {
          city: string | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          locality: string | null
          name: string | null
          slug: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          locality?: string | null
          name?: string | null
          slug?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          locality?: string | null
          name?: string | null
          slug?: string | null
        }
        Relationships: []
      }
      car_models: {
        Row: {
          brand_id: string | null
          created_at: string | null
          id: string
          is_ev: boolean | null
          is_trending: boolean | null
          name: string
          on_road_price_jaipur_min: number | null
          slug: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          is_ev?: boolean | null
          is_trending?: boolean | null
          name: string
          on_road_price_jaipur_min?: number | null
          slug?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          is_ev?: boolean | null
          is_trending?: boolean | null
          name?: string
          on_road_price_jaipur_min?: number | null
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "car_brands"
            referencedColumns: ["id"]
          },
        ]
      }
      car_ownership_stories: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_featured: boolean | null
          model_id: string | null
          rating: number | null
          status: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          model_id?: string | null
          rating?: number | null
          status?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          model_id?: string | null
          rating?: number | null
          status?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_ownership_stories_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "car_models"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          canonical_url: string | null
          created_at: string | null
          description: string | null
          editorial_status: string | null
          h1_override: string | null
          id: string
          index_status: Database["public"]["Enums"]["index_status_enum"] | null
          is_active: boolean | null
          is_indexable: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          parent_slug: string | null
          pillar_group: string | null
          published_at: string | null
          seo_blurb: string | null
          seo_content: string | null
          slug: string
          status: Database["public"]["Enums"]["status_enum"] | null
          updated_at: string | null
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string | null
          description?: string | null
          editorial_status?: string | null
          h1_override?: string | null
          id?: string
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_active?: boolean | null
          is_indexable?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          parent_slug?: string | null
          pillar_group?: string | null
          published_at?: string | null
          seo_blurb?: string | null
          seo_content?: string | null
          slug: string
          status?: Database["public"]["Enums"]["status_enum"] | null
          updated_at?: string | null
        }
        Update: {
          canonical_url?: string | null
          created_at?: string | null
          description?: string | null
          editorial_status?: string | null
          h1_override?: string | null
          id?: string
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_active?: boolean | null
          is_indexable?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          parent_slug?: string | null
          pillar_group?: string | null
          published_at?: string | null
          seo_blurb?: string | null
          seo_content?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["status_enum"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      category_aliases: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          old_slug: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          old_slug?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          old_slug?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "category_aliases_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_aliases_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_aliases_view"
            referencedColumns: ["category_id"]
          },
        ]
      }
      click_events: {
        Row: {
          created_at: string | null
          element_text: string | null
          element_type: string | null
          id: string
          page_url: string | null
          session_id: string | null
          target_url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          element_text?: string | null
          element_type?: string | null
          id?: string
          page_url?: string | null
          session_id?: string | null
          target_url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          element_text?: string | null
          element_type?: string | null
          id?: string
          page_url?: string | null
          session_id?: string | null
          target_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          coupon_code: string | null
          created_at: string | null
          deal_id: string | null
          discount_amount: number | null
          expires_at: string | null
          id: string
          merchant_id: string | null
          redeemed_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string | null
          deal_id?: string | null
          discount_amount?: number | null
          expires_at?: string | null
          id?: string
          merchant_id?: string | null
          redeemed_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          coupon_code?: string | null
          created_at?: string | null
          deal_id?: string | null
          discount_amount?: number | null
          expires_at?: string | null
          id?: string
          merchant_id?: string | null
          redeemed_at?: string | null
          status?: string | null
          user_id?: string | null
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
            referencedRelation: "merchant_performance"
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
      daily_deals: {
        Row: {
          clicks_count: number | null
          created_at: string | null
          deal_price: number
          description: string | null
          discount_percentage: number | null
          end_time: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_flash_sale: boolean | null
          max_per_user: number | null
          merchant_id: string | null
          meta_description: string | null
          meta_title: string | null
          original_price: number
          qr_code_url: string | null
          redemption_code_pattern: string | null
          redemptions_count: number | null
          remaining_quantity: number | null
          slug: string
          sold_quantity: number | null
          start_time: string
          status: string | null
          title: string
          total_quantity: number
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          clicks_count?: number | null
          created_at?: string | null
          deal_price: number
          description?: string | null
          discount_percentage?: number | null
          end_time: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_flash_sale?: boolean | null
          max_per_user?: number | null
          merchant_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          original_price: number
          qr_code_url?: string | null
          redemption_code_pattern?: string | null
          redemptions_count?: number | null
          remaining_quantity?: number | null
          slug: string
          sold_quantity?: number | null
          start_time?: string
          status?: string | null
          title: string
          total_quantity: number
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          clicks_count?: number | null
          created_at?: string | null
          deal_price?: number
          description?: string | null
          discount_percentage?: number | null
          end_time?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_flash_sale?: boolean | null
          max_per_user?: number | null
          merchant_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          original_price?: number
          qr_code_url?: string | null
          redemption_code_pattern?: string | null
          redemptions_count?: number | null
          remaining_quantity?: number | null
          slug?: string
          sold_quantity?: number | null
          start_time?: string
          status?: string | null
          title?: string
          total_quantity?: number
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_deals_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_deals_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_purchases: {
        Row: {
          deal_id: string | null
          expires_at: string | null
          id: string
          purchase_price: number | null
          purchased_at: string | null
          qr_code_url: string | null
          redeemed_at: string | null
          redemption_code: string | null
          status: string | null
          user_id: string | null
          user_phone: string | null
        }
        Insert: {
          deal_id?: string | null
          expires_at?: string | null
          id?: string
          purchase_price?: number | null
          purchased_at?: string | null
          qr_code_url?: string | null
          redeemed_at?: string | null
          redemption_code?: string | null
          status?: string | null
          user_id?: string | null
          user_phone?: string | null
        }
        Update: {
          deal_id?: string | null
          expires_at?: string | null
          id?: string
          purchase_price?: number | null
          purchased_at?: string | null
          qr_code_url?: string | null
          redeemed_at?: string | null
          redemption_code?: string | null
          status?: string | null
          user_id?: string | null
          user_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_purchases_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "daily_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          address: string | null
          approval_status: string | null
          canonical_url: string | null
          category: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          current_redemptions: number | null
          deal_type: string | null
          description: string | null
          discount_percentage: number | null
          discounted_price: number | null
          editorial_status: string | null
          end_date: string | null
          gallery_images: string[] | null
          id: string
          image_url: string | null
          inventory_count: number | null
          is_active: boolean | null
          is_featured: boolean | null
          is_indexable: boolean | null
          is_product_sale: boolean | null
          is_verified: boolean | null
          jaicoin_reward: number | null
          locality_id: string | null
          location: string | null
          max_redemptions: number | null
          merchant_id: string | null
          meta_description: string | null
          meta_title: string | null
          original_price: number | null
          published_at: string | null
          redemption_instructions: string | null
          slug: string
          source_label: string | null
          source_url: string | null
          start_date: string | null
          status: string | null
          subcategory: string | null
          tags: string[] | null
          terms: string | null
          terms_conditions: string | null
          title: string
          updated_at: string
          updated_by: string | null
          usage_terms: string | null
          valid_until: string | null
        }
        Insert: {
          address?: string | null
          approval_status?: string | null
          canonical_url?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          current_redemptions?: number | null
          deal_type?: string | null
          description?: string | null
          discount_percentage?: number | null
          discounted_price?: number | null
          editorial_status?: string | null
          end_date?: string | null
          gallery_images?: string[] | null
          id?: string
          image_url?: string | null
          inventory_count?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_indexable?: boolean | null
          is_product_sale?: boolean | null
          is_verified?: boolean | null
          jaicoin_reward?: number | null
          locality_id?: string | null
          location?: string | null
          max_redemptions?: number | null
          merchant_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          original_price?: number | null
          published_at?: string | null
          redemption_instructions?: string | null
          slug: string
          source_label?: string | null
          source_url?: string | null
          start_date?: string | null
          status?: string | null
          subcategory?: string | null
          tags?: string[] | null
          terms?: string | null
          terms_conditions?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
          usage_terms?: string | null
          valid_until?: string | null
        }
        Update: {
          address?: string | null
          approval_status?: string | null
          canonical_url?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          current_redemptions?: number | null
          deal_type?: string | null
          description?: string | null
          discount_percentage?: number | null
          discounted_price?: number | null
          editorial_status?: string | null
          end_date?: string | null
          gallery_images?: string[] | null
          id?: string
          image_url?: string | null
          inventory_count?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_indexable?: boolean | null
          is_product_sale?: boolean | null
          is_verified?: boolean | null
          jaicoin_reward?: number | null
          locality_id?: string | null
          location?: string | null
          max_redemptions?: number | null
          merchant_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          original_price?: number | null
          published_at?: string | null
          redemption_instructions?: string | null
          slug?: string
          source_label?: string | null
          source_url?: string | null
          start_date?: string | null
          status?: string | null
          subcategory?: string | null
          tags?: string[] | null
          terms?: string | null
          terms_conditions?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
          usage_terms?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_id"]
          },
          {
            foreignKeyName: "deals_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      deals_merchants: {
        Row: {
          created_at: string | null
          deal_id: string | null
          id: string
          merchant_id: string | null
        }
        Insert: {
          created_at?: string | null
          deal_id?: string | null
          id?: string
          merchant_id?: string | null
        }
        Update: {
          created_at?: string | null
          deal_id?: string | null
          id?: string
          merchant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_merchants_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_merchants_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_merchants_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      ev_charging_stations: {
        Row: {
          city: string | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          latitude: number | null
          locality: string | null
          longitude: number | null
          name: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          name?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          name?: string | null
        }
        Relationships: []
      }
      event_artists: {
        Row: {
          artist_id: string
          created_at: string | null
          event_id: string
          id: string | null
          role: string | null
        }
        Insert: {
          artist_id: string
          created_at?: string | null
          event_id: string
          id?: string | null
          role?: string | null
        }
        Update: {
          artist_id?: string
          created_at?: string | null
          event_id?: string
          id?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "event_artist_match_candidates"
            referencedColumns: ["artist_id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_artist_match_candidates"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_slug_aliases_view"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_artist_coverage_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_graph_health"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_integrity_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_quality_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_venue_tba_audit"
            referencedColumns: ["id"]
          },
        ]
      }
      event_categories: {
        Row: {
          category_id: string
          event_id: string
        }
        Insert: {
          category_id: string
          event_id: string
        }
        Update: {
          category_id?: string
          event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_aliases_view"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "event_categories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_artist_match_candidates"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_categories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_slug_aliases_view"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_categories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_categories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_artist_coverage_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_categories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_graph_health"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_categories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_integrity_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_categories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_quality_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_categories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_venue_tba_audit"
            referencedColumns: ["id"]
          },
        ]
      }
      event_content_blocks: {
        Row: {
          block_type: string | null
          content: Json | null
          created_at: string | null
          event_id: string | null
          id: string
          order_index: number | null
          title: string | null
        }
        Insert: {
          block_type?: string | null
          content?: Json | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          order_index?: number | null
          title?: string | null
        }
        Update: {
          block_type?: string | null
          content?: Json | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          order_index?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_content_blocks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_artist_match_candidates"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_content_blocks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_slug_aliases_view"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_content_blocks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_content_blocks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_artist_coverage_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_content_blocks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_graph_health"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_content_blocks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_integrity_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_content_blocks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_quality_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_content_blocks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_venue_tba_audit"
            referencedColumns: ["id"]
          },
        ]
      }
      event_faqs: {
        Row: {
          answer: string | null
          created_at: string | null
          event_id: string | null
          id: string
          order_index: number | null
          question: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          order_index?: number | null
          question?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          order_index?: number | null
          question?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_faqs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_artist_match_candidates"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_faqs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_slug_aliases_view"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_faqs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_faqs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_artist_coverage_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_faqs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_graph_health"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_faqs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_integrity_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_faqs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_quality_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_faqs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_venue_tba_audit"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          event_id: string | null
          helpful_count: number | null
          id: string
          rating: number | null
          verified: boolean | null
          verified_booking: boolean | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          event_id?: string | null
          helpful_count?: number | null
          id?: string
          rating?: number | null
          verified?: boolean | null
          verified_booking?: boolean | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          event_id?: string | null
          helpful_count?: number | null
          id?: string
          rating?: number | null
          verified?: boolean | null
          verified_booking?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "event_reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_artist_match_candidates"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_slug_aliases_view"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_artist_coverage_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_graph_health"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_integrity_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_quality_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_venue_tba_audit"
            referencedColumns: ["id"]
          },
        ]
      }
      event_series: {
        Row: {
          canonical_event_id: string | null
          canonical_url: string | null
          category_id: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          editorial_status: string
          id: string
          image_url: string | null
          is_indexable: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          organizer_id: string | null
          slug: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          canonical_event_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          editorial_status?: string
          id?: string
          image_url?: string | null
          is_indexable?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          organizer_id?: string | null
          slug: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          canonical_event_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          editorial_status?: string
          id?: string
          image_url?: string | null
          is_indexable?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          organizer_id?: string | null
          slug?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_series_canonical_event_id_fkey"
            columns: ["canonical_event_id"]
            isOneToOne: false
            referencedRelation: "event_artist_match_candidates"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_series_canonical_event_id_fkey"
            columns: ["canonical_event_id"]
            isOneToOne: false
            referencedRelation: "event_slug_aliases_view"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_series_canonical_event_id_fkey"
            columns: ["canonical_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_series_canonical_event_id_fkey"
            columns: ["canonical_event_id"]
            isOneToOne: false
            referencedRelation: "events_artist_coverage_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_series_canonical_event_id_fkey"
            columns: ["canonical_event_id"]
            isOneToOne: false
            referencedRelation: "events_graph_health"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_series_canonical_event_id_fkey"
            columns: ["canonical_event_id"]
            isOneToOne: false
            referencedRelation: "events_integrity_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_series_canonical_event_id_fkey"
            columns: ["canonical_event_id"]
            isOneToOne: false
            referencedRelation: "events_quality_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_series_canonical_event_id_fkey"
            columns: ["canonical_event_id"]
            isOneToOne: false
            referencedRelation: "events_venue_tba_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_series_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_series_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_aliases_view"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "event_series_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizers"
            referencedColumns: ["id"]
          },
        ]
      }
      event_slug_aliases: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          notes: string | null
          old_slug: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          old_slug?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          old_slug?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_slug_aliases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_artist_match_candidates"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_slug_aliases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_slug_aliases_view"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_slug_aliases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_slug_aliases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_artist_coverage_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_slug_aliases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_graph_health"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_slug_aliases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_integrity_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_slug_aliases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_quality_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_slug_aliases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_venue_tba_audit"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          additional_info: string | null
          age_restriction: string | null
          archive_status: string | null
          archive_summary: string | null
          artist_id: string | null
          artist_image: string | null
          artist_name: string | null
          artist_social_links: Json | null
          audience_tags: string[] | null
          available_seats: number | null
          booking_url: string | null
          campaign_slug: string | null
          canonical_url: string | null
          capacity: number | null
          category: string | null
          city: string | null
          confidence_score: number | null
          content_warning: string | null
          cover_image: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          door_time: string | null
          duration: string | null
          editorial_status: string | null
          end_date: string | null
          end_time: string | null
          event_format: string | null
          faq_json: Json | null
          freshness_score: number | null
          h1_override: string | null
          id: string
          image_url: string | null
          index_status: Database["public"]["Enums"]["index_status_enum"] | null
          interested_count: number | null
          is_all_day: boolean | null
          is_featured: boolean | null
          is_free: boolean | null
          is_indexable: boolean | null
          is_online: boolean | null
          last_verified_at: string | null
          latitude: number | null
          locality: string | null
          locality_id: string | null
          locality_slug: string | null
          longitude: number | null
          meta_description: string | null
          meta_title: string | null
          next_edition_id: string | null
          online_url: string | null
          organizer_contact: string | null
          organizer_email: string | null
          organizer_id: string | null
          organizer_name: string | null
          organizer_phone: string | null
          organizer_website: string | null
          performer_id: string | null
          performer_image: string | null
          performer_name: string | null
          performer_social_links: Json | null
          photo_count: number | null
          previous_edition_id: string | null
          price_band: string | null
          price_max: number | null
          price_min: number | null
          published_at: string | null
          recap_summary: string | null
          registration_url: string | null
          review_count: number | null
          saved_count: number | null
          schema_json: Json | null
          seo_blurb: string | null
          seo_content: string | null
          series_id: string | null
          series_key: string | null
          short_description: string | null
          slug: string
          source_label: string | null
          source_url: string | null
          start_date: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["status_enum"] | null
          tags: string[] | null
          terms_conditions: string | null
          ticket_price: number | null
          ticket_sale_end_date: string | null
          ticket_sale_start_date: string | null
          ticket_tiers: Json | null
          tickets_sold: number | null
          timezone: string | null
          title: string
          total_capacity: number | null
          updated_at: string | null
          updated_by: string | null
          venue_address: string | null
          venue_id: string | null
          venue_name: string | null
          view_count: number
        }
        Insert: {
          additional_info?: string | null
          age_restriction?: string | null
          archive_status?: string | null
          archive_summary?: string | null
          artist_id?: string | null
          artist_image?: string | null
          artist_name?: string | null
          artist_social_links?: Json | null
          audience_tags?: string[] | null
          available_seats?: number | null
          booking_url?: string | null
          campaign_slug?: string | null
          canonical_url?: string | null
          capacity?: number | null
          category?: string | null
          city?: string | null
          confidence_score?: number | null
          content_warning?: string | null
          cover_image?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          door_time?: string | null
          duration?: string | null
          editorial_status?: string | null
          end_date?: string | null
          end_time?: string | null
          event_format?: string | null
          faq_json?: Json | null
          freshness_score?: number | null
          h1_override?: string | null
          id?: string
          image_url?: string | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          interested_count?: number | null
          is_all_day?: boolean | null
          is_featured?: boolean | null
          is_free?: boolean | null
          is_indexable?: boolean | null
          is_online?: boolean | null
          last_verified_at?: string | null
          latitude?: number | null
          locality?: string | null
          locality_id?: string | null
          locality_slug?: string | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          next_edition_id?: string | null
          online_url?: string | null
          organizer_contact?: string | null
          organizer_email?: string | null
          organizer_id?: string | null
          organizer_name?: string | null
          organizer_phone?: string | null
          organizer_website?: string | null
          performer_id?: string | null
          performer_image?: string | null
          performer_name?: string | null
          performer_social_links?: Json | null
          photo_count?: number | null
          previous_edition_id?: string | null
          price_band?: string | null
          price_max?: number | null
          price_min?: number | null
          published_at?: string | null
          recap_summary?: string | null
          registration_url?: string | null
          review_count?: number | null
          saved_count?: number | null
          schema_json?: Json | null
          seo_blurb?: string | null
          seo_content?: string | null
          series_id?: string | null
          series_key?: string | null
          short_description?: string | null
          slug: string
          source_label?: string | null
          source_url?: string | null
          start_date?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          tags?: string[] | null
          terms_conditions?: string | null
          ticket_price?: number | null
          ticket_sale_end_date?: string | null
          ticket_sale_start_date?: string | null
          ticket_tiers?: Json | null
          tickets_sold?: number | null
          timezone?: string | null
          title: string
          total_capacity?: number | null
          updated_at?: string | null
          updated_by?: string | null
          venue_address?: string | null
          venue_id?: string | null
          venue_name?: string | null
          view_count?: number
        }
        Update: {
          additional_info?: string | null
          age_restriction?: string | null
          archive_status?: string | null
          archive_summary?: string | null
          artist_id?: string | null
          artist_image?: string | null
          artist_name?: string | null
          artist_social_links?: Json | null
          audience_tags?: string[] | null
          available_seats?: number | null
          booking_url?: string | null
          campaign_slug?: string | null
          canonical_url?: string | null
          capacity?: number | null
          category?: string | null
          city?: string | null
          confidence_score?: number | null
          content_warning?: string | null
          cover_image?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          door_time?: string | null
          duration?: string | null
          editorial_status?: string | null
          end_date?: string | null
          end_time?: string | null
          event_format?: string | null
          faq_json?: Json | null
          freshness_score?: number | null
          h1_override?: string | null
          id?: string
          image_url?: string | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          interested_count?: number | null
          is_all_day?: boolean | null
          is_featured?: boolean | null
          is_free?: boolean | null
          is_indexable?: boolean | null
          is_online?: boolean | null
          last_verified_at?: string | null
          latitude?: number | null
          locality?: string | null
          locality_id?: string | null
          locality_slug?: string | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          next_edition_id?: string | null
          online_url?: string | null
          organizer_contact?: string | null
          organizer_email?: string | null
          organizer_id?: string | null
          organizer_name?: string | null
          organizer_phone?: string | null
          organizer_website?: string | null
          performer_id?: string | null
          performer_image?: string | null
          performer_name?: string | null
          performer_social_links?: Json | null
          photo_count?: number | null
          previous_edition_id?: string | null
          price_band?: string | null
          price_max?: number | null
          price_min?: number | null
          published_at?: string | null
          recap_summary?: string | null
          registration_url?: string | null
          review_count?: number | null
          saved_count?: number | null
          schema_json?: Json | null
          seo_blurb?: string | null
          seo_content?: string | null
          series_id?: string | null
          series_key?: string | null
          short_description?: string | null
          slug?: string
          source_label?: string | null
          source_url?: string | null
          start_date?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          tags?: string[] | null
          terms_conditions?: string | null
          ticket_price?: number | null
          ticket_sale_end_date?: string | null
          ticket_sale_start_date?: string | null
          ticket_tiers?: Json | null
          tickets_sold?: number | null
          timezone?: string | null
          title?: string
          total_capacity?: number | null
          updated_at?: string | null
          updated_by?: string | null
          venue_address?: string | null
          venue_id?: string | null
          venue_name?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "events_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "event_artist_match_candidates"
            referencedColumns: ["artist_id"]
          },
          {
            foreignKeyName: "events_locality_fk"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_locality_fk"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_id"]
          },
          {
            foreignKeyName: "events_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_id"]
          },
          {
            foreignKeyName: "events_next_edition_id_fkey"
            columns: ["next_edition_id"]
            isOneToOne: false
            referencedRelation: "event_artist_match_candidates"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "events_next_edition_id_fkey"
            columns: ["next_edition_id"]
            isOneToOne: false
            referencedRelation: "event_slug_aliases_view"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "events_next_edition_id_fkey"
            columns: ["next_edition_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_next_edition_id_fkey"
            columns: ["next_edition_id"]
            isOneToOne: false
            referencedRelation: "events_artist_coverage_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_next_edition_id_fkey"
            columns: ["next_edition_id"]
            isOneToOne: false
            referencedRelation: "events_graph_health"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_next_edition_id_fkey"
            columns: ["next_edition_id"]
            isOneToOne: false
            referencedRelation: "events_integrity_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_next_edition_id_fkey"
            columns: ["next_edition_id"]
            isOneToOne: false
            referencedRelation: "events_quality_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_next_edition_id_fkey"
            columns: ["next_edition_id"]
            isOneToOne: false
            referencedRelation: "events_venue_tba_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_performer_id_fkey"
            columns: ["performer_id"]
            isOneToOne: false
            referencedRelation: "performers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_previous_edition_id_fkey"
            columns: ["previous_edition_id"]
            isOneToOne: false
            referencedRelation: "event_artist_match_candidates"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "events_previous_edition_id_fkey"
            columns: ["previous_edition_id"]
            isOneToOne: false
            referencedRelation: "event_slug_aliases_view"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "events_previous_edition_id_fkey"
            columns: ["previous_edition_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_previous_edition_id_fkey"
            columns: ["previous_edition_id"]
            isOneToOne: false
            referencedRelation: "events_artist_coverage_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_previous_edition_id_fkey"
            columns: ["previous_edition_id"]
            isOneToOne: false
            referencedRelation: "events_graph_health"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_previous_edition_id_fkey"
            columns: ["previous_edition_id"]
            isOneToOne: false
            referencedRelation: "events_integrity_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_previous_edition_id_fkey"
            columns: ["previous_edition_id"]
            isOneToOne: false
            referencedRelation: "events_quality_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_previous_edition_id_fkey"
            columns: ["previous_edition_id"]
            isOneToOne: false
            referencedRelation: "events_venue_tba_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "event_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_section_items: {
        Row: {
          created_at: string
          display_order: number
          entity_id: string
          entity_type: string
          id: string
          is_active: boolean
          label_override: string | null
          section_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          entity_id: string
          entity_type: string
          id?: string
          is_active?: boolean
          label_override?: string | null
          section_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          entity_id?: string
          entity_type?: string
          id?: string
          is_active?: boolean
          label_override?: string | null
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "homepage_section_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "homepage_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_sections: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number
          entity_type: string
          filters: Json
          id: string
          is_active: boolean
          is_featured: boolean
          max_items: number
          mode: string
          section_key: string
          sort_mode: string | null
          subtitle: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          entity_type: string
          filters?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          max_items?: number
          mode?: string
          section_key: string
          sort_mode?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          entity_type?: string
          filters?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          max_items?: number
          mode?: string
          section_key?: string
          sort_mode?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
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
      legacy_redirect_review: {
        Row: {
          confidence: number | null
          created_at: string
          entity_type: string | null
          old_path: string
          old_slug: string | null
          reason: string | null
          reviewed: boolean
          suggested_new_path: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          entity_type?: string | null
          old_path: string
          old_slug?: string | null
          reason?: string | null
          reviewed?: boolean
          suggested_new_path?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          entity_type?: string | null
          old_path?: string
          old_slug?: string | null
          reason?: string | null
          reviewed?: boolean
          suggested_new_path?: string | null
        }
        Relationships: []
      }
      legacy_redirects: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          new_path: string
          old_path: string
          reason: string | null
          status_code: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean
          new_path: string
          old_path: string
          reason?: string | null
          status_code?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean
          new_path?: string
          old_path?: string
          reason?: string | null
          status_code?: number
          updated_at?: string
        }
        Relationships: []
      }
      legacy_routes: {
        Row: {
          canonical_path: string | null
          created_at: string | null
          entity_type: string | null
          id: string
          notes: string | null
          old_path: string | null
          redirect_type: number | null
          updated_at: string | null
        }
        Insert: {
          canonical_path?: string | null
          created_at?: string | null
          entity_type?: string | null
          id?: string
          notes?: string | null
          old_path?: string | null
          redirect_type?: number | null
          updated_at?: string | null
        }
        Update: {
          canonical_path?: string | null
          created_at?: string | null
          entity_type?: string | null
          id?: string
          notes?: string | null
          old_path?: string | null
          redirect_type?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      legacy_url_import: {
        Row: {
          created_at: string
          raw_url: string
        }
        Insert: {
          created_at?: string
          raw_url: string
        }
        Update: {
          created_at?: string
          raw_url?: string
        }
        Relationships: []
      }
      localities: {
        Row: {
          assembly_constituency: string | null
          avg_rating: number | null
          banking: Json | null
          best_for: string[] | null
          best_time_to_visit: string | null
          cafes: Json | null
          canonical_url: string | null
          civic_helplines: Json | null
          colleges: Json | null
          cons: string[] | null
          coworking_spaces: Json | null
          created_at: string | null
          data_source: string | null
          description: string | null
          dining: Json | null
          distance_matrix: Json | null
          distance_to_airport: string | null
          distance_to_bus_stand: string | null
          distance_to_railway: string | null
          education: Json | null
          emergency_contacts: Json | null
          entertainment: Json | null
          faq_json: Json | null
          featured_image: string | null
          geo_lat: number | null
          geo_lng: number | null
          h1_override: string | null
          healthcare: Json | null
          hero_image: string | null
          hospitals: Json | null
          id: string
          index_override: boolean | null
          index_status: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable: boolean | null
          is_placeholder: boolean
          known_for: string | null
          landmarks: string[] | null
          last_verified_at: string | null
          livability_score: number | null
          local_insights: Json | null
          locality_type: string | null
          major_roads: string[] | null
          malls: Json | null
          meta_description: string | null
          meta_title: string | null
          micro_localities: string[] | null
          municipality: string | null
          name: string
          name_hi: string | null
          nearby_localities: string[] | null
          nearest_airport: Json | null
          nearest_bus_stand: Json | null
          nearest_metro: string | null
          nearest_railway: Json | null
          nightlife: Json | null
          parent_locality_slug: string | null
          parks: Json | null
          parliamentary_constituency: string | null
          pin_code: string | null
          pincode: string | null
          places_of_worship: Json | null
          police_station: string | null
          police_station_address: string | null
          police_station_email: string | null
          police_station_emergency: string | null
          police_station_incharge: string | null
          police_station_incharge_contact: string | null
          police_station_jurisdiction: string | null
          police_station_maps: string | null
          police_station_name: string | null
          police_station_phone: string | null
          police_station_whatsapp: string | null
          popular_eateries: string[] | null
          popular_venues: string[] | null
          population_estimate: number | null
          pros: string[] | null
          public_transport: string[] | null
          quality_score: number | null
          real_estate: Json | null
          related_localities: string[] | null
          resident_testimonials: Json | null
          restaurants: Json | null
          review_count: number | null
          safety_rating: number | null
          schema_json: Json | null
          schools: Json | null
          seo_blurb: string | null
          seo_content: string | null
          shopping: Json | null
          shopping_options: string | null
          should_index: boolean | null
          slug: string
          source_label: string | null
          status: Database["public"]["Enums"]["status_enum"] | null
          updated_at: string | null
          venue_categories: string[] | null
          verification_notes: string | null
          vibe_tags: string[] | null
          walkability_score: number | null
          ward_name: string | null
          ward_number: string | null
          weekly_markets: Json | null
          zone: string | null
          zone_id: string | null
        }
        Insert: {
          assembly_constituency?: string | null
          avg_rating?: number | null
          banking?: Json | null
          best_for?: string[] | null
          best_time_to_visit?: string | null
          cafes?: Json | null
          canonical_url?: string | null
          civic_helplines?: Json | null
          colleges?: Json | null
          cons?: string[] | null
          coworking_spaces?: Json | null
          created_at?: string | null
          data_source?: string | null
          description?: string | null
          dining?: Json | null
          distance_matrix?: Json | null
          distance_to_airport?: string | null
          distance_to_bus_stand?: string | null
          distance_to_railway?: string | null
          education?: Json | null
          emergency_contacts?: Json | null
          entertainment?: Json | null
          faq_json?: Json | null
          featured_image?: string | null
          geo_lat?: number | null
          geo_lng?: number | null
          h1_override?: string | null
          healthcare?: Json | null
          hero_image?: string | null
          hospitals?: Json | null
          id?: string
          index_override?: boolean | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable?: boolean | null
          is_placeholder?: boolean
          known_for?: string | null
          landmarks?: string[] | null
          last_verified_at?: string | null
          livability_score?: number | null
          local_insights?: Json | null
          locality_type?: string | null
          major_roads?: string[] | null
          malls?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          micro_localities?: string[] | null
          municipality?: string | null
          name: string
          name_hi?: string | null
          nearby_localities?: string[] | null
          nearest_airport?: Json | null
          nearest_bus_stand?: Json | null
          nearest_metro?: string | null
          nearest_railway?: Json | null
          nightlife?: Json | null
          parent_locality_slug?: string | null
          parks?: Json | null
          parliamentary_constituency?: string | null
          pin_code?: string | null
          pincode?: string | null
          places_of_worship?: Json | null
          police_station?: string | null
          police_station_address?: string | null
          police_station_email?: string | null
          police_station_emergency?: string | null
          police_station_incharge?: string | null
          police_station_incharge_contact?: string | null
          police_station_jurisdiction?: string | null
          police_station_maps?: string | null
          police_station_name?: string | null
          police_station_phone?: string | null
          police_station_whatsapp?: string | null
          popular_eateries?: string[] | null
          popular_venues?: string[] | null
          population_estimate?: number | null
          pros?: string[] | null
          public_transport?: string[] | null
          quality_score?: number | null
          real_estate?: Json | null
          related_localities?: string[] | null
          resident_testimonials?: Json | null
          restaurants?: Json | null
          review_count?: number | null
          safety_rating?: number | null
          schema_json?: Json | null
          schools?: Json | null
          seo_blurb?: string | null
          seo_content?: string | null
          shopping?: Json | null
          shopping_options?: string | null
          should_index?: boolean | null
          slug: string
          source_label?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          updated_at?: string | null
          venue_categories?: string[] | null
          verification_notes?: string | null
          vibe_tags?: string[] | null
          walkability_score?: number | null
          ward_name?: string | null
          ward_number?: string | null
          weekly_markets?: Json | null
          zone?: string | null
          zone_id?: string | null
        }
        Update: {
          assembly_constituency?: string | null
          avg_rating?: number | null
          banking?: Json | null
          best_for?: string[] | null
          best_time_to_visit?: string | null
          cafes?: Json | null
          canonical_url?: string | null
          civic_helplines?: Json | null
          colleges?: Json | null
          cons?: string[] | null
          coworking_spaces?: Json | null
          created_at?: string | null
          data_source?: string | null
          description?: string | null
          dining?: Json | null
          distance_matrix?: Json | null
          distance_to_airport?: string | null
          distance_to_bus_stand?: string | null
          distance_to_railway?: string | null
          education?: Json | null
          emergency_contacts?: Json | null
          entertainment?: Json | null
          faq_json?: Json | null
          featured_image?: string | null
          geo_lat?: number | null
          geo_lng?: number | null
          h1_override?: string | null
          healthcare?: Json | null
          hero_image?: string | null
          hospitals?: Json | null
          id?: string
          index_override?: boolean | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable?: boolean | null
          is_placeholder?: boolean
          known_for?: string | null
          landmarks?: string[] | null
          last_verified_at?: string | null
          livability_score?: number | null
          local_insights?: Json | null
          locality_type?: string | null
          major_roads?: string[] | null
          malls?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          micro_localities?: string[] | null
          municipality?: string | null
          name?: string
          name_hi?: string | null
          nearby_localities?: string[] | null
          nearest_airport?: Json | null
          nearest_bus_stand?: Json | null
          nearest_metro?: string | null
          nearest_railway?: Json | null
          nightlife?: Json | null
          parent_locality_slug?: string | null
          parks?: Json | null
          parliamentary_constituency?: string | null
          pin_code?: string | null
          pincode?: string | null
          places_of_worship?: Json | null
          police_station?: string | null
          police_station_address?: string | null
          police_station_email?: string | null
          police_station_emergency?: string | null
          police_station_incharge?: string | null
          police_station_incharge_contact?: string | null
          police_station_jurisdiction?: string | null
          police_station_maps?: string | null
          police_station_name?: string | null
          police_station_phone?: string | null
          police_station_whatsapp?: string | null
          popular_eateries?: string[] | null
          popular_venues?: string[] | null
          population_estimate?: number | null
          pros?: string[] | null
          public_transport?: string[] | null
          quality_score?: number | null
          real_estate?: Json | null
          related_localities?: string[] | null
          resident_testimonials?: Json | null
          restaurants?: Json | null
          review_count?: number | null
          safety_rating?: number | null
          schema_json?: Json | null
          schools?: Json | null
          seo_blurb?: string | null
          seo_content?: string | null
          shopping?: Json | null
          shopping_options?: string | null
          should_index?: boolean | null
          slug?: string
          source_label?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          updated_at?: string | null
          venue_categories?: string[] | null
          verification_notes?: string | null
          vibe_tags?: string[] | null
          walkability_score?: number | null
          ward_name?: string | null
          ward_number?: string | null
          weekly_markets?: Json | null
          zone?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "localities_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      locality_aliases: {
        Row: {
          alias: string | null
          alias_slug: string | null
          created_at: string | null
          id: string
          locality_id: string | null
          locality_slug: string | null
          notes: string | null
          old_slug: string | null
          updated_at: string | null
        }
        Insert: {
          alias?: string | null
          alias_slug?: string | null
          created_at?: string | null
          id?: string
          locality_id?: string | null
          locality_slug?: string | null
          notes?: string | null
          old_slug?: string | null
          updated_at?: string | null
        }
        Update: {
          alias?: string | null
          alias_slug?: string | null
          created_at?: string | null
          id?: string
          locality_id?: string | null
          locality_slug?: string | null
          notes?: string | null
          old_slug?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_locality_aliases_locality_slug"
            columns: ["locality_slug"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "fk_locality_aliases_locality_slug"
            columns: ["locality_slug"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_slug"]
          },
          {
            foreignKeyName: "locality_aliases_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locality_aliases_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_id"]
          },
        ]
      }
      locality_category_pages: {
        Row: {
          canonical_url: string | null
          category_id: string
          created_at: string | null
          description: string | null
          editorial_status: string | null
          id: string
          index_override: boolean | null
          index_status: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable: boolean | null
          locality_id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          should_index: boolean | null
          slug: string | null
          status: Database["public"]["Enums"]["status_enum"] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          canonical_url?: string | null
          category_id: string
          created_at?: string | null
          description?: string | null
          editorial_status?: string | null
          id?: string
          index_override?: boolean | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable?: boolean | null
          locality_id: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          should_index?: boolean | null
          slug?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          canonical_url?: string | null
          category_id?: string
          created_at?: string | null
          description?: string | null
          editorial_status?: string | null
          id?: string
          index_override?: boolean | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable?: boolean | null
          locality_id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          should_index?: boolean | null
          slug?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locality_category_pages_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locality_category_pages_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_aliases_view"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "locality_category_pages_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locality_category_pages_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_id"]
          },
        ]
      }
      locality_comparisons: {
        Row: {
          comparison_data: Json | null
          created_at: string | null
          id: string
          locality_slug_1: string | null
          locality_slug_2: string | null
        }
        Insert: {
          comparison_data?: Json | null
          created_at?: string | null
          id?: string
          locality_slug_1?: string | null
          locality_slug_2?: string | null
        }
        Update: {
          comparison_data?: Json | null
          created_at?: string | null
          id?: string
          locality_slug_1?: string | null
          locality_slug_2?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locality_comparisons_locality_slug_1_fkey"
            columns: ["locality_slug_1"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "locality_comparisons_locality_slug_1_fkey"
            columns: ["locality_slug_1"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_slug"]
          },
          {
            foreignKeyName: "locality_comparisons_locality_slug_2_fkey"
            columns: ["locality_slug_2"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "locality_comparisons_locality_slug_2_fkey"
            columns: ["locality_slug_2"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_slug"]
          },
        ]
      }
      merchant_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_indexable: boolean | null
          name: string
          slug: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_indexable?: boolean | null
          name: string
          slug: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_indexable?: boolean | null
          name?: string
          slug?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      merchant_category_links: {
        Row: {
          created_at: string
          id: string
          merchant_category_id: string
          merchant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          merchant_category_id: string
          merchant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          merchant_category_id?: string
          merchant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_category_links_merchant_category_id_fkey"
            columns: ["merchant_category_id"]
            isOneToOne: false
            referencedRelation: "merchant_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_category_links_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_category_links_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          active_deals_count: number | null
          address: string | null
          average_rating: number | null
          avg_rating: number | null
          booking_url: string | null
          business_name: string | null
          business_type: string | null
          canonical_url: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          editorial_status: string | null
          features: string[] | null
          google_place_id: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_indexable: boolean | null
          is_verified: boolean | null
          known_for: string[] | null
          last_verified: string | null
          latitude: number | null
          locality: string | null
          locality_id: string | null
          logo_url: string | null
          longitude: number | null
          menu_url: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          opening_hours: Json | null
          opening_hours_specification: Json | null
          phone: string | null
          published_at: string | null
          rating_sources: string[] | null
          slug: string
          source_label: string | null
          source_url: string | null
          status: string | null
          structured_citations: Json | null
          total_reviews: number | null
          total_views: number | null
          unstructured_mentions: number | null
          updated_at: string
          updated_by: string | null
          verification_status: string | null
          website: string | null
          weekly_views: number | null
        }
        Insert: {
          active_deals_count?: number | null
          address?: string | null
          average_rating?: number | null
          avg_rating?: number | null
          booking_url?: string | null
          business_name?: string | null
          business_type?: string | null
          canonical_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          editorial_status?: string | null
          features?: string[] | null
          google_place_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_indexable?: boolean | null
          is_verified?: boolean | null
          known_for?: string[] | null
          last_verified?: string | null
          latitude?: number | null
          locality?: string | null
          locality_id?: string | null
          logo_url?: string | null
          longitude?: number | null
          menu_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          opening_hours?: Json | null
          opening_hours_specification?: Json | null
          phone?: string | null
          published_at?: string | null
          rating_sources?: string[] | null
          slug: string
          source_label?: string | null
          source_url?: string | null
          status?: string | null
          structured_citations?: Json | null
          total_reviews?: number | null
          total_views?: number | null
          unstructured_mentions?: number | null
          updated_at?: string
          updated_by?: string | null
          verification_status?: string | null
          website?: string | null
          weekly_views?: number | null
        }
        Update: {
          active_deals_count?: number | null
          address?: string | null
          average_rating?: number | null
          avg_rating?: number | null
          booking_url?: string | null
          business_name?: string | null
          business_type?: string | null
          canonical_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          editorial_status?: string | null
          features?: string[] | null
          google_place_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_indexable?: boolean | null
          is_verified?: boolean | null
          known_for?: string[] | null
          last_verified?: string | null
          latitude?: number | null
          locality?: string | null
          locality_id?: string | null
          logo_url?: string | null
          longitude?: number | null
          menu_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          opening_hours?: Json | null
          opening_hours_specification?: Json | null
          phone?: string | null
          published_at?: string | null
          rating_sources?: string[] | null
          slug?: string
          source_label?: string | null
          source_url?: string | null
          status?: string | null
          structured_citations?: Json | null
          total_reviews?: number | null
          total_views?: number | null
          unstructured_mentions?: number | null
          updated_at?: string
          updated_by?: string | null
          verification_status?: string | null
          website?: string | null
          weekly_views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "merchants_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchants_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_id"]
          },
        ]
      }
      news_articles: {
        Row: {
          ai_prompt: string | null
          author_id: string | null
          canonical_url: string | null
          category: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_ai_generated: boolean | null
          is_featured: boolean | null
          like_count: number | null
          locality_id: string | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          schema_json: Json | null
          share_count: number | null
          slug: string
          status: Database["public"]["Enums"]["article_status"]
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          ai_prompt?: string | null
          author_id?: string | null
          canonical_url?: string | null
          category?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_ai_generated?: boolean | null
          is_featured?: boolean | null
          like_count?: number | null
          locality_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          schema_json?: Json | null
          share_count?: number | null
          slug: string
          status?: Database["public"]["Enums"]["article_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          ai_prompt?: string | null
          author_id?: string | null
          canonical_url?: string | null
          category?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_ai_generated?: boolean | null
          is_featured?: boolean | null
          like_count?: number | null
          locality_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          schema_json?: Json | null
          share_count?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["article_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_articles_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_articles_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_id"]
          },
        ]
      }
      news_flashes: {
        Row: {
          content: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          published_at: string | null
          slug: string
          title: string
          urgency: string | null
        }
        Insert: {
          content: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          published_at?: string | null
          slug: string
          title: string
          urgency?: string | null
        }
        Update: {
          content?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          published_at?: string | null
          slug?: string
          title?: string
          urgency?: string | null
        }
        Relationships: []
      }
      news_likes: {
        Row: {
          article_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
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
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          order_id: string
          price_snapshot: number | null
          qty: number | null
          title_snapshot: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          order_id: string
          price_snapshot?: number | null
          qty?: number | null
          title_snapshot?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          order_id?: string
          price_snapshot?: number | null
          qty?: number | null
          title_snapshot?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          deal_id: string | null
          id: string
          merchant_id: string | null
          notes: string | null
          order_type: string | null
          payment_status: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          deal_id?: string | null
          id?: string
          merchant_id?: string | null
          notes?: string | null
          order_type?: string | null
          payment_status?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          deal_id?: string | null
          id?: string
          merchant_id?: string | null
          notes?: string | null
          order_type?: string | null
          payment_status?: string | null
          status?: string | null
          updated_at?: string
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
            referencedRelation: "merchant_performance"
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
      organizers: {
        Row: {
          bio: string | null
          canonical_url: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          editorial_status: string
          email: string | null
          id: string
          image_url: string | null
          is_indexable: boolean | null
          locality_id: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          phone: string | null
          schema_json: Json | null
          slug: string
          source_label: string | null
          source_url: string | null
          status: string
          updated_at: string
          updated_by: string | null
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          canonical_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          editorial_status?: string
          email?: string | null
          id?: string
          image_url?: string | null
          is_indexable?: boolean | null
          locality_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          phone?: string | null
          schema_json?: Json | null
          slug: string
          source_label?: string | null
          source_url?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          canonical_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          editorial_status?: string
          email?: string | null
          id?: string
          image_url?: string | null
          is_indexable?: boolean | null
          locality_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          phone?: string | null
          schema_json?: Json | null
          slug?: string
          source_label?: string | null
          source_url?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizers_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizers_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_id"]
          },
        ]
      }
      page_views: {
        Row: {
          created_at: string | null
          id: string
          page_title: string | null
          page_url: string | null
          referrer_url: string | null
          scroll_depth: number | null
          session_id: string | null
          time_on_page: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          page_title?: string | null
          page_url?: string | null
          referrer_url?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          time_on_page?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          page_title?: string | null
          page_url?: string | null
          referrer_url?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          time_on_page?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          gateway: string | null
          gateway_ref: string | null
          id: string
          order_id: string | null
          payload: Json | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          gateway?: string | null
          gateway_ref?: string | null
          id?: string
          order_id?: string | null
          payload?: Json | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          gateway?: string | null
          gateway_ref?: string | null
          id?: string
          order_id?: string | null
          payload?: Json | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      performers: {
        Row: {
          bio: string | null
          created_at: string | null
          follower_count: number | null
          id: string
          image: string | null
          name: string
          slug: string
          social_links: Json | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          follower_count?: number | null
          id?: string
          image?: string | null
          name: string
          slug: string
          social_links?: Json | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          follower_count?: number | null
          id?: string
          image?: string | null
          name?: string
          slug?: string
          social_links?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          created_at: string | null
          id: string
          is_featured: boolean | null
          slug: string | null
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          slug?: string | null
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          slug?: string | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      related_events: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          related_event_id: string | null
          relationship_type: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          related_event_id?: string | null
          relationship_type?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          related_event_id?: string | null
          relationship_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "related_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_artist_match_candidates"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "related_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_slug_aliases_view"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "related_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_artist_coverage_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_graph_health"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_integrity_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_quality_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_venue_tba_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_events_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "event_artist_match_candidates"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "related_events_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "event_slug_aliases_view"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "related_events_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_events_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "events_artist_coverage_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_events_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "events_graph_health"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_events_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "events_integrity_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_events_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "events_quality_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_events_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "events_venue_tba_audit"
            referencedColumns: ["id"]
          },
        ]
      }
      search_queries: {
        Row: {
          created_at: string | null
          id: string
          search_query: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          search_query?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          search_query?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      seo_metadata: {
        Row: {
          canonical_url: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          robots: string | null
          schema_json: Json | null
          twitter_card: string | null
          updated_at: string | null
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          robots?: string | null
          schema_json?: Json | null
          twitter_card?: string | null
          updated_at?: string | null
        }
        Update: {
          canonical_url?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          robots?: string | null
          schema_json?: Json | null
          twitter_card?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      testing: {
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
      ticket_tiers: {
        Row: {
          availability: string | null
          created_at: string | null
          description: string | null
          event_id: string | null
          id: string
          name: string | null
          price: number | null
        }
        Insert: {
          availability?: string | null
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          name?: string | null
          price?: number | null
        }
        Update: {
          availability?: string | null
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          name?: string | null
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_artist_match_candidates"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "ticket_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_slug_aliases_view"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "ticket_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_artist_coverage_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_graph_health"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_integrity_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_quality_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_venue_tba_audit"
            referencedColumns: ["id"]
          },
        ]
      }
      url_redirects: {
        Row: {
          created_at: string | null
          from_path: string
          id: string
          redirect_type: number | null
          to_path: string
        }
        Insert: {
          created_at?: string | null
          from_path: string
          id?: string
          redirect_type?: number | null
          to_path: string
        }
        Update: {
          created_at?: string | null
          from_path?: string
          id?: string
          redirect_type?: number | null
          to_path?: string
        }
        Relationships: []
      }
      user_reviews: {
        Row: {
          article_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          photos: string[] | null
          rating: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          article_id?: string | null
          comment?: string | null
          created_at?: string | null
          id: string
          photos?: string[] | null
          rating?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          article_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          photos?: string[] | null
          rating?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_reviews_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          metadata: Json | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          metadata?: Json | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          metadata?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string | null
          amenities: Json | null
          campaign_slug: string | null
          canonical_url: string | null
          capacity: number | null
          category: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          editorial_status: string | null
          email: string | null
          geo_lat: number | null
          geo_lng: number | null
          google_maps_embed: string | null
          h1_override: string | null
          id: string
          image: string | null
          image_url: string | null
          index_status: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable: boolean | null
          latitude: number | null
          locality_id: string | null
          locality_slug: string | null
          longitude: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          phone: string | null
          published_at: string | null
          rating: number | null
          review_count: number | null
          schema_json: Json | null
          seo_blurb: string | null
          seo_content: string | null
          slug: string
          source_label: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["status_enum"] | null
          updated_at: string | null
          updated_by: string | null
          venue_category: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          amenities?: Json | null
          campaign_slug?: string | null
          canonical_url?: string | null
          capacity?: number | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          editorial_status?: string | null
          email?: string | null
          geo_lat?: number | null
          geo_lng?: number | null
          google_maps_embed?: string | null
          h1_override?: string | null
          id?: string
          image?: string | null
          image_url?: string | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable?: boolean | null
          latitude?: number | null
          locality_id?: string | null
          locality_slug?: string | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          phone?: string | null
          published_at?: string | null
          rating?: number | null
          review_count?: number | null
          schema_json?: Json | null
          seo_blurb?: string | null
          seo_content?: string | null
          slug: string
          source_label?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          updated_at?: string | null
          updated_by?: string | null
          venue_category?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          amenities?: Json | null
          campaign_slug?: string | null
          canonical_url?: string | null
          capacity?: number | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          editorial_status?: string | null
          email?: string | null
          geo_lat?: number | null
          geo_lng?: number | null
          google_maps_embed?: string | null
          h1_override?: string | null
          id?: string
          image?: string | null
          image_url?: string | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable?: boolean | null
          latitude?: number | null
          locality_id?: string | null
          locality_slug?: string | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          phone?: string | null
          published_at?: string | null
          rating?: number | null
          review_count?: number | null
          schema_json?: Json | null
          seo_blurb?: string | null
          seo_content?: string | null
          slug?: string
          source_label?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          updated_at?: string | null
          updated_by?: string | null
          venue_category?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venues_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_id"]
          },
        ]
      }
      videos: {
        Row: {
          article_id: string | null
          duration: number | null
          id: string
          title: string | null
          transcript: string | null
          youtube_id: string | null
        }
        Insert: {
          article_id?: string | null
          duration?: number | null
          id: string
          title?: string | null
          transcript?: string | null
          youtube_id?: string | null
        }
        Update: {
          article_id?: string | null
          duration?: number | null
          id?: string
          title?: string | null
          transcript?: string | null
          youtube_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_sessions: {
        Row: {
          browser: string | null
          browser_version: string | null
          city: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          first_visit_at: string | null
          id: string
          is_converted: boolean | null
          landing_page: string | null
          last_activity_at: string | null
          os: string | null
          os_version: string | null
          referrer: string | null
          screen_height: number | null
          screen_width: number | null
          session_id: string
          total_page_views: number | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          browser?: string | null
          browser_version?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          first_visit_at?: string | null
          id?: string
          is_converted?: boolean | null
          landing_page?: string | null
          last_activity_at?: string | null
          os?: string | null
          os_version?: string | null
          referrer?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id: string
          total_page_views?: number | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          browser?: string | null
          browser_version?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          first_visit_at?: string | null
          id?: string
          is_converted?: boolean | null
          landing_page?: string | null
          last_activity_at?: string | null
          os?: string | null
          os_version?: string | null
          referrer?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id?: string
          total_page_views?: number | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      whatsapp_subscribers: {
        Row: {
          id: string
          is_active: boolean | null
          last_broadcast_sent: string | null
          neighborhood: string | null
          phone_number: string
          subscribed_at: string | null
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          last_broadcast_sent?: string | null
          neighborhood?: string | null
          phone_number: string
          subscribed_at?: string | null
        }
        Update: {
          id?: string
          is_active?: boolean | null
          last_broadcast_sent?: string | null
          neighborhood?: string | null
          phone_number?: string
          subscribed_at?: string | null
        }
        Relationships: []
      }
      zones: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      category_aliases_view: {
        Row: {
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          created_at: string | null
          id: string | null
          notes: string | null
          old_slug: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      event_artist_match_candidates: {
        Row: {
          artist_id: string | null
          artist_name: string | null
          artist_slug: string | null
          category: string | null
          event_id: string | null
          match_type: string | null
          slug: string | null
          start_date: string | null
          title: string | null
        }
        Relationships: []
      }
      event_artists_view: {
        Row: {
          artist_id: string | null
          artist_image_url: string | null
          artist_meta_description: string | null
          artist_meta_title: string | null
          artist_name: string | null
          artist_slug: string | null
          event_id: string | null
          id: string | null
          role: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "event_artist_match_candidates"
            referencedColumns: ["artist_id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_artist_match_candidates"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_slug_aliases_view"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_artist_coverage_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_graph_health"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_integrity_audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_quality_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_venue_tba_audit"
            referencedColumns: ["id"]
          },
        ]
      }
      event_slug_aliases_view: {
        Row: {
          created_at: string | null
          event_id: string | null
          event_slug: string | null
          event_title: string | null
          id: string | null
          notes: string | null
          old_slug: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      events_artist_coverage_audit: {
        Row: {
          category: string | null
          has_artist_link: boolean | null
          id: string | null
          likely_performer_led_title: boolean | null
          locality: string | null
          slug: string | null
          start_date: string | null
          title: string | null
          venue_name: string | null
        }
        Insert: {
          category?: string | null
          has_artist_link?: never
          id?: string | null
          likely_performer_led_title?: never
          locality?: string | null
          slug?: string | null
          start_date?: string | null
          title?: string | null
          venue_name?: string | null
        }
        Update: {
          category?: string | null
          has_artist_link?: never
          id?: string | null
          likely_performer_led_title?: never
          locality?: string | null
          slug?: string | null
          start_date?: string | null
          title?: string | null
          venue_name?: string | null
        }
        Relationships: []
      }
      events_graph_health: {
        Row: {
          editorial_status: string | null
          id: string | null
          index_status: Database["public"]["Enums"]["index_status_enum"] | null
          locality: string | null
          locality_id: string | null
          missing_locality_link: boolean | null
          missing_venue_link: boolean | null
          slug: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["status_enum"] | null
          title: string | null
          venue_id: string | null
          venue_name: string | null
        }
        Insert: {
          editorial_status?: string | null
          id?: string | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          locality?: string | null
          locality_id?: string | null
          missing_locality_link?: never
          missing_venue_link?: never
          slug?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          title?: string | null
          venue_id?: string | null
          venue_name?: string | null
        }
        Update: {
          editorial_status?: string | null
          id?: string | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          locality?: string | null
          locality_id?: string | null
          missing_locality_link?: never
          missing_venue_link?: never
          slug?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          title?: string | null
          venue_id?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_locality_fk"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_locality_fk"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_id"]
          },
          {
            foreignKeyName: "events_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      events_integrity_audit: {
        Row: {
          category: string | null
          editorial_status: string | null
          generic_city_level_locality: boolean | null
          has_core_graph_links: boolean | null
          id: string | null
          index_status: Database["public"]["Enums"]["index_status_enum"] | null
          locality: string | null
          locality_id: string | null
          missing_locality_link: boolean | null
          missing_slug: boolean | null
          missing_venue_link: boolean | null
          organizer_name: string | null
          slug: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["status_enum"] | null
          title: string | null
          venue_id: string | null
          venue_name: string | null
          venue_tba_row: boolean | null
        }
        Insert: {
          category?: string | null
          editorial_status?: string | null
          generic_city_level_locality?: never
          has_core_graph_links?: never
          id?: string | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          locality?: string | null
          locality_id?: string | null
          missing_locality_link?: never
          missing_slug?: never
          missing_venue_link?: never
          organizer_name?: string | null
          slug?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          title?: string | null
          venue_id?: string | null
          venue_name?: string | null
          venue_tba_row?: never
        }
        Update: {
          category?: string | null
          editorial_status?: string | null
          generic_city_level_locality?: never
          has_core_graph_links?: never
          id?: string | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          locality?: string | null
          locality_id?: string | null
          missing_locality_link?: never
          missing_slug?: never
          missing_venue_link?: never
          organizer_name?: string | null
          slug?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          title?: string | null
          venue_id?: string | null
          venue_name?: string | null
          venue_tba_row?: never
        }
        Relationships: [
          {
            foreignKeyName: "events_locality_fk"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_locality_fk"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_id"]
          },
          {
            foreignKeyName: "events_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      events_quality_score: {
        Row: {
          category: string | null
          id: string | null
          locality_id: string | null
          quality_score: number | null
          slug: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["status_enum"] | null
          title: string | null
          venue_id: string | null
        }
        Insert: {
          category?: string | null
          id?: string | null
          locality_id?: string | null
          quality_score?: never
          slug?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          title?: string | null
          venue_id?: string | null
        }
        Update: {
          category?: string | null
          id?: string | null
          locality_id?: string | null
          quality_score?: never
          slug?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          title?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_locality_fk"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_locality_fk"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_id"]
          },
          {
            foreignKeyName: "events_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      events_venue_tba_audit: {
        Row: {
          category: string | null
          has_artist_link: boolean | null
          id: string | null
          lifecycle_bucket: string | null
          locality: string | null
          locality_id: string | null
          organizer_name: string | null
          slug: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["status_enum"] | null
          title: string | null
        }
        Insert: {
          category?: string | null
          has_artist_link?: never
          id?: string | null
          lifecycle_bucket?: never
          locality?: string | null
          locality_id?: string | null
          organizer_name?: string | null
          slug?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          title?: string | null
        }
        Update: {
          category?: string | null
          has_artist_link?: never
          id?: string | null
          lifecycle_bucket?: never
          locality?: string | null
          locality_id?: string | null
          organizer_name?: string | null
          slug?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_locality_fk"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_locality_fk"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_id"]
          },
          {
            foreignKeyName: "events_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "locality_aliases_view"
            referencedColumns: ["locality_id"]
          },
        ]
      }
      locality_aliases_view: {
        Row: {
          created_at: string | null
          id: string | null
          locality_id: string | null
          locality_name: string | null
          locality_slug: string | null
          notes: string | null
          old_slug: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      merchant_performance: {
        Row: {
          active_deals: number | null
          article_mentions: number | null
          avg_rating: number | null
          id: string | null
          last_verified: string | null
          locality: string | null
          name: string | null
          slug: string | null
          total_reviews: number | null
          total_views: number | null
          verification_status: string | null
          weekly_views: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      compute_indexability: {
        Args: {
          meta_title: string
          override: boolean
          quality_score: number
          seo_blurb: string
        }
        Returns: boolean
      }
      generate_meta_description: {
        Args: { entity_type: string; name: string }
        Returns: string
      }
      generate_meta_title: {
        Args: { entity_type: string; name: string }
        Returns: string
      }
      generate_unique_slug: {
        Args: { base_slug: string; column_name: string; table_name: string }
        Returns: string
      }
      get_article_by_slug: { Args: { article_slug: string }; Returns: Json }
      get_canonical_url: {
        Args: { entity_type: string; slug: string }
        Returns: string
      }
      get_category_page:
        | { Args: { p_slug: string }; Returns: Json }
        | { Args: { params: Json }; Returns: Json }
      get_event_for_schema: {
        Args: { event_slug_param: string }
        Returns: Json
      }
      get_event_page: { Args: { p_slug: string }; Returns: Json }
      get_event_series_context: {
        Args: { p_event_id: string; p_limit?: number }
        Returns: {
          id: string
          locality: string
          relation_type: string
          slug: string
          start_date: string
          title: string
          venue_name: string
        }[]
      }
      get_events_by_category_locality: {
        Args: { p_category_slug: string; p_locality_slug: string }
        Returns: Json
      }
      get_homepage_section: { Args: { p_section_key: string }; Returns: Json }
      get_locality_page: { Args: { p_slug: string }; Returns: Json }
      get_nearby_locality_ids: {
        Args: { p_limit?: number; p_locality_id: string }
        Returns: {
          distance_km: number
          locality_id: string
          locality_name: string
          locality_slug: string
        }[]
      }
      get_nearest_locality: {
        Args: { p_lat: number; p_lng: number; p_max_km?: number }
        Returns: {
          distance_km: number
          locality_id: string
          locality_name: string
          locality_slug: string
        }[]
      }
      get_organizer_upcoming_events: {
        Args: { p_limit?: number; p_organizer_slug: string }
        Returns: {
          cover_image_url: string
          id: string
          is_free: boolean
          locality_name: string
          price_min: number
          slug: string
          start_date: string
          title: string
          venue_name: string
        }[]
      }
      get_performer_upcoming_events: {
        Args: { performer_id_param: string }
        Returns: number
      }
      get_redirect_url: { Args: { old_path: string }; Returns: string }
      get_series_events: {
        Args: { p_limit?: number; p_offset?: number; p_series_slug: string }
        Returns: {
          cover_image_url: string
          end_date: string
          id: string
          is_upcoming: boolean
          locality_name: string
          slug: string
          start_date: string
          title: string
          venue_name: string
        }[]
      }
      get_similar_upcoming_events: {
        Args: { p_event_id: string; p_limit?: number }
        Returns: {
          category: string
          cover_image_url: string
          end_date: string
          id: string
          image_url: string
          is_free: boolean
          locality: string
          organizer_name: string
          price_max: number
          price_min: number
          short_description: string
          similarity_score: number
          slug: string
          start_date: string
          status: string
          title: string
          venue_name: string
        }[]
      }
      get_sitemap_categories: {
        Args: never
        Returns: {
          lastmod: string
          loc: string
        }[]
      }
      get_sitemap_deals: {
        Args: never
        Returns: {
          lastmod: string
          loc: string
        }[]
      }
      get_sitemap_events: {
        Args: never
        Returns: {
          lastmod: string
          loc: string
        }[]
      }
      get_sitemap_index: {
        Args: never
        Returns: {
          lastmod: string
          loc: string
        }[]
      }
      get_sitemap_localities: {
        Args: never
        Returns: {
          lastmod: string
          loc: string
        }[]
      }
      get_today_events: {
        Args: { locality_slug_param: string }
        Returns: {
          id: string
          is_free: boolean
          slug: string
          start_date: string
          ticket_price: number
          title: string
          venue_name: string
        }[]
      }
      get_upcoming_events_count: {
        Args: { locality_slug_param: string }
        Returns: number
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
      get_venue_page: { Args: { p_slug: string }; Returns: Json }
      handle_missing_route: { Args: { request_path: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_article_view_count: {
        Args: { p_article_id: string }
        Returns: undefined
      }
      increment_event_view_count: {
        Args: { p_event_id: string }
        Returns: undefined
      }
      normalize_event_locality_ids: {
        Args: never
        Returns: {
          remaining_null: number
          updated_from_alias: number
          updated_from_slug: number
          updated_from_venue: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      slugify: { Args: { input: string }; Returns: string }
    }
    Enums: {
      app_role:
        | "user"
        | "pro_user"
        | "merchant"
        | "listing_agent"
        | "listing_supervisor"
        | "admin"
        | "real_estate_broker"
        | "event_organizer"
      article_status: "draft" | "published" | "archived"
      index_status_enum: "index" | "noindex"
      status_enum:
        | "draft"
        | "published"
        | "archived"
        | "upcoming"
        | "ongoing"
        | "past"
        | "cancelled"
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
        "real_estate_broker",
        "event_organizer",
      ],
      article_status: ["draft", "published", "archived"],
      index_status_enum: ["index", "noindex"],
      status_enum: [
        "draft",
        "published",
        "archived",
        "upcoming",
        "ongoing",
        "past",
        "cancelled",
      ],
    },
  },
} as const
