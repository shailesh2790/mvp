'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, Brain } from 'lucide-react';

function AnalyticsPage() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndLoadData = () => {
      const user = localStorage.getItem('user');
      if (!user) {
        router.push('/login');
        return;
      }

      const historyData = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
      setHistory(historyData);
      setIsLoading(false);
    };

    checkAuthAndLoadData();
  }, [router]);

  // Process data for charts
  const processedData = history.map(entry => ({
    date: new Date(entry.date).toLocaleDateString(),
    emotionalIntensity: entry.data.emotional.intensity,
    anxiety: entry.data.emotional.anxiety ? 1 : 0,
    concentration: entry.data.cognitive.concentration,
    sleepHours: entry.data.behavioral.sleepHours,
    selfAwareness: entry.data.eqMetrics.selfAwareness
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with improved contrast */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Mood Tracking Analytics</h1>
              <p className="text-gray-100 mt-2">Track your emotional well-being over time</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-white text-blue-900 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Back to Assessment
            </button>
          </div>
        </div>

        {/* Charts Section with better visibility */}
        <div className="space-y-8">
          {/* Mood Trends Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Mood Intensity Trends</h2>
            <div className="h-[400px]"> {/* Increased height for better visibility */}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#4b5563"
                    tick={{ fill: '#4b5563', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#4b5563"
                    tick={{ fill: '#4b5563', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      fontSize: '14px',
                      paddingTop: '20px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="emotionalIntensity" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    name="Emotional Intensity"
                    dot={{ stroke: '#6366f1', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="concentration" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Concentration"
                    dot={{ stroke: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sleep Pattern Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Sleep Patterns</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#4b5563"
                    tick={{ fill: '#4b5563', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#4b5563"
                    tick={{ fill: '#4b5563', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      fontSize: '14px',
                      paddingTop: '20px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sleepHours" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Sleep Hours"
                    dot={{ stroke: '#f59e0b', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

    

export default AnalyticsPage;