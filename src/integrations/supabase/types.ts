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
    }
    Views: {
      [_ in never]: never
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
