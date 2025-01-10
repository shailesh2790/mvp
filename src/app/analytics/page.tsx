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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Mood Tracking Analytics</h1>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Assessment
            </button>
          </div>

          {/* Mood Trends Chart */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold mb-4">Mood Intensity Trends</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="emotionalIntensity" 
                    stroke="#8884d8" 
                    name="Emotional Intensity"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="concentration" 
                    stroke="#82ca9d" 
                    name="Concentration"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sleep Pattern Chart */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Sleep Patterns</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sleepHours" 
                    stroke="#ffa726" 
                    name="Sleep Hours"
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