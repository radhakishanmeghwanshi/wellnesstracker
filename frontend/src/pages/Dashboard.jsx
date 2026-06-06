import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import MoodTracker from '../components/MoodTracker';
import PomodoroTimer from '../components/PomodoroTimer';
import BreathingWidget from '../components/BreathingWidget';
import { Sparkles, Heart, Activity, ShieldAlert, Award, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { user, api } = useAuth();
  const [moodHistory, setMoodHistory] = useState([]);
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch mood data
  const fetchData = useCallback(async () => {
    try {
      const response = await api.get('/moods');
      if (response.data && response.data.success) {
        const moods = response.data.data;
        setMoodHistory(moods.slice(0, 5)); // Keep only latest 5 for history list
        
        // Calculate average score and count
        if (moods.length > 0) {
          const sum = moods.reduce((acc, m) => acc + m.score, 0);
          setStats({
            average: Number((sum / moods.length).toFixed(1)),
            count: moods.length
          });
        } else {
          setStats({ average: 0, count: 0 });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard mood data:', error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Greeting based on current time
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Generate personalized insights based on average mood score
  const getWellnessInsight = () => {
    if (stats.count === 0) {
      return {
        title: 'Start your journey',
        message: 'Log your first mood check-in to begin receiving personalized wellness suggestions.',
        color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/40',
        icon: Sparkles
      };
    }

    if (stats.average < 2.5) {
      return {
        title: 'Taking Time for Yourself',
        message: "It looks like your mood has been a bit low lately. Remember that it's okay to feel overwhelmed. Consider doing a quick box breathing session or stepping away from your studies for a 15-minute break.",
        color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40',
        icon: ShieldAlert
      };
    }

    if (stats.average >= 2.5 && stats.average < 4.0) {
      return {
        title: 'Maintaining Balance',
        message: 'Your emotional health is steady. Remember to blend focused study periods with active self-care, like stretching or talking to a classmate. Keep up the balance!',
        color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40',
        icon: Activity
      };
    }

    return {
      title: 'Thriving & Resilient',
      message: "You're in a great mental space! Take a moment to write down what has been bringing you joy today in your journal to solidify these positive memories.",
      color: 'text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/40',
      icon: Award
    };
  };

  const insight = getWellnessInsight();
  const InsightIcon = insight.icon;

  const emojiMap = {
    1: { char: '😢', name: 'Awful' },
    2: { char: '😕', name: 'Struggling' },
    3: { char: '😐', name: 'Okay' },
    4: { char: '🙂', name: 'Good' },
    5: { char: '😄', name: 'Excellent' }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-emerald-50 to-sky-50 dark:from-slate-800/40 dark:to-slate-800/80 p-6 md:p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm transition-all duration-300">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {getGreeting()}, {user?.name}!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Your personal mental wellness sanctuary. Let's practice mindfulness today.
          </p>
        </div>
        <div className="flex items-center space-x-6 mt-4 md:mt-0">
          <div className="flex flex-col items-center bg-white dark:bg-slate-800 px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/60">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.average > 0 ? stats.average : '--'}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Avg Mood
            </span>
          </div>
          <div className="flex flex-col items-center bg-white dark:bg-slate-800 px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/60">
            <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              {stats.count}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Total Logs
            </span>
          </div>
        </div>
      </div>

      {/* Wellness Insights & Quick check-in */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Wellness Insight & Interactive Widgets */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Insights Box */}
          <div className={`p-6 rounded-3xl border transition-all duration-300 flex items-start space-x-4 ${insight.color}`}>
            <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/60 shadow-sm flex-shrink-0">
              <InsightIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight mb-1">{insight.title}</h3>
              <p className="text-xs leading-relaxed opacity-95">{insight.message}</p>
            </div>
          </div>

          {/* Pomodoro Timer */}
          <div className="h-auto">
            <PomodoroTimer />
          </div>

          {/* Breathing Widget */}
          <div className="h-auto">
            <BreathingWidget />
          </div>

        </div>

        {/* Right 1 Col: Log Mood & Recent Logs */}
        <div className="space-y-8">
          
          {/* Mood tracker widget */}
          <MoodTracker onMoodLogged={fetchData} />

          {/* Recent Mood History logs */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/80 transition-all duration-300">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-emerald-500" />
              Recent Logs
            </h3>

            {loading ? (
              <div className="text-center py-6 text-xs text-slate-400">Loading...</div>
            ) : moodHistory.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No moods logged yet. Check-in above!
              </div>
            ) : (
              <div className="space-y-3.5">
                {moodHistory.map((log) => (
                  <div
                    key={log._id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 flex items-start space-x-3 text-xs"
                  >
                    <span className="text-2xl filter drop-shadow-sm select-none">
                      {emojiMap[log.score]?.char || '😐'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-700 dark:text-slate-350">
                          {emojiMap[log.score]?.name || 'Okay'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      {log.note && (
                        <p className="text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-1.5">
                          "{log.note}"
                        </p>
                      )}

                      {log.tags && log.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {log.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/40 text-[9px] font-semibold"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
