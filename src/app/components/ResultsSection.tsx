'use client';

import { Brain, Activity, AlertTriangle, Heart, Stethoscope, FileText, ListChecks, ThermometerSun } from 'lucide-react';
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
      case 'severe': 
        return { bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-300', progressBg: 'bg-red-500' };
      case 'moderate': 
        return { bg: 'bg-yellow-100', text: 'text-yellow-900', border: 'border-yellow-300', progressBg: 'bg-yellow-500' };
      case 'mild': 
        return { bg: 'bg-green-100', text: 'text-green-900', border: 'border-green-300', progressBg: 'bg-green-500' };
      default: 
        return { bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-300', progressBg: 'bg-blue-500' };
    }
  };

  const renderSymptomList = (symptoms: string[], title: string, bgColor: string = 'bg-gray-50', textColor: string = 'text-gray-700') => (
    <div className={`mt-4 p-4 ${bgColor} rounded-lg shadow-sm`}>
      <h5 className={`font-semibold ${textColor} mb-2`}>{title}</h5>
      <ul className="list-disc pl-5 space-y-2">
        {symptoms.map((symptom, index) => (
          <li key={index} className={textColor}>{symptom}</li>
        ))}
      </ul>
    </div>
  );

  const renderScoreCard = (title: string, icon: JSX.Element, score: number, severity: string, symptoms: string[], extraContent?: JSX.Element) => {
    const colors = getSeverityColor(severity);
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {icon}
            {title}
          </h4>
          <span className={`px-4 py-2 rounded-full text-base font-bold ${colors.bg} ${colors.text} ${colors.border}`}>
            Score: {score}/10
          </span>
        </div>
        <div className="relative h-4 mb-6">
          <Progress 
            value={score * 10} 
            className="h-full rounded-full"
            color={colors.progressBg}
          />
          <div className="absolute top-full left-0 right-0 flex justify-between mt-1 text-sm text-gray-500">
            <span>Minimal</span>
            <span>Moderate</span>
            <span>Severe</span>
          </div>
        </div>
        {symptoms.length > 0 && renderSymptomList(symptoms, 'Key Symptoms')}
        {extraContent}
      </div>
    );
  };

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      {/* Clinical Assessment Summary */}
      <Card className="border-2 border-blue-300 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-white border-b-2 border-blue-200">
          <CardTitle className="flex items-center gap-3 text-2xl text-blue-900 font-bold">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            Clinical Assessment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ThermometerSun className="h-6 w-6 text-blue-500" />
                Overall Severity:
              </h3>
              <span className={`px-6 py-3 rounded-full text-lg font-bold ${getSeverityColor(assessment.screening.depression.severity).bg} ${getSeverityColor(assessment.screening.depression.severity).text}`}>
                {assessment.screening.depression.severity.toUpperCase()}
              </span>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-lg text-gray-700 leading-relaxed">
                {assessment.summary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Assessment Scores */}
      <Card className="border-2 border-gray-200 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-100 to-white border-b-2 border-gray-200">
          <CardTitle className="flex items-center gap-3 text-2xl text-gray-900 font-bold">
            <Activity className="h-7 w-7 text-blue-600" />
            Detailed Assessment Scores
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* Depression Score */}
          {renderScoreCard(
            'Depression Screening',
            <Heart className="h-6 w-6 text-red-500" />,
            assessment.screening.depression.score,
            assessment.screening.depression.severity,
            assessment.screening.depression.keySymptoms
          )}

          {/* Anxiety Score */}
          {renderScoreCard(
            'Anxiety Screening',
            <AlertTriangle className="h-6 w-6 text-yellow-500" />,
            assessment.screening.anxiety.score,
            assessment.screening.anxiety.severity,
            assessment.screening.anxiety.keySymptoms
          )}

          {/* Bipolar Score */}
          {renderScoreCard(
            'Bipolar Screening',
            <Brain className="h-6 w-6 text-purple-500" />,
            assessment.screening.bipolar.score,
            assessment.screening.bipolar.severity,
            assessment.screening.bipolar.keySymptoms,
            assessment.screening.bipolar.moodPatterns?.length > 0 && (
              renderSymptomList(
                assessment.screening.bipolar.moodPatterns,
                'Mood Patterns',
                'bg-purple-50',
                'text-purple-700'
              )
            )
          )}
        </CardContent>
      </Card>

      {/* Treatment Recommendations */}
      <Card className="border-2 border-green-300 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-100 to-white border-b-2 border-green-200">
          <CardTitle className="flex items-center gap-3 text-2xl text-gray-900 font-bold">
            <FileText className="h-7 w-7 text-green-600" />
            Treatment Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {assessment.recommendations.immediate.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="text-lg font-bold text-red-900 mb-3">Immediate Actions</h4>
                <ul className="space-y-2">
                  {assessment.recommendations.immediate.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-red-800">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {assessment.recommendations.professional.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-lg font-bold text-blue-900 mb-3">Professional Support</h4>
                <ul className="space-y-2">
                  {assessment.recommendations.professional.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-blue-800">
                      <Stethoscope className="h-5 w-5 text-blue-500 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {assessment.recommendations.selfCare.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-lg font-bold text-green-900 mb-3">Self-Care Steps</h4>
                <ul className="space-y-2">
                  {assessment.recommendations.selfCare.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-green-800">
                      <Heart className="h-5 w-5 text-green-500 mt-0.5" />
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