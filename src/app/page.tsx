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

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!data.emotional.mood) newErrors.mood = 'Please describe your mood';
    if (!data.cognitive.thoughtPatterns) newErrors.thoughtPatterns = 'Please describe your thoughts';
    return newErrors;
  };

  const handleSubmit = () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    console.log('Assessment submitted:', data);
    // Add your submission logic here
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">
            Mental Health Assessment
          </h1>
          <p className="text-center text-blue-100 text-lg">
            Track and understand your mental well-being
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-2">
          {['emotional', 'cognitive', 'behavioral'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-t-lg font-semibold text-lg capitalize transition-all
                ${activeTab === tab 
                  ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-lg' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mb-6 bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${((activeTab === 'emotional' ? 1 : activeTab === 'cognitive' ? 2 : 3) / 3) * 100}%`
            }}
          />
        </div>

        {/* Content Panel */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8 transition-all duration-300">
          {/* Emotional Assessment */}
          {activeTab === 'emotional' && (
            <div className="space-y-8 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Emotional Assessment</h2>
              
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  How are you feeling today?
                </label>
                <textarea
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-h-[100px]"
                  placeholder="Describe your current emotional state..."
                  value={data.emotional.mood}
                  onChange={(e) => setData({
                    ...data,
                    emotional: { ...data.emotional, mood: e.target.value }
                  })}
                />
                {errors.mood && <p className="text-red-500 mt-1">{errors.mood}</p>}
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
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
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-2xl font-bold text-blue-600 min-w-[2.5rem] text-center">
                    {data.emotional.intensity}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
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
                      className={`px-8 py-4 rounded-lg text-lg font-medium transition-all
                        ${data.emotional.anxiety === (option === 'Yes')
                          ? 'bg-blue-600 text-white shadow-md transform scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'}`}
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
            <div className="space-y-8 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Cognitive Assessment</h2>
              
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
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
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-2xl font-bold text-blue-600 min-w-[2.5rem] text-center">
                    {data.cognitive.concentration}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Describe any recurring thoughts or patterns
                </label>
                <textarea
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-h-[100px]"
                  placeholder="Describe any thoughts that keep coming back..."
                  value={data.cognitive.thoughtPatterns}
                  onChange={(e) => setData({
                    ...data,
                    cognitive: { ...data.cognitive, thoughtPatterns: e.target.value }
                  })}
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Memory Issues
                </label>
                <div className="flex gap-4">
                  {['Yes', 'No'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setData({
                        ...data,
                        cognitive: { ...data.cognitive, memoryIssues: option === 'Yes' }
                      })}
                      className={`px-8 py-4 rounded-lg text-lg font-medium transition-all
                        ${data.cognitive.memoryIssues === (option === 'Yes')
                          ? 'bg-blue-600 text-white shadow-md transform scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Behavioral Assessment */}
          {activeTab === 'behavioral' && (
            <div className="space-y-8 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Behavioral Assessment</h2>
              
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Sleep Quality
                </label>
                <select
                  value={data.behavioral.sleep}
                  onChange={(e) => setData({
                    ...data,
                    behavioral: { ...data.behavioral, sleep: e.target.value }
                  })}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Social Activity Level
                </label>
                <select
                  value={data.behavioral.socialActivity}
                  onChange={(e) => setData({
                    ...data,
                    behavioral: { ...data.behavioral, socialActivity: e.target.value }
                  })}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="normal">Normal</option>
                  <option value="reduced">Reduced</option>
                  <option value="withdrawn">Withdrawn</option>
                  <option value="increased">Increased</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Daily Activities
                </label>
                <div className="space-y-3">
                  {['Exercise', 'Work/Study', 'Hobbies', 'Social Interaction', 'Self-Care'].map(activity => (
                    <label key={activity} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50">
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
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 text-lg">{activity}</span>
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
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
            >
              Previous
            </button>
          )}
          {activeTab !== 'behavioral' ? (
            <button
              onClick={() => setActiveTab(prev => 
                prev === 'emotional' ? 'cognitive' : 'behavioral'
              )}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all ml-auto"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold text-lg ml-auto shadow-lg transform hover:scale-105"
            >
              Submit Assessment
            </button>
          )}
        </div>

        {/* Results Preview (for development) */}
        <div className="mt-8 bg-white rounded-lg shadow-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Data</h2>
          <pre className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  );
}