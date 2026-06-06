import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, CheckSquare, Square, Check, RefreshCw } from 'lucide-react';

export default function PomodoroTimer() {
  // Timer States
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  // Task States
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('pomodoro_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Read lecture notes', completed: false },
      { id: 2, text: 'Do math assignments', completed: false }
    ];
  });
  const [newTaskText, setNewTaskText] = useState('');

  // Save tasks to local storage
  useEffect(() => {
    localStorage.setItem('pomodoro_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Handle Timer Ticking
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            
            // Alarm / Switch mode
            alert(mode === 'focus' ? 'Focus session completed! Time for a break.' : 'Break session over! Time to focus.');
            
            // Switch mode automatically
            const nextMode = mode === 'focus' ? 'break' : 'focus';
            setMode(nextMode);
            return (nextMode === 'focus' ? 25 : 5) * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft((mode === 'focus' ? 25 : 5) * 60);
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft((newMode === 'focus' ? 25 : 5) * 60);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Task Handlers
  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTaskText.trim(), completed: false }]);
    setNewTaskText('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  // Progress Calculation
  const totalDuration = (mode === 'focus' ? 25 : 5) * 60;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/80 transition-all duration-300 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      
      {/* Left Column: Pomodoro Timer */}
      <div className="flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700/60 pb-6 md:pb-0 md:pr-6">
        
        {/* Header */}
        <div className="text-center w-full">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Study Timer</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pomodoro focus & rest cycles</p>
          
          {/* Mode Switchers */}
          <div className="flex justify-center space-x-2 mt-4 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
            <button
              onClick={() => switchMode('focus')}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl transition-all duration-200 ${
                mode === 'focus'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Focus (25m)
            </button>
            <button
              onClick={() => switchMode('break')}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl transition-all duration-200 ${
                mode === 'break'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Short Break (5m)
            </button>
          </div>
        </div>

        {/* Circular Display / Timer representation */}
        <div className="relative my-6 flex items-center justify-center">
          <svg className="w-36 h-36 transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="64"
              className="stroke-slate-100 dark:stroke-slate-900"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r="64"
              className={`transition-all duration-300 ${
                mode === 'focus' ? 'stroke-emerald-500' : 'stroke-sky-500'
              }`}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 64}
              strokeDashoffset={2 * Math.PI * 64 * (1 - progressPercent / 100)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center select-none">
            <span className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
              {formatTime(timeLeft)}
            </span>
            <span className={`text-[10px] font-semibold tracking-widest uppercase mt-0.5 ${
              mode === 'focus' ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-600 dark:text-sky-400'
            }`}>
              {mode === 'focus' ? 'Focus' : 'Break'}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTimer}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-2xl font-bold text-sm text-white transition-all duration-300 shadow-md ${
              isRunning
                ? 'bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500'
                : mode === 'focus'
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10'
                : 'bg-sky-500 hover:bg-sky-600 shadow-sky-500/10'
            }`}
          >
            {isRunning ? (
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
            onClick={resetTimer}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900 dark:hover:bg-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-850 transition-all"
            title="Reset Timer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Right Column: Study Checklist */}
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Session Checklist</h4>
            {tasks.some(t => t.completed) && (
              <button
                onClick={clearCompleted}
                className="text-[10px] font-semibold text-red-500 hover:underline hover:text-red-600"
              >
                Clear Done
              </button>
            )}
          </div>

          {/* Task input */}
          <form onSubmit={addTask} className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="What are you working on?"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="flex-grow px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-slate-100"
            />
            <button
              type="submit"
              className="p-1.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>

          {/* Task list container */}
          <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
            {tasks.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No tasks added. Add one above!
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-200 text-xs ${
                    task.completed
                      ? 'bg-slate-50/80 border-slate-100 text-slate-400 dark:bg-slate-900/40 dark:border-slate-850'
                      : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350'
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center space-x-2 text-left flex-grow"
                  >
                    {task.completed ? (
                      <div className="p-0.5 rounded bg-emerald-500 text-white">
                        <Check className="h-3 w-3 stroke-[3px]" />
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded border border-slate-300 dark:border-slate-700 flex-shrink-0" />
                    )}
                    <span className={task.completed ? 'line-through' : ''}>
                      {task.text}
                    </span>
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-400 dark:text-slate-500 flex justify-between items-center">
          <span>Completed: {tasks.filter(t => t.completed).length}/{tasks.length} tasks</span>
          <span>Be focused, take breaks!</span>
        </div>
      </div>

    </div>
  );
}
