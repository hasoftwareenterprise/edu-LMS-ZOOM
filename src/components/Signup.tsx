import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, Smartphone, School, BookOpen, 
  ArrowRight, GraduationCap, ArrowLeft, CheckCircle2, 
  AlertCircle, ShieldCheck, Sparkles, UserCheck, Shield,
  ChevronRight, Info, CheckCircle, Verified
} from 'lucide-react';
import GradientButton from './ui/button-1';
import { Button } from './ui/interfaces-button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export default function Signup({ setToken, setUser }: { setToken: (t: string) => void, setUser: (u: any) => void }) {
  const [formData, setFormData] = useState({
    username: '', fullName: '', email: '', password: '', 
    mobileNumber: '', role: 'STUDENT', instituteName: '', subjectSpecialization: '', educationQualifications: '', shortBio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: Role, 1: Basic, 2: Academic

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.role === 'TEACHER' && step === 1) {
        setStep(2); return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', formData);
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else window.location.hash = '#login';
  };

  return (
    <div className="min-h-screen w-full flex bg-background overflow-hidden relative">
      {/* ── Left Side: Brand ── */}
      <div className="hidden lg:flex w-1/3 relative overflow-hidden bg-surface-2 p-12 flex-col justify-between border-r border-white/5">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute -left-20 -top-20 size-[500px] bg-primary/30 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute right-0 bottom-0 size-[400px] bg-primary/20 blur-[100px] rounded-full" />
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 flex items-center gap-3">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-2xl shadow-primary/40">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-text-main">EDU-LMS <span className="text-primary font-black">.</span></span>
        </motion.div>

        <div className="relative z-10 space-y-12">
            <motion.h1 
                key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="text-5xl font-black tracking-tighter leading-[1.1]"
            >
                {step === 0 ? <>Select your <br /><span className="text-gradient">Pathway</span>.</> : 
                 step === 1 ? <>Complete your <br /><span className="text-gradient">Identity</span>.</> : 
                 <>Verify your <br /><span className="text-gradient">Expertise</span>.</>}
            </motion.h1>
            
            <div className="space-y-6">
                {[
                  { icon: ShieldCheck, title: 'Verified Security', desc: 'Enterprise data protection' },
                  { icon: Sparkles, title: 'Live Experience', desc: 'Embedded dynamic learning' },
                ].map((item, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        key={i} className="flex items-start gap-4"
                    >
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20"><item.icon size={18} className="text-primary" /></div>
                        <div>
                            <p className="font-black text-sm mb-0.5">{item.title}</p>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-60">{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>

        <div className="relative z-10 p-6 bg-white/[0.03] border border-white/5 rounded-3xl backdrop-blur-sm">
             <div className="flex items-center gap-3 mb-2">
                <Shield size={16} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Sri Lankan LKR Support</span>
             </div>
             <p className="text-[11px] font-bold text-text-muted tracking-tight leading-relaxed">Identity-first infrastructure. All transactions are securely handled in local currency.</p>
        </div>
      </div>

      {/* ── Right Side: Dynamic Scrollable Form ── */}
      <div className="flex-1 flex flex-col items-center justify-start p-6 md:p-12 pt-8 relative overflow-y-auto custom-scrollbar">
         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[500px] py-12">
            
            {/* Header/Back Navigation */}
            <div className="text-center md:text-left mb-10">
                <button onClick={handleBack} className="mb-6 flex items-center gap-2 text-text-muted hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest">
                    <ArrowLeft size={16} /> {step === 0 ? 'Back to Login' : 'Previous Step'}
                </button>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-4xl font-black tracking-tight underline decoration-primary/20 decoration-4">Sign Up</h2>
                    {step > 0 && (
                        <button onClick={() => setStep(0)} className="text-[9px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-all">Change Role</button>
                    )}
                </div>
                <p className="text-text-muted font-black text-[10px] uppercase tracking-widest leading-loose">Secure your access to the EDU-LMS academic ecosystem</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-xs font-black flex items-center gap-3">
                            <AlertCircle size={16} /> {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-6 px-4 py-2 rounded-2xl border border-white/5 bg-white/[0.01]">
                    {step === 0 && (
                        <div className="flex flex-col items-center gap-6 py-8">
                            <p className="text-text-muted font-black text-[10px] uppercase tracking-widest text-center">Choose your role to get started</p>
                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => { setFormData({...formData, role: 'STUDENT'}); setStep(1); }}
                                    className="flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border-2 border-primary/30 hover:bg-primary hover:border-primary hover:text-white text-primary font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-primary/10 group"
                                >
                                    <GraduationCap size={18} className="shrink-0" />
                                    Continue as Student
                                </motion.button>

                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => { setFormData({...formData, role: 'TEACHER'}); setStep(1); }}
                                    className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border-2 border-white/10 hover:bg-primary hover:border-primary hover:text-white text-text-muted font-black text-sm uppercase tracking-widest transition-all shadow-lg group"
                                >
                                    <UserCheck size={18} className="shrink-0" />
                                    Continue as Teacher
                                </motion.button>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Identity Handle</Label>
                                    <div className="relative group">
                                        <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                                        <Input placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required className="h-14 pl-14 rounded-[1.5rem] bg-surface-2 transition-all focus:ring-4 focus:ring-primary/10" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Legal Name</Label>
                                    <Input placeholder="Full Legal Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required className="h-14 px-6 rounded-[1.5rem] bg-surface-2 transition-all focus:ring-4 focus:ring-primary/10" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Direct Email Point</Label>
                                <div className="relative group">
                                    <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                                    <Input type="email" placeholder="official@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="h-14 pl-14 rounded-[1.5rem] bg-surface-2 transition-all focus:ring-4 focus:ring-primary/10" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Secure Passkey</Label>
                                    <div className="relative group">
                                        <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                                        <Input type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required className="h-14 pl-14 rounded-[1.5rem] bg-surface-2 transition-all focus:ring-4 focus:ring-primary/10" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Telecomm Vector</Label>
                                    <div className="relative group">
                                        <Smartphone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                                        <Input placeholder="+94 7X XXX XXXX" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} required className="h-14 pl-14 rounded-[1.5rem] bg-surface-2 transition-all focus:ring-4 focus:ring-primary/10" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            
                            {/* Modern Approval Message Component */}
                            <div className="relative group p-6 rounded-[2rem] bg-warning/10 border border-warning/20 overflow-hidden">
                                <div className="relative z-10 flex gap-5">
                                    <div className="size-12 rounded-2xl bg-warning/20 flex items-center justify-center shrink-0 shadow-lg shadow-warning/10">
                                        <ShieldCheck size={24} className="text-warning" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-warning text-sm uppercase tracking-widest">Protocol Verification Required</h4>
                                        <p className="text-[11px] font-bold text-text-muted leading-relaxed">To maintain academic integrity, all facilitator accounts undergo manual identity review. You will be notified via email within 24 hours.</p>
                                    </div>
                                </div>
                                <div className="absolute -right-4 -top-4 size-32 bg-warning/5 blur-[40px] rounded-full" />
                            </div>

                            <div className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Institution Affiliation</Label>
                                    <div className="relative group">
                                        <School size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                                        <Input placeholder="University / Academy Name" value={formData.instituteName} onChange={e => setFormData({...formData, instituteName: e.target.value})} required={formData.role === 'TEACHER'} className="h-14 pl-14 rounded-[1.5rem] bg-surface-2" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Subject Specialization</Label>
                                    <div className="relative group">
                                        <BookOpen size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                                        <Input placeholder="Physics / ICT / Biology" value={formData.subjectSpecialization} onChange={e => setFormData({...formData, subjectSpecialization: e.target.value})} required={formData.role === 'TEACHER'} className="h-14 pl-14 rounded-[1.5rem] bg-surface-2" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Academic Biography</Label>
                                    <textarea placeholder="Describe your credentials and teaching methodology..." value={formData.shortBio} onChange={e => setFormData({...formData, shortBio: e.target.value})} required={formData.role === 'TEACHER'} className="w-full h-40 p-6 rounded-[2rem] bg-surface-2 border border-white/5 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all font-semibold text-sm outline-none custom-scrollbar" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {step > 0 && (
                    <div className="pt-4">
                        <GradientButton 
                            onClick={() => {
                                if (formData.role === 'TEACHER' && step === 1) setStep(2);
                                else {
                                    const form = document.querySelector('form');
                                    if (form) form.requestSubmit();
                                }
                            }}
                            disabled={loading}
                            height="52px"
                            className="rounded-xl shadow-lg shadow-primary/10 hover:scale-[1.01] transition-transform"
                        >
                            {loading ? (
                                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>{step === 1 && formData.role === 'TEACHER' ? 'Next: Teaching Experience' : (formData.role === 'STUDENT' ? 'Continue as Student' : 'Continue as Teacher')} <ArrowRight size={18} className="ml-2" /></>
                            )}
                        </GradientButton>
                    </div>
                )}
            </form>

            <div className="pt-12 border-t border-white/5 text-center">
                 <p className="text-xs font-black text-text-muted uppercase tracking-widest">
                    Recognized Identity? {' '}
                    <button onClick={() => window.location.hash = '#login'} className="text-primary hover:underline transition-all">Establish Link</button>
                 </p>
            </div>
         </motion.div>
      </div>
    </div>
  );
}
