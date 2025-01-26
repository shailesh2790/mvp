'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const questions = [
  {
    id: 1,
    text: "How would you rate your mood over the past week?",
    category: "emotional",
    subCategory: "mood",
    type: "scale"
  },
  {
    id: 2,
    text: "How often have you felt anxious or worried?",
    category: "emotional",
    subCategory: "anxiety",
    type: "scale"
  }
];

export default function AssessmentPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = async (value) => {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/assess', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            responses: Object.entries(newAnswers).map(([_, value]) => ({
              question: questions[parseInt(_)],
              response: value
            }))
          })
        });
        
        if (response.ok) {
          router.push('/');
        }
      } catch (error) {
        console.error('Assessment submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-bold text-white mb-8">Mental Health Assessment</h1>
        
        {currentQuestion < questions.length && (
          <div className="space-y-6">
            <p className="text-lg text-white">{questions[currentQuestion].text}</p>
            
            <div className="flex flex-col space-y-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswer(value)}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50"
                >
                  {value}
                </button>
              ))}
            </div>
            
            <div className="text-gray-400 text-sm text-center">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}