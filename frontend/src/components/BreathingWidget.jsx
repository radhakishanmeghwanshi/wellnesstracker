import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Wind } from 'lucide-react';

const BREATH_MODES = {
  box: {
    name: 'Box Breathing',
    description: 'Relieves stress and regulates the nervous system.',
    steps: [
      { phase: 'Inhale', duration: 4, cssClass: 'animate-breath-inhale-4', instruction: 'Breathe in slowly through your nose...' },
      { phase: 'Hold', duration: 4, cssClass: 'animate-breath-hold-4', instruction: 'Suspend your breath, keeping your body relaxed...' },
      { phase: 'Exhale', duration: 4, cssClass: 'animate-breath-exhale-4', instruction: 'Gently release your breath through your mouth...' },
      { phase: 'Hold', duration: 4, cssClass: 'animate-breath-hold-collapsed-4', instruction: 'Rest and wait before the next cycle...' }
    ]
  },
  '478': {
    name: '4-7-8 Breathing',
    description: 'Promotes deep relaxation and aids in falling asleep.',
    steps: [
      { phase: 'Inhale', duration: 4, cssClass: 'animate-breath-inhale-4', instruction: 'Inhale quietly through your nose...' },
      { phase: 'Hold', duration: 7, cssClass: 'animate-breath-hold-7', instruction: 'Hold your breath and focus on stillness...' },
      { phase: 'Exhale', duration: 8, cssClass: 'animate-breath-exhale-8', instruction: 'Exhale fully with a gentle whooshing sound...' }
    ]
  }
};

export default function BreathingWidget() {
  const [modeKey, setModeKey] = useState('box');
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(BREATH_MODES.box.steps[0].duration);
  const timerRef = useRef(null);

  const mode = BREATH_MODES[modeKey];
  const currentStep = mode.steps[stepIndex];

  // Handle ticking
  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Go to next step
          const nextIndex = (stepIndex + 1) % mode.steps.length;
          setStepIndex(nextIndex);
          return mode.steps[nextIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, stepIndex, modeKey, mode.steps.length]);

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setStepIndex(0);
    setSecondsLeft(mode.steps[0].duration);
  };

  const handleModeChange = (newModeKey) => {
    setModeKey(newModeKey);
    setIsActive(false);
    setStepIndex(0);
    setSecondsLeft(BREATH_MODES[newModeKey].steps[0].duration);
  };

  // Get color depending on the phase
  const getPhaseColor = () => {
    if (!isActive) return 'bg-slate-300 dark:bg-slate-700';
    switch (currentStep.phase) {
      case 'Inhale': return 'bg-emerald-500 shadow-emerald-500/30';
      case 'Hold': return 'bg-amber-400 shadow-amber-400/30';
      case 'Exhale': return 'bg-sky-500 shadow-sky-500/30';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/80 transition-all duration-300 flex flex-col items-center justify-between h-full min-h-[420px]">
      
      {/* Widget Header */}
      <div className="w-full text-center">
        <div className="flex items-center justify-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-1">
          <Wind className="h-5 w-5" />
          <h3 className="font-bold text-lg">Breathing Exercise</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Find calm and center your focus
        </p>

        {/* Mode Selector */}
        <div className="flex justify-center space-x-2 mt-4 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
          {Object.entries(BREATH_MODES).map(([key, item]) => (
            <button
              key={key}
              onClick={() => handleModeChange(key)}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl transition-all duration-200 ${
                modeKey === key
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Breathing Circle */}
      <div className="relative flex items-center justify-center my-8 h-48 w-48">
        {/* Outer glowing ripple ring when active */}
        {isActive && (
          <div className={`absolute inset-0 rounded-full opacity-25 animate-ping-slow ${getPhaseColor()}`} />
        )}
        
        {/* Animated breathing circle */}
        <div
          key={`${modeKey}-${stepIndex}-${isActive}`} // force remount animation on step change
          className={`h-24 w-24 rounded-full flex flex-col items-center justify-center text-white font-bold transition-all shadow-lg select-none ${getPhaseColor()} ${
            isActive ? currentStep.cssClass : 'scale-100'
          }`}
        >
          <div className="text-3xl font-extrabold tracking-tighter">
            {isActive ? secondsLeft : 'Ready'}
          </div>
          <div className="text-[10px] uppercase tracking-widest opacity-80 mt-0.5">
            {isActive ? currentStep.phase : 'Breath'}
          </div>
        </div>
      </div>

      {/* Instructions & Controls */}
      <div className="w-full text-center space-y-4">
        {/* Instruction Text */}
        <div className="h-12 flex items-center justify-center px-4">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">
            {isActive ? currentStep.instruction : mode.description}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={toggleActive}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-300 shadow-md ${
              isActive
                ? 'bg-slate-700 hover:bg-slate-600 text-white dark:bg-slate-600 dark:hover:bg-slate-500'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="h-4 w-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                <span>Start</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900 dark:hover:bg-slate-700 dark:text-slate-400 transition-all border border-slate-200 dark:border-slate-800"
            title="Reset"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
