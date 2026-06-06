import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Plus, Search, Trash2, Edit3, Brain, ArrowLeft, 
  ChevronRight, Sparkles, Smile, ShieldAlert, CheckCircle, Info 
} from 'lucide-react';

export default function Journal() {
  const { api } = useAuth();
  
  // State variables
  const [journals, setJournals] = useState([]);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor mode states
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formMoodScore, setFormMoodScore] = useState(3);
  
  // Status states
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reflecting, setReflecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch journals list
  const fetchJournals = async () => {
    setLoadingList(true);
    try {
      const response = await api.get('/journals');
      if (response.data && response.data.success) {
        setJournals(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch journals:', error);
      setErrorMsg('Failed to load journal list.');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  // Filter journals based on search query
  const filteredJournals = journals.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Selection Handler
  const handleSelectJournal = (journal) => {
    setSelectedJournal(journal);
    setIsEditing(false);
    setIsCreating(false);
    setErrorMsg('');
  };

  // Trigger Creation Mode
  const handleNewEntry = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedJournal(null);
    setFormTitle('');
    setFormContent('');
    setFormMoodScore(3);
    setErrorMsg('');
  };

  // Trigger Edit Mode
  const handleEditEntry = () => {
    if (!selectedJournal) return;
    setIsEditing(true);
    setIsCreating(false);
    setFormTitle(selectedJournal.title);
    setFormContent(selectedJournal.content);
    setFormMoodScore(selectedJournal.moodScore || 3);
    setErrorMsg('');
  };

  // Cancel Handler
  const handleCancelForm = () => {
    setIsEditing(false);
    setIsCreating(false);
    setErrorMsg('');
  };

  // Save/Update Journal Form Submit
  const handleSaveJournal = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      setErrorMsg('Title and Content are required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      if (isCreating) {
        // POST request
        const response = await api.post('/journals', {
          title: formTitle.trim(),
          content: formContent.trim(),
          moodScore: formMoodScore
        });
        if (response.data.success) {
          const newJournal = response.data.data;
          setJournals([newJournal, ...journals]);
          setSelectedJournal(newJournal);
          setIsCreating(false);
        }
      } else if (isEditing && selectedJournal) {
        // PUT request
        const response = await api.put(`/journals/${selectedJournal._id}`, {
          title: formTitle.trim(),
          content: formContent.trim(),
          moodScore: formMoodScore
        });
        if (response.data.success) {
          const updatedJournal = response.data.data;
          setJournals(journals.map(j => j._id === updatedJournal._id ? updatedJournal : j));
          setSelectedJournal(updatedJournal);
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error('Failed to save journal:', error);
      setErrorMsg(error.response?.data?.message || 'Failed to save entry.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Journal Entry
  const handleDeleteJournal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) return;
    
    try {
      const response = await api.delete(`/journals/${id}`);
      if (response.data.success) {
        setJournals(journals.filter(j => j._id !== id));
        setSelectedJournal(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to delete journal:', error);
      setErrorMsg('Failed to delete journal entry.');
    }
  };

  // Request AI Reflection
  const handleGetReflection = async () => {
    if (!selectedJournal) return;
    setReflecting(true);
    setErrorMsg('');

    try {
      const response = await api.post(`/ai/reflect/${selectedJournal._id}`);
      if (response.data.success) {
        const reflectionData = response.data.data;
        const updatedJournal = { ...selectedJournal, aiReflection: reflectionData };
        setSelectedJournal(updatedJournal);
        setJournals(journals.map(j => j._id === selectedJournal._id ? updatedJournal : j));
      }
    } catch (error) {
      console.error('AI reflection failure:', error);
      setErrorMsg('Could not fetch AI Reflection. Please try again.');
    } finally {
      setReflecting(false);
    }
  };

  // Distress level styling helper
  const getDistressStyle = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40';
      case 'medium': return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/40';
      case 'high': 
      case 'severe': return 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/40';
      default: return 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-350 border-slate-200 dark:border-slate-800';
    }
  };

  const emojiMap = {
    1: '😢 Awful',
    2: '😕 Struggling',
    3: '😐 Okay',
    4: '🙂 Good',
    5: '😄 Excellent'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        
        {/* Left Pane: Journals List */}
        <div className={`md:col-span-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col overflow-hidden transition-all duration-300 ${
          (selectedJournal || isCreating || isEditing) ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Header & New Entry Button */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-emerald-500" />
              Journal Entries
            </h3>
            <button
              onClick={handleNewEntry}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Entry</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-700/60">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-slate-100"
              />
            </div>
          </div>

          {/* List Entries */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60 p-2 space-y-1">
            {loadingList ? (
              <div className="text-center py-12 text-xs text-slate-400">Loading entries...</div>
            ) : filteredJournals.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                {searchQuery ? 'No search matches found.' : 'Your journal is empty. Write your first entry!'}
              </div>
            ) : (
              filteredJournals.map((item) => (
                <button
                  key={item._id}
                  onClick={() => handleSelectJournal(item)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 flex flex-col space-y-1.5 ${
                    selectedJournal?._id === item._id
                      ? 'bg-emerald-50/60 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40 text-slate-900 dark:text-white'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs truncate max-w-[150px]">{item.title}</span>
                    <span className="text-[9px] text-slate-400 shrink-0">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                  <div className="flex justify-between items-center pt-1 text-[10px]">
                    <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded font-semibold text-slate-500 dark:text-slate-400">
                      Score: {item.moodScore || '--'}
                    </span>
                    {item.aiReflection && (
                      <span className="flex items-center text-emerald-500 font-semibold text-[9px]">
                        <Brain className="h-3 w-3 mr-0.5" />
                        Reflected
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Pane: Entry Viewer / Editor */}
        <div className={`md:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col overflow-hidden transition-all duration-300 ${
          !(selectedJournal || isCreating || isEditing) ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Active Header (with back button on mobile) */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => { setSelectedJournal(null); setIsCreating(false); setIsEditing(false); }}
                className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                {isCreating ? 'Write New Entry' : isEditing ? 'Edit Entry' : selectedJournal ? 'Journal Entry View' : 'Select Entry'}
              </h4>
            </div>
            
            {/* Action Buttons for View Mode */}
            {selectedJournal && !isEditing && !isCreating && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEditEntry}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900 dark:hover:bg-slate-700 dark:text-slate-350 text-xs font-bold transition-all border border-slate-200 dark:border-slate-800"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteJournal(selectedJournal._id)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-950/60 dark:text-red-400 text-xs font-bold transition-all border border-red-100 dark:border-red-950/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          {/* Main pane body */}
          <div className="flex-1 overflow-y-auto p-6">
            {errorMsg && (
              <div className="mb-4 flex items-center space-x-2 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-100 dark:border-red-900/40">
                <ShieldAlert className="h-4 w-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* CREATE or EDIT FORM */}
            {(isCreating || isEditing) ? (
              <form onSubmit={handleSaveJournal} className="space-y-5 h-full flex flex-col">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-350">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. A busy day at the library"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="block w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-slate-100 placeholder-slate-400 font-semibold"
                  />
                </div>

                {/* Mood slider */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-350 flex justify-between">
                    <span>How would you rate your mood score?</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                      {emojiMap[formMoodScore]}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={formMoodScore}
                    onChange={(e) => setFormMoodScore(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 px-1 font-semibold">
                    <span>1 (Awful)</span>
                    <span>3 (Okay)</span>
                    <span>5 (Excellent)</span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5 flex-1 flex flex-col">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-350">What's on your mind? (Content)</label>
                  <textarea
                    required
                    rows="8"
                    placeholder="Write freely. Your entry is safe and confidential. AI reflections can provide mental insights when requested."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="block w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-slate-100 placeholder-slate-400 leading-relaxed flex-grow resize-none"
                  ></textarea>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900 dark:hover:bg-slate-700 dark:text-slate-400 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/10 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Entry'}
                  </button>
                </div>
              </form>
            ) : selectedJournal ? (
              /* VIEW MODE */
              <div className="space-y-6">
                
                {/* Journal Content Card */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">
                      {selectedJournal.title}
                    </h2>
                    <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold px-3 py-1 rounded-full text-xs border border-emerald-100/40">
                      Mood: {emojiMap[selectedJournal.moodScore] || selectedJournal.moodScore || 'N/A'}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    Logged on {new Date(selectedJournal.createdAt).toLocaleString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>

                  <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap pt-2 bg-slate-50/50 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
                    {selectedJournal.content}
                  </div>
                </div>

                {/* AI Reflections Section */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-150 flex items-center">
                      <Sparkles className="h-4.5 w-4.5 mr-2 text-emerald-500" />
                      AI Companion Reflection
                    </h3>
                  </div>

                  {selectedJournal.aiReflection ? (
                    /* Reflection Display Card */
                    <div className="space-y-4">
                      {selectedJournal.aiReflection.crisisDetected ? (
                        /* CRISIS WARNING BOX */
                        <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 space-y-3">
                          <div className="flex items-center space-x-2">
                            <ShieldAlert className="h-5 w-5 fill-red-500/10 text-red-600 dark:text-red-400" />
                            <h4 className="font-extrabold text-sm">Crisis Support Recommended</h4>
                          </div>
                          <p className="text-xs leading-relaxed">
                            {selectedJournal.aiReflection.reflection}
                          </p>
                          <div className="pt-2 border-t border-red-200/40 space-y-1.5">
                            <p className="text-[11px] font-bold">Confidential Support Resources (Free, 24/7):</p>
                            <ul className="list-disc list-inside text-[11px] space-y-1">
                              {selectedJournal.aiReflection.actionableTips.map((tip, i) => (
                                <li key={i} className="leading-snug">{tip}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        /* STANDARD REFLECTION */
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Left: General Reflection text */}
                          <div className="md:col-span-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Companion Reflection</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {selectedJournal.aiReflection.reflection}
                            </p>
                          </div>

                          {/* Right: Metadata & Sentiment */}
                          <div className="space-y-4">
                            {/* Distress Box */}
                            <div className={`p-4 rounded-2xl border flex flex-col justify-center ${getDistressStyle(selectedJournal.aiReflection.distressLevel)}`}>
                              <span className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">Distress Level</span>
                              <span className="text-sm font-extrabold capitalize mt-0.5">
                                {selectedJournal.aiReflection.distressLevel}
                              </span>
                            </div>
                            
                            {/* Sentiment Box */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 flex flex-col justify-center">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Sentiment Tone</span>
                              <span className="text-sm font-extrabold text-slate-750 dark:text-slate-250 capitalize mt-0.5">
                                {selectedJournal.aiReflection.sentiment}
                              </span>
                            </div>
                          </div>

                          {/* Bottom: Actionable Coping Tips */}
                          {selectedJournal.aiReflection.actionableTips && selectedJournal.aiReflection.actionableTips.length > 0 && (
                            <div className="md:col-span-3 p-5 rounded-2xl bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/30 dark:border-emerald-900/20 space-y-2.5">
                              <h4 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1.5" />
                                Actionable Wellness Tips
                              </h4>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-350">
                                {selectedJournal.aiReflection.actionableTips.map((tip, i) => (
                                  <li key={i} className="flex items-start space-x-1.5">
                                    <span className="text-emerald-500 font-extrabold shrink-0 mt-0.5">•</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  ) : (
                    /* Get Reflection Prompt */
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 text-center flex flex-col items-center justify-center space-y-3">
                      <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
                        <Info className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Receive personalized wellness reflection
                        </p>
                        <p className="text-[11px] text-slate-400 max-w-md">
                          Click below to have the AI Companion reflect on your emotional state, analyze distress levels, and suggest custom coping tips.
                        </p>
                      </div>
                      <button
                        onClick={handleGetReflection}
                        disabled={reflecting}
                        className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-bold text-xs shadow-md shadow-emerald-500/10 transition-all disabled:opacity-50"
                      >
                        {reflecting ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Brain className="h-3.5 w-3.5" />
                            <span>Ask AI for Reflection</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              /* PLACEHOLDER */
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 text-slate-400 shadow-inner">
                  <BookOpen className="h-10 w-10 stroke-[1.5]" />
                </div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200">No Journal Selected</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                  Select an entry from the list on the left to review, or click "New Entry" to write about your day.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
