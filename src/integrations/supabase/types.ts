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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          image: string | null
          name: string
          name_ar: string
          slug: string
          sort_order: number
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          image?: string | null
          name: string
          name_ar: string
          slug: string
          sort_order?: number
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          image?: string | null
          name?: string
          name_ar?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          id: string
          order_id: string | null
          used_at: string
          user_id: string | null
        }
        Insert: {
          coupon_id: string
          id?: string
          order_id?: string | null
          used_at?: string
          user_id?: string | null
        }
        Update: {
          coupon_id?: string
          id?: string
          order_id?: string | null
          used_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          description: string
          expires_at: string | null
          id: string
          is_active: boolean
          max_discount: number | null
          min_order: number
          type: Database["public"]["Enums"]["coupon_type"]
          usage_limit: number
          used_count: number
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order?: number
          type?: Database["public"]["Enums"]["coupon_type"]
          usage_limit?: number
          used_count?: number
          value?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order?: number
          type?: Database["public"]["Enums"]["coupon_type"]
          usage_limit?: number
          used_count?: number
          value?: number
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          created_at: string
          estimated_time: string
          id: string
          is_active: boolean
          name: string
          price: number
          sort_order: number
        }
        Insert: {
          created_at?: string
          estimated_time?: string
          id?: string
          is_active?: boolean
          name: string
          price?: number
          sort_order?: number
        }
        Update: {
          created_at?: string
          estimated_time?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category_id: string | null
          created_at: string
          description: string
          id: string
          image: string | null
          ingredients: string[] | null
          is_available: boolean
          is_new: boolean
          is_popular: boolean
          name: string
          name_ar: string | null
          price: number
          rating: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          image?: string | null
          ingredients?: string[] | null
          is_available?: boolean
          is_new?: boolean
          is_popular?: boolean
          name: string
          name_ar?: string | null
          price?: number
          rating?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          image?: string | null
          ingredients?: string[] | null
          is_available?: boolean
          is_new?: boolean
          is_popular?: boolean
          name?: string
          name_ar?: string | null
          price?: number
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string | null
          name: string
          order_id: string
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          name: string
          order_id: string
          price: number
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          name?: string
          order_id?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
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
          coupon_code: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          delivery_fee: number
          delivery_lat: number | null
          delivery_lng: number | null
          discount: number
          id: string
          notes: string | null
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          delivery_fee?: number
          delivery_lat?: number | null
          delivery_lng?: number | null
          discount?: number
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          delivery_fee?: number
          delivery_lat?: number | null
          delivery_lng?: number | null
          discount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          lat: number | null
          lng: number | null
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string
          date: string
          email: string | null
          guests: number
          id: string
          name: string
          notes: string | null
          phone: string
          status: Database["public"]["Enums"]["reservation_status"]
          time: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          email?: string | null
          guests?: number
          id?: string
          name: string
          notes?: string | null
          phone: string
          status?: Database["public"]["Enums"]["reservation_status"]
          time: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          email?: string | null
          guests?: number
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          time?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      restaurant_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_approved: boolean
          menu_item_id: string | null
          order_id: string | null
          rating: number
          reviewer_name: string
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          menu_item_id?: string | null
          order_id?: string | null
          rating: number
          reviewer_name?: string
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          menu_item_id?: string | null
          order_id?: string | null
          rating?: number
          reviewer_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          points: number
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          points?: number
          reason?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          points?: number
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      coupon_type: "percentage" | "fixed"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      payment_method: "cash" | "card" | "bank_transfer"
      reservation_status: "pending" | "confirmed" | "cancelled" | "completed"
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
      app_role: ["admin", "moderator", "user"],
      coupon_type: ["percentage", "fixed"],
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      payment_method: ["cash", "card", "bank_transfer"],
      reservation_status: ["pending", "confirmed", "cancelled", "completed"],
    },
  },
} as const
