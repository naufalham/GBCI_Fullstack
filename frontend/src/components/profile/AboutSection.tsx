'use client';

import { useState, useRef, useEffect } from 'react';
import { Profile } from '@/types';
import { api } from '@/lib/api';
import { getHoroscope, getZodiac } from '@/lib/zodiac';

interface AboutSectionProps {
  profile: Profile | null;
  onUpdate: () => void;
}

export default function AboutSection({ profile, onUpdate }: AboutSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(profile?.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: profile?.name || '',
    birthday: profile?.birthday?.split('T')[0] || '',
    height: profile?.height || 0,
    weight: profile?.weight || 0,
    gender: profile?.gender || '',
  });

  // Sync form state when profile prop changes (after save/fetch)
  useEffect(() => {
    setForm({
      name: profile?.name || '',
      birthday: profile?.birthday?.split('T')[0] || '',
      height: profile?.height || 0,
      weight: profile?.weight || 0,
      gender: profile?.gender || '',
    });
    setImagePreview(profile?.imageUrl || null);
  }, [profile]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 600;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = (h / w) * MAX; w = MAX; }
          else { w = (w / h) * MAX; h = MAX; }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        setImagePreview(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        height: Number(form.height),
        weight: Number(form.weight),
        interests: profile?.interests || [],
        imageUrl: imagePreview || '',
      };

      if (profile) {
        await api.updateProfile(payload);
      } else {
        await api.createProfile(payload);
      }
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      alert(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const horoscope = form.birthday ? getHoroscope(form.birthday) : '--';
  const zodiac = form.birthday ? getZodiac(form.birthday) : '--';

  // View mode
  if (!isEditing) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-sm">About</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="text-white/50 hover:text-white"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        {profile ? (
          <div className="space-y-3 text-sm">
            <InfoRow label="Birthday" value={`${formatDateDisplay(profile.birthday)} (Age ${calculateAge(profile.birthday)})`} />
            <InfoRow label="Horoscope" value={profile.horoscope || horoscope} />
            <InfoRow label="Zodiac" value={profile.zodiac || zodiac} />
            <InfoRow label="Height" value={`${profile.height} cm`} />
            <InfoRow label="Weight" value={`${profile.weight} kg`} />
          </div>
        ) : (
          <p className="text-white/30 text-sm">
            Add in your your to help others know you better
          </p>
        )}
      </div>
    );
  }

  // Edit mode
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-sm">About</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-youapp-gold text-sm font-semibold hover:text-youapp-gold-light"
        >
          {saving ? 'Saving...' : 'Save & Update'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Add image */}
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden shrink-0"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
          </button>
          <span
            className="text-white/50 text-sm cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? 'Change image' : 'Add image'}
          </span>
        </div>

        {/* Form fields */}
        <FormRow label="Display name:">
          <FieldInput
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="Enter name"
          />
        </FormRow>

        <FormRow label="Gender:">
          <FieldSelect
            value={form.gender}
            onChange={(v) => setForm({ ...form, gender: v })}
            placeholder="Select Gender"
            options={['Male', 'Female', 'Other']}
          />
        </FormRow>

        <FormRow label="Birthday:">
          <FieldInput
            value={form.birthday}
            onChange={(v) => setForm({ ...form, birthday: v })}
            placeholder="DD MM YYYY"
            type="date"
          />
        </FormRow>

        <FormRow label="Horoscope:">
          <FieldReadonly value={horoscope} />
        </FormRow>

        <FormRow label="Zodiac:">
          <FieldReadonly value={zodiac} />
        </FormRow>

        <FormRow label="Height:">
          <FieldInput
            value={form.height ? `${form.height}` : ''}
            onChange={(v) => setForm({ ...form, height: Number(v.replace(/[^0-9]/g, '')) || 0 })}
            placeholder="Add height"
            suffix="cm"
          />
        </FormRow>

        <FormRow label="Weight:">
          <FieldInput
            value={form.weight ? `${form.weight}` : ''}
            onChange={(v) => setForm({ ...form, weight: Number(v.replace(/[^0-9]/g, '')) || 0 })}
            placeholder="Add weight"
            suffix="kg"
          />
        </FormRow>
      </div>
    </div>
  );
}

/* ── View mode row ── */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-white/30">{label}:</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

/* ── Form row wrapper ── */
function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-white/30 text-sm whitespace-nowrap shrink-0">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Text / number input (with optional suffix inside) ── */
function FieldInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  suffix,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  suffix?: string;
}) {
  return (
    <div className="relative w-full max-w-[200px]">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full bg-white/5 border border-white/10 rounded-lg
          px-4 py-2.5 text-white text-sm text-right
          placeholder:text-white/30
          focus:outline-none focus:border-white/30 transition-colors
          ${suffix ? 'pr-10' : ''}
        `}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-sm pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

/* ── Select dropdown ── */
function FieldSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <div className="relative w-full max-w-[200px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full bg-white/5 border border-white/10 rounded-lg
          appearance-none px-4 py-2.5 pr-9
          text-sm text-right cursor-pointer
          focus:outline-none focus:border-white/30 transition-colors
          ${value ? 'text-white' : 'text-white/30'}
        `}
      >
        <option value="" className="bg-[#162329] text-white/40">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#162329] text-white">{opt}</option>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50"
        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

/* ── Readonly field (Horoscope, Zodiac) ── */
function FieldReadonly({ value }: { value: string }) {
  return (
    <div className="w-full max-w-[200px] bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-right">
      <span className={`text-sm ${value === '--' ? 'text-white/30' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}

/* ── Helpers ── */
function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd} / ${mm} / ${yyyy}`;
}

function calculateAge(dateStr: string): number {
  const today = new Date();
  const birthDate = new Date(dateStr);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
