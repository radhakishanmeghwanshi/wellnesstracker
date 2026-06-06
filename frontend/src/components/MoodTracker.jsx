import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, Plus, X, Sparkles } from 'lucide-react';

const EMOJIS = [
  { score: 1, char: '😢', label: 'Awful', color: 'hover:bg-red-100 border-red-200 text-red-600 bg-red-50/30' },
  { score: 2, char: '😕', label: 'Struggling', color: 'hover:bg-orange-100 border-orange-200 text-orange-600 bg-orange-50/30' },
  { score: 3, char: '😐', label: 'Okay', color: 'hover:bg-amber-100 border-amber-200 text-amber-600 bg-amber-50/30' },
  { score: 4, char: '🙂', label: 'Good', color: 'hover:bg-emerald-100 border-emerald-200 text-emerald-600 bg-emerald-50/30' },
  { score: 5, char: '😄', label: 'Excellent', color: 'hover:bg-sky-100 border-sky-200 text-sky-600 bg-sky-50/30' }
];

const PRESET_TAGS = [
  'Academics', 'Exam stress', 'Socializing', 'Exercise', 'Good Sleep', 
  'Poor Sleep', 'Family time', 'Relaxing', 'Anxious', 'Productive'
];

export default function MoodTracker({ onMoodLogged }) {
  const { api } = useAuth();
  
  // States
  const [selectedScore, setSelectedScore] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // Add tag toggler
  const togglePresetTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Add custom tag
  const handleAddCustomTag = (e) => {
    e.preventDefault();
    const tag = customTag.trim();
    if (!tag) return;
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setCustomTag('');
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(t => t !== tagToRemove));
  };

  // Submit mood log
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedScore) {
      setFeedbackMsg({ type: 'error', text: 'Please select a mood emoji first.' });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg({ type: '', text: '' });

    try {
      const response = await api.post('/moods', {
        score: selectedScore,
        tags: selectedTags,
        note: note.trim()
      });

      if (response.data.success) {
        setFeedbackMsg({ type: 'success', text: 'Mood logged beautifully!' });
        
        // Reset form
        setSelectedScore(null);
        setSelectedTags([]);
        setNote('');
        
        // Call callback if present
        if (onMoodLogged) {
          onMoodLogged(response.data.data);
        }

        // Clear success message after 3 seconds
        setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Failed to log mood:', error);
      const errMsg = error.response?.data?.message || 'Failed to submit mood log.';
      setFeedbackMsg({ type: 'error', text: errMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/80 transition-all duration-300">
      
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-1">
          <Heart className="h-5 w-5 fill-emerald-500/10" />
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Daily Mood Check-in</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          How are you feeling right now? Select an emoji and add context.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Emoji Selector */}
        <div className="grid grid-cols-5 gap-2">
          {EMOJIS.map((emoji) => {
            const isSelected = selectedScore === emoji.score;
            return (
              <button
                key={emoji.score}
                type="button"
                onClick={() => setSelectedScore(emoji.score)}
                className={`flex flex-col items-center p-3 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-500 text-emerald-700 dark:text-emerald-350 scale-105 shadow-md shadow-emerald-500/5 font-bold'
                    : `bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 text-slate-600 dark:text-slate-400 ${emoji.color}`
                }`}
              >
                <span className="text-3xl mb-1 filter drop-shadow-sm">{emoji.char}</span>
                <span className="text-[10px] whitespace-nowrap">{emoji.label}</span>
              </button>
            );
          })}
        </div>

        {/* Note textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-350">
            Write down any notes (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What made you feel this way? What's on your mind?"
            rows="2"
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-slate-100 placeholder-slate-400"
          ></textarea>
        </div>

        {/* Tags Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-350">
            Select associated tags
          </label>
          
          {/* Preset Tags Grid */}
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => togglePresetTag(tag)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900 dark:hover:bg-slate-700 dark:text-slate-400'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Custom Tag Form */}
          <div className="flex gap-2 items-center mt-2">
            <input
              type="text"
              placeholder="Add custom tag (e.g. Gaming)"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-slate-100 flex-grow"
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Current Selection & Custom Tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 text-[10px] font-bold"
                >
                  <span>{tag}</span>
                  <button type="button" onClick={() => removeTag(tag)} className="text-emerald-500 hover:text-emerald-700">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-between pt-1">
          {feedbackMsg.text && (
            <div className={`text-xs font-semibold ${
              feedbackMsg.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
            }`}>
              {feedbackMsg.text}
            </div>
          )}
          <div className="flex-grow"></div>
          <button
            type="submit"
            disabled={isSubmitting || !selectedScore}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-bold text-sm shadow-md shadow-emerald-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isSubmitting ? 'Logging...' : 'Save Log'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
