import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { User, Lock, Bell, Shield, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import InitialsAvatar from './ui/InitialsAvatar';

interface SettingsPageProps {
  user: any;
  onLogout: () => void;
}

const PasswordField: React.FC<{ label: string; value: string; onChange: (v: string) => void; name: string }> = ({ label, value, onChange, name }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">{label}</label>
      <div className="relative">
        <input
          id={name}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pr-11"
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
};

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
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10 max-w-5xl mx-auto py-8">
      <div className="relative overflow-hidden rounded-[3rem] bg-surface-2 border border-white/5 p-10 md:p-14 mb-8">
           <div className="absolute -right-20 -top-20 size-[450px] bg-primary/10 blur-[130px] rounded-full" />
           <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
               <div className="flex items-center gap-8">
                   <div className="relative shrink-0">
                       <div className="size-24 md:size-32 rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-2xl relative z-10">
                           {profilePhotoUrl ? (
                               <img src={profilePhotoUrl} alt={displayName} className="w-full h-full object-cover" />
                           ) : (
                               <div className="w-full h-full bg-primary flex items-center justify-center text-4xl font-black text-white italic">
                                   {displayName.charAt(0).toUpperCase()}
                               </div>
                           )}
                       </div>
                       <div className="absolute -bottom-2 -right-2 size-10 rounded-2xl bg-surface-3 border border-white/10 flex items-center justify-center text-primary shadow-xl z-20">
                           <Shield size={20} />
                       </div>
                   </div>
                   <div className="space-y-2">
                       <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1 flex items-center gap-2 mb-2 w-fit">
                           <span className="size-2 bg-primary rounded-full shadow-[0_0_8px_#f3184c]" />
                           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted italic">{user?.role} ACCOUNT PROTOCOL</span>
                       </div>
                       <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none italic">{displayName}</h1>
                       <p className="text-text-muted text-sm font-black uppercase tracking-widest opacity-40">{user?.email}</p>
                   </div>
               </div>
           </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
             <div className="glass p-10 rounded-[2.5rem] border-white/5 space-y-10">
                 <div className="flex items-center gap-4">
                     <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                         <User size={22} />
                     </div>
                     <div>
                         <h2 className="text-xl font-black italic tracking-tighter uppercase">Identity Vector</h2>
                         <p className="text-[10px] font-black text-text-muted opacity-40 uppercase tracking-widest">Personal Identification Managed</p>
                     </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                         <label className="text-[10px] uppercase font-black tracking-[0.2em] text-text-muted ml-4">Legal Nomenclature</label>
                         <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full h-15 bg-white/[0.03] border border-white/10 rounded-2xl px-6 font-black text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                     </div>
                     <div className="space-y-3">
                         <label className="text-[10px] uppercase font-black tracking-[0.2em] text-text-muted ml-4">Identity Display URL</label>
                         <input type="url" value={profilePhotoUrl} onChange={e => setProfilePhotoUrl(e.target.value)} className="w-full h-15 bg-white/[0.03] border border-white/10 rounded-2xl px-6 font-black text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all" placeholder="Institutional asset URL..." />
                     </div>
                     <div className="space-y-3">
                         <label className="text-[10px] uppercase font-black tracking-[0.2em] text-text-muted ml-4">Communication Line (Mobile)</label>
                         <input type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} className="w-full h-15 bg-white/[0.03] border border-white/10 rounded-2xl px-6 font-black text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all" placeholder="+94 7X XXX XXXX" />
                     </div>
                     <div className="space-y-3">
                         <label className="text-[10px] uppercase font-black tracking-[0.2em] text-text-muted ml-4">WhatsApp Protocol</label>
                         <input type="tel" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} className="w-full h-15 bg-white/[0.03] border border-white/10 rounded-2xl px-6 font-black text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all" placeholder="+94 7X XXX XXXX" />
                     </div>
                     <div className="md:col-span-2 space-y-3">
                         <label className="text-[10px] uppercase font-black tracking-[0.2em] text-text-muted ml-4">Institutional Persona (Short Bio)</label>
                         <textarea value={shortBio} onChange={e => setShortBio(e.target.value)} rows={4} className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] p-6 font-black text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none" placeholder="Elaborate on your institutional contribution..." />
                     </div>
                 </div>
             </div>
         </div>

         <div className="space-y-8">
             <div className="glass p-10 rounded-[2.5rem] border-white/5 space-y-8">
                 <div className="flex items-center gap-4">
                     <div className="size-12 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center text-success">
                         <Shield size={22} />
                     </div>
                     <div>
                         <h2 className="text-xl font-black italic tracking-tighter uppercase">Security Node</h2>
                         <p className="text-[10px] font-black text-text-muted opacity-40 uppercase tracking-widest">Protocol Attributes</p>
                     </div>
                 </div>

                 <div className="space-y-4">
                     <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                         <p className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-40 mb-1">Vector Handle</p>
                         <p className="text-sm font-black text-text-main italic underline decoration-primary/30 decoration-2">@{user?.username}</p>
                     </div>
                     <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                         <p className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-40 mb-1">Institutional Verified Role</p>
                         <p className="text-sm font-black text-text-main italic">{user?.role}</p>
                     </div>
                 </div>

                 <div className="pt-4 border-t border-white/5">
                     <Button type="submit" disabled={saving} className="w-full h-15 rounded-2xl shadow-xl shadow-primary/20 group">
                         {saving ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" /> : <CheckCircle2 size={18} className="mr-3 group-hover:scale-125 transition-transform" />}
                         {saving ? 'SYNCHRONIZING...' : 'COMMIT PROTOCOL'}
                     </Button>
                 </div>
                 
                 {error && <p className="text-danger text-[10px] font-black uppercase tracking-widest text-center">⚠ {error}</p>}
                 {success && <p className="text-success text-[10px] font-black uppercase tracking-widest text-center italic">Institutional registry updated!</p>}
             </div>

             <div className="glass p-10 rounded-[2.5rem] border-white/5 text-center space-y-6">
                  <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-text-muted">
                       <Bell size={24} />
                  </div>
                  <div>
                       <h3 className="font-black text-lg italic tracking-tighter uppercase">Global Alerts</h3>
                       <p className="text-[10px] font-black text-text-muted opacity-40 uppercase tracking-widest mt-1">Ecosystem notifications enabled</p>
                  </div>
                  <Button variant="outline" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border-white/10 hover:bg-white/5">Configure Vectors</Button>
             </div>
         </div>
      </form>
    </motion.div>
  );
}

function Button({ children, type = "button", onClick, disabled, className, variant = "primary" }: any) {
 return (
   <button
     type={type}
     onClick={onClick}
     disabled={disabled}
     className={`flex items-center justify-center font-black transition-all ${
       variant === "primary" 
         ? "bg-primary text-white hover:bg-primary-hover active:scale-[0.98]" 
         : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
     } ${className}`}
   >
     {children}
   </button>
 );
}
