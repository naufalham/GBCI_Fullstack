'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface InterestSectionProps {
  interests: string[];
  onUpdate: () => void;
}

export default function InterestSection({ interests, onUpdate }: InterestSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tags, setTags] = useState<string[]>(interests);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile({ interests: tags });
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      console.error('Failed to save interests:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    setTags(interests);
    setIsEditing(false);
  };

  // View mode
  if (!isEditing) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-sm">Interest</h3>
          <button
            onClick={() => { setTags(interests); setIsEditing(true); }}
            className="text-white/50 hover:text-white"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        {interests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span key={interest} className="interest-tag">
                {interest}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-white/30 text-sm">
            Add in your interest to find a better match
          </p>
        )}
      </div>
    );
  }

  // Edit mode - fullscreen overlay within mobile frame
  return (
    <div className="absolute inset-0 z-50 bg-[#09141A] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <button
          onClick={handleBack}
          className="text-white flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-sm font-semibold"
          style={{
            background: 'linear-gradient(135deg, #ABFFFD 0%, #4599DB 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-9 pt-16">
        <p
          className="text-sm font-bold mb-1"
          style={{
            background: 'linear-gradient(135deg, #94783E 0%, #F3EDA6 50%, #D5BE88 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Tell everyone about yourself
        </p>
        <h2 className="text-white text-xl font-bold mb-9">
          What interest you?
        </h2>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-[#1B2A30] text-white text-xs font-medium pl-3 pr-2 py-1.5 rounded flex items-center gap-1.5"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-white/60 hover:text-white"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full bg-[#1B2A30] border-0 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
        />
      </div>
    </div>
  );
}
