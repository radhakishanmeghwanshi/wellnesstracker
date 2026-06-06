import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Brain, Heart, Sparkles, AlertTriangle, CheckCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Reflection() {
  const { api } = useAuth();
  
  // States
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'low' | 'medium' | 'high'

  useEffect(() => {
    const fetchJournals = async () => {
      setLoading(true);
      try {
        const response = await api.get('/journals');
        if (response.data && response.data.success) {
          // Keep only those with AI reflections
          const reflectedJournals = response.data.data.filter(j => j.aiReflection);
          setJournals(reflectedJournals);
        }
      } catch (error) {
        console.error('Failed to fetch journals for reflection page:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJournals();
  }, [api]);

  // Filters reflections based on selected distress level
  const filteredJournals = journals.filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'high') {
      return item.aiReflection.distressLevel === 'high' || item.aiReflection.distressLevel === 'severe';
    }
    return item.aiReflection.distressLevel === selectedFilter;
  });

  // Consolidates actionable tips from all filtered entries
  const allTips = journals.reduce((acc, current) => {
    const tips = current.aiReflection?.actionableTips || [];
    // Only fetch non-crisis tips to keep tips positive, or include crisis warning separately
    if (!current.aiReflection?.crisisDetected) {
      return [...acc, ...tips];
    }
    return acc;
  }, []);

  // Remove duplicates and limit to top 6 unique tips
  const uniqueTips = [...new Set(allTips)].slice(0, 6);

  // Distress level styling helper
  const getDistressBadgeColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40';
      case 'medium': 
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40';
      case 'high':
      case 'severe': 
        return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40';
      default: 
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-350 dark:border-slate-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-tr from-emerald-500 to-sky-500 rounded-3xl p-6 md:p-8 text-white shadow-md shadow-emerald-500/10 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 fill-white/10" />
            <h1 className="text-2xl font-black tracking-tight">AI Reflection Center</h1>
          </div>
          <p className="text-xs text-emerald-50/90 max-w-2xl leading-relaxed">
            Here you can find all synthesized reflections from your journal entries. Your AI companion analyzes your writing tone, estimates emotional distress, and gives personalized advice.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex-shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center">
            <span className="block text-2xl font-black">{journals.length}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">Reflections Logs</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Aggregated Coping Tips */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/80 transition-all duration-300">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-emerald-500" />
              Your Actionable Tips
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">Wellness steps recommended by AI based on your journals</p>

            {uniqueTips.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Write some journal entries and click "Ask AI for Reflection" to generate tips.
              </div>
            ) : (
              <div className="space-y-3">
                {uniqueTips.map((tip, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 flex items-start space-x-2.5 text-xs text-slate-600 dark:text-slate-350"
                  >
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-normal">{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Reflection Cards & Filters */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Filters Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-sm transition-all duration-300">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-350">
              Filter by Distress Level:
            </span>
            <div className="flex space-x-1">
              {['all', 'low', 'medium', 'high'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedFilter(lvl)}
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold capitalize transition-all duration-200 ${
                    selectedFilter === lvl
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-500 dark:bg-slate-900 dark:hover:bg-slate-750 dark:text-slate-400'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Reflections List */}
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading reflection entries...</div>
          ) : filteredJournals.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700/80 text-slate-400 text-xs">
              {journals.length === 0 ? (
                <div className="space-y-4">
                  <p>You have not created any AI reflections yet.</p>
                  <Link
                    to="/journal"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all text-[11px]"
                  >
                    <span>Write in Journal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                'No reflections matching this filter.'
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredJournals.map((log) => (
                <div
                  key={log._id}
                  className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/80 transition-all duration-300 space-y-4"
                >
                  {/* Header Row */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-100">
                        {log.title}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex space-x-2 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getDistressBadgeColor(log.aiReflection.distressLevel)}`}>
                        Distress: {log.aiReflection.distressLevel}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {log.aiReflection.sentiment}
                      </span>
                    </div>
                  </div>

                  {/* Crisis Banner */}
                  {log.aiReflection.crisisDetected && (
                    <div className="flex items-start space-x-2.5 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-150 dark:border-red-900/50 text-[11px]">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                      <span>Confidential crisis resources listed below. Contact someone immediately.</span>
                    </div>
                  )}

                  {/* Reflection Content */}
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <span className="block font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                      Companion Reflection
                    </span>
                    "{log.aiReflection.reflection}"
                  </div>

                  {/* Actionable Tips checklist style */}
                  {log.aiReflection.actionableTips && log.aiReflection.actionableTips.length > 0 && (
                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Actionable items
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {log.aiReflection.actionableTips.map((tip, i) => (
                          <div
                            key={i}
                            className="flex items-start space-x-2 text-[11px] text-slate-500 dark:text-slate-400"
                          >
                            <span className="text-emerald-500 shrink-0">•</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Link back to journal */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex justify-end">
                    <Link
                      to="/journal"
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-350 flex items-center space-x-1"
                    >
                      <span>View original entry</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
