import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Lock, ArrowRight, ShieldCheck, GraduationCap,
    Sparkles, Globe, Zap, CheckCircle2, AlertCircle, Eye, EyeOff,
    Shield, HelpCircle
} from 'lucide-react';
import GradientButton from './ui/button-1';
import { Button } from './ui/interfaces-button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export default function Login({ setToken, setUser }: { setToken: (t: string) => void, setUser: (u: any) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            setToken(res.data.token);
            setUser(res.data.user);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-background overflow-hidden relative">
            {/* ── Left Side: Brand & Visuals ── */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-surface-2 p-16 flex-col justify-between border-r border-white/5">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -left-20 -top-20 size-[500px] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute right-0 bottom-0 size-[400px] bg-primary/10 blur-[100px] rounded-full" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(243,24,76,0.05)_0%,transparent_70%)]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 flex items-center gap-3"
                >
                    <div className="size-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40">
                        <GraduationCap size={24} className="text-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-text-main">EDU-LMS <span className="text-primary font-black">.</span></span>
                </motion.div>

                <div className="relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="text-6xl font-black tracking-tighter leading-[1.05] mb-8"
                    >
                        Unleash the <br />
                        <span className="text-gradient">Power of Live</span> <br />
                        Education.
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                        className="grid grid-cols-2 gap-6 max-w-md"
                    >
                        <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5">
                            <Zap size={20} className="text-primary mb-3" />
                            <p className="text-sm font-black mb-1">Instant Zoom</p>
                            <p className="text-[10px] uppercase tracking-widest text-text-muted opacity-60">Zero latency rooms</p>
                        </div>
                        <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5">
                            <Globe size={20} className="text-primary mb-3" />
                            <p className="text-sm font-black mb-1">Global Scale</p>
                            <p className="text-[10px] uppercase tracking-widest text-text-muted opacity-60">Enterprise ready</p>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                    className="relative z-10 flex items-center gap-4 py-4 px-6 bg-white/[0.03] border border-white/5 rounded-3xl w-fit"
                >
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => <div key={i} className="size-8 rounded-full border-2 border-surface-2 bg-primary/20" />)}
                    </div>
                    <p className="text-xs font-black text-text-muted leading-none">JOIN <span className="text-text-main">2,400+</span> ACTIVE SCHOLARS</p>
                </motion.div>
            </div>

            {/* ── Right Side: Login Form ── */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-[420px] space-y-10"
                >
                    <div className="text-center lg:text-left">
                        <h2 className="text-4xl font-black tracking-tight mb-3">Welcome Back</h2>
                        <p className="text-text-muted font-black text-xs uppercase tracking-widest leading-loose">Enter your identity to resume your journey</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-xs font-black flex items-center gap-3"
                                >
                                    <AlertCircle size={16} /> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Universal Identity (Email / Username)</Label>
                                <div className="relative group">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type="text" placeholder="name@institute.com or admin" value={email}
                                        onChange={e => setEmail(e.target.value)} required
                                        className="h-14 pl-12 rounded-2xl bg-surface transition-all focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Secret Password</Label>
                                    <button type="button" className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">Forgot Access?</button>
                                </div>
                                <div className="relative group">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                                        onChange={e => setPassword(e.target.value)} required
                                        className="h-14 pl-12 pr-12 rounded-2xl bg-surface transition-all focus:ring-4 focus:ring-primary/10"
                                    />
                                    <button
                                        type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <GradientButton
                                onClick={() => {
                                    const form = document.querySelector('form');
                                    if (form) form.requestSubmit();
                                }}
                                disabled={loading}
                                height="60px"
                            >
                                {loading ? (
                                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Sign In to Dashboard <ArrowRight size={18} className="ml-2" /></>
                                )}
                            </GradientButton>
                        </div>
                    </form>

                    <div className="pt-6 border-t border-white/5 text-center">
                        <p className="text-xs font-black text-text-muted uppercase tracking-widest">
                            No account yet? {' '}
                            <button onClick={() => window.location.hash = '#signup'} className="text-primary hover:underline transition-all">Establish Identity</button>
                        </p>
                    </div>
                </motion.div>

                <div className="absolute bottom-8 flex flex-col items-center gap-4">
                    <div className="flex gap-6 login-footer-links text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#ffffff' }}>
                        <a href="#" className="hover:underline transition-all" style={{ color: '#ffffff' }}>Privacy</a>
                        <a href="#" className="hover:underline transition-all" style={{ color: '#ffffff' }}>Terms</a>
                        <a href="#" className="hover:underline transition-all" style={{ color: '#ffffff' }}>Help</a>
                    </div>
                    <div className="text-[9px] font-black text-text-muted opacity-30 uppercase tracking-[0.3em]">
                        Secure Identity Protocol &bull; EDU-LMS v3.0
                    </div>
                </div>
            </div>
        </div>
    );
}
