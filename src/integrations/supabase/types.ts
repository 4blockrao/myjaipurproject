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
          editorial_status: string | null
          h1_override: string | null
          id: string
          index_status: Database["public"]["Enums"]["index_status_enum"] | null
          is_indexable: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          parent_slug: string | null
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
          is_indexable?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          parent_slug?: string | null
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
          is_indexable?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          parent_slug?: string | null
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
          archive_status: string | null
          archive_summary: string | null
          audience_tags: string[] | null
          canonical_url: string | null
          category: string | null
          confidence_score: number | null
          cover_image: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
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
          is_featured: boolean | null
          is_free: boolean | null
          is_indexable: boolean | null
          is_online: boolean | null
          last_verified_at: string | null
          locality: string | null
          locality_id: string | null
          meta_description: string | null
          meta_title: string | null
          next_edition_id: string | null
          online_url: string | null
          organizer_name: string | null
          photo_count: number | null
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
          series_key: string | null
          short_description: string | null
          slug: string
          source_label: string | null
          source_url: string | null
          start_date: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["status_enum"] | null
          tags: string[] | null
          ticket_price: number | null
          title: string
          updated_at: string | null
          updated_by: string | null
          venue_address: string | null
          venue_id: string | null
          venue_name: string | null
        }
        Insert: {
          archive_status?: string | null
          archive_summary?: string | null
          audience_tags?: string[] | null
          canonical_url?: string | null
          category?: string | null
          confidence_score?: number | null
          cover_image?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
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
          is_featured?: boolean | null
          is_free?: boolean | null
          is_indexable?: boolean | null
          is_online?: boolean | null
          last_verified_at?: string | null
          locality?: string | null
          locality_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          next_edition_id?: string | null
          online_url?: string | null
          organizer_name?: string | null
          photo_count?: number | null
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
          series_key?: string | null
          short_description?: string | null
          slug: string
          source_label?: string | null
          source_url?: string | null
          start_date?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          tags?: string[] | null
          ticket_price?: number | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
          venue_address?: string | null
          venue_id?: string | null
          venue_name?: string | null
        }
        Update: {
          archive_status?: string | null
          archive_summary?: string | null
          audience_tags?: string[] | null
          canonical_url?: string | null
          category?: string | null
          confidence_score?: number | null
          cover_image?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
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
          is_featured?: boolean | null
          is_free?: boolean | null
          is_indexable?: boolean | null
          is_online?: boolean | null
          last_verified_at?: string | null
          locality?: string | null
          locality_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          next_edition_id?: string | null
          online_url?: string | null
          organizer_name?: string | null
          photo_count?: number | null
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
          series_key?: string | null
          short_description?: string | null
          slug?: string
          source_label?: string | null
          source_url?: string | null
          start_date?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          tags?: string[] | null
          ticket_price?: number | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          venue_address?: string | null
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
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
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
          best_for: string[] | null
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
          is_placeholder: boolean
          known_for: string[] | null
          locality_type: string | null
          meta_description: string | null
          meta_title: string | null
          municipality: string | null
          name: string
          name_hi: string | null
          nearby_localities: string[] | null
          parent_locality_slug: string | null
          pincode: string | null
          police_station: string | null
          quality_score: number | null
          related_localities: string[] | null
          schema_json: Json | null
          seo_blurb: string | null
          seo_content: string | null
          should_index: boolean | null
          slug: string
          source_label: string | null
          status: Database["public"]["Enums"]["status_enum"] | null
          updated_at: string | null
          vibe_tags: string[] | null
          zone: string | null
          zone_id: string | null
        }
        Insert: {
          best_for?: string[] | null
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
          is_placeholder?: boolean
          known_for?: string[] | null
          locality_type?: string | null
          meta_description?: string | null
          meta_title?: string | null
          municipality?: string | null
          name: string
          name_hi?: string | null
          nearby_localities?: string[] | null
          parent_locality_slug?: string | null
          pincode?: string | null
          police_station?: string | null
          quality_score?: number | null
          related_localities?: string[] | null
          schema_json?: Json | null
          seo_blurb?: string | null
          seo_content?: string | null
          should_index?: boolean | null
          slug: string
          source_label?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          updated_at?: string | null
          vibe_tags?: string[] | null
          zone?: string | null
          zone_id?: string | null
        }
        Update: {
          best_for?: string[] | null
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
          is_placeholder?: boolean
          known_for?: string[] | null
          locality_type?: string | null
          meta_description?: string | null
          meta_title?: string | null
          municipality?: string | null
          name?: string
          name_hi?: string | null
          nearby_localities?: string[] | null
          parent_locality_slug?: string | null
          pincode?: string | null
          police_station?: string | null
          quality_score?: number | null
          related_localities?: string[] | null
          schema_json?: Json | null
          seo_blurb?: string | null
          seo_content?: string | null
          should_index?: boolean | null
          slug?: string
          source_label?: string | null
          status?: Database["public"]["Enums"]["status_enum"] | null
          updated_at?: string | null
          vibe_tags?: string[] | null
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
      get_user_roles: {
        Args: { _user_id: string }
        Returns: {
          assigned_at: string
          metadata: Json
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_venue_page: { Args: { p_slug: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
