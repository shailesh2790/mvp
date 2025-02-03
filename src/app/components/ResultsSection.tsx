import { Brain, Activity, AlertTriangle, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

const ResultsSection = () => {
  const [currentSection, setCurrentSection] = useState(0);

  // Sample assessment data
  const assessment = {
    timestamp: new Date().toISOString(),
    scores: {
      emotional: 7.5,
      cognitive: 6.8,
      behavioral: 8.2,
      overall: 7.5,
      anxiety: 4.2,
      depression: 3.8,
      stress: 5.1,
      eq: 7.8
    },
    summary: "Your assessment indicates overall good mental well-being with particularly strong behavioral health scores.",
    detailedAnalysis: {
      emotional: {
        summary: "Your emotional health shows good resilience and stability.",
        details: ["Strong emotional awareness", "Effective stress management"],
        recommendations: ["Practice daily mindfulness", "Continue journaling"]
      },
      cognitive: {
        summary: "Your cognitive function demonstrates above-average performance.",
        details: ["Good problem-solving skills", "Strong memory retention"],
        recommendations: ["Try new learning challenges", "Engage in brain training"]
      },
      behavioral: {
        summary: "Your behavioral patterns show healthy adaptability.",
        details: ["Consistent sleep schedule", "Regular exercise routine"],
        recommendations: ["Maintain current routines", "Add variety to activities"]
      },
      conditionSpecific: {
        summary: "Some areas may benefit from targeted attention.",
        details: ["Moderate stress levels noted", "Sleep quality could improve"],
        recommendations: ["Consider stress reduction techniques", "Optimize sleep environment"]
      }
    },
    historicalTrends: {
      trend: "Showing consistent improvement over the past 3 months",
      changes: ["15% reduction in stress levels", "20% improvement in sleep quality"],
      recommendations: ["Continue current practices", "Focus on maintaining gains"]
    }
  };

  const getSeverityColor = (score) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score) => {
    if (score >= 7) return 'bg-green-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handlePrevious = () => {
    setCurrentSection(currentSection - 1);
  };

  const handleNext = () => {
    setCurrentSection(currentSection + 1);
  };

  const handleRetakeAssessment = () => {
    // Reset assessment state and redirect to the first question
    console.log("Retake assessment clicked");
  };

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      {currentSection === 0 && (
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
                {/* Score cards */}
                {Object.entries({
                  'Emotional Health': assessment.scores.emotional,
                  'Cognitive Function': assessment.scores.cognitive,
                  'Behavioral Health': assessment.scores.behavioral,
                  'Emotional Intelligence': assessment.scores.eq
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
      )}

      {currentSection === 1 && (
        <div>
          {Object.entries(assessment.detailedAnalysis).map(([category, analysis]) => (
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
                  
                  {analysis.details.length > 0 && (
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
                  
                  {analysis.recommendations.length > 0 && (
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

      {currentSection === 2 && assessment.historicalTrends && (
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
              <Activity className="h-6 w-6 text-indigo-500" />
              Progress & Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-800 text-lg mb-6">{assessment.historicalTrends.trend}</p>
            {assessment.historicalTrends.changes.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Notable Changes</h4>
                <ul className="space-y-2">
                  {assessment.historicalTrends.changes.map((change, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
            className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
        {currentSection === 2 && (
          <button
            onClick={handleRetakeAssessment}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            Retake Assessment
          </button>
        )}
      </div>
    </div>
  );
};

export default ResultsSection;