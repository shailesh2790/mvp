import { Brain, Activity, AlertTriangle, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

interface ResultsSectionProps {
  assessment: {
    screening: {
      depression: { score: number; severity: string; keySymptoms: string[] };
      anxiety: { score: number; severity: string; keySymptoms: string[] };
      bipolar: { score: number; severity: string; keySymptoms: string[]; moodPatterns: string[] };
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
  router: any;
  onRetake: () => void;
}

const ResultsSection = ({ assessment, router, onRetake }: ResultsSectionProps) => {
    const [currentSection, setCurrentSection] = useState(0);
    
    if (!assessment) return null;
   
    const calculateScores = () => ({
      emotional: ((assessment.screening.depression.score + assessment.screening.anxiety.score) / 2),
      cognitive: assessment.screening.depression.score * 0.7,
      behavioral: assessment.screening.anxiety.score * 0.8,
      overall: (assessment.screening.depression.score + assessment.screening.anxiety.score + assessment.screening.bipolar.score) / 3,
      anxiety: assessment.screening.anxiety.score,
      depression: assessment.screening.depression.score,
      stress: assessment.screening.anxiety.score * 0.9,
      eq: assessment.screening.depression.score * 0.6
    });
   
    const scores = calculateScores();
   
    const getSeverityColor = (score) => {
      if (score >= 7) return 'text-red-600';
      if (score >= 5) return 'text-yellow-600';
      return 'text-green-600';
    };
   
    const getProgressColor = (score) => {
      if (score >= 7) return 'bg-red-500';
      if (score >= 5) return 'bg-yellow-500';
      return 'bg-green-500';
    };
   
    const detailedAnalysis = {
      emotional: {
        summary: "Analysis of emotional health patterns",
        details: assessment.screening.anxiety.keySymptoms,
        recommendations: assessment.recommendations.selfCare
      },
      cognitive: {
        summary: "Evaluation of cognitive function",
        details: assessment.screening.depression.keySymptoms,
        recommendations: assessment.recommendations.lifestyle || []
      },
      behavioral: {
        summary: "Assessment of behavioral patterns",
        details: assessment.clinicalReport.clinicalImpressions,
        recommendations: assessment.recommendations.professional || []
      },
      conditionSpecific: {
        summary: "Specific condition analysis",
        details: assessment.clinicalReport.riskFactors,
        recommendations: assessment.recommendations.immediate
      }
    };
   
    const handlePrevious = () => setCurrentSection(currentSection - 1);
    const handleNext = () => setCurrentSection(currentSection + 1);
   
    return (
      <div className="space-y-8 p-6 max-w-5xl mx-auto">
        {currentSection === 0 && (
          <div className="space-y-6">
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                <CardTitle className="flex items-center gap-3 text-2xl text-blue-800">
                  <Activity className="h-8 w-8 text-blue-600" />
                  Assessment Results
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <p className="text-xl font-semibold text-gray-800">{assessment.summary}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {Object.entries({
                      'Emotional Health': scores.emotional,
                      'Cognitive Function': scores.cognitive,
                      'Behavioral Health': scores.behavioral,
                      'Emotional Intelligence': scores.eq
                    }).map(([label, score]) => (
                      <div key={label} className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-semibold text-gray-700">{label}</p>
                          <span className={`text-lg font-bold ${getSeverityColor(score)}`}>
                            {score.toFixed(1)}/10
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-200 rounded-full">
                          <div 
                            className={`h-2.5 rounded-full ${getProgressColor(score)}`}
                            style={{ width: `${score * 10}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
   
            <Card className="border-2 border-red-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-white">
                <CardTitle className="flex items-center gap-3 text-xl text-red-800">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  Clinical Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <span className="font-semibold text-gray-700">Risk Level:</span>
                    <span className="text-red-600 font-bold">{assessment.screening.depression.severity}</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="font-semibold text-gray-700">Recommended Action:</span>
                    <span className="text-blue-600">{assessment.recommendations.immediate[0]}</span>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Primary Concerns</h4>
                    <ul className="space-y-2">
                      {assessment.clinicalReport.clinicalImpressions.map((concern, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Warning Signs</h4>
                    <ul className="space-y-2">
                      {assessment.recommendations.warningSignals.map((sign, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-yellow-500 mt-1">•</span>
                          <span>{sign}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
   
        {currentSection === 1 && (
          <div>
            {Object.entries(detailedAnalysis).map(([category, analysis]) => (
              <Card key={category} className="border-2 border-gray-200 shadow-lg mb-6">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                  <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
                    {category === 'emotional' && <Heart className="h-6 w-6 text-red-500" />}
                    {category === 'cognitive' && <Brain className="h-6 w-6 text-purple-500" />}
                    {category === 'behavioral' && <Activity className="h-6 w-6 text-blue-500" />}
                    {category === 'conditionSpecific' && <AlertTriangle className="h-6 w-6 text-yellow-500" />}
                    {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')} Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <p className="text-gray-800 text-lg">{analysis.summary}</p>
                    
                    {analysis.details?.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-3">Key Observations</h4>
                        <ul className="space-y-2">
                          {analysis.details.map((detail, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {analysis.recommendations?.length > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-3">Recommendations</h4>
                        <ul className="space-y-2">
                          {analysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700">
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
            ))}
          </div>
        )}
   
        {currentSection === 2 && (
          <Card className="border-2 border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
              <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
                <Activity className="h-6 w-6 text-indigo-500" />
                Professional Report
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {assessment.clinicalReport.diagnosticConsiderations.map((diagnosis, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">{diagnosis.condition} ({diagnosis.icdCode})</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Indicators:</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          {diagnosis.indicators.map((indicator, i) => (
                            <li key={i} className="text-gray-600">{indicator}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Differential Considerations:</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          {diagnosis.differentials.map((diff, i) => (
                            <li key={i} className="text-gray-600">{diff}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Recommended Assessments</h4>
                  <ul className="space-y-2">
                    {assessment.clinicalReport.recommendedAssessments.map((assessment, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{assessment}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
   
        <div className="flex justify-between mt-6">
          {currentSection > 0 && (
            <button 
              onClick={handlePrevious}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </button>
          )}
          {currentSection < 2 && (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600 ml-auto"
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
          {currentSection === 2 && (
            <button
              onClick={onRetake}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600 ml-auto"
            >
              Retake Assessment
            </button>
          )}
        </div>
      </div>
    );
   };
   
   export default ResultsSection;