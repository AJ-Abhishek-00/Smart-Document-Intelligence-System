/*
  # Smart Document Intelligence System Schema

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `filename` (text)
      - `file_size` (bigint)
      - `file_type` (text)
      - `storage_path` (text)
      - `upload_status` (text, default 'pending')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `document_analysis`
      - `id` (uuid, primary key)
      - `document_id` (uuid, references documents)
      - `extracted_text` (text)
      - `ocr_confidence` (numeric)
      - `processing_status` (text, default 'pending')
      - `error_message` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `document_insights`
      - `id` (uuid, primary key)
      - `document_id` (uuid, references documents)
      - `summary` (text)
      - `key_fields` (jsonb)
      - `named_entities` (jsonb)
      - `keywords` (jsonb)
      - `topics` (jsonb)
      - `risks` (jsonb)
      - `action_items` (jsonb)
      - `compliance_suggestions` (jsonb)
      - `confidence_scores` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Storage
    - Create storage bucket for document files

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own documents
*/

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  storage_path text NOT NULL,
  upload_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create document_analysis table
CREATE TABLE IF NOT EXISTS document_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  extracted_text text,
  ocr_confidence numeric(5, 2),
  processing_status text DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create document_insights table
CREATE TABLE IF NOT EXISTS document_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  summary text,
  key_fields jsonb DEFAULT '{}',
  named_entities jsonb DEFAULT '[]',
  keywords jsonb DEFAULT '[]',
  topics jsonb DEFAULT '[]',
  risks jsonb DEFAULT '[]',
  action_items jsonb DEFAULT '[]',
  compliance_suggestions jsonb DEFAULT '[]',
  confidence_scores jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_insights ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Document analysis policies
CREATE POLICY "Users can view own document analysis"
  ON document_analysis FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_analysis.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own document analysis"
  ON document_analysis FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_analysis.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own document analysis"
  ON document_analysis FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_analysis.document_id
      AND documents.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_analysis.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Document insights policies
CREATE POLICY "Users can view own document insights"
  ON document_insights FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_insights.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own document insights"
  ON document_insights FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_insights.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own document insights"
  ON document_insights FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_insights.document_id
      AND documents.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_insights.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Storage policies
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_document_analysis_document_id ON document_analysis(document_id);
CREATE INDEX IF NOT EXISTS idx_document_insights_document_id ON document_insights(document_id);
