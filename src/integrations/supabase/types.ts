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
      access_codes: {
        Row: {
          code: string
          company_name: string
          created_at: string
          current_uses: number
          id: string
          is_active: boolean
          max_uses: number | null
        }
        Insert: {
          code: string
          company_name: string
          created_at?: string
          current_uses?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
        }
        Update: {
          code?: string
          company_name?: string
          created_at?: string
          current_uses?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
        }
        Relationships: []
      }
      canonical_exercises: {
        Row: {
          animation_asset_id: string | null
          animation_spec: Json | null
          animation_status: string | null
          animation_version: number | null
          archetype: string | null
          biomechanical_confidence_score: number | null
          category: string
          common_mistakes: Json | null
          created_at: string
          cues: Json | null
          description: string | null
          error_log: string | null
          force_regen: boolean | null
          id: string
          is_bilateral: boolean | null
          last_generated_at: string | null
          media_spec: Json | null
          name: string
          progressions: string | null
          regressions: string | null
          tags: string[] | null
        }
        Insert: {
          animation_asset_id?: string | null
          animation_spec?: Json | null
          animation_status?: string | null
          animation_version?: number | null
          archetype?: string | null
          biomechanical_confidence_score?: number | null
          category?: string
          common_mistakes?: Json | null
          created_at?: string
          cues?: Json | null
          description?: string | null
          error_log?: string | null
          force_regen?: boolean | null
          id?: string
          is_bilateral?: boolean | null
          last_generated_at?: string | null
          media_spec?: Json | null
          name: string
          progressions?: string | null
          regressions?: string | null
          tags?: string[] | null
        }
        Update: {
          animation_asset_id?: string | null
          animation_spec?: Json | null
          animation_status?: string | null
          animation_version?: number | null
          archetype?: string | null
          biomechanical_confidence_score?: number | null
          category?: string
          common_mistakes?: Json | null
          created_at?: string
          cues?: Json | null
          description?: string | null
          error_log?: string | null
          force_regen?: boolean | null
          id?: string
          is_bilateral?: boolean | null
          last_generated_at?: string | null
          media_spec?: Json | null
          name?: string
          progressions?: string | null
          regressions?: string | null
          tags?: string[] | null
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          completed: boolean
          created_at: string
          id: string
          progress_value: number
          user_id: string
          winner: boolean
        }
        Insert: {
          challenge_id: string
          completed?: boolean
          created_at?: string
          id?: string
          progress_value?: number
          user_id: string
          winner?: boolean
        }
        Update: {
          challenge_id?: string
          completed?: boolean
          created_at?: string
          id?: string
          progress_value?: number
          user_id?: string
          winner?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          company_id: string
          created_at: string
          created_by_user_id: string
          description: string | null
          end_at: string
          id: string
          metric_type: string
          points_award: number
          start_at: string
          status: string
          title: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by_user_id: string
          description?: string | null
          end_at: string
          id?: string
          metric_type?: string
          points_award?: number
          start_at: string
          status?: string
          title: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by_user_id?: string
          description?: string | null
          end_at?: string
          id?: string
          metric_type?: string
          points_award?: number
          start_at?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          accent_color: string | null
          created_at: string
          employee_access_code: string
          id: string
          logo_url: string | null
          name: string
          plan_name: string | null
          plan_status: string | null
          renewal_date: string | null
          seats: number | null
          slug: string
        }
        Insert: {
          accent_color?: string | null
          created_at?: string
          employee_access_code?: string
          id?: string
          logo_url?: string | null
          name: string
          plan_name?: string | null
          plan_status?: string | null
          renewal_date?: string | null
          seats?: number | null
          slug: string
        }
        Update: {
          accent_color?: string | null
          created_at?: string
          employee_access_code?: string
          id?: string
          logo_url?: string | null
          name?: string
          plan_name?: string | null
          plan_status?: string | null
          renewal_date?: string | null
          seats?: number | null
          slug?: string
        }
        Relationships: []
      }
      conditions_kb: {
        Row: {
          body_region: string | null
          condition_json: Json
          condition_name: string
          created_at: string
          id: string
          source_doc: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          body_region?: string | null
          condition_json?: Json
          condition_name: string
          created_at?: string
          id?: string
          source_doc?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          body_region?: string | null
          condition_json?: Json
          condition_name?: string
          created_at?: string
          id?: string
          source_doc?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      event_attendance: {
        Row: {
          attended_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          attended_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          attended_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendance_code: string | null
          company_id: string
          created_at: string
          created_by_user_id: string
          description: string | null
          end_at: string | null
          id: string
          location: string | null
          points_award: number | null
          start_at: string
          status: string
          title: string
        }
        Insert: {
          attendance_code?: string | null
          company_id: string
          created_at?: string
          created_by_user_id: string
          description?: string | null
          end_at?: string | null
          id?: string
          location?: string | null
          points_award?: number | null
          start_at: string
          status?: string
          title: string
        }
        Update: {
          attendance_code?: string | null
          company_id?: string
          created_at?: string
          created_by_user_id?: string
          description?: string | null
          end_at?: string | null
          id?: string
          location?: string | null
          points_award?: number | null
          start_at?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_aliases: {
        Row: {
          alias_name: string
          canonical_exercise_id: string
          created_at: string
          id: string
          is_manual_override: boolean | null
          normalized_name: string
        }
        Insert: {
          alias_name: string
          canonical_exercise_id: string
          created_at?: string
          id?: string
          is_manual_override?: boolean | null
          normalized_name: string
        }
        Update: {
          alias_name?: string
          canonical_exercise_id?: string
          created_at?: string
          id?: string
          is_manual_override?: boolean | null
          normalized_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_aliases_canonical_exercise_id_fkey"
            columns: ["canonical_exercise_id"]
            isOneToOne: false
            referencedRelation: "canonical_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
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
      invites: {
        Row: {
          company_id: string
          created_at: string
          created_by_user_id: string
          expires_at: string
          id: string
          role_to_assign: string
          token: string
          used_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by_user_id: string
          expires_at?: string
          id?: string
          role_to_assign?: string
          token?: string
          used_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by_user_id?: string
          expires_at?: string
          id?: string
          role_to_assign?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_daily: {
        Row: {
          company_id: string | null
          created_at: string
          date: string
          hrv: number | null
          id: string
          resting_hr: number | null
          sleep_score: number | null
          steps: number | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          date: string
          hrv?: number | null
          id?: string
          resting_hr?: number | null
          sleep_score?: number | null
          steps?: number | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          date?: string
          hrv?: number | null
          id?: string
          resting_hr?: number | null
          sleep_score?: number | null
          steps?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "metrics_daily_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      module_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          frequency: string | null
          hold_duration: string | null
          id: string
          module_id: string
          notes: string | null
          reps: string | null
          sequence_label: string
          sets: string | null
        }
        Insert: {
          created_at?: string
          exercise_id: string
          frequency?: string | null
          hold_duration?: string | null
          id?: string
          module_id: string
          notes?: string | null
          reps?: string | null
          sequence_label?: string
          sets?: string | null
        }
        Update: {
          created_at?: string
          exercise_id?: string
          frequency?: string | null
          hold_duration?: string | null
          id?: string
          module_id?: string
          notes?: string | null
          reps?: string | null
          sequence_label?: string
          sets?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "canonical_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_exercises_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "weekly_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_code: string | null
          company_id: string | null
          created_at: string
          current_challenge: string | null
          daily_routine: string | null
          display_name: string | null
          equipment: string[] | null
          fitness_level: string | null
          id: string
          last_active_at: string | null
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
          company_code?: string | null
          company_id?: string | null
          created_at?: string
          current_challenge?: string | null
          daily_routine?: string | null
          display_name?: string | null
          equipment?: string[] | null
          fitness_level?: string | null
          id?: string
          last_active_at?: string | null
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
          company_code?: string | null
          company_id?: string | null
          created_at?: string
          current_challenge?: string | null
          daily_routine?: string | null
          display_name?: string | null
          equipment?: string[] | null
          fitness_level?: string | null
          id?: string
          last_active_at?: string | null
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
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      program_mapping: {
        Row: {
          body_regions: string[] | null
          created_at: string
          id: string
          program_id: string | null
          program_name: string
          tags: string[] | null
          use_when: string[] | null
        }
        Insert: {
          body_regions?: string[] | null
          created_at?: string
          id?: string
          program_id?: string | null
          program_name: string
          tags?: string[] | null
          use_when?: string[] | null
        }
        Update: {
          body_regions?: string[] | null
          created_at?: string
          id?: string
          program_id?: string | null
          program_name?: string
          tags?: string[] | null
          use_when?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "program_mapping_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          category: string
          category_type: string
          created_at: string
          description: string | null
          difficulty: string
          duration_minutes: number
          duration_weeks: number | null
          equipment_needed: string[] | null
          exercise_count: number
          icon: string | null
          id: string
          name: string
          region: string | null
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
          duration_weeks?: number | null
          equipment_needed?: string[] | null
          exercise_count?: number
          icon?: string | null
          id?: string
          name: string
          region?: string | null
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
          duration_weeks?: number | null
          equipment_needed?: string[] | null
          exercise_count?: number
          icon?: string | null
          id?: string
          name?: string
          region?: string | null
          sort_order?: number | null
          target_area?: string
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          reward_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reward_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reward_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          active: boolean
          company_id: string
          created_at: string
          description: string | null
          id: string
          inventory_limit: number | null
          points_cost: number
          title: string
        }
        Insert: {
          active?: boolean
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          inventory_limit?: number | null
          points_cost?: number
          title: string
        }
        Update: {
          active?: boolean
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          inventory_limit?: number | null
          points_cost?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_routines: {
        Row: {
          created_at: string
          id: string
          routine_json: Json
          routine_name: string
          source_condition: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          routine_json?: Json
          routine_name: string
          source_condition?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          routine_json?: Json
          routine_name?: string
          source_condition?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scheduled_tasks: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          is_completed: boolean
          program_id: string | null
          scheduled_at: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          is_completed?: boolean
          program_id?: string | null
          scheduled_at?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          is_completed?: boolean
          program_id?: string | null
          scheduled_at?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_tasks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_enrolled_programs: {
        Row: {
          current_week: number
          enrolled_at: string
          id: string
          is_active: boolean
          program_id: string
          user_id: string
        }
        Insert: {
          current_week?: number
          enrolled_at?: string
          id?: string
          is_active?: boolean
          program_id: string
          user_id: string
        }
        Update: {
          current_week?: number
          enrolled_at?: string
          id?: string
          is_active?: boolean
          program_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_enrolled_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
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
      user_roles: {
        Row: {
          company_name: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_modules: {
        Row: {
          created_at: string
          focus_text: string | null
          id: string
          program_id: string
          week_number: number
        }
        Insert: {
          created_at?: string
          focus_text?: string | null
          id?: string
          program_id: string
          week_number: number
        }
        Update: {
          created_at?: string
          focus_text?: string | null
          id?: string
          program_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_modules_program_id_fkey"
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
      welly_points_ledger: {
        Row: {
          company_id: string
          created_at: string
          created_by_user_id: string
          id: string
          points_delta: number
          reason: string
          related_challenge_id: string | null
          related_event_id: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by_user_id: string
          id?: string
          points_delta: number
          reason: string
          related_challenge_id?: string | null
          related_event_id?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by_user_id?: string
          id?: string
          points_delta?: number
          reason?: string
          related_challenge_id?: string | null
          related_event_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "welly_points_ledger_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "welly_points_ledger_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_owner: { Args: { _user_id: string }; Returns: boolean }
      validate_access_code: { Args: { p_code: string }; Returns: Json }
      validate_company_access_code: { Args: { p_code: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "moderator" | "hr_admin" | "user"
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
      app_role: ["admin", "moderator", "hr_admin", "user"],
    },
  },
} as const
