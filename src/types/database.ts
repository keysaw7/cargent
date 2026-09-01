export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      card_abilities: {
        Row: {
          card_id: string;
          created_at: string;
          description: string;
          id: string;
          name: string;
          position: number;
          power: number;
        };
        Insert: {
          card_id: string;
          created_at?: string;
          description?: string;
          id?: string;
          name: string;
          position: number;
          power: number;
        };
        Update: {
          card_id?: string;
          created_at?: string;
          description?: string;
          id?: string;
          name?: string;
          position?: number;
          power?: number;
        };
        Relationships: [
          {
            foreignKeyName: "card_abilities_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "cards";
            referencedColumns: ["id"];
          },
        ];
      };
      card_drafts: {
        Row: {
          abilities: Json;
          card_id: string | null;
          collection_id: string;
          created_at: string;
          description: string;
          generate_prompt: string;
          id: string;
          image_path: string | null;
          is_published: boolean;
          kind: Database["public"]["Enums"]["card_kind"];
          level: number;
          name: string;
          provider: string;
          short_description: string;
          tags: string[];
          template: Database["public"]["Enums"]["card_template"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          abilities?: Json;
          card_id?: string | null;
          collection_id: string;
          created_at?: string;
          description?: string;
          generate_prompt?: string;
          id?: string;
          image_path?: string | null;
          is_published?: boolean;
          kind?: Database["public"]["Enums"]["card_kind"];
          level?: number;
          name?: string;
          provider?: string;
          short_description?: string;
          tags?: string[];
          template?: Database["public"]["Enums"]["card_template"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          abilities?: Json;
          card_id?: string | null;
          collection_id?: string;
          created_at?: string;
          description?: string;
          generate_prompt?: string;
          id?: string;
          image_path?: string | null;
          is_published?: boolean;
          kind?: Database["public"]["Enums"]["card_kind"];
          level?: number;
          name?: string;
          provider?: string;
          short_description?: string;
          tags?: string[];
          template?: Database["public"]["Enums"]["card_template"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "card_drafts_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "card_drafts_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "card_drafts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      cards: {
        Row: {
          collection_id: string;
          created_at: string;
          description: string;
          id: string;
          image_path: string | null;
          is_published: boolean;
          kind: Database["public"]["Enums"]["card_kind"];
          level: number;
          name: string;
          provider: string | null;
          short_description: string;
          slug: string;
          tags: string[];
          template: Database["public"]["Enums"]["card_template"];
          updated_at: string;
        };
        Insert: {
          collection_id: string;
          created_at?: string;
          description?: string;
          id?: string;
          image_path?: string | null;
          is_published?: boolean;
          kind: Database["public"]["Enums"]["card_kind"];
          level: number;
          name: string;
          provider?: string | null;
          short_description: string;
          slug: string;
          tags?: string[];
          template?: Database["public"]["Enums"]["card_template"];
          updated_at?: string;
        };
        Update: {
          collection_id?: string;
          created_at?: string;
          description?: string;
          id?: string;
          image_path?: string | null;
          is_published?: boolean;
          kind?: Database["public"]["Enums"]["card_kind"];
          level?: number;
          name?: string;
          provider?: string | null;
          short_description?: string;
          slug?: string;
          tags?: string[];
          template?: Database["public"]["Enums"]["card_template"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cards_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
        ];
      };
      image_generations: {
        Row: {
          created_at: string;
          id: string;
          image_path: string;
          prompt: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_path: string;
          prompt: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_path?: string;
          prompt?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "image_generations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      image_generation_quotas: {
        Row: {
          day: string;
          used: number;
          user_id: string;
        };
        Insert: {
          day: string;
          used?: number;
          user_id: string;
        };
        Update: {
          day?: string;
          used?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "image_generation_quotas_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      collections: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          is_public: boolean;
          name: string;
          owner_id: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          id?: string;
          is_public?: boolean;
          name: string;
          owner_id: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          is_public?: boolean;
          name?: string;
          owner_id?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collections_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_path: string | null;
          bio: string;
          created_at: string;
          display_name: string;
          id: string;
          updated_at: string;
          username: string;
        };
        Insert: {
          avatar_path?: string | null;
          bio?: string;
          created_at?: string;
          display_name: string;
          id: string;
          updated_at?: string;
          username: string;
        };
        Update: {
          avatar_path?: string | null;
          bio?: string;
          created_at?: string;
          display_name?: string;
          id?: string;
          updated_at?: string;
          username?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      consume_image_generation_quota: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
    };
    Enums: {
      card_kind: "agent" | "model";
      card_template:
        | "classique"
        | "signal"
        | "reflet"
        | "grimoire"
        | "terminal"
        | "arcane"
        | "obsidienne"
        | "classeur"
        | "relique";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Collection = Database["public"]["Tables"]["collections"]["Row"];
export type Card = Database["public"]["Tables"]["cards"]["Row"];
export type CardAbility = Database["public"]["Tables"]["card_abilities"]["Row"];
export type CardDraft = Database["public"]["Tables"]["card_drafts"]["Row"];
export type ImageGeneration = Database["public"]["Tables"]["image_generations"]["Row"];
