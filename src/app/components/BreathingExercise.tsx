// components/BreathingExercise.tsx
'use client';

import { useState, useEffect } from 'react';

export default function BreathingExercise() {
  const [phase, setPhase] = useState('inhale');
  const [count, setCount] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      if (count === 0) {
        switch (phase) {
          case 'inhale':
            setPhase('hold');
            setCount(4);
            break;
          case 'hold':
            setPhase('exhale');
            setCount(4);
            break;
          case 'exhale':
            setPhase('inhale');
            setCount(4);
            break;
        }
      } else {
        setCount(c => c - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, count]);

  return (
    <div className="flex items-center justify-center p-8">
      <div className={`w-48 h-48 rounded-full flex flex-col items-center justify-center
        transition-transform duration-1000 bg-blue-100 border-4 border-blue-500
        ${phase === 'inhale' ? 'scale-110' : phase === 'exhale' ? 'scale-90' : ''}`}>
        <span className="text-xl font-bold text-blue-800">{phase}</span>
        <span className="text-3xl font-bold text-blue-600">{count}</span>
      </div>
    </div>
  );
}