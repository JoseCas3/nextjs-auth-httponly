export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {id:string; full_name:string; created_at:string};
        Insert: {id:string; full_name?:string; created_at?:string};
        Update: {full_name?:string};
        Relationships: [];
      };
    };
    Views: {[_ in never]:never};
    Functions: {[_ in never]:never};
    Enums: {[_ in never]:never};
    CompositeTypes: {[_ in never]:never};
  };
};
