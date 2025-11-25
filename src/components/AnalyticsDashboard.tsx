import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, FileText, AlertTriangle, CheckSquare } from 'lucide-react';
import type { Database } from '../types/database';

interface AnalyticsDashboardProps {
  documents: Array<{
    document_analysis: Array<Database['public']['Tables']['document_analysis']['Row']>;
    document_insights: Array<Database['public']['Tables']['document_insights']['Row']>;
  }>;
}

export function AnalyticsDashboard({ documents }: AnalyticsDashboardProps) {
  const totalDocuments = documents.length;
  const analyzedDocuments = documents.filter(
    (d) => d.document_analysis.length > 0 && d.document_insights.length > 0
  ).length;

  const allRisks = documents.flatMap(
    (d) => d.document_insights[0]?.risks || []
  );

  const allActionItems = documents.flatMap(
    (d) => d.document_insights[0]?.action_items || []
  );

  const risksBySeverity = {
    critical: allRisks.filter((r) => r.severity === 'critical').length,
    high: allRisks.filter((r) => r.severity === 'high').length,
    medium: allRisks.filter((r) => r.severity === 'medium').length,
    low: allRisks.filter((r) => r.severity === 'low').length,
  };

  const actionsByPriority = {
    high: allActionItems.filter((a) => a.priority === 'high').length,
    medium: allActionItems.filter((a) => a.priority === 'medium').length,
    low: allActionItems.filter((a) => a.priority === 'low').length,
  };

  const avgConfidence = documents
    .filter((d) => d.document_insights.length > 0)
    .reduce((sum, d) => sum + (d.document_insights[0]?.confidence_scores?.overall || 0), 0) /
    (analyzedDocuments || 1);

  const confidenceData = documents
    .filter((d) => d.document_insights.length > 0)
    .map((d, idx) => ({
      name: `Doc ${idx + 1}`,
      overall: Math.round((d.document_insights[0]?.confidence_scores?.overall || 0) * 100),
      extraction: Math.round((d.document_insights[0]?.confidence_scores?.extraction || 0) * 100),
      analysis: Math.round((d.document_insights[0]?.confidence_scores?.analysis || 0) * 100),
      insights: Math.round((d.document_insights[0]?.confidence_scores?.insights || 0) * 100),
    }));

  const riskPieData = [
    { name: 'Critical', value: risksBySeverity.critical, color: '#dc2626' },
    { name: 'High', value: risksBySeverity.high, color: '#ea580c' },
    { name: 'Medium', value: risksBySeverity.medium, color: '#ca8a04' },
    { name: 'Low', value: risksBySeverity.low, color: '#2563eb' },
  ].filter((item) => item.value > 0);

  const actionPieData = [
    { name: 'High', value: actionsByPriority.high, color: '#dc2626' },
    { name: 'Medium', value: actionsByPriority.medium, color: '#ca8a04' },
    { name: 'Low', value: actionsByPriority.low, color: '#16a34a' },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Analytics Dashboard</h2>
        <p className="text-slate-600">Insights across all your analyzed documents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-sm text-slate-600 mb-1">Total Documents</p>
          <p className="text-3xl font-bold text-slate-900">{totalDocuments}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm text-slate-600 mb-1">Avg Confidence</p>
          <p className="text-3xl font-bold text-slate-900">
            {Math.round(avgConfidence * 100)}%
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-sm text-slate-600 mb-1">Total Risks</p>
          <p className="text-3xl font-bold text-slate-900">{allRisks.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckSquare className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-sm text-slate-600 mb-1">Action Items</p>
          <p className="text-3xl font-bold text-slate-900">{allActionItems.length}</p>
        </div>
      </div>

      {confidenceData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Confidence Scores by Document</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="overall" fill="#0f172a" name="Overall" />
              <Bar dataKey="extraction" fill="#3b82f6" name="Extraction" />
              <Bar dataKey="analysis" fill="#10b981" name="Analysis" />
              <Bar dataKey="insights" fill="#8b5cf6" name="Insights" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {riskPieData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Risks by Severity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {riskPieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-medium text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {actionPieData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Actions by Priority</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={actionPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {actionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {actionPieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-700">{item.name} Priority</span>
                  </div>
                  <span className="font-medium text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {totalDocuments === 0 && (
        <div className="bg-slate-50 rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Upload and analyze documents to see analytics</p>
        </div>
      )}
    </div>
  );
}
