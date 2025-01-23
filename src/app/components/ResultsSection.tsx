'use client';

import { Brain, Activity, AlertTriangle, Heart, Stethoscope, FileText, ListChecks } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ResultsSectionProps {
  assessment: {
    screening: {
      depression: {
        score: number;
        severity: string;
        keySymptoms: string[];
      };
      anxiety: {
        score: number;
        severity: string;
        keySymptoms: string[];
      };
      bipolar: {
        score: number;
        severity: string;
        keySymptoms: string[];
        moodPatterns: string[];
      };
    };
    summary: string;
    clinicalReport: {
      diagnosticConsiderations: Array<{
        condition: string;
        icdCode: string;
        indicators: string[];
        differentials: string[];
      }>;
      recommendedAssessments: string[];
      clinicalImpressions: string[];
      riskFactors: string[];
    };
    recommendations: {
      immediate: string[];
      professional: string[];
      selfCare: string[];
      lifestyle: string[];
      support: string[];
      warningSignals: string[];
    };
  };
}

const ResultsSection = ({ assessment }: ResultsSectionProps) => {
  if (!assessment) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe': return 'bg-red-100 text-red-800 border-red-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'mild': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* Clinical Assessment Summary */}
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
          <CardTitle className="flex items-center gap-3 text-2xl text-blue-800">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            Clinical Assessment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Overall Severity */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Overall Severity:</h3>
              <span className={`px-4 py-2 rounded-full font-bold ${
                getSeverityColor(assessment.screening.depression.severity)
              }`}>
                {assessment.screening.depression.severity.toUpperCase()}
              </span>
            </div>

            {/* Summary */}
            <p className="text-gray-700">{assessment.summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Assessment Scores */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
            <Activity className="h-6 w-6 text-blue-500" />
            Detailed Assessment Scores
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Depression Scores */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Depression Screening</h4>
              <span className={`px-3 py-1 rounded-full text-sm ${
                getSeverityColor(assessment.screening.depression.severity)
              }`}>
                {assessment.screening.depression.score}/10
              </span>
            </div>
            <Progress value={assessment.screening.depression.score * 10} className="h-2" />
            {assessment.screening.depression.keySymptoms.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Key Symptoms: {assessment.screening.depression.keySymptoms.join(', ')}
              </div>
            )}
          </div>

          {/* Anxiety Scores */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Anxiety Screening</h4>
              <span className={`px-3 py-1 rounded-full text-sm ${
                getSeverityColor(assessment.screening.anxiety.severity)
              }`}>
                {assessment.screening.anxiety.score}/10
              </span>
            </div>
            <Progress value={assessment.screening.anxiety.score * 10} className="h-2" />
            {assessment.screening.anxiety.keySymptoms.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Key Symptoms: {assessment.screening.anxiety.keySymptoms.join(', ')}
              </div>
            )}
          </div>

          {/* Bipolar Screening */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Bipolar Screening</h4>
              <span className={`px-3 py-1 rounded-full text-sm ${
                getSeverityColor(assessment.screening.bipolar.severity)
              }`}>
                {assessment.screening.bipolar.score}/10
              </span>
            </div>
            <Progress value={assessment.screening.bipolar.score * 10} className="h-2" />
            {assessment.screening.bipolar.keySymptoms.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Key Symptoms: {assessment.screening.bipolar.keySymptoms.join(', ')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Treatment Recommendations */}
      <Card className="border-2 border-green-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-white">
          <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
            <FileText className="h-6 w-6 text-green-500" />
            Treatment Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {assessment.recommendations.immediate.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-3">Immediate Actions</h4>
                <ul className="space-y-2">
                  {assessment.recommendations.immediate.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-red-700">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {assessment.recommendations.professional.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">Professional Support</h4>
                <ul className="space-y-2">
                  {assessment.recommendations.professional.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-blue-700">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {assessment.recommendations.selfCare.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">Self-Care Steps</h4>
                <ul className="space-y-2">
                  {assessment.recommendations.selfCare.map((rec, index) => (
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