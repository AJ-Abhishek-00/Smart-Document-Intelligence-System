import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { DocumentUpload } from './components/DocumentUpload';
import { DocumentList } from './components/DocumentList';
import { DocumentAnalysis } from './components/DocumentAnalysis';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { getDocuments } from './services/documentService';
import { LogOut, BarChart3, FileText } from 'lucide-react';

function AppContent() {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeView, setActiveView] = useState<'documents' | 'analytics'>('documents');
  const [documents, setDocuments] = useState<any[]>([]);
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user, refreshTrigger]);

  const loadDocuments = async () => {
    if (!user) return;
    try {
      const data = await getDocuments(user.id);
      setDocuments(data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Document Intelligence</h1>
                <p className="text-xs text-slate-600">AI-Powered Analysis</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <nav className="flex gap-2">
                <button
                  onClick={() => setActiveView('documents')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    activeView === 'documents'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Documents
                </button>
                <button
                  onClick={() => setActiveView('analytics')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    activeView === 'analytics'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </button>
              </nav>

              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <span className="text-sm text-slate-600">{user.email}</span>
                <button
                  onClick={signOut}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'documents' ? (
          <div className="space-y-8">
            <DocumentUpload onUploadComplete={handleUploadComplete} />
            <DocumentList
              onSelectDocument={(doc) => setSelectedDocument(doc)}
              refreshTrigger={refreshTrigger}
            />
          </div>
        ) : (
          <AnalyticsDashboard documents={documents} />
        )}
      </main>

      {selectedDocument && (
        <DocumentAnalysis
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
