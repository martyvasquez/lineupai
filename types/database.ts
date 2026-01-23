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
      game_preferences: {
        Row: {
          game_id: string | null
          id: string
          preference_text: string
          priority: number | null
        }
        Insert: {
          game_id?: string | null
          id?: string
          preference_text: string
          priority?: number | null
        }
        Update: {
          game_id?: string | null
          id?: string
          preference_text?: string
          priority?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_preferences_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_roster: {
        Row: {
          available: boolean | null
          game_id: string | null
          id: string
          pitching_innings_available: number | null
          player_id: string | null
          restrictions: string | null
        }
        Insert: {
          available?: boolean | null
          game_id?: string | null
          id?: string
          pitching_innings_available?: number | null
          player_id?: string | null
          restrictions?: string | null
        }
        Update: {
          available?: boolean | null
          game_id?: string | null
          id?: string
          pitching_innings_available?: number | null
          player_id?: string | null
          restrictions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_roster_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_roster_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      game_state: {
        Row: {
          adjustments: Json | null
          current_inning: number | null
          game_id: string | null
          id: string
          is_top_of_inning: boolean | null
          lineup_id: string | null
          our_score: number | null
          their_score: number | null
          updated_at: string | null
        }
        Insert: {
          adjustments?: Json | null
          current_inning?: number | null
          game_id?: string | null
          id?: string
          is_top_of_inning?: boolean | null
          lineup_id?: string | null
          our_score?: number | null
          their_score?: number | null
          updated_at?: string | null
        }
        Update: {
          adjustments?: Json | null
          current_inning?: number | null
          game_id?: string | null
          id?: string
          is_top_of_inning?: boolean | null
          lineup_id?: string | null
          our_score?: number | null
          their_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_state_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: true
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_state_lineup_id_fkey"
            columns: ["lineup_id"]
            isOneToOne: false
            referencedRelation: "lineups"
            referencedColumns: ["id"]
          },
        ]
      }
      gamechanger_batting: {
        Row: {
          ab: number | null
          bb: number | null
          cs: number | null
          doubles: number | null
          game_date: string | null
          h: number | null
          hbp: number | null
          hr: number | null
          id: string
          imported_at: string | null
          pa: number | null
          player_id: string | null
          r: number | null
          rbi: number | null
          sb: number | null
          singles: number | null
          so: number | null
          triples: number | null
        }
        Insert: {
          ab?: number | null
          bb?: number | null
          cs?: number | null
          doubles?: number | null
          game_date?: string | null
          h?: number | null
          hbp?: number | null
          hr?: number | null
          id?: string
          imported_at?: string | null
          pa?: number | null
          player_id?: string | null
          r?: number | null
          rbi?: number | null
          sb?: number | null
          singles?: number | null
          so?: number | null
          triples?: number | null
        }
        Update: {
          ab?: number | null
          bb?: number | null
          cs?: number | null
          doubles?: number | null
          game_date?: string | null
          h?: number | null
          hbp?: number | null
          hr?: number | null
          id?: string
          imported_at?: string | null
          pa?: number | null
          player_id?: string | null
          r?: number | null
          rbi?: number | null
          sb?: number | null
          singles?: number | null
          so?: number | null
          triples?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gamechanger_batting_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      gamechanger_fielding: {
        Row: {
          a: number | null
          dp: number | null
          e: number | null
          game_date: string | null
          id: string
          imported_at: string | null
          innings_by_position: Json | null
          player_id: string | null
          po: number | null
          tc: number | null
        }
        Insert: {
          a?: number | null
          dp?: number | null
          e?: number | null
          game_date?: string | null
          id?: string
          imported_at?: string | null
          innings_by_position?: Json | null
          player_id?: string | null
          po?: number | null
          tc?: number | null
        }
        Update: {
          a?: number | null
          dp?: number | null
          e?: number | null
          game_date?: string | null
          id?: string
          imported_at?: string | null
          innings_by_position?: Json | null
          player_id?: string | null
          po?: number | null
          tc?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gamechanger_fielding_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string | null
          game_date: string
          game_time: string | null
          id: string
          innings: number | null
          location: string | null
          opponent: string | null
          our_score: number | null
          scouting_report: string | null
          status: string | null
          team_id: string | null
          their_score: number | null
        }
        Insert: {
          created_at?: string | null
          game_date: string
          game_time?: string | null
          id?: string
          innings?: number | null
          location?: string | null
          opponent?: string | null
          our_score?: number | null
          scouting_report?: string | null
          status?: string | null
          team_id?: string | null
          their_score?: number | null
        }
        Update: {
          created_at?: string | null
          game_date?: string
          game_time?: string | null
          id?: string
          innings?: number | null
          location?: string | null
          opponent?: string | null
          our_score?: number | null
          scouting_report?: string | null
          status?: string | null
          team_id?: string | null
          their_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "games_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      lineups: {
        Row: {
          ai_reasoning: string | null
          batting_order: Json
          created_at: string | null
          defensive_grid: Json
          game_id: string | null
          id: string
          optimization_mode: string | null
          rule_group_id: string | null
          rules_check: Json | null
          version: number | null
          warnings: Json | null
        }
        Insert: {
          ai_reasoning?: string | null
          batting_order: Json
          created_at?: string | null
          defensive_grid: Json
          game_id?: string | null
          id?: string
          optimization_mode?: string | null
          rule_group_id?: string | null
          rules_check?: Json | null
          version?: number | null
          warnings?: Json | null
        }
        Update: {
          ai_reasoning?: string | null
          batting_order?: Json
          created_at?: string | null
          defensive_grid?: Json
          game_id?: string | null
          id?: string
          optimization_mode?: string | null
          rule_group_id?: string | null
          rules_check?: Json | null
          version?: number | null
          warnings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lineups_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lineups_rule_group_id_fkey"
            columns: ["rule_group_id"]
            isOneToOne: false
            referencedRelation: "rule_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      player_metrics: {
        Row: {
          id: string
          metric_type: string
          player_id: string | null
          recorded_at: string | null
          value: string
        }
        Insert: {
          id?: string
          metric_type: string
          player_id?: string | null
          recorded_at?: string | null
          value: string
        }
        Update: {
          id?: string
          metric_type?: string
          player_id?: string | null
          recorded_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_metrics_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_ratings: {
        Row: {
          attention: number | null
          baseball_iq: number | null
          batting_power: number | null
          catcher_ability: number | null
          contact_ability: number | null
          fielding_arm_strength: number | null
          fielding_hands: number | null
          fielding_throw_accuracy: number | null
          fly_ball_ability: number | null
          id: string
          pitch_composure: number | null
          pitch_control: number | null
          pitch_velocity: number | null
          plate_discipline: number | null
          player_id: string | null
          run_speed: number | null
          season: string | null
          updated_at: string | null
        }
        Insert: {
          attention?: number | null
          baseball_iq?: number | null
          batting_power?: number | null
          catcher_ability?: number | null
          contact_ability?: number | null
          fielding_arm_strength?: number | null
          fielding_hands?: number | null
          fielding_throw_accuracy?: number | null
          fly_ball_ability?: number | null
          id?: string
          pitch_composure?: number | null
          pitch_control?: number | null
          pitch_velocity?: number | null
          plate_discipline?: number | null
          player_id?: string | null
          run_speed?: number | null
          season?: string | null
          updated_at?: string | null
        }
        Update: {
          attention?: number | null
          baseball_iq?: number | null
          batting_power?: number | null
          catcher_ability?: number | null
          contact_ability?: number | null
          fielding_arm_strength?: number | null
          fielding_hands?: number | null
          fielding_throw_accuracy?: number | null
          fly_ball_ability?: number | null
          id?: string
          pitch_composure?: number | null
          pitch_control?: number | null
          pitch_velocity?: number | null
          plate_discipline?: number | null
          player_id?: string | null
          run_speed?: number | null
          season?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_ratings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          jersey_number: number | null
          name: string
          notes: string | null
          position_strengths: string[] | null
          stats_analysis: Json | null
          stats_analyzed_at: string | null
          team_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          jersey_number?: number | null
          name: string
          notes?: string | null
          position_strengths?: string[] | null
          stats_analysis?: Json | null
          stats_analyzed_at?: string | null
          team_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          jersey_number?: number | null
          name?: string
          notes?: string | null
          position_strengths?: string[] | null
          stats_analysis?: Json | null
          stats_analyzed_at?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      position_eligibility: {
        Row: {
          can_catch: boolean | null
          can_pitch: boolean | null
          can_play_1b: boolean | null
          can_play_ss: boolean | null
          id: string
          player_id: string | null
          updated_at: string | null
        }
        Insert: {
          can_catch?: boolean | null
          can_pitch?: boolean | null
          can_play_1b?: boolean | null
          can_play_ss?: boolean | null
          id?: string
          player_id?: string | null
          updated_at?: string | null
        }
        Update: {
          can_catch?: boolean | null
          can_pitch?: boolean | null
          can_play_1b?: boolean | null
          can_play_ss?: boolean | null
          id?: string
          player_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "position_eligibility_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      rule_groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          team_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          team_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rule_groups_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_rules: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          priority: number | null
          rule_group_id: string | null
          rule_text: string
          team_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          priority?: number | null
          rule_group_id?: string | null
          rule_text: string
          team_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          priority?: number | null
          rule_group_id?: string | null
          rule_text?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_rules_rule_group_id_fkey"
            columns: ["rule_group_id"]
            isOneToOne: false
            referencedRelation: "rule_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_rules_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          age_group: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          innings_per_game: number | null
          league_name: string | null
          name: string
          stats_imported_at: string | null
          team_analysis: Json | null
          team_analyzed_at: string | null
        }
        Insert: {
          age_group?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          innings_per_game?: number | null
          league_name?: string | null
          name: string
          stats_imported_at?: string | null
          team_analysis?: Json | null
          team_analyzed_at?: string | null
        }
        Update: {
          age_group?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          innings_per_game?: number | null
          league_name?: string | null
          name?: string
          stats_imported_at?: string | null
          team_analysis?: Json | null
          team_analyzed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      gamechanger_batting_season: {
        Row: {
          ab: number | null
          avg: number | null
          bb_rate: number | null
          cs: number | null
          h: number | null
          k_rate: number | null
          obp: number | null
          pa: number | null
          player_id: string | null
          sb: number | null
          slg: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gamechanger_batting_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      gamechanger_fielding_season: {
        Row: {
          a: number | null
          dp: number | null
          e: number | null
          fpct: number | null
          player_id: string | null
          po: number | null
          tc: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gamechanger_fielding_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
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
