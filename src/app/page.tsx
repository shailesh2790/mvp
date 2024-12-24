'use client';

import React, { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('emotional');
  const [data, setData] = useState({
    emotional: {
      mood: '',
      intensity: 5,
      moodSwings: false,
      anxiety: false,
      energy: 5,
      description: ''
    },
    cognitive: {
      concentration: 5,
      focusIssues: false,
      memoryIssues: false,
      thoughtPatterns: '',
      decisionMaking: 5
    },
    behavioral: {
      sleep: 'good',
      sleepHours: 7,
      socialActivity: 'normal',
      activities: [],
      avoidance: false
    }
  });

  const handleSubmit = () => {
    console.log('Assessment submitted:', data);
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">
            Mental Health Assessment
          </h1>
          <p className="text-center text-white text-lg">
            Track and understand your mental well-being
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-2">
          {['emotional', 'cognitive', 'behavioral'].map((tab) => (
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

        {/* Content Panel */}
        <div className="bg-white rounded-lg shadow-xl border-2 border-gray-300 p-8">
          {/* Emotional Assessment */}
          {activeTab === 'emotional' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Emotional Assessment</h2>
              
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  How are you feeling today?
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

              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Are you feeling anxious?
                </label>
                <div className="flex gap-4">
                  {['Yes', 'No'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setData({
                        ...data,
                        emotional: { ...data.emotional, anxiety: option === 'Yes' }
                      })}
                      className={`px-8 py-4 rounded-lg text-lg font-medium transition-colors
                        ${data.emotional.anxiety === (option === 'Yes')
                          ? 'bg-blue-700 text-white shadow-md'
                          : 'bg-white text-gray-900 hover:bg-gray-50 border-2 border-gray-300'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cognitive Assessment */}
          {activeTab === 'cognitive' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cognitive Assessment</h2>
              
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
                  <span className="text-2xl font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg min-w-[3rem] text-center border-2 border-blue-200">
                    {data.cognitive.concentration}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Do you have memory issues?
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
                          ? 'bg-blue-700 text-white shadow-md'
                          : 'bg-white text-gray-900 hover:bg-gray-50 border-2 border-gray-300'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Describe any recurring thoughts
                </label>
                <textarea
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-h-[100px] text-gray-900 text-lg bg-white shadow-inner"
                  placeholder="Describe any thoughts that keep coming back..."
                  value={data.cognitive.thoughtPatterns}
                  onChange={(e) => setData({
                    ...data,
                    cognitive: { ...data.cognitive, thoughtPatterns: e.target.value }
                  })}
                />
              </div>
            </div>
          )}

          {/* Behavioral Assessment */}
          {activeTab === 'behavioral' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Behavioral Assessment</h2>
              
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Sleep Quality
                </label>
                <select
                  value={data.behavioral.sleep}
                  onChange={(e) => setData({
                    ...data,
                    behavioral: { ...data.behavioral, sleep: e.target.value }
                  })}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-lg bg-white shadow-inner"
                >
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Social Activity Level
                </label>
                <select
                  value={data.behavioral.socialActivity}
                  onChange={(e) => setData({
                    ...data,
                    behavioral: { ...data.behavioral, socialActivity: e.target.value }
                  })}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-lg bg-white shadow-inner"
                >
                  <option value="normal">Normal</option>
                  <option value="reduced">Reduced</option>
                  <option value="withdrawn">Withdrawn</option>
                  <option value="increased">Increased</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Daily Activities
                </label>
                <div className="space-y-3">
                  {['Exercise', 'Work/Study', 'Hobbies', 'Social Interaction', 'Self-Care'].map(activity => (
                    <label key={activity} className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer">
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
                        className="w-5 h-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-900 text-lg">{activity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {activeTab !== 'emotional' && (
            <button
              onClick={() => setActiveTab(prev => 
                prev === 'behavioral' ? 'cognitive' : 'emotional'
              )}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
          )}
          {activeTab !== 'behavioral' ? (
            <button
              onClick={() => setActiveTab(prev => 
                prev === 'emotional' ? 'cognitive' : 'behavioral'
              )}
              className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors ml-auto"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-4 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg hover:from-blue-800 hover:to-blue-950 transition-colors font-semibold text-lg ml-auto shadow-lg"
            >
              Submit Assessment
            </button>
          )}
        </div>

        {/* Current Data Display */}
        <div className="mt-8 bg-white rounded-lg shadow-xl border-2 border-gray-300 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Data</h2>
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
            <pre className="text-gray-900 text-base whitespace-pre-wrap font-mono">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}