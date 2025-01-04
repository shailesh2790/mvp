'use client';

import React, { useState, useRef } from 'react';
import { 
  Brain, 
  Activity, 
  Heart, 
  Mic, 
  AlertCircle, 
  TrendingUp 
} from 'lucide-react';
import ResultsSection from './components/ResultsSection';

// Types
interface EmotionalData {
  mood: string;
  intensity: number;
  moodSwings: boolean;
  anxiety: boolean;
  energy: number;
  description: string;
  voiceJournal: string;
}

interface CognitiveData {
  concentration: number;
  focusIssues: boolean;
  memoryIssues: boolean;
  thoughtPatterns: string;
  decisionMaking: number;
  clarity: number;
}

interface BehavioralData {
  sleep: 'good' | 'fair' | 'poor';
  sleepHours: number;
  socialActivity: 'normal' | 'reduced' | 'withdrawn' | 'increased';
  activities: string[];
  avoidance: boolean;
  routineChanges: boolean;
}

interface EQMetrics {
  selfAwareness: number;
  empathy: number;
  regulation: number;
  socialSkills: number;
  motivation: number;
}

interface AssessmentData {
  emotional: EmotionalData;
  cognitive: CognitiveData;
  behavioral: BehavioralData;
  eqMetrics: EQMetrics;
}

interface AssessmentResult {
  primary?: {
    severity?: string;
    category?: string;
    nimhansClassification?: string;
    symptoms?: string[];
  };
  psychometricScores?: {
    phq9?: number;
    gad7?: number;
    eqScore?: number;
  };
  treatmentPlan?: {
    immediate?: string[];
    longTerm?: string[];
    therapeuticApproaches?: string[];
  };
  professionalCare?: {
    recommended?: boolean;
    recommendationType?: string;
    urgencyLevel?: string;
    specialistReferral?: string[];
  };
}

export default function Home() {
  // States
  const [activeTab, setActiveTab] = useState<string>('emotional');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);

  
  // Voice Recording States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [hasVoicePermission, setHasVoicePermission] = useState<boolean>(false);

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

  // Voice Recording Functions
  const getMicPermission = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      setHasVoicePermission(true);
      return mediaStream;
    } catch (err) {
      alert('Please enable your microphone to use voice journaling');
      return null;
    }
  };

  const startRecording = async () => {
    const stream = await getMicPermission();
    if (!stream) return;

    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        await convertSpeechToText(event.data);
      }
    };
    mediaRecorder.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  const convertSpeechToText = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Transcription failed');
      
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
      console.error('Speech to text error:', error);
      alert('Failed to transcribe audio. Please try again.');
    }
  };

  // Modify your handleSubmit function
const handleSubmit = async () => {
  try {
    setIsSubmitting(true);
    console.log('Submitting data:', data); // Debug log

    const response = await fetch('/api/assess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentAssessment: data,
        history: localStorage.getItem('assessmentHistory')
      })
    });

    const result = await response.json();
    console.log('API Response:', result); // Debug log

    if (!response.ok) {
      throw new Error(result.error || 'Assessment failed');
    }
    
    setAssessment(result);
    setActiveTab('results');


  
      // Save to history
      const history = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
      history.push({
        date: new Date().toISOString(),
        data,
        results: result
      });
      localStorage.setItem('assessmentHistory', JSON.stringify(history));
  
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to process assessment: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Functions
  // Render Functions
  const renderEmotionalAssessment = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        <div className="flex items-center gap-2">
          <Heart className="text-red-500" />
          Emotional Assessment
        </div>
      </h2>

      {/* Voice Journal */}
      <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Journal</h3>
        <p className="text-gray-600 mb-4">Express your thoughts and feelings verbally</p>
        <div className="flex items-center gap-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-colors ${
              isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <Mic className={`h-5 w-5 ${isRecording ? 'animate-pulse' : ''}`} />
            {isRecording ? 'Stop Recording' : 'Start Voice Journal'}
          </button>
          {transcript && (
            <span className="text-green-600 text-sm">Transcription complete!</span>
          )}
        </div>
        {transcript && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Transcribed Journal:</h4>
            <p className="text-gray-800">{transcript}</p>
          </div>
        )}
      </div>

      {/* Mood Description */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          How would you describe your mood today?
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-h-[100px] text-gray-900 text-lg bg-white shadow-inner"
          placeholder="Describe your current emotional state..."
          value={data.emotional.mood}
          onChange={(e) => setData({
            ...data,
            emotional: { ...data.emotional, mood: e.target.value }
          })}
        />
      </div>

      {/* Emotional Intensity */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Emotional Intensity (1-10)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="10"
            value={data.emotional.intensity}
            onChange={(e) => setData({
              ...data,
              emotional: { ...data.emotional, intensity: parseInt(e.target.value) }
            })}
            className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-2xl font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg min-w-[3rem] text-center border-2 border-blue-200">
            {data.emotional.intensity}
          </span>
        </div>
      </div>

      {/* Additional Emotional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood Swings */}
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            Experiencing mood swings?
          </label>
          <div className="flex gap-4">
            {['Yes', 'No'].map((option) => (
              <button
                key={option}
                onClick={() => setData({
                  ...data,
                  emotional: { ...data.emotional, moodSwings: option === 'Yes' }
                })}
                className={`px-8 py-4 rounded-lg text-lg font-medium transition-colors ${
                  data.emotional.moodSwings === (option === 'Yes')
                    ? 'bg-blue-700 text-white shadow-md'
                    : 'bg-white text-gray-900 hover:bg-gray-50 border-2 border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Anxiety Check */}
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            Feeling anxious?
          </label>
          <div className="flex gap-4">
            {['Yes', 'No'].map((option) => (
              <button
                key={option}
                onClick={() => setData({
                  ...data,
                  emotional: { ...data.emotional, anxiety: option === 'Yes' }
                })}
                className={`px-8 py-4 rounded-lg text-lg font-medium transition-colors ${
                  data.emotional.anxiety === (option === 'Yes')
                    ? 'bg-blue-700 text-white shadow-md'
                    : 'bg-white text-gray-900 hover:bg-gray-50 border-2 border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* EQ Self-Assessment */}
      <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emotional Intelligence Check</h3>
        <div className="space-y-6">
          {[
            { key: 'selfAwareness', label: 'Self-Awareness Level' },
            { key: 'empathy', label: 'Empathy Level' },
            { key: 'regulation', label: 'Emotional Regulation' },
          ].map((metric) => (
            <div key={metric.key}>
              <label className="block text-md font-medium text-gray-800 mb-2">
                {metric.label} (1-10)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={data.eqMetrics[metric.key]}
                  onChange={(e) => setData({
                    ...data,
                    eqMetrics: {
                      ...data.eqMetrics,
                      [metric.key]: parseInt(e.target.value)
                    }
                  })}
                  className="flex-1 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xl font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-lg min-w-[2.5rem] text-center">
                  {data.eqMetrics[metric.key]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCognitiveAssessment = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        <div className="flex items-center gap-2">
          <Brain className="text-purple-500" />
          Cognitive Assessment
        </div>
      </h2>

      {/* Concentration Level */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Concentration Level (1-10)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="10"
            value={data.cognitive.concentration}
            onChange={(e) => setData({
              ...data,
              cognitive: { ...data.cognitive, concentration: parseInt(e.target.value) }
            })}
            className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-2xl font-bold text-purple-700 bg-purple-50 px-4 py-2 rounded-lg min-w-[3rem] text-center border-2 border-purple-200">
            {data.cognitive.concentration}
          </span>
        </div>
      </div>

      {/* Memory Issues */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Experiencing memory issues?
        </label>
        <div className="flex gap-4">
          {['Yes', 'No'].map((option) => (
            <button
              key={option}
              onClick={() => setData({
                ...data,
                cognitive: { ...data.cognitive, memoryIssues: option === 'Yes' }
              })}
              className={`px-8 py-4 rounded-lg text-lg font-medium transition-colors
                ${data.cognitive.memoryIssues === (option === 'Yes')
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'bg-white text-gray-900 hover:bg-gray-50 border-2 border-gray-300'}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Focus Issues */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Having trouble focusing?
        </label>
        <div className="flex gap-4">
          {['Yes', 'No'].map((option) => (
            <button
              key={option}
              onClick={() => setData({
                ...data,
                cognitive: { ...data.cognitive, focusIssues: option === 'Yes' }
              })}
              className={`px-8 py-4 rounded-lg text-lg font-medium transition-colors
                ${data.cognitive.focusIssues === (option === 'Yes')
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'bg-white text-gray-900 hover:bg-gray-50 border-2 border-gray-300'}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Thought Patterns */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Describe any recurring thoughts
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 min-h-[100px] text-gray-900 text-lg bg-white shadow-inner"
          placeholder="Describe any thoughts that keep coming back..."
          value={data.cognitive.thoughtPatterns}
          onChange={(e) => setData({
            ...data,
            cognitive: { ...data.cognitive, thoughtPatterns: e.target.value }
          })}
        />
      </div>

      {/* Mental Clarity */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Mental Clarity (1-10)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="10"
            value={data.cognitive.clarity}
            onChange={(e) => setData({
              ...data,
              cognitive: { ...data.cognitive, clarity: parseInt(e.target.value) }
            })}
            className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-2xl font-bold text-purple-700 bg-purple-50 px-4 py-2 rounded-lg min-w-[3rem] text-center border-2 border-purple-200">
            {data.cognitive.clarity}
          </span>
        </div>
      </div>
    </div>
  );

  const renderBehavioralAssessment = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        <div className="flex items-center gap-2">
          <Activity className="text-green-500" />
          Behavioral Assessment
        </div>
      </h2>

      {/* Sleep Quality */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Sleep Quality
        </label>
        <select
          value={data.behavioral.sleep}
          onChange={(e) => setData({
            ...data,
            behavioral: { ...data.behavioral, sleep: e.target.value as 'good' | 'fair' | 'poor' }
          })}
          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-900 text-lg bg-white shadow-inner"
        >
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      {/* Sleep Hours */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Hours of Sleep
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="12"
            value={data.behavioral.sleepHours}
            onChange={(e) => setData({
              ...data,
              behavioral: { ...data.behavioral, sleepHours: parseInt(e.target.value) }
            })}
            className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-2xl font-bold text-green-700 bg-green-50 px-4 py-2 rounded-lg min-w-[3rem] text-center border-2 border-green-200">
            {data.behavioral.sleepHours}h
          </span>
        </div>
      </div>

      {/* Social Activity Level */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Social Activity Level
        </label>
        <select
          value={data.behavioral.socialActivity}
          onChange={(e) => setData({
            ...data,
            behavioral: { ...data.behavioral, socialActivity: e.target.value as 'normal' | 'reduced' | 'withdrawn' | 'increased' }
          })}
          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-900 text-lg bg-white shadow-inner"
        >
          <option value="normal">Normal</option>
          <option value="reduced">Reduced</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="increased">Increased</option>
        </select>
      </div>

      {/* Daily Activities */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Daily Activities
        </label>
        <div className="space-y-3">
          {['Exercise', 'Work/Study', 'Hobbies', 'Social Interaction', 'Self-Care'].map(activity => (
            <label key={activity} className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:bg-green-50 cursor-pointer">
              <input
                type="checkbox"
                checked={data.behavioral.activities.includes(activity)}
                onChange={(e) => {
                  const newActivities = e.target.checked
                    ? [...data.behavioral.activities, activity]
                    : data.behavioral.activities.filter(a => a !== activity);
                  setData({
                    ...data,
                    behavioral: { ...data.behavioral, activities: newActivities }
                  });
                }}
                className="w-5 h-5 rounded border-gray-400 text-green-600 focus:ring-green-500"
              />
              <span className="text-gray-900 text-lg">{activity}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  {activeTab === 'results' && assessment && (
    <div className="bg-white rounded-lg shadow-xl p-6">
      {/* Debug View */}
      <div className="mb-4 p-4 bg-gray-100 rounded overflow-auto">
        <p className="font-bold mb-2">Debug Data:</p>
        <pre className="text-xs">{JSON.stringify(assessment, null, 2)}</pre>
      </div>
      <ResultsSection assessment={assessment} />
    </div>
  )}
         
  



  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">Sukoon</h1>
          <p className="text-center text-white text-lg">Diagnose, Track mood and enhance your EQ</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-2">
          {['emotional', 'cognitive', 'behavioral', ...(assessment ? ['results'] : [])].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-t-lg font-semibold text-lg capitalize transition-colors
                ${activeTab === tab 
                  ? 'bg-white text-blue-700 border-t-4 border-blue-700 shadow-lg' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-100'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg shadow-xl border-2 border-gray-300 p-8">
          {activeTab === 'emotional' && renderEmotionalAssessment()}
          {activeTab === 'cognitive' && renderCognitiveAssessment()}
          {activeTab === 'behavioral' && renderBehavioralAssessment()}
          {activeTab === 'results' && assessment && (
            <div className="bg-white rounded-lg shadow-xl p-6">
              <ResultsSection assessment={assessment} />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {activeTab !== 'emotional' && activeTab !== 'results' && (
              <button
                onClick={() => setActiveTab(prev => prev === 'behavioral' ? 'cognitive' : 'emotional')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
            )}
            {activeTab !== 'behavioral' && activeTab !== 'results' ? (
              <button
                onClick={() => setActiveTab(prev => prev === 'emotional' ? 'cognitive' : 'behavioral')}
                className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors ml-auto"
              >
                Next
              </button>
            ) : activeTab === 'behavioral' ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-8 py-4 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg 
                  hover:from-blue-800 hover:to-blue-950 transition-colors font-semibold text-lg ml-auto 
                  shadow-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Processing Assessment...' : 'Get NIMHANS Assessment'}
              </button>
            ) : null}
          </div>
        </div>

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full mx-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto" />
              <p className="mt-4 text-center text-gray-700">Analyzing your responses...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}