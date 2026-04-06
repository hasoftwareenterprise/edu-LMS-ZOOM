import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { User, Shield, Bell, CheckCircle2, ChevronRight, Camera, Globe, Smartphone, MessageSquare } from 'lucide-react';

interface SettingsPageProps {
  user: any;
  onLogout: () => void;
}

export default function SettingsPage({ user }: SettingsPageProps) {
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || '');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(user?.profilePhotoUrl || '');
  const [shortBio, setShortBio] = useState(user?.shortBio || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await axios.put('/api/auth/profile', { fullName, mobileNumber, whatsappNumber, profilePhotoUrl, shortBio }, authHeaders);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      const saved = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...saved, fullName, mobileNumber, whatsappNumber, profilePhotoUrl, shortBio }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.fullName || user?.username;

  return (
    <div className="min-h-full py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-6xl mx-auto space-y-12"
      >
        {/* Header Protocol Card */}
        <div className="protocol-card relative overflow-hidden group">
          <div className="protocol-header-glow" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="relative">
              <div className="size-36 rounded-[2.5rem] p-1 bg-gradient-to-br from-primary/40 to-transparent shadow-2xl">
                <div className="w-full h-full rounded-[2.25rem] overflow-hidden bg-surface-2 border border-white/10">
                  {profilePhotoUrl ? (
                    <img src={profilePhotoUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center text-5xl font-black text-primary italic">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <button className="absolute -bottom-2 -right-2 size-12 rounded-2xl bg-white text-primary flex items-center justify-center shadow-2xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all">
                <Camera size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <span className="size-2 bg-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{user?.role} ACCESS ENABLED</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white italic">{displayName}</h1>
              <p className="text-text-muted text-sm font-medium opacity-60 flex items-center justify-center md:justify-start gap-2">
                <Shield size={14} className="text-primary" />
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Information Vector */}
          <div className="lg:col-span-8">
            <div className="protocol-card space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white italic tracking-tight">Identity Vector</h2>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40">Core Protocol Attributes</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="protocol-label">Legal Nomenclature</label>
                  <div className="protocol-input-group">
                    <input 
                      type="text" 
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)} 
                      className="protocol-input" 
                      placeholder="ENTER FULL NAME"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="protocol-label">Asset Repository URL</label>
                  <div className="protocol-input-group">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                    <input 
                      type="url" 
                      value={profilePhotoUrl} 
                      onChange={e => setProfilePhotoUrl(e.target.value)} 
                      className="protocol-input pl-12" 
                      placeholder="HTTPS://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="protocol-label">Communication Line</label>
                  <div className="protocol-input-group">
                    <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                    <input 
                      type="tel" 
                      value={mobileNumber} 
                      onChange={e => setMobileNumber(e.target.value)} 
                      className="protocol-input pl-12" 
                      placeholder="+94 ..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="protocol-label">WhatsApp Stream</label>
                  <div className="protocol-input-group">
                    <MessageSquare className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                    <input 
                      type="tel" 
                      value={whatsappNumber} 
                      onChange={e => setWhatsappNumber(e.target.value)} 
                      className="protocol-input pl-12" 
                      placeholder="+94 ..."
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="protocol-label">Institutional Persona (Short Bio)</label>
                  <div className="protocol-input-group min-h-[160px] p-2">
                    <textarea 
                      value={shortBio} 
                      onChange={e => setShortBio(e.target.value)} 
                      className="protocol-input h-full py-4 resize-none" 
                      placeholder="Elaborate on your institutional contribution..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Vector */}
          <div className="lg:col-span-4 space-y-10">
            <div className="protocol-card space-y-8">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                  <Shield size={20} />
                </div>
                <h3 className="text-lg font-black text-white italic tracking-tight uppercase">Registry</h3>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-30">Handle</p>
                  <p className="text-sm font-black text-white italic">@{user?.username}</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-30">Role Attribute</p>
                  <p className="text-sm font-black text-white italic">{user?.role}</p>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="protocol-button w-full shadow-lg shadow-primary/20"
                >
                  {saving ? (
                    <div className="size-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      Commit Updates
                    </>
                  )}
                </button>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-[10px] font-black text-center uppercase tracking-widest">
                  ⚠ {error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-[10px] font-black text-center uppercase tracking-widest italic">
                  Registry Sync Successful
                </motion.div>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
