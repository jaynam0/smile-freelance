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
      bookings: {
        Row: {
          client_id: string
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at: string
          description: string | null
          freelancer_id: string
          hourly_rate: number | null
          id: string
          job_post_id: string | null
          price: number | null
          scheduled_for: string | null
          status: Database["public"]["Enums"]["booking_status"]
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          description?: string | null
          freelancer_id: string
          hourly_rate?: number | null
          id?: string
          job_post_id?: string | null
          price?: number | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          description?: string | null
          freelancer_id?: string
          hourly_rate?: number | null
          id?: string
          job_post_id?: string | null
          price?: number | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_posts: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          budget_type: Database["public"]["Enums"]["budget_type"]
          category: string | null
          client_id: string
          created_at: string
          description: string
          id: string
          skills: string[] | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: Database["public"]["Enums"]["budget_type"]
          category?: string | null
          client_id: string
          created_at?: string
          description: string
          id?: string
          skills?: string[] | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: Database["public"]["Enums"]["budget_type"]
          category?: string | null
          client_id?: string
          created_at?: string
          description?: string
          id?: string
          skills?: string[] | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_posts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          booking_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          booking_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          booking_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          due_date: string | null
          id: string
          order_index: number
          status: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          order_index?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          order_index?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          category: string | null
          created_at: string
          full_name: string | null
          headline: string | null
          hourly_rate: number | null
          id: string
          portfolio_url: string | null
          resume_url: string | null
          skills: string[] | null
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          category?: string | null
          created_at?: string
          full_name?: string | null
          headline?: string | null
          hourly_rate?: number | null
          id: string
          portfolio_url?: string | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          category?: string | null
          created_at?: string
          full_name?: string | null
          headline?: string | null
          hourly_rate?: number | null
          id?: string
          portfolio_url?: string | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          bid_amount: number
          cover_letter: string
          created_at: string
          estimated_days: number | null
          freelancer_id: string
          id: string
          job_post_id: string
          status: Database["public"]["Enums"]["proposal_status"]
          updated_at: string
        }
        Insert: {
          bid_amount: number
          cover_letter: string
          created_at?: string
          estimated_days?: number | null
          freelancer_id: string
          id?: string
          job_post_id: string
          status?: Database["public"]["Enums"]["proposal_status"]
          updated_at?: string
        }
        Update: {
          bid_amount?: number
          cover_letter?: string
          created_at?: string
          estimated_days?: number | null
          freelancer_id?: string
          id?: string
          job_post_id?: string
          status?: Database["public"]["Enums"]["proposal_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_job_post_id_fkey"
            columns: ["job_post_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_freelancers: {
        Row: {
          client_id: string
          created_at: string
          freelancer_id: string
          id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          freelancer_id: string
          id?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          freelancer_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_freelancers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_freelancers_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      time_logs: {
        Row: {
          booking_id: string
          created_at: string
          freelancer_id: string
          hours: number
          id: string
          logged_for: string
          notes: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          freelancer_id: string
          hours: number
          id?: string
          logged_for?: string
          notes?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          freelancer_id?: string
          hours?: number
          id?: string
          logged_for?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_logs_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_booking_participant: {
        Args: { _booking_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "client" | "freelancer" | "admin"
      booking_status:
        | "pending"
        | "accepted"
        | "declined"
        | "completed"
        | "cancelled"
      budget_type: "fixed" | "hourly"
      contract_type: "fixed" | "hourly"
      job_status: "open" | "closed" | "archived"
      milestone_status: "pending" | "funded" | "released" | "cancelled"
      proposal_status: "pending" | "accepted" | "rejected" | "withdrawn"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["client", "freelancer", "admin"],
      booking_status: [
        "pending",
        "accepted",
        "declined",
        "completed",
        "cancelled",
      ],
      budget_type: ["fixed", "hourly"],
      contract_type: ["fixed", "hourly"],
      job_status: ["open", "closed", "archived"],
      milestone_status: ["pending", "funded", "released", "cancelled"],
      proposal_status: ["pending", "accepted", "rejected", "withdrawn"],
    },
  },
} as const
