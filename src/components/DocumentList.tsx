import { useState, useEffect } from 'react';
import { File, Clock, Trash2, Eye, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getDocuments, deleteDocument } from '../services/documentService';
import type { Database } from '../types/database';

interface DocumentWithRelations {
  id: string;
  filename: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  upload_status: string;
  created_at: string;
  document_analysis: Array<Database['public']['Tables']['document_analysis']['Row']>;
  document_insights: Array<Database['public']['Tables']['document_insights']['Row']>;
}

interface DocumentListProps {
  onSelectDocument: (doc: DocumentWithRelations) => void;
  refreshTrigger: number;
}

export function DocumentList({ onSelectDocument, refreshTrigger }: DocumentListProps) {
  const [documents, setDocuments] = useState<DocumentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadDocuments();
  }, [user, refreshTrigger]);

  const loadDocuments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getDocuments(user.id);
      setDocuments(data as DocumentWithRelations[]);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, doc: DocumentWithRelations) => {
    e.stopPropagation();

    if (!confirm(`Delete ${doc.filename}?`)) return;

    try {
      await deleteDocument(doc.id, doc.storage_path);
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center text-slate-600">Loading documents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Documents</h2>
        <p className="text-slate-600">
          {documents.length} document{documents.length !== 1 ? 's' : ''} analyzed
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <File className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No documents yet. Upload one to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              className="group border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition-colors">
                  <File className="w-6 h-6 text-slate-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate mb-1">
                    {doc.filename}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(doc.created_at)}
                    </span>
                    <span>{formatFileSize(doc.file_size)}</span>
                    {doc.document_analysis.length > 0 && (
                      <span className="text-green-600 font-medium">
                        Analyzed
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectDocument(doc)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="View analysis"
                  >
                    <Eye className="w-5 h-5 text-slate-600" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, doc)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
