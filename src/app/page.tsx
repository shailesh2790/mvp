'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { Brain, Activity, Heart, Mic, TrendingUp, LogOut } from 'lucide-react';
import ResultsSection from './components/ResultsSection';

interface DynamicQuestion {
  id: string;
  text: string;
  type: 'scale' | 'text' | 'multiSelect' | 'singleSelect' | 'yesNo';
  options?: string[];
  category: 'emotional' | 'cognitive' | 'behavioral' | 'eq';
  subCategory?: string;
  followUp?: boolean;
  criteria?: string;
  response?: any;
}

interface QuestionResponse {
  question: DynamicQuestion;
  response: any;
}

interface AssessmentData {
  emotional: {
    mood: string;
    intensity: number;
    moodSwings: boolean;
    anxiety: boolean;
    energy: number;
    description: string;
    voiceJournal: string;
  };
  cognitive: {
    concentration: number;
    focusIssues: boolean;
    memoryIssues: boolean;
    thoughtPatterns: string;
    decisionMaking: number;
    clarity: number;
  };
  behavioral: {
    sleep: 'good' | 'fair' | 'poor';
    sleepHours: number;
    socialActivity: 'normal' | 'reduced' | 'withdrawn' | 'increased';
    activities: string[];
    avoidance: boolean;
    routineChanges: boolean;
  };
  eqMetrics: {
    selfAwareness: number;
    empathy: number;
    regulation: number;
    socialSkills: number;
    motivation: number;
  };
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [rangeValue, setRangeValue] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<DynamicQuestion | null>(null);
  const [previousResponses, setPreviousResponses] = useState<Array<{
    question: DynamicQuestion;
    response: any;
  }>>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [showInitialForm, setShowInitialForm] = useState(true);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Main Assessment Data
  const [data, setData] = useState<AssessmentData>({
    emotional: {
      mood: '',
      intensity: 5,
      moodSwings: false,
      anxiety: false,
      energy: 5,
      description: '',
      voiceJournal: ''
    },
    cognitive: {
      concentration: 5,
      focusIssues: false,
      memoryIssues: false,
      thoughtPatterns: '',
      decisionMaking: 5,
      clarity: 5
    },
    behavioral: {
      sleep: 'good',
      sleepHours: 7,
      socialActivity: 'normal',
      activities: [],
      avoidance: false,
      routineChanges: false
    },
    eqMetrics: {
      selfAwareness: 5,
      empathy: 5,
      regulation: 5,
      socialSkills: 5,
      motivation: 5
    }
  });

  useEffect(() => {
    const initializeAssessment = async () => {
      const user = localStorage.getItem('user');
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const history = localStorage.getItem('assessmentHistory');
        if (history) {
          setHistoricalData(JSON.parse(history));
        }
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAssessment();
  }, [router]);

  const startAssessment = async () => {
    try {
      setIsSubmitting(true);
      setShowInitialForm(false);

      const response = await fetch('/api/next-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentQuestion: null,
          currentResponse: null,
          previousResponses: [],
          history: historicalData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start assessment');
      }

      const result = await response.json();
      
      if (result.complete) {
        await handleSubmit();
      } else {
        setCurrentQuestion(result.question);
      }
    } catch (error) {
      console.error('Failed to start assessment:', error);
      alert('Failed to start assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuestionResponse = async (response: any) => {
    try {
      if (!currentQuestion) return;

      // Update current question's response
      const updatedQuestion = {
        ...currentQuestion,
        response: response
      };

      const updatedResponses = [...previousResponses, {
        question: updatedQuestion,
        response: response
      }];

      setPreviousResponses(updatedResponses);

      const nextQuestionResponse = await fetch('/api/next-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentQuestion: updatedQuestion,
          currentResponse: response,
          previousResponses: updatedResponses,
          history: historicalData
        })
      });

      if (!nextQuestionResponse.ok) {
        throw new Error('Failed to get next question');
      }

      const result = await nextQuestionResponse.json();

      if (result.complete) {
        await handleSubmit();
      } else {
        // Reset range value for new questions
        if (result.question.type === 'scale') {
          setRangeValue(5);
        }
        setCurrentQuestion(result.question);
      }
    } catch (error) {
      console.error('Response handling error:', error);
      await handleSubmit();
    }
};



  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setCurrentQuestion(null);

      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentAssessment: data,
          responses: previousResponses,
          history: historicalData
        })
      });

      if (!response.ok) {
        throw new Error('Assessment failed');
      }

      const result = await response.json();
      
      if (result.success && result.assessment) {
        setAssessment(result.assessment);

        // Save to history
        const newHistory = [
          ...historicalData,
          {
            date: new Date().toISOString(),
            data: data,
            responses: previousResponses,
            assessment: result.assessment
          }
        ];
        
        setHistoricalData(newHistory);
        localStorage.setItem('assessmentHistory', JSON.stringify(newHistory));
      } else {
        throw new Error(result.error || 'Failed to generate assessment');
      }

    } catch (error) {
      console.error('Submit error:', error);
      alert('Assessment failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
  
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await handleAudioData(audioBlob);
      };
  
      recorder.start();
      setIsRecording(true);
      setTranscript('');
    } catch (error) {
      console.error('Recording error:', error);
      alert('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };
  



  const handleAudioData = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const { text } = await response.json();
      setTranscript(text);
      
      setData(prev => ({
        ...prev,
        emotional: {
          ...prev.emotional,
          voiceJournal: text
        }
      }));
    } catch (error) {
      console.error('Audio processing error:', error);
      alert('Failed to process audio recording');
    }
  };

  // Render functions
  const renderInitialForm = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Journal</h3>
        <p className="text-gray-600 mb-4">Express your thoughts and feelings verbally</p>
        <div className="flex items-center gap-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-colors
              ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isRecording ? (
              <>
                <span className="animate-pulse">●</span> Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" /> Start Recording
              </>
            )}
          </button>
        </div>

        {transcript && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Transcribed Journal:</h4>
            <p className="text-gray-800">{transcript}</p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          How would you describe your current emotional state?
        </label>
        <textarea
          value={data.emotional.description}
          onChange={(e) => setData(prev => ({
            ...prev,
            emotional: { ...prev.emotional, description: e.target.value }
          }))}
          className="w-full p-4 border-2 border-gray-300 rounded-lg 
            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
            min-h-[120px] text-gray-800 bg-white shadow-sm hover:border-blue-300
            transition-all duration-200"
          placeholder="Describe how you're feeling..."
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Rate your current mood (1-10)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="10"
            value={data.emotional.intensity}
            onChange={(e) => setData(prev => ({
              ...prev,
              emotional: { ...prev.emotional, intensity: parseInt(e.target.value) }
            }))}
            className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-2xl font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg min-w-[3rem] text-center">
            {data.emotional.intensity}
          </span>
        </div>
      </div>

      <button
        onClick={startAssessment}
        disabled={isSubmitting || !data.emotional.description}
        className={`w-full px-8 py-4 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg
          hover:from-blue-800 hover:to-blue-950 transition-colors font-semibold text-lg
          ${(isSubmitting || !data.emotional.description) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? 'Starting Assessment...' : 'Begin Assessment'}
      </button>
    </div>
  );

  const renderDynamicQuestion = () => {
    if (!currentQuestion) return null;

    const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setRangeValue(value);
        handleQuestionResponse(value);
    };
    
    return (
        <div className="p-6 bg-white rounded-lg shadow-lg border-2 border-gray-200">
            {/* Follow-up Question Indicator */}
            {currentQuestion.followUp && (
                <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-600 flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Follow-up Question
                    </p>
                </div>
            )}

            <h3 className="text-xl font-semibold text-gray-900 mb-4">{currentQuestion.text}</h3>
            
            {currentQuestion.type === 'scale' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={rangeValue}
                            onChange={handleRangeChange}
                            className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-2xl font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg min-w-[3rem] text-center">
                            {rangeValue}
                        </span>
                    </div>
                </div>
            )}
            
            {currentQuestion.type === 'multiSelect' && currentQuestion.options && (
                <div className="space-y-3">
                    {currentQuestion.options.map((option) => (
                        <label
                            key={option}
                            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-all duration-200"
                        >
                            <input
                                type="checkbox"
                                onChange={(e) => {
                                    const currentSelection = Array.isArray(currentQuestion.response) 
                                        ? currentQuestion.response 
                                        : [];
                                    const updatedSelection = e.target.checked
                                        ? [...currentSelection, option]
                                        : currentSelection.filter(item => item !== option);
                                    handleQuestionResponse(updatedSelection);
                                }}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-900">{option}</span>
                        </label>
                    ))}
                </div>
            )}
            
            {currentQuestion.type === 'yesNo' && (
                <div className="flex gap-4">
                    {['Yes', 'No'].map((option) => (
                        <button
                            key={option}
                            onClick={() => handleQuestionResponse(option === 'Yes')}
                            className="flex-1 py-4 px-6 rounded-lg font-medium transition-colors hover:bg-blue-50 border-2 border-gray-200 text-gray-900"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
            
            {currentQuestion.type === 'singleSelect' && currentQuestion.options && (
                <div className="space-y-3">
                    {currentQuestion.options.map((option) => (
                        <button
                            key={option}
                            onClick={() => handleQuestionResponse(option)}
                            className="w-full p-4 text-left rounded-lg font-medium transition-colors hover:bg-blue-50 border-2 border-gray-200 text-gray-900"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
            
            {currentQuestion.type === 'text' && (
                <textarea
                    onChange={(e) => handleQuestionResponse(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-h-[120px] text-gray-800 bg-white shadow-sm hover:border-blue-300 transition-all duration-200"
                    placeholder="Type your response here..."
                />
            )}
            
            {/* Question Progress and Category */}
            <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <span>Question {previousResponses.length + 1}</span>
                    {currentQuestion.followUp && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            Follow-up
                        </span>
                    )}
                </div>
                <span className="flex items-center gap-2">
                    {currentQuestion.category === 'emotional' && <Heart className="h-4 w-4" />}
                    {currentQuestion.category === 'cognitive' && <Brain className="h-4 w-4" />}
                    {currentQuestion.category === 'behavioral' && <Activity className="h-4 w-4" />}
                    {currentQuestion.category === 'eq' && <Brain className="h-4 w-4" />}
                    {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)} Assessment
                </span>
            </div>
        </div>
    );
};


 



  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Sukoon</h1>
              <p className="text-lg">Mental Health Assessment</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/analytics')}
                className="px-4 py-2 bg-white text-blue-900 rounded-lg hover:bg-gray-100 
                  transition-colors font-medium flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Analytics
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('user');
                  router.push('/login');
                }}
                className="px-4 py-2 bg-white text-blue-900 rounded-lg hover:bg-gray-100 
                  transition-colors font-medium flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-xl border-2 border-gray-300 p-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700" />
            </div>
          ) : (
            <>
              {showInitialForm && !assessment ? (
                renderInitialForm()
              ) : currentQuestion ? (
                renderDynamicQuestion()
              ) : assessment ? (
                <ResultsSection 
                  assessment={assessment}
                  history={historicalData}
                />
              ) : null}
            </>
          )}
        </div>

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center 
            justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full mx-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 
                border-blue-700 mx-auto" />
              <p className="mt-4 text-center text-gray-700">
                {assessment ? 'Processing Assessment...' : 'Starting Assessment...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
