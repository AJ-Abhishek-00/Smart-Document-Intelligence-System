import { X, FileText, Brain, AlertTriangle, CheckSquare, Shield, Tag, TrendingUp } from 'lucide-react';
import type { Database } from '../types/database';

interface DocumentAnalysisProps {
  document: {
    filename: string;
    created_at: string;
    document_analysis: Array<Database['public']['Tables']['document_analysis']['Row']>;
    document_insights: Array<Database['public']['Tables']['document_insights']['Row']>;
  };
  onClose: () => void;
}

export function DocumentAnalysis({ document, onClose }: DocumentAnalysisProps) {
  const analysis = document.document_analysis[0];
  const insights = document.document_insights[0];

  if (!analysis || !insights) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Document Analysis</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
          </div>
          <p className="text-slate-600">No analysis available for this document.</p>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100';
      case 'high': return 'text-orange-700 bg-orange-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-blue-700 bg-blue-100';
      default: return 'text-slate-700 bg-slate-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-slate-700 bg-slate-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-slate-200 rounded-t-2xl p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{document.filename}</h2>
            <p className="text-slate-600 text-sm mt-1">
              Analyzed on {new Date(document.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-600 mb-1">Overall Score</p>
              <p className="text-2xl font-bold text-slate-900">
                {Math.round((insights.confidence_scores.overall || 0) * 100)}%
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-700 mb-1">Extraction</p>
              <p className="text-2xl font-bold text-blue-900">
                {Math.round((insights.confidence_scores.extraction || 0) * 100)}%
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm text-green-700 mb-1">Analysis</p>
              <p className="text-2xl font-bold text-green-900">
                {Math.round((insights.confidence_scores.analysis || 0) * 100)}%
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-sm text-purple-700 mb-1">Insights</p>
              <p className="text-2xl font-bold text-purple-900">
                {Math.round((insights.confidence_scores.insights || 0) * 100)}%
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-slate-700" />
              <h3 className="text-xl font-bold text-slate-900">Summary</h3>
            </div>
            <p className="text-slate-700 leading-relaxed">{insights.summary}</p>
          </div>

          {insights.risks && insights.risks.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-bold text-slate-900">Risks Identified</h3>
              </div>
              <div className="space-y-3">
                {insights.risks.map((risk, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-slate-900 font-medium flex-1">{risk.description}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(risk.severity)}`}>
                        {risk.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {risk.category}
                      </span>
                      <span>Confidence: {Math.round(risk.confidence * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.action_items && insights.action_items.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckSquare className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-slate-900">Action Items</h3>
              </div>
              <div className="space-y-2">
                {insights.action_items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="w-5 h-5 border-2 border-slate-300 rounded flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-slate-900">{item.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.compliance_suggestions && insights.compliance_suggestions.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">Compliance Suggestions</h3>
              </div>
              <div className="space-y-3">
                {insights.compliance_suggestions.map((suggestion, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-slate-900 flex-1">{suggestion.description}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">Regulation: {suggestion.regulation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.keywords && insights.keywords.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Tag className="w-6 h-6 text-slate-700" />
                <h3 className="text-xl font-bold text-slate-900">Keywords</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {insights.keywords.slice(0, 15).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                  >
                    {keyword.text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {insights.topics && insights.topics.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-slate-700" />
                <h3 className="text-xl font-bold text-slate-900">Topics</h3>
              </div>
              <div className="space-y-3">
                {insights.topics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-900 font-medium">{topic.name}</span>
                        <span className="text-sm text-slate-600">{Math.round(topic.confidence * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-slate-700 h-2 rounded-full transition-all"
                          style={{ width: `${topic.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.named_entities && insights.named_entities.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-slate-700" />
                <h3 className="text-xl font-bold text-slate-900">Named Entities</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {insights.named_entities.map((entity, index) => (
                  <div key={index} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-900 font-medium mb-1">{entity.text}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{entity.type}</span>
                      <span className="text-slate-500">{Math.round(entity.confidence * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
