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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          boost_until: string | null
          data: Json
          expires_at: string
          id: string
          posted_at: string
          updated_at: string
        }
        Insert: {
          boost_until?: string | null
          data: Json
          expires_at: string
          id: string
          posted_at: string
          updated_at?: string
        }
        Update: {
          boost_until?: string | null
          data?: Json
          expires_at?: string
          id?: string
          posted_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_secrets: {
        Row: {
          hash: string
          name: string
        }
        Insert: {
          hash: string
          name: string
        }
        Update: {
          hash?: string
          name?: string
        }
        Relationships: []
      }
      launch_claims: {
        Row: {
          ad_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          ad_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          ad_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          ad_id: string | null
          created_at: string
          dedupe_key: string
          id: string
          kind: string
          message: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          ad_id?: string | null
          created_at?: string
          dedupe_key: string
          id?: string
          kind: string
          message: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          ad_id?: string | null
          created_at?: string
          dedupe_key?: string
          id?: string
          kind?: string
          message?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          free_week_credits: number
          id: string
          referral_code: string
          referral_rewarded: boolean
          referred_by: string | null
        }
        Insert: {
          created_at?: string
          free_week_credits?: number
          id: string
          referral_code?: string
          referral_rewarded?: boolean
          referred_by?: string | null
        }
        Update: {
          created_at?: string
          free_week_credits?: number
          id?: string
          referral_code?: string
          referral_rewarded?: boolean
          referred_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      used_checkouts: {
        Row: {
          created_at: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_ads: {
        Row: {
          ad_id: string
          boost_until: string | null
          created_at: string
          expires_at: string
          plan: string
          title: string
          user_id: string
        }
        Insert: {
          ad_id: string
          boost_until?: string | null
          created_at?: string
          expires_at: string
          plan: string
          title?: string
          user_id: string
        }
        Update: {
          ad_id?: string
          boost_until?: string | null
          created_at?: string
          expires_at?: string
          plan?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_launch_spot: {
        Args: { _ad_id: string; _limit: number; _user_id: string }
        Returns: boolean
      }
      claim_referral: { Args: { _code: string }; Returns: boolean }
      launch_status: {
        Args: { _limit: number }
        Returns: {
          already_claimed: boolean
          spots_left: number
        }[]
      }
      publish_ad: {
        Args: {
          _boost_until: string
          _data: Json
          _expires_at: string
          _id: string
          _posted_at: string
          _secret: string
        }
        Returns: boolean
      }
      redeem_free_week: {
        Args: {
          _ad_id: string
          _boost_until: string
          _expires_at: string
          _launch_limit: number
          _title: string
        }
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
    Enums: {},
  },
} as const
