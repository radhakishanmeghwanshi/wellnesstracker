import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Calendar, Heart, Award, ShieldAlert } from 'lucide-react';

export default function Analytics() {
  const { api } = useAuth();
  
  // States
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Analytics Data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const response = await api.get('/moods/analytics');
        if (response.data && response.data.success) {
          setAnalyticsData(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setErrorMsg('Failed to fetch mental health analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [api]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="text-sm font-bold text-slate-400">Loading your mental analytics...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="p-4 rounded-2xl bg-red-50 text-red-600 inline-block text-xs font-semibold">
          {errorMsg}
        </div>
      </div>
    );
  }

  // Handle empty state
  const hasHistory = analyticsData && analyticsData.history && analyticsData.history.length > 0;
  if (!hasHistory) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-4">
        <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 inline-block">
          <BarChart3 className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="font-extrabold text-slate-800 dark:text-slate-200">No Analytics Available Yet</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Please log your daily mood in the Dashboard. Once you log one or more entries, Recharts will generate your charts.
        </p>
      </div>
    );
  }

  const { averageScore, distribution, tagCounts, history } = analyticsData;

  // 1. Format Mood Trend History (LineChart)
  const lineChartData = history.map(item => ({
    date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: item.score
  }));

  // 2. Format Mood Distribution (BarChart)
  const distributionData = [
    { name: '😢 Awful', count: distribution[1] || 0, color: '#f87171' },
    { name: '😕 Bad', count: distribution[2] || 0, color: '#fb923c' },
    { name: '😐 Okay', count: distribution[3] || 0, color: '#fbbf24' },
    { name: '🙂 Good', count: distribution[4] || 0, color: '#34d399' },
    { name: '😄 Excellent', count: distribution[5] || 0, color: '#38bdf8' }
  ];

  // 3. Format Tag Counts (Horizontal BarChart)
  const tagData = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 tags

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center">
          <BarChart3 className="h-7 w-7 mr-2 text-emerald-500" />
          Mood & Wellness Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Visualize your emotional trends and study patterns over the past 30 days.
        </p>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Average Mood */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
            <Heart className="h-6 w-6 fill-emerald-500/10" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Mood Score</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{averageScore} / 5</span>
          </div>
        </div>

        {/* Card 2: Total Logs */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/20 text-sky-500">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Logs (30 days)</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{history.length} Logs</span>
          </div>
        </div>

        {/* Card 3: Predominant Emotion */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Predominant Tag</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white mt-0.5 capitalize">
              {tagData.length > 0 ? tagData[0].tag : 'None yet'}
            </span>
          </div>
        </div>

      </div>

      {/* Recharts Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Mood Trend Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/80 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-emerald-500" />
                Mood Score Trend
              </h3>
              <p className="text-[11px] text-slate-400">Daily mood trajectory over the last 30 logs</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700/40" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    fontSize: '11px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    backgroundColor: '#1e293b',
                    color: '#fff'
                  }} 
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: '#10b981', strokeWidth: 1, fill: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/80 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Mood score distribution</h3>
              <p className="text-[11px] text-slate-400">Total occurrence frequency per mood score</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700/40" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ 
                    borderRadius: '16px', 
                    fontSize: '11px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    backgroundColor: '#1e293b',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tag Frequency */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/80 transition-all duration-300 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Top Associated Wellness Tags</h3>
              <p className="text-[11px] text-slate-400">Frequencies of context tags logged alongside your moods</p>
            </div>
          </div>

          {tagData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No tags logged in this period.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tagData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" className="dark:stroke-slate-700/40" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis dataKey="tag" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ 
                      borderRadius: '16px', 
                      fontSize: '11px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      backgroundColor: '#1e293b',
                      color: '#fff'
                    }} 
                  />
                  <Bar dataKey="count" fill="#38bdf8" radius={[0, 8, 8, 0]} barSize={14}>
                    {tagData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#0ea5e9'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
