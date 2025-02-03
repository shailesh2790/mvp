'use client';

import { Brain, Activity, AlertTriangle, Heart, ListChecks, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui/card';
import { useState } from 'react';

interface ResultsSectionProps {
  assessment: {
    patterns: string[];
    progress: {
      improvements: string[];
      concerns: string[];
    };
    personalizedRecommendations: string[];
    earlyWarningSignals: string[];
    eqDevelopment: {
      strengths: string[];
      areasForImprovement: string[];
      exercises: string[];
    };
  };
  history?: any[];
}

export default function ResultsSection({ assessment }: ResultsSectionProps) {
  const [currentSection, setCurrentSection] = useState(0);

  // If assessment is null or undefined, show loading state
  if (!assessment) {
    return (
      <div className="p-6 text-gray-500 text-center text-xl">
        Loading assessment results...
      </div>
    );
  }

  // Create safe data with distinct variable names to avoid overwriting
  const safeData = {
    patterns: assessment.patterns || [],
    progressImprovements: assessment.progress?.improvements || [],
    progressConcerns: assessment.progress?.concerns || [],
    recommendations: assessment.personalizedRecommendations || [],
    warnings: assessment.earlyWarningSignals || [],
    strengths: assessment.eqDevelopment?.strengths || [],
    eqImprovements: assessment.eqDevelopment?.areasForImprovement || [],
    exercises: assessment.eqDevelopment?.exercises || []
  };

  const handlePrevious = () => {
    setCurrentSection(currentSection - 1);
  };

  const handleNext = () => {
    setCurrentSection(currentSection + 1);
  };

  const handleRetakeAssessment = () => {
    // Reset assessment state and redirect to the first question
  };

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      {currentSection === 0 && (
        <div>
          {/* Behavioral Patterns Card */}
          {safeData.patterns.length > 0 && (
            <Card className="border-2 border-blue-300 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-white">
                <CardTitle className="flex items-center gap-3">
                  <Brain className="h-6 w-6 text-blue-600" />
                  Behavioral Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {safeData.patterns.map((pattern, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <ListChecks className="h-5 w-5 text-blue-500 mt-1" />
                      {pattern}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {currentSection === 1 && (
        <div>
          {/* Progress Tracking Card */}
          {(safeData.progressImprovements.length > 0 || safeData.progressConcerns.length > 0) && (
            <Card className="border-2 border-green-300 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-100 to-white">
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  Progress Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {safeData.progressImprovements.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-bold text-green-900 mb-3">Improvements</h4>
                    <ul className="space-y-2">
                      {safeData.progressImprovements.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-green-800">
                          <Activity className="h-5 w-5 text-green-500 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {safeData.progressConcerns.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-bold text-yellow-900 mb-3">Areas of Concern</h4>
                    <ul className="space-y-2">
                      {safeData.progressConcerns.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-yellow-800">
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {currentSection === 2 && (
        <div>
          {/* Personalized Recommendations Card */}
          {safeData.recommendations.length > 0 && (
            <Card className="border-2 border-purple-300 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-white">
                <CardTitle className="flex items-center gap-3">
                  <Heart className="h-6 w-6 text-purple-600" />
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {safeData.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <ListChecks className="h-5 w-5 text-purple-500 mt-1" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {currentSection === 3 && (
        <div>
          {/* Early Warning Signs Card */}
          {safeData.warnings.length > 0 && (
            <Card className="border-2 border-red-300 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-100 to-white">
                <CardTitle className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  Early Warning Signs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {safeData.warnings.map((warning, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-1" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {currentSection === 4 && (
        <div>
          {/* Emotional Intelligence Development Card */}
          {(safeData.strengths.length > 0 || safeData.eqImprovements.length > 0 || safeData.exercises.length > 0) && (
            <Card className="border-2 border-blue-300 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-white">
                <CardTitle className="flex items-center gap-3">
                  <Brain className="h-6 w-6 text-blue-600" />
                  Emotional Intelligence Development
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {safeData.strengths.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-bold text-green-900 mb-3">Strengths</h4>
                    <ul className="space-y-2">
                      {safeData.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2 text-green-800">
                          <Activity className="h-5 w-5 text-green-500 mt-0.5" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {safeData.eqImprovements.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-bold text-yellow-900 mb-3">Areas for Improvement</h4>
                    <ul className="space-y-2">
                      {safeData.eqImprovements.map((area, i) => (
                        <li key={i} className="flex items-start gap-2 text-yellow-800">
                          <Brain className="h-5 w-5 text-yellow-500 mt-0.5" />
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {safeData.exercises.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-900 mb-3">Recommended Exercises</h4>
                    <ul className="space-y-2">
                      {safeData.exercises.map((exercise, i) => (
                        <li key={i} className="flex items-start gap-2 text-blue-800">
                          <ListChecks className="h-5 w-5 text-blue-500 mt-0.5" />
                          {exercise}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex justify-between mt-6">
        {currentSection > 0 && (
          <Button onClick={handlePrevious} className="flex items-center gap-2">
            <ChevronLeft className="h-5 w-5" />
            Previous
          </Button>
        )}
        {currentSection < 4 && (
          <Button onClick={handleNext} className="flex items-center gap-2">
            Next
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
        {currentSection === 4 && (
          <Button onClick={handleRetakeAssessment} className="flex items-center gap-2">
            Retake Assessment
          </Button>
        )}
      </div>
    </div>
  );
}