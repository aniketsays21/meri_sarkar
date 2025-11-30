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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alert_upvotes: {
        Row: {
          alert_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          alert_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          alert_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_upvotes_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "area_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      area_alerts: {
        Row: {
          category: string
          created_at: string | null
          description: string
          expires_at: string | null
          id: string
          image_url: string | null
          location_name: string | null
          pincode: string
          status: string | null
          title: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          location_name?: string | null
          pincode: string
          status?: string | null
          title: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          location_name?: string | null
          pincode?: string
          status?: string | null
          title?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      area_reports: {
        Row: {
          constituency: string | null
          created_at: string
          daily_updates: Json | null
          district: string | null
          expires_at: string | null
          generated_at: string | null
          health_details: Json | null
          health_score: number | null
          health_trend: string | null
          id: string
          key_issues: string[] | null
          overall_score: number | null
          pincode: string
          rank_change: number | null
          recent_developments: string[] | null
          roads_details: Json | null
          roads_score: number | null
          roads_trend: string | null
          safety_details: Json | null
          safety_score: number | null
          safety_trend: string | null
          state: string | null
          summary: string | null
          total_wards: number | null
          updated_at: string
          ward: string | null
          ward_rank: number | null
          water_details: Json | null
          water_score: number | null
          water_trend: string | null
        }
        Insert: {
          constituency?: string | null
          created_at?: string
          daily_updates?: Json | null
          district?: string | null
          expires_at?: string | null
          generated_at?: string | null
          health_details?: Json | null
          health_score?: number | null
          health_trend?: string | null
          id?: string
          key_issues?: string[] | null
          overall_score?: number | null
          pincode: string
          rank_change?: number | null
          recent_developments?: string[] | null
          roads_details?: Json | null
          roads_score?: number | null
          roads_trend?: string | null
          safety_details?: Json | null
          safety_score?: number | null
          safety_trend?: string | null
          state?: string | null
          summary?: string | null
          total_wards?: number | null
          updated_at?: string
          ward?: string | null
          ward_rank?: number | null
          water_details?: Json | null
          water_score?: number | null
          water_trend?: string | null
        }
        Update: {
          constituency?: string | null
          created_at?: string
          daily_updates?: Json | null
          district?: string | null
          expires_at?: string | null
          generated_at?: string | null
          health_details?: Json | null
          health_score?: number | null
          health_trend?: string | null
          id?: string
          key_issues?: string[] | null
          overall_score?: number | null
          pincode?: string
          rank_change?: number | null
          recent_developments?: string[] | null
          roads_details?: Json | null
          roads_score?: number | null
          roads_trend?: string | null
          safety_details?: Json | null
          safety_score?: number | null
          safety_trend?: string | null
          state?: string | null
          summary?: string | null
          total_wards?: number | null
          updated_at?: string
          ward?: string | null
          ward_rank?: number | null
          water_details?: Json | null
          water_score?: number | null
          water_trend?: string | null
        }
        Relationships: []
      }
      constituencies: {
        Row: {
          created_at: string
          id: string
          name: string
          reserved_category: string | null
          state: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          reserved_category?: string | null
          state: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          reserved_category?: string | null
          state?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_polls: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          poll_date: string
          question: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          poll_date?: string
          question: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          poll_date?: string
          question?: string
        }
        Relationships: []
      }
      leader_activities: {
        Row: {
          activity_date: string | null
          activity_description: string
          activity_type: string
          created_at: string | null
          id: string
          is_positive: boolean | null
          leader_id: string | null
          source_url: string | null
        }
        Insert: {
          activity_date?: string | null
          activity_description: string
          activity_type: string
          created_at?: string | null
          id?: string
          is_positive?: boolean | null
          leader_id?: string | null
          source_url?: string | null
        }
        Update: {
          activity_date?: string | null
          activity_description?: string
          activity_type?: string
          created_at?: string | null
          id?: string
          is_positive?: boolean | null
          leader_id?: string | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leader_activities_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "leaders"
            referencedColumns: ["id"]
          },
        ]
      }
      leader_category_votes: {
        Row: {
          category: string
          created_at: string | null
          id: string
          leader_id: string
          user_id: string
          vote_type: string
          week_number: number
          year: number
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          leader_id: string
          user_id: string
          vote_type: string
          week_number?: number
          year?: number
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          leader_id?: string
          user_id?: string
          vote_type?: string
          week_number?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leader_category_votes_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "leaders"
            referencedColumns: ["id"]
          },
        ]
      }
      leaders: {
        Row: {
          assets: number | null
          attendance: number | null
          bills_passed: number | null
          bio: string | null
          completed_projects: Json | null
          constituency: string | null
          constituency_id: string | null
          created_at: string | null
          criminal_cases: number | null
          current_work: string | null
          designation: string
          education: string | null
          election_history: Json | null
          funds_utilized: number | null
          hierarchy_level: number
          id: string
          image_url: string | null
          name: string
          office_address: string | null
          office_email: string | null
          office_phone: string | null
          ongoing_projects: Json | null
          party: string | null
          professional_history: Json | null
          questions_raised: number | null
          social_media: Json | null
          state: string | null
          total_funds_allocated: number | null
          updated_at: string | null
        }
        Insert: {
          assets?: number | null
          attendance?: number | null
          bills_passed?: number | null
          bio?: string | null
          completed_projects?: Json | null
          constituency?: string | null
          constituency_id?: string | null
          created_at?: string | null
          criminal_cases?: number | null
          current_work?: string | null
          designation: string
          education?: string | null
          election_history?: Json | null
          funds_utilized?: number | null
          hierarchy_level?: number
          id?: string
          image_url?: string | null
          name: string
          office_address?: string | null
          office_email?: string | null
          office_phone?: string | null
          ongoing_projects?: Json | null
          party?: string | null
          professional_history?: Json | null
          questions_raised?: number | null
          social_media?: Json | null
          state?: string | null
          total_funds_allocated?: number | null
          updated_at?: string | null
        }
        Update: {
          assets?: number | null
          attendance?: number | null
          bills_passed?: number | null
          bio?: string | null
          completed_projects?: Json | null
          constituency?: string | null
          constituency_id?: string | null
          created_at?: string | null
          criminal_cases?: number | null
          current_work?: string | null
          designation?: string
          education?: string | null
          election_history?: Json | null
          funds_utilized?: number | null
          hierarchy_level?: number
          id?: string
          image_url?: string | null
          name?: string
          office_address?: string | null
          office_email?: string | null
          office_phone?: string | null
          ongoing_projects?: Json | null
          party?: string | null
          professional_history?: Json | null
          questions_raised?: number | null
          social_media?: Json | null
          state?: string | null
          total_funds_allocated?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaders_constituency_id_fkey"
            columns: ["constituency_id"]
            isOneToOne: false
            referencedRelation: "constituencies"
            referencedColumns: ["id"]
          },
        ]
      }
      pincode_constituency: {
        Row: {
          assembly_constituency: string | null
          created_at: string
          district: string | null
          id: string
          parliamentary_constituency: string | null
          pincode: string
          state: string
          ward: string | null
        }
        Insert: {
          assembly_constituency?: string | null
          created_at?: string
          district?: string | null
          id?: string
          parliamentary_constituency?: string | null
          pincode: string
          state: string
          ward?: string | null
        }
        Update: {
          assembly_constituency?: string | null
          created_at?: string
          district?: string | null
          id?: string
          parliamentary_constituency?: string | null
          pincode?: string
          state?: string
          ward?: string | null
        }
        Relationships: []
      }
      policies_subsidies: {
        Row: {
          application_link: string | null
          benefit_amount: number | null
          benefit_description: string | null
          category: string
          created_at: string
          departments: string[] | null
          description: string
          eligibility_criteria: Json
          how_to_apply: string | null
          id: string
          impact_score: number | null
          is_active: boolean | null
          state: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          application_link?: string | null
          benefit_amount?: number | null
          benefit_description?: string | null
          category: string
          created_at?: string
          departments?: string[] | null
          description: string
          eligibility_criteria?: Json
          how_to_apply?: string | null
          id?: string
          impact_score?: number | null
          is_active?: boolean | null
          state?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          application_link?: string | null
          benefit_amount?: number | null
          benefit_description?: string | null
          category?: string
          created_at?: string
          departments?: string[] | null
          description?: string
          eligibility_criteria?: Json
          how_to_apply?: string | null
          id?: string
          impact_score?: number | null
          is_active?: boolean | null
          state?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      poll_responses: {
        Row: {
          created_at: string | null
          id: string
          pincode: string
          poll_id: string
          response: boolean
          user_id: string
          ward: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pincode: string
          poll_id: string
          response: boolean
          user_id: string
          ward?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pincode?: string
          poll_id?: string
          response?: boolean
          user_id?: string
          ward?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_responses_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "daily_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string
          ends_at: string | null
          id: string
          is_active: boolean | null
          options: Json
          pincode: string | null
          question: string
          room_id: string | null
          total_votes: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by: string
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          pincode?: string | null
          question: string
          room_id?: string | null
          total_votes?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          pincode?: string | null
          question?: string
          room_id?: string | null
          total_votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "polls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polls_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          constituency: string | null
          created_at: string | null
          gender: string | null
          id: string
          income: number | null
          kids: number | null
          marital_status: string | null
          name: string
          occupation: string | null
          phone: string | null
          pincode: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          constituency?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          income?: number | null
          kids?: number | null
          marital_status?: string | null
          name: string
          occupation?: string | null
          phone?: string | null
          pincode?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          constituency?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          income?: number | null
          kids?: number | null
          marital_status?: string | null
          name?: string
          occupation?: string | null
          phone?: string | null
          pincode?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      room_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_type: string | null
          parent_id: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          parent_id?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          parent_id?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "room_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_participants: {
        Row: {
          id: string
          is_active: boolean | null
          joined_at: string | null
          left_at: string | null
          role: Database["public"]["Enums"]["participant_role"] | null
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          role?: Database["public"]["Enums"]["participant_role"] | null
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          role?: Database["public"]["Enums"]["participant_role"] | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          is_live: boolean | null
          max_participants: number | null
          pincode: string | null
          scheduled_at: string | null
          title: string
          topic_category: Database["public"]["Enums"]["room_category"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_live?: boolean | null
          max_participants?: number | null
          pincode?: string | null
          scheduled_at?: string | null
          title: string
          topic_category?: Database["public"]["Enums"]["room_category"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_live?: boolean | null
          max_participants?: number | null
          pincode?: string | null
          scheduled_at?: string | null
          title?: string
          topic_category?: Database["public"]["Enums"]["room_category"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ward_weekly_scores: {
        Row: {
          calculated_at: string | null
          city: string
          cleanliness_score: number | null
          id: string
          overall_score: number | null
          pincode: string
          prev_rank: number | null
          rank: number | null
          rank_change: number | null
          roads_score: number | null
          safety_score: number | null
          state: string
          total_alerts: number | null
          total_confirmations: number | null
          total_responses: number | null
          ward: string
          water_score: number | null
          week_number: number
          year: number
        }
        Insert: {
          calculated_at?: string | null
          city: string
          cleanliness_score?: number | null
          id?: string
          overall_score?: number | null
          pincode: string
          prev_rank?: number | null
          rank?: number | null
          rank_change?: number | null
          roads_score?: number | null
          safety_score?: number | null
          state: string
          total_alerts?: number | null
          total_confirmations?: number | null
          total_responses?: number | null
          ward: string
          water_score?: number | null
          week_number: number
          year: number
        }
        Update: {
          calculated_at?: string | null
          city?: string
          cleanliness_score?: number | null
          id?: string
          overall_score?: number | null
          pincode?: string
          prev_rank?: number | null
          rank?: number | null
          rank_change?: number | null
          roads_score?: number | null
          safety_score?: number | null
          state?: string
          total_alerts?: number | null
          total_confirmations?: number | null
          total_responses?: number | null
          ward?: string
          water_score?: number | null
          week_number?: number
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      participant_role: "host" | "speaker" | "listener"
      room_category: "national" | "state" | "local" | "policy"
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
      participant_role: ["host", "speaker", "listener"],
      room_category: ["national", "state", "local", "policy"],
    },
  },
} as const
