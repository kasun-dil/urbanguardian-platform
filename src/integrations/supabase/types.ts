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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      donation_categories: {
        Row: {
          center_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          center_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          center_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "donation_categories_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "donation_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_center_comments: {
        Row: {
          author_name: string
          center_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          author_name?: string
          center_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          author_name?: string
          center_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_center_comments_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "donation_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_center_likes: {
        Row: {
          center_id: string
          created_at: string
          guest_id: string | null
          id: string
          is_like: boolean
          user_id: string | null
        }
        Insert: {
          center_id: string
          created_at?: string
          guest_id?: string | null
          id?: string
          is_like?: boolean
          user_id?: string | null
        }
        Update: {
          center_id?: string
          created_at?: string
          guest_id?: string | null
          id?: string
          is_like?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_center_likes_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "donation_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_centers: {
        Row: {
          comments_count: number
          created_at: string
          description: string | null
          dislikes_count: number
          id: string
          is_admin_verified: boolean
          is_government_verified: boolean
          latitude: number
          likes_count: number
          location: string
          longitude: number
          name: string
          phone_numbers: string[]
          status: Database["public"]["Enums"]["donation_center_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          created_at?: string
          description?: string | null
          dislikes_count?: number
          id?: string
          is_admin_verified?: boolean
          is_government_verified?: boolean
          latitude: number
          likes_count?: number
          location: string
          longitude: number
          name: string
          phone_numbers?: string[]
          status?: Database["public"]["Enums"]["donation_center_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          created_at?: string
          description?: string | null
          dislikes_count?: number
          id?: string
          is_admin_verified?: boolean
          is_government_verified?: boolean
          latitude?: number
          likes_count?: number
          location?: string
          longitude?: number
          name?: string
          phone_numbers?: string[]
          status?: Database["public"]["Enums"]["donation_center_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      donation_products: {
        Row: {
          category_id: string | null
          center_id: string
          created_at: string
          current_count: number
          id: string
          max_capacity: number
          name: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          center_id: string
          created_at?: string
          current_count?: number
          id?: string
          max_capacity?: number
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          center_id?: string
          created_at?: string
          current_count?: number
          id?: string
          max_capacity?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donation_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "donation_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_products_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "donation_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          incident_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          author_name?: string
          content: string
          created_at?: string
          id?: string
          incident_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          incident_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_comments_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_likes: {
        Row: {
          created_at: string
          guest_id: string | null
          id: string
          incident_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          guest_id?: string | null
          id?: string
          incident_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          guest_id?: string | null
          id?: string
          incident_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_likes_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          comments_count: number
          created_at: string
          description: string | null
          id: string
          latitude: number
          likes_count: number
          location: string
          longitude: number
          reported_by: string
          severity: Database["public"]["Enums"]["incident_severity"]
          status: Database["public"]["Enums"]["incident_status"]
          title: string
          type: Database["public"]["Enums"]["incident_type"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          comments_count?: number
          created_at?: string
          description?: string | null
          id?: string
          latitude: number
          likes_count?: number
          location: string
          longitude: number
          reported_by?: string
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          title: string
          type: Database["public"]["Enums"]["incident_type"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          comments_count?: number
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number
          likes_count?: number
          location?: string
          longitude?: number
          reported_by?: string
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          title?: string
          type?: Database["public"]["Enums"]["incident_type"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      official_publications: {
        Row: {
          alert_type: Database["public"]["Enums"]["publication_alert_type"]
          comments_count: number
          created_at: string
          department: string
          description: string
          dislikes_count: number
          forecast_info: string | null
          id: string
          likes_count: number
          recommendations: string[]
          severity: Database["public"]["Enums"]["publication_severity"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["publication_alert_type"]
          comments_count?: number
          created_at?: string
          department: string
          description: string
          dislikes_count?: number
          forecast_info?: string | null
          id?: string
          likes_count?: number
          recommendations?: string[]
          severity?: Database["public"]["Enums"]["publication_severity"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["publication_alert_type"]
          comments_count?: number
          created_at?: string
          department?: string
          description?: string
          dislikes_count?: number
          forecast_info?: string | null
          id?: string
          likes_count?: number
          recommendations?: string[]
          severity?: Database["public"]["Enums"]["publication_severity"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      preparedness_guides: {
        Row: {
          category: Database["public"]["Enums"]["guide_category"]
          created_at: string
          description: string
          id: string
          relevance: Database["public"]["Enums"]["guide_relevance"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["guide_category"]
          created_at?: string
          description: string
          id?: string
          relevance?: Database["public"]["Enums"]["guide_relevance"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["guide_category"]
          created_at?: string
          description?: string
          id?: string
          relevance?: Database["public"]["Enums"]["guide_relevance"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      publication_comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          publication_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          author_name?: string
          content: string
          created_at?: string
          id?: string
          publication_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          publication_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publication_comments_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "official_publications"
            referencedColumns: ["id"]
          },
        ]
      }
      publication_likes: {
        Row: {
          created_at: string
          guest_id: string | null
          id: string
          is_like: boolean
          publication_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          guest_id?: string | null
          id?: string
          is_like?: boolean
          publication_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          guest_id?: string | null
          id?: string
          is_like?: boolean
          publication_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publication_likes_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "official_publications"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admins: {
        Row: {
          created_at: string
          email: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_total_user_count: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "citizen" | "government" | "organization" | "super_admin"
      donation_center_status: "active" | "inactive"
      guide_category:
        | "natural_disasters"
        | "general_preparedness"
        | "emergency_response"
        | "health_safety"
        | "infrastructure"
        | "community_resilience"
      guide_relevance: "low" | "medium" | "high"
      incident_severity: "low" | "moderate" | "high" | "critical"
      incident_status: "active" | "resolved" | "investigating"
      incident_type:
        | "flooding"
        | "blocked_road"
        | "fallen_tree"
        | "hazard"
        | "other"
      publication_alert_type:
        | "weather_alert"
        | "environmental_alert"
        | "health_alert"
        | "safety_alert"
        | "infrastructure_alert"
        | "general_announcement"
      publication_severity: "low" | "moderate" | "high" | "critical"
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
      app_role: ["citizen", "government", "organization", "super_admin"],
      donation_center_status: ["active", "inactive"],
      guide_category: [
        "natural_disasters",
        "general_preparedness",
        "emergency_response",
        "health_safety",
        "infrastructure",
        "community_resilience",
      ],
      guide_relevance: ["low", "medium", "high"],
      incident_severity: ["low", "moderate", "high", "critical"],
      incident_status: ["active", "resolved", "investigating"],
      incident_type: [
        "flooding",
        "blocked_road",
        "fallen_tree",
        "hazard",
        "other",
      ],
      publication_alert_type: [
        "weather_alert",
        "environmental_alert",
        "health_alert",
        "safety_alert",
        "infrastructure_alert",
        "general_announcement",
      ],
      publication_severity: ["low", "moderate", "high", "critical"],
    },
  },
} as const
