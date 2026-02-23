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
      exercises: {
        Row: {
          created_at: string
          duration_seconds: number
          id: string
          instruction_text: string | null
          is_bilateral: boolean | null
          name: string
          program_id: string
          sequence_order: number
        }
        Insert: {
          created_at?: string
          duration_seconds: number
          id?: string
          instruction_text?: string | null
          is_bilateral?: boolean | null
          name: string
          program_id: string
          sequence_order: number
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          id?: string
          instruction_text?: string | null
          is_bilateral?: boolean | null
          name?: string
          program_id?: string
          sequence_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "exercises_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_challenge: string | null
          daily_routine: string | null
          display_name: string | null
          equipment: string[] | null
          fitness_level: string | null
          id: string
          main_goal: string | null
          onboarding_completed: boolean | null
          pain_duration: string | null
          pain_score: number | null
          primary_area: string | null
          session_duration: string | null
          updated_at: string
          user_id: string
          weekly_days: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_challenge?: string | null
          daily_routine?: string | null
          display_name?: string | null
          equipment?: string[] | null
          fitness_level?: string | null
          id?: string
          main_goal?: string | null
          onboarding_completed?: boolean | null
          pain_duration?: string | null
          pain_score?: number | null
          primary_area?: string | null
          session_duration?: string | null
          updated_at?: string
          user_id: string
          weekly_days?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_challenge?: string | null
          daily_routine?: string | null
          display_name?: string | null
          equipment?: string[] | null
          fitness_level?: string | null
          id?: string
          main_goal?: string | null
          onboarding_completed?: boolean | null
          pain_duration?: string | null
          pain_score?: number | null
          primary_area?: string | null
          session_duration?: string | null
          updated_at?: string
          user_id?: string
          weekly_days?: number | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          category: string
          category_type: string
          created_at: string
          description: string | null
          difficulty: string
          duration_minutes: number
          exercise_count: number
          icon: string | null
          id: string
          name: string
          sort_order: number | null
          target_area: string
        }
        Insert: {
          category: string
          category_type?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_minutes: number
          exercise_count?: number
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
          target_area: string
        }
        Update: {
          category?: string
          category_type?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          exercise_count?: number
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          target_area?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_at: string
          exercise_id: string | null
          id: string
          points_earned: number | null
          program_id: string
          session_duration_seconds: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          exercise_id?: string | null
          id?: string
          points_earned?: number | null
          program_id: string
          session_duration_seconds?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          exercise_id?: string | null
          id?: string
          points_earned?: number | null
          program_id?: string
          session_duration_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      welly_points: {
        Row: {
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_owner: { Args: { _user_id: string }; Returns: boolean }
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
    Enums: {},
  },
} as const
