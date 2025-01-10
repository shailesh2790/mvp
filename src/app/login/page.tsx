'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleAnonymousLogin = () => {
    // Store a simple user object in localStorage
    localStorage.setItem('user', JSON.stringify({
      id: `anonymous-${Date.now()}`,
      isAnonymous: true
    }));
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Welcome to Sukoon
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Mental Health Assessment Platform
        </p>
        <button
          onClick={handleAnonymousLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Start Assessment
        </button>
      </div>
    </div>
  );
}