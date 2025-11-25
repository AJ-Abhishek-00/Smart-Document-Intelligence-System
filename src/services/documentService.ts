import { supabase } from '../lib/supabase';
import { analyzeDocument } from './aiService';
import type { Database } from '../types/database';

type DocumentInsert = Database['public']['Tables']['documents']['Insert'];

export async function uploadDocument(file: File, userId: string) {
  const filePath = `${userId}/${Date.now()}_${file.name}`;

  const { data: storageData, error: storageError } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (storageError) {
    throw new Error(`Upload failed: ${storageError.message}`);
  }

  const documentData: DocumentInsert = {
    user_id: userId,
    filename: file.name,
    file_size: file.size,
    file_type: file.type,
    storage_path: storageData.path,
    upload_status: 'completed',
  };

  const { data: document, error: dbError } = await supabase
    .from('documents')
    .insert(documentData)
    .select()
    .single();

  if (dbError) {
    await supabase.storage.from('documents').remove([filePath]);
    throw new Error(`Database insert failed: ${dbError.message}`);
  }

  return document;
}

export async function processDocument(documentId: string, file: File) {
  try {
    await supabase
      .from('document_analysis')
      .insert({
        document_id: documentId,
        processing_status: 'processing',
      });

    const text = await extractTextFromFile(file);

    const ocrConfidence = calculateOCRConfidence(text);

    const { data: analysisData } = await supabase
      .from('document_analysis')
      .update({
        extracted_text: text,
        ocr_confidence: ocrConfidence,
        processing_status: 'completed',
      })
      .eq('document_id', documentId)
      .select()
      .single();

    const insights = await analyzeDocument(text);

    await supabase
      .from('document_insights')
      .insert({
        document_id: documentId,
        summary: insights.summary,
        key_fields: insights.key_fields,
        named_entities: insights.named_entities,
        keywords: insights.keywords,
        topics: insights.topics,
        risks: insights.risks,
        action_items: insights.action_items,
        compliance_suggestions: insights.compliance_suggestions,
        confidence_scores: insights.confidence_scores,
      });

    return analysisData;
  } catch (error) {
    await supabase
      .from('document_analysis')
      .update({
        processing_status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('document_id', documentId);

    throw error;
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const content = e.target?.result as string;

      if (file.type === 'application/pdf') {
        resolve(content);
      } else if (file.type.startsWith('text/')) {
        resolve(content);
      } else {
        resolve(content);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));

    if (file.type === 'application/pdf') {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  });
}

function calculateOCRConfidence(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  const hasAlphanumeric = /[a-zA-Z0-9]/.test(text);
  const hasStructure = /[.!?,;:\n]/.test(text);
  const wordCount = text.split(/\s+/).length;

  let confidence = 50;

  if (hasAlphanumeric) confidence += 20;
  if (hasStructure) confidence += 15;
  if (wordCount > 10) confidence += 10;
  if (wordCount > 50) confidence += 5;

  return Math.min(confidence, 95);
}

export async function getDocuments(userId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      document_analysis(*),
      document_insights(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch documents: ${error.message}`);
  }

  return data;
}

export async function getDocumentById(documentId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      document_analysis(*),
      document_insights(*)
    `)
    .eq('id', documentId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch document: ${error.message}`);
  }

  return data;
}

export async function deleteDocument(documentId: string, storagePath: string) {
  await supabase.storage.from('documents').remove([storagePath]);

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  if (error) {
    throw new Error(`Failed to delete document: ${error.message}`);
  }
}
