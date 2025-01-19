'use client';

import { Brain, Activity, AlertTriangle, Heart, Stethoscope, FileText, ListChecks } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ResultsSectionProps {
  assessment: any; // We'll keep it as any for now to debug
}

const ResultsSection = ({ assessment }: ResultsSectionProps) => {
  if (!assessment) return null;

  const getSeverityColor = (severity: string = 'moderate') => {
    switch (severity.toLowerCase()) {
      case 'severe': return 'bg-red-100 text-red-800 border-red-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'mild': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getProgressColor = (score: number = 5) => {
    if (score >= 7) return 'bg-green-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Safely access nested properties
  const scores = assessment.scores || {};
  const clinicalSummary = assessment.clinicalSummary || {};
  const recommendations = assessment.recommendations || {};

  // Debug log
  console.log('Assessment data:', {
    scores,
    clinicalSummary,
    recommendations
  });

  return (
    <div className="space-y-8">
      {/* Clinical Summary Card */}
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
          <CardTitle className="flex items-center gap-3 text-2xl text-blue-800">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            Clinical Assessment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">Overall Severity:</span>
              <span className={`px-4 py-2 rounded-full text-lg font-bold border ${getSeverityColor(clinicalSummary.severity)}`}>
                {(clinicalSummary.severity || 'Moderate').toUpperCase()}
              </span>
            </div>

            {/* ICD Codes */}
            {clinicalSummary.icdCodes && clinicalSummary.icdCodes.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Clinical Classifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clinicalSummary.icdCodes.map((code: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <p className="font-medium text-gray-700">{code.condition?.toUpperCase()}</p>
                      <div className="flex gap-4 mt-1 text-sm">
                        <span className="text-blue-600">ICD-10: {code.icd10}</span>
                        <span className="text-blue-600">ICD-11: {code.icd11}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NIMHANS Scales */}
            {clinicalSummary.nimhansScales && clinicalSummary.nimhansScales.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Recommended NIMHANS Assessments</h4>
                <ul className="space-y-2">
                  {clinicalSummary.nimhansScales.map((scale: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <ListChecks className="h-5 w-5 text-blue-500 mt-0.5" />
                      <span>{scale}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scores and Analysis Card */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
            <Activity className="h-6 w-6 text-blue-500" />
            Detailed Assessment Scores
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {Object.entries(scores).map(([domain, score]) => (
              <div key={domain} className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-gray-700 capitalize">{domain} Health</p>
                  <span className={`text-lg font-bold ${Number(score) >= 7 ? 'text-green-600' : Number(score) >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {typeof score === 'number' ? score.toFixed(1) : '0'}/10
                  </span>
                </div>
                <div className="h-2.5 w-full bg-gray-200 rounded-full">
                  <div 
                    className={`h-2.5 rounded-full ${getProgressColor(Number(score))} transition-all duration-500`}
                    style={{ width: `${Number(score) * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Card */}
      <Card className="border-2 border-green-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-white">
          <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
            <FileText className="h-6 w-6 text-green-500" />
            Treatment Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {recommendations.immediate?.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-3">Immediate Actions</h4>
                <ul className="space-y-2">
                  {recommendations.immediate.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-red-700">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.shortTerm?.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">Short-Term Goals</h4>
                <ul className="space-y-2">
                  {recommendations.shortTerm.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-blue-700">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.longTerm?.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">Long-Term Strategy</h4>
                <ul className="space-y-2">
                  {recommendations.longTerm.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-green-700">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsSection;