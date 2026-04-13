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
      artists: {
        Row: {
          bio: string | null
          canonical_url: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          editorial_status: string | null
          h1_override: string | null
          id: string
          image_url: string | null
          index_status: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          published_at: string | null
          seo_blurb: string | null
          seo_content: string | null
          slug: string
          source_label: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["status_enum"] | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bio?: string | null
          canonical_url?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          editorial_status?: string | null
          h1_override?: string | null
          id?: string
          image_url?: string | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          published_at?: string | null
          seo_blurb?: string | null
          seo_content?: string | null
          slug: string
          source_label?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bio?: string | null
          canonical_url?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          editorial_status?: string | null
          h1_override?: string | null
          id?: string
          image_url?: string | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          published_at?: string | null
          seo_blurb?: string | null
          seo_content?: string | null
          slug?: string
          source_label?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          canonical_url: string | null
          created_at: string | null
          description: string | null
          h1_override: string | null
          id: string
          index_status: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
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
          h1_override?: string | null
          id?: string
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
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
          h1_override?: string | null
          id?: string
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
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
      deals: {
        Row: {
          canonical_url: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          deal_type: string | null
          description: string | null
          editorial_status: string | null
          id: string
          image_url: string | null
          is_indexable: boolean | null
          locality_id: string | null
          merchant_id: string | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          source_label: string | null
          source_url: string | null
          status: string | null
          title: string
          updated_at: string
          updated_by: string | null
          valid_until: string | null
        }
        Insert: {
          canonical_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          deal_type?: string | null
          description?: string | null
          editorial_status?: string | null
          id?: string
          image_url?: string | null
          is_indexable?: boolean | null
          locality_id?: string | null
          merchant_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          source_label?: string | null
          source_url?: string | null
          status?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
          valid_until?: string | null
        }
        Update: {
          canonical_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          deal_type?: string | null
          description?: string | null
          editorial_status?: string | null
          id?: string
          image_url?: string | null
          is_indexable?: boolean | null
          locality_id?: string | null
          merchant_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          source_label?: string | null
          source_url?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
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
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
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
        ]
      }
      events: {
        Row: {
          canonical_url: string | null
          cover_image: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          editorial_status: string | null
          end_date: string | null
          end_time: string | null
          faq_json: Json | null
          h1_override: string | null
          id: string
          image_url: string | null
          index_status: Database["public"]["Enums"]["index_status_enum"] | null
          is_free: boolean | null
          is_indexable: boolean | null
          is_online: boolean | null
          locality_id: string | null
          meta_description: string | null
          meta_title: string | null
          online_url: string | null
          price_max: number | null
          price_min: number | null
          published_at: string | null
          schema_json: Json | null
          seo_blurb: string | null
          seo_content: string | null
          short_description: string | null
          slug: string
          source_label: string | null
          source_url: string | null
          start_date: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["status_enum"] | null
          ticket_price: number | null
          title: string
          updated_at: string | null
          updated_by: string | null
          venue_id: string | null
        }
        Insert: {
          canonical_url?: string | null
          cover_image?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          editorial_status?: string | null
          end_date?: string | null
          end_time?: string | null
          faq_json?: Json | null
          h1_override?: string | null
          id?: string
          image_url?: string | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_free?: boolean | null
          is_indexable?: boolean | null
          is_online?: boolean | null
          locality_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          online_url?: string | null
          price_max?: number | null
          price_min?: number | null
          published_at?: string | null
          schema_json?: Json | null
          seo_blurb?: string | null
          seo_content?: string | null
          short_description?: string | null
          slug: string
          source_label?: string | null
          source_url?: string | null
          start_date?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          ticket_price?: number | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
          venue_id?: string | null
        }
        Update: {
          canonical_url?: string | null
          cover_image?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          editorial_status?: string | null
          end_date?: string | null
          end_time?: string | null
          faq_json?: Json | null
          h1_override?: string | null
          id?: string
          image_url?: string | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_free?: boolean | null
          is_indexable?: boolean | null
          is_online?: boolean | null
          locality_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          online_url?: string | null
          price_max?: number | null
          price_min?: number | null
          published_at?: string | null
          schema_json?: Json | null
          seo_blurb?: string | null
          seo_content?: string | null
          short_description?: string | null
          slug?: string
          source_label?: string | null
          source_url?: string | null
          start_date?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          ticket_price?: number | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          venue_id?: string | null
        }
        Relationships: [
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
      localities: {
        Row: {
          canonical_url: string | null
          created_at: string | null
          description: string | null
          faq_json: Json | null
          geo_lat: number | null
          geo_lng: number | null
          h1_override: string | null
          id: string
          index_override: boolean | null
          index_status: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          quality_score: number | null
          schema_json: Json | null
          seo_blurb: string | null
          seo_content: string | null
          should_index: boolean | null
          slug: string
          status: Database["public"]["Enums"]["status_enum"] | null
          updated_at: string | null
          zone: string | null
          zone_id: string | null
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string | null
          description?: string | null
          faq_json?: Json | null
          geo_lat?: number | null
          geo_lng?: number | null
          h1_override?: string | null
          id?: string
          index_override?: boolean | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          quality_score?: number | null
          schema_json?: Json | null
          seo_blurb?: string | null
          seo_content?: string | null
          should_index?: boolean | null
          slug: string
          status?: Database["public"]["Enums"]["status_enum"] | null
          updated_at?: string | null
          zone?: string | null
          zone_id?: string | null
        }
        Update: {
          canonical_url?: string | null
          created_at?: string | null
          description?: string | null
          faq_json?: Json | null
          geo_lat?: number | null
          geo_lng?: number | null
          h1_override?: string | null
          id?: string
          index_override?: boolean | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          quality_score?: number | null
          schema_json?: Json | null
          seo_blurb?: string | null
          seo_content?: string | null
          should_index?: boolean | null
          slug?: string
          status?: Database["public"]["Enums"]["status_enum"] | null
          updated_at?: string | null
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
          created_at: string | null
          id: string
          locality_id: string | null
          notes: string | null
          old_slug: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          locality_id?: string | null
          notes?: string | null
          old_slug?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          locality_id?: string | null
          notes?: string | null
          old_slug?: string | null
          updated_at?: string | null
        }
        Relationships: [
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
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          canonical_url: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          editorial_status: string | null
          id: string
          image_url: string | null
          is_indexable: boolean | null
          locality_id: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          published_at: string | null
          slug: string
          source_label: string | null
          source_url: string | null
          status: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          canonical_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          editorial_status?: string | null
          id?: string
          image_url?: string | null
          is_indexable?: boolean | null
          locality_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          published_at?: string | null
          slug: string
          source_label?: string | null
          source_url?: string | null
          status?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          canonical_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          editorial_status?: string | null
          id?: string
          image_url?: string | null
          is_indexable?: boolean | null
          locality_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          published_at?: string | null
          slug?: string
          source_label?: string | null
          source_url?: string | null
          status?: string | null
          updated_at?: string
          updated_by?: string | null
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
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
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
      venues: {
        Row: {
          address: string | null
          canonical_url: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          editorial_status: string | null
          geo_lat: number | null
          geo_lng: number | null
          h1_override: string | null
          id: string
          image_url: string | null
          index_status: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable: boolean | null
          locality_id: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          published_at: string | null
          schema_json: Json | null
          seo_blurb: string | null
          seo_content: string | null
          slug: string
          source_label: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["status_enum"] | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          canonical_url?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          editorial_status?: string | null
          geo_lat?: number | null
          geo_lng?: number | null
          h1_override?: string | null
          id?: string
          image_url?: string | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable?: boolean | null
          locality_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          published_at?: string | null
          schema_json?: Json | null
          seo_blurb?: string | null
          seo_content?: string | null
          slug: string
          source_label?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          canonical_url?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          editorial_status?: string | null
          geo_lat?: number | null
          geo_lng?: number | null
          h1_override?: string | null
          id?: string
          image_url?: string | null
          index_status?: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable?: boolean | null
          locality_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          published_at?: string | null
          schema_json?: Json | null
          seo_blurb?: string | null
          seo_content?: string | null
          slug?: string
          source_label?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          updated_at?: string | null
          updated_by?: string | null
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
      get_canonical_url: {
        Args: { entity_type: string; slug: string }
        Returns: string
      }
      get_category_page:
        | { Args: { p_slug: string }; Returns: Json }
        | { Args: { params: Json }; Returns: Json }
      get_event_page: { Args: { p_slug: string }; Returns: Json }
      get_events_by_category_locality: {
        Args: { p_category_slug: string; p_locality_slug: string }
        Returns: Json
      }
      get_locality_page: { Args: { p_slug: string }; Returns: Json }
      get_sitemap_categories: {
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
      get_sitemap_index: { Args: never; Returns: Json }
      get_sitemap_localities: {
        Args: never
        Returns: {
          lastmod: string
          loc: string
        }[]
      }
      get_venue_page: { Args: { p_slug: string }; Returns: Json }
      slugify: { Args: { input: string }; Returns: string }
    }
    Enums: {
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
