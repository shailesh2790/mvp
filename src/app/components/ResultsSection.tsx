'use client';

import React from 'react';
import { Brain, AlertCircle } from 'lucide-react';

interface PrimaryAssessment {
  severity?: string;
  category?: string;
  nimhansClassification?: string;
  symptoms?: string[];
}

interface PsychometricScores {
  phq9?: number;
  gad7?: number;
  eqScore?: number;
}

interface TreatmentPlan {
  immediate?: string[];
  longTerm?: string[];
  therapeuticApproaches?: string[];
}

interface ProfessionalCare {
  recommended?: boolean;
  recommendationType?: string;
  urgencyLevel?: string;
  specialistReferral?: string[];
}

interface AssessmentResult {
  primary?: PrimaryAssessment;
  psychometricScores?: PsychometricScores;
  treatmentPlan?: TreatmentPlan;
  professionalCare?: ProfessionalCare;
}

interface ResultsSectionProps {
  assessment: AssessmentResult;
}

const safeMap = (arr: any[] | undefined, fn: (item: any, index: number) => React.ReactNode) => {
  return arr?.map(fn) || [];
};

const ResultsSection: React.FC<ResultsSectionProps> = ({ assessment }) => {
  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'severe': return 'bg-red-100 text-red-800 border-red-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'mild': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getRiskLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (type: string, score?: number) => {
    if (score === undefined) return 'text-gray-600';
    
    switch(type) {
      case 'phq9':
        if (score <= 4) return 'text-green-600';
        if (score <= 9) return 'text-yellow-600';
        if (score <= 14) return 'text-orange-600';
        return 'text-red-600';
      case 'gad7':
        if (score <= 4) return 'text-green-600';
        if (score <= 9) return 'text-yellow-600';
        if (score <= 14) return 'text-orange-600';
        return 'text-red-600';
      case 'eq':
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        if (score >= 40) return 'text-orange-600';
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!assessment || !assessment.primary) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">Assessment data is not available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Early Diagnostics Assessment Results</h2>

      {/* Primary Assessment */}
      <div className="bg-white rounded-lg shadow-lg border-2 border-blue-300 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="text-blue-500" />
          Primary Assessment
        </h3>
        <div className={`inline-block px-4 py-2 rounded-full font-medium ${getSeverityColor(assessment.primary?.severity)}`}>
          Severity: {assessment.primary?.severity || 'Not specified'}
        </div>
        <div className="mt-2 text-gray-700">Category: {assessment.primary?.category || 'Not specified'}</div>
        <div className="mt-2 text-gray-700">
          NIMHANS Classification: {assessment.primary?.nimhansClassification || 'Not specified'}
        </div>
        
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 mb-2">Primary Symptoms:</h4>
          <ul className="list-disc pl-5 space-y-2">
            {safeMap(assessment.primary?.symptoms, (symptom: string, index: number) => (
              <li key={index} className="text-gray-800">{symptom}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Psychometric Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-4 border-2 border-purple-200">
          <h4 className="font-medium text-gray-900 mb-2">PHQ-9 Score</h4>
          <div className={`text-2xl font-bold ${getScoreColor('phq9', assessment.psychometricScores?.phq9)}`}>
            {assessment.psychometricScores?.phq9 ?? 'N/A'}/27
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-2 border-blue-200">
          <h4 className="font-medium text-gray-900 mb-2">GAD-7 Score</h4>
          <div className={`text-2xl font-bold ${getScoreColor('gad7', assessment.psychometricScores?.gad7)}`}>
            {assessment.psychometricScores?.gad7 ?? 'N/A'}/21
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-2 border-green-200">
          <h4 className="font-medium text-gray-900 mb-2">EQ Score</h4>
          <div className={`text-2xl font-bold ${getScoreColor('eq', assessment.psychometricScores?.eqScore)}`}>
            {assessment.psychometricScores?.eqScore ?? 'N/A'}/100
          </div>
        </div>
      </div>

      {/* Treatment Recommendations */}
      {assessment.treatmentPlan && (
        <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">NIMHANS Treatment Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Immediate Actions:</h4>
              <ul className="list-disc pl-5 space-y-2">
                {safeMap(assessment.treatmentPlan.immediate, (action, index) => (
                  <li key={index} className="text-gray-800">{action}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Long-term Strategies:</h4>
              <ul className="list-disc pl-5 space-y-2">
                {safeMap(assessment.treatmentPlan.longTerm, (strategy, index) => (
                  <li key={index} className="text-gray-800">{strategy}</li>
                ))}
              </ul>
            </div>
          </div>

          
          
          <div className="mt-4">
            <h4 className="font-medium text-black-900 mb-2">Recommended Therapeutic Approaches:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeMap(assessment.treatmentPlan.therapeuticApproaches, (approach, index) => (
                <div key={index} className="text-gray-800">
                    <p className="text-blue-900 font-medium">{approach}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Professional Care Recommendations */}
      {assessment.professionalCare?.recommended && (
        <div className="bg-red-50 rounded-lg shadow-lg border-l-4 border-red-500 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-red-500 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Professional Care Recommended</h3>
              <div className="mt-2 space-y-3">
                <p className="text-red-700">
                  {assessment.professionalCare.recommendationType} Treatment Recommended
                </p>
                <p className="font-medium text-red-800">
                  Urgency Level: {assessment.professionalCare.urgencyLevel}
                </p>
                <div className="mt-3">
                  <h4 className="font-medium text-red-800 mb-2">Specialist Referrals:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {safeMap(assessment.professionalCare.specialistReferral, (specialist, index) => (
                      <li key={index} className="text-red-700">{specialist}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsSection;