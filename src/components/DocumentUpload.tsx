import { useState, useRef } from 'react';
import { Upload, File, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadDocument, processDocument } from '../services/documentService';

interface DocumentUploadProps {
  onUploadComplete: () => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const validTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.includes(file.type) && !file.type.startsWith('text/')) {
      setError('Please upload a PDF, text, or document file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError('');
    setSuccess(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    setError('');

    try {
      const document = await uploadDocument(selectedFile, user.id);

      setProcessing(true);

      await processDocument(document.id, selectedFile);

      setSuccess(true);
      setSelectedFile(null);
      setTimeout(() => {
        setSuccess(false);
        onUploadComplete();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setError('');
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Document</h2>
        <p className="text-slate-600">
          Upload your document for AI-powered analysis and insights
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          isDragging
            ? 'border-slate-900 bg-slate-50'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept=".pdf,.txt,.doc,.docx,text/*"
          className="hidden"
        />

        {!selectedFile ? (
          <>
            <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-700 mb-2">
              Drop your document here, or click to browse
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Supports PDF, TXT, DOC, DOCX (Max 10MB)
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Choose File
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 bg-slate-50 rounded-lg p-4">
              <File className="w-8 h-8 text-slate-600" />
              <div className="flex-1 text-left">
                <p className="font-medium text-slate-900">{selectedFile.name}</p>
                <p className="text-sm text-slate-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {!uploading && !processing && (
                <button
                  onClick={clearSelection}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              )}
            </div>

            {uploading && (
              <div className="flex items-center justify-center gap-3 text-slate-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading document...</span>
              </div>
            )}

            {processing && (
              <div className="flex items-center justify-center gap-3 text-slate-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing with AI...</span>
              </div>
            )}

            {success && (
              <div className="flex items-center justify-center gap-3 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>Document processed successfully!</span>
              </div>
            )}

            {!uploading && !processing && !success && (
              <button
                onClick={handleUpload}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload & Analyze
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
