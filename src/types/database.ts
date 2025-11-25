export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          file_size: number;
          file_type: string;
          storage_path: string;
          upload_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          filename: string;
          file_size: number;
          file_type: string;
          storage_path: string;
          upload_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          filename?: string;
          file_size?: number;
          file_type?: string;
          storage_path?: string;
          upload_status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_analysis: {
        Row: {
          id: string;
          document_id: string;
          extracted_text: string | null;
          ocr_confidence: number | null;
          processing_status: string;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          extracted_text?: string | null;
          ocr_confidence?: number | null;
          processing_status?: string;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          extracted_text?: string | null;
          ocr_confidence?: number | null;
          processing_status?: string;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_insights: {
        Row: {
          id: string;
          document_id: string;
          summary: string | null;
          key_fields: KeyFields;
          named_entities: NamedEntity[];
          keywords: Keyword[];
          topics: Topic[];
          risks: Risk[];
          action_items: ActionItem[];
          compliance_suggestions: ComplianceSuggestion[];
          confidence_scores: ConfidenceScores;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          summary?: string | null;
          key_fields?: KeyFields;
          named_entities?: NamedEntity[];
          keywords?: Keyword[];
          topics?: Topic[];
          risks?: Risk[];
          action_items?: ActionItem[];
          compliance_suggestions?: ComplianceSuggestion[];
          confidence_scores?: ConfidenceScores;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          summary?: string | null;
          key_fields?: KeyFields;
          named_entities?: NamedEntity[];
          keywords?: Keyword[];
          topics?: Topic[];
          risks?: Risk[];
          action_items?: ActionItem[];
          compliance_suggestions?: ComplianceSuggestion[];
          confidence_scores?: ConfidenceScores;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export interface KeyFields {
  [key: string]: string | number | boolean;
}

export interface NamedEntity {
  text: string;
  type: string;
  confidence: number;
}

export interface Keyword {
  text: string;
  relevance: number;
}

export interface Topic {
  name: string;
  confidence: number;
}

export interface Risk {
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  confidence: number;
}

export interface ActionItem {
  description: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  assignee?: string;
}

export interface ComplianceSuggestion {
  description: string;
  regulation: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ConfidenceScores {
  overall: number;
  extraction: number;
  analysis: number;
  insights: number;
}

export interface DocumentWithAnalysis {
  document: Database['public']['Tables']['documents']['Row'];
  analysis: Database['public']['Tables']['document_analysis']['Row'] | null;
  insights: Database['public']['Tables']['document_insights']['Row'] | null;
}
