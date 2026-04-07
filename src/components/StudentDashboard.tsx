import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  BookOpen, Video, Clock, ChevronRight, Search,
  Calendar, Star, GraduationCap, ArrowRight, Zap,
  CheckCircle2, Package, Globe, ShieldCheck, Verified,
  PlayCircle, HelpCircle, ArrowLeft, ArrowUpRight,
  Sparkles, DollarSign, Users, Award, Eye
} from 'lucide-react';
import { Button } from './ui/interfaces-button';
import { Input } from './ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import GradientButton from './ui/button-1';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

interface StudentDashboardProps {
  user: any;
  dashboardData: any;
  startZoomMeeting: (meeting: any) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  token: string | null;
}

const ClassCard: React.FC<{ course: any; onClick: () => void }> = ({ course, onClick }) => (
  <motion.div
    whileHover={{ y: -8 }}
    onClick={onClick}
    className="glass rounded-2xl p-6 cursor-pointer group hover:border-primary/40 hover:bg-white/[0.015] transition-all duration-500 relative overflow-hidden"
  >
    <div className="relative aspect-video rounded-xl overflow-hidden mb-5 shadow-2xl">
      {course.imageUrl ? (
        <img src={course.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center"><BookOpen size={40} className="text-primary opacity-20" /></div>
      )}
      <div className="absolute top-4 left-4"><span className="glass border-white/20 px-3 py-1 rounded-full text-[9px] font-black tracking-widest text-white uppercase">Education</span></div>
      <div className="absolute bottom-4 right-4"><div className="size-2 rounded-full bg-success shadow-[0_0_10px_#10b981]" /></div>
    </div>

    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full" style={{ background: course.color || '#f3184c' }} />
        <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted opacity-40">Class</span>
      </div>
      <h3 className="text-lg font-black truncate group-hover:text-primary transition-colors tracking-tight uppercase">{course.name}</h3>
      <p className="text-text-muted text-[11px] line-clamp-2 leading-relaxed opacity-50 font-medium h-9">{course.description}</p>
    </div>

    <div className="flex items-center justify-between pt-5 border-t border-white/5 mt-5">
      <div className="flex flex-col gap-0.5">
        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest opacity-40">Status</span>
        <span className="text-xs font-black flex items-center gap-1.5 uppercase">
          <CheckCircle2 size={12} className="text-success" /> Active
        </span>
      </div>
      <div className="size-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-lg">
        <ArrowUpRight size={18} />
      </div>
    </div>
  </motion.div>
);

const StatMini: React.FC<{ label: string; value: string; icon: any }> = ({ label, value, icon: Icon }) => (
  <div className="glass rounded-[1.5rem] px-5 py-4 flex items-center gap-4 border border-white/5 hover:border-primary/20 transition-all group">
    <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mb-1 opacity-40">{label}</p>
      <p className="text-base font-black text-white tracking-tighter leading-none">{value}</p>
    </div>
  </div>
);

export default function StudentDashboard({ user, dashboardData, startZoomMeeting, activeTab, setActiveTab, token }: StudentDashboardProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [availableModules, setAvailableModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [classTab, setClassTab] = useState<'vectors' | 'hub' | 'assets'>('vectors');
  const [search, setSearch] = useState('');
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
  const displayName = user?.fullName || user?.username;
  const now = new Date();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const r = await axios.get('/api/student/my-courses', authHeaders); // Keeping API route but terminology changes in UI
        setCourses(r.data);
      } catch { }
      setLoading(false);
    };
    if (activeTab === 'classes' || activeTab === 'dashboard') fetchCourses();

    if (activeTab === 'explore') {
      axios.get("/api/student/available-modules", authHeaders)
        .then(res => setAvailableModules(res.data))
        .catch(err => console.error("Error fetching available modules:", err));
    }
  }, [activeTab, token]);

  const handleEnroll = async (moduleId: string) => {
    setEnrolling(moduleId);
    try {
      await axios.post("/api/student/enroll", { moduleId }, authHeaders);
      setShowPaymentModal(null);
      setActiveTab('classes');
      window.location.reload();
    } catch (err: any) {
      alert("Encryption failure in payment gateway. Please retry.");
    } finally {
      setEnrolling(null);
    }
  };

  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const upcomingMeetings = courses.flatMap(c => (c.live_classes || []).map((m: any) => ({ ...m, courseName: c.name, courseColor: c.color })))
    .filter(m => new Date(m.scheduledAt) > twentyFourHoursAgo)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  if (activeTab === 'dashboard') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
        <div className="relative overflow-hidden rounded-[3.5rem] bg-[#0f0405] border border-white/5 p-12 md:p-16 mb-12 shadow-2xl group">
          {/* Dynamic Background Elements */}
          <div className="absolute -right-20 -top-20 size-[500px] bg-primary/20 blur-[150px] rounded-full group-hover:bg-primary/30 transition-all duration-1000" />
          <div className="absolute left-1/4 -bottom-40 size-[400px] bg-primary/10 blur-[120px] rounded-full group-hover:bg-primary/15 transition-all duration-1000" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="size-16 rounded-[1.5rem] bg-primary flex items-center justify-center shadow-[0_0_40px_rgba(243,24,76,0.5)] rotate-[-4deg] hover:rotate-0 transition-transform duration-500">
                  <GraduationCap size={32} className="text-white" />
                </div>
                <div className="space-y-1">
                  <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2 w-fit">
                    <span className="size-2 bg-success rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/80">Identity Verified: Online</span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-40 ml-1">Verified Scholar Node</p>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] italic uppercase">
                  Excel <br /><span className="text-gradient">Higher,</span> <br />
                  <span className="text-3xl md:text-4xl text-white/40 not-italic tracking-normal lowercase font-medium">@{displayName}</span>
                </h1>
              </div>

              <p className="text-text-muted text-sm md:text-lg max-w-xl leading-relaxed font-bold opacity-80 border-l-4 border-primary/40 pl-6 py-2">
                Your learning trajectory is optimized. <br />
                <span className="text-white font-black">{courses.length} ACTIVE CLASSES</span> identified in your registry.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-6">
              <StatMini label="Active Classes" value={String(courses.length)} icon={Package} />
              <StatMini label="Upcoming Vectors" value={String(upcomingMeetings.length)} icon={PlayCircle} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-2"><h2 className="font-black text-2xl tracking-tighter uppercase italic">Upcoming Sessions</h2><button onClick={() => setActiveTab('classes')} className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">Full Agenda <ChevronRight size={14} /></button></div>
            {upcomingMeetings.length === 0 ? (
              <div className="glass rounded-[2.5rem] p-16 text-center border-dashed border-white/10 group hover:border-primary/20 transition-all"><div className="size-16 rounded-3xl bg-white/[0.03] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"><Video size={32} className="text-text-muted opacity-20" /></div><p className="text-text-muted text-xs font-black uppercase tracking-[0.3em]">No upcoming vectors scheduled</p></div>
            ) : (
              <div className="space-y-5">
                {upcomingMeetings.slice(0, 3).map((m, idx) => {
                  const dt = new Date(m.scheduledAt);
                  const isNow = now.getTime() > dt.getTime() - 15 * 60 * 1000 && now.getTime() < dt.getTime() + 24 * 60 * 60 * 1000;
                  return (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} key={m.id} className="glass rounded-[2.5rem] p-6 flex items-center gap-6 group hover:border-primary/20 transition-all relative overflow-hidden">
                      <div className="absolute right-0 top-0 h-full w-1.5 opacity-40" style={{ background: m.courseColor || '#f3184c' }} />
                      <div className="size-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border-4 border-background/20 shadow-2xl" style={{ background: m.courseColor || '#f3184c' }}>
                        <span className="text-[10px] font-black text-white/90 uppercase leading-none mb-1 tracking-tighter">{dt.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-2xl font-black text-white leading-none tracking-tighter">{dt.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2"><div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full"><div className="size-2 rounded-full" style={{ background: m.courseColor || '#f3184c' }} /><span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{m.courseName}</span></div>{isNow && <span className="text-[10px] font-black text-primary animate-pulse tracking-[0.2em] flex items-center gap-1.5 uppercase"><div className="size-1.5 bg-primary rounded-full shadow-[0_0_10px_#f3184c]" /> LIVE NOW</span>}</div>
                        <h3 className="font-black text-xl truncate tracking-tight">{m.topic}</h3>
                        <p className="text-xs font-black text-text-muted uppercase tracking-widest mt-2">{dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; Active Node</p>
                      </div>
                      {isNow && m.zoomMeetingId ? (
                        <button onClick={() => startZoomMeeting(m)} className="entry-button-animated h-12 !px-8 h-12 shadow-xl shadow-primary/20">
                          <svg xmlns="http://www.w3.org/2000/svg" className="arr-2" viewBox="0 0 24 24">
                            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                          </svg>
                          <span className="text italic">E N T R Y</span>
                          <span className="circle"></span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="arr-1" viewBox="0 0 24 24">
                            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                          </svg>
                        </button>
                      ) : (
                        <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all cursor-pointer"><ChevronRight size={20} /></div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="space-y-8">
            <h2 className="font-black text-2xl tracking-tighter italic uppercase px-2">My Classes</h2>
            <div className="space-y-4">
              {courses.slice(0, 4).map((c) => (
                <div key={c.id} onClick={() => { setSelectedCourse(c); setClassTab('vectors'); setActiveTab('classes'); }} className="glass rounded-[1.5rem] p-5 flex items-center gap-5 cursor-pointer hover:bg-white/[0.05] hover:border-primary/20 transition-all group">
                  <div className="relative shrink-0"><div className="size-14 rounded-2xl ring-4 ring-background overflow-hidden" style={{ background: c.color || '#f3184c' }}>{c.imageUrl && <img src={c.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" alt="" />}</div></div>
                  <div className="flex-1 min-w-0"><p className="font-black text-base truncate tracking-tight mb-1">{c.name}</p><p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">Class Access &rarr;</p></div>
                </div>
              ))}
              <Button variant="outline" onClick={() => setActiveTab('classes')} className="w-full h-15 rounded-[1.5rem] bg-white/[0.02] border-dashed font-black text-xs space-x-2"><span>VIEW ALL ACTIVE CLASSES</span><ArrowRight size={14} className="opacity-40" /></Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (activeTab === 'explore') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
        <div><h1 className="text-4xl font-black tracking-tighter uppercase italic">Explore Classes</h1><p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-2">Available Institutional Access Nodes</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableModules.map((m: any) => (
            <div key={m.id} className="glass rounded-[2.5rem] overflow-hidden border-white/5 group hover:border-primary/30 transition-all bg-[#0f0405]/20">
              <div className="h-48 bg-[#0f0405] relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-transparent z-0" /><div className="absolute inset-0 flex items-center justify-center p-8 z-10 transition-transform group-hover:scale-105"><h3 className="text-2xl font-black text-center tracking-tighter uppercase leading-tight italic drop-shadow-2xl">{m.name}</h3></div><div className="absolute top-6 right-6 z-20"><span className="px-5 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-primary shadow-2xl">LKR {parseFloat(m.price).toFixed(2)}</span></div></div>
              <div className="p-8 space-y-6 relative z-10"><div className="flex items-center gap-4"><Avatar className="size-12 rounded-xl border border-white/10 ring-2 ring-primary/10"><AvatarImage src={m.users?.profilePhotoUrl} /><AvatarFallback className="bg-primary/20 text-primary font-black uppercase">{(m.users?.fullName || 'T').charAt(0)}</AvatarFallback></Avatar><div><p className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-40 mb-0.5">Faculty Expert</p><p className="font-black text-sm uppercase tracking-tight text-white/90">{m.users?.fullName}</p></div></div><p className="text-text-muted text-xs font-bold leading-relaxed line-clamp-2 opacity-60">{m.description}</p><Button onClick={() => setShowPaymentModal(m)} className="w-full h-14 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-primary transition-all text-[10px] font-black uppercase tracking-[0.4em] shadow-lg group-hover:shadow-primary/10">Request Access</Button></div>
            </div>
          ))}
          {availableModules.length === 0 && <div className="col-span-full py-32 text-center opacity-40 border-2 border-dashed border-white/5 rounded-[3rem]"><Globe size={48} className="mx-auto mb-4 text-primary/20" /><p className="text-[10px] font-black uppercase tracking-[0.6em]">No regional classes discovered</p></div>}
        </div>
        <AnimatePresence>{showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"><motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="glass max-w-md w-full p-10 rounded-[3rem] border-white/10 text-center"><div className="size-20 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-8 text-success shadow-2xl shadow-success/10"><ShieldCheck size={32} /></div><h2 className="text-2xl font-black mb-2 uppercase tracking-tighter italic">Secure Payment Protocol</h2><p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-10">Institutional Verification Center</p><div className="bg-white/5 rounded-2xl p-6 mb-8 text-left border border-white/5"><div className="flex justify-between items-center mb-4"><span className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-40">System Handle</span><span className="font-bold text-white text-xs uppercase">{showPaymentModal.name}</span></div><div className="flex justify-between items-center pt-4 border-t border-white/5"><span className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-40">Access Fee</span><span className="font-black text-xl text-primary tracking-tighter italic">LKR {parseFloat(showPaymentModal.price).toFixed(2)}</span></div></div><div className="space-y-3"><Button onClick={() => handleEnroll(showPaymentModal.id)} disabled={enrolling !== null} className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.4em] text-[10px] shadow-xl shadow-primary/20">{enrolling ? 'Processing Nodes...' : 'Authorize Transaction'}</Button><Button onClick={() => setShowPaymentModal(null)} variant="ghost" className="w-full h-12 rounded-2xl text-text-muted hover:text-white font-black uppercase tracking-[0.4em] text-[10px]">Cancel Protocol</Button></div></motion.div></div>
        )}</AnimatePresence>
      </motion.div>
    );
  }

  if (activeTab === 'classes') {
    if (selectedCourse) {
      const meetings = (selectedCourse.live_classes || []).sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      return (
        <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
          <div className="glass border border-white/10 rounded-[3rem] p-4 md:p-12 mb-10 relative overflow-hidden bg-[#0f0405]/20">
            <div className="absolute right-0 top-0 h-full w-2 shadow-[0_0_30px_rgba(243,24,76,0.3)] z-20" style={{ background: selectedCourse.color || '#f3184c' }} />
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 mb-12 pb-12 border-b border-white/5 relative z-10">
              <div className="flex items-center gap-6">
                <button onClick={() => setSelectedCourse(null)} className="size-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-primary transition-all group shrink-0"><ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" /></button>
                <div className="min-w-0"><div className="flex items-center gap-3 mb-2"><div className="size-2 rounded-full shadow-[0_0_8px_#f3184c]" style={{ background: selectedCourse.color || '#f3184c' }} /><p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-40">Class ID: {selectedCourse.id.slice(0, 12)}</p></div><h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic truncate">{selectedCourse.name}</h2></div>
              </div>
              <div className="institutional-radio-inputs shadow-2xl shadow-black/40">
                {['vectors', 'hub'].map(tab => (
                  <label key={tab} className="institutional-radio">
                    <input
                      type="radio"
                      name="classTab"
                      checked={classTab === tab}
                      onChange={() => setClassTab(tab as any)}
                      className="institutional-radio-input"
                    />
                    <span className="institutional-radio-name italic tracking-widest">{tab === 'vectors' ? 'Live Classes' : 'Class Info'}</span>
                  </label>
                ))}
              </div>
            </div>
            <AnimatePresence mode="wait">
              {classTab === 'vectors' && (
                <motion.div key="vectors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 relative z-10">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-3 opacity-60"><Video size={18} className="text-primary" /><h3 className="font-black text-xs uppercase tracking-[0.3em]">Institutional Directives</h3></div><div className="flex items-center gap-3 group cursor-pointer" onClick={() => setShowHistory(!showHistory)}><span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Archive Log</span><div className={`w-12 h-6 rounded-full relative transition-colors border ${showHistory ? 'bg-primary/20 border-primary/40' : 'bg-white/5 border-white/10'}`}><motion.div animate={{ x: showHistory ? 26 : 4 }} className={`absolute top-1 size-4 rounded-full shadow-lg ${showHistory ? 'bg-primary shadow-primary/40' : 'bg-white/20'}`} /></div></div></div>
                  <div className="grid grid-cols-1 gap-4">
                    {meetings.filter(m => showHistory || new Date(m.scheduledAt).getTime() > twentyFourHoursAgo.getTime()).map((m: any) => {
                      const isLive = now >= new Date(new Date(m.scheduledAt).getTime() - 15 * 60 * 1000) && now <= new Date(new Date(m.scheduledAt).getTime() + 24 * 60 * 60 * 1000); // Available for 24h post-start
                      const isPast = new Date(m.scheduledAt).getTime() < twentyFourHoursAgo.getTime();
                      return (
                        <div key={m.id} className={`glass p-8 rounded-[2.5rem] border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:border-primary/20 transition-all group ${isPast ? 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100' : ''}`}>
                          <div className="flex items-center gap-8">
                            <div className={`size-16 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/5 transition-all group-hover:scale-105 ${isLive ? 'bg-primary shadow-2xl shadow-primary/30' : 'bg-white/5'}`}><Calendar size={28} className={isLive ? 'text-white' : 'text-text-muted'} /></div>
                            <div><p className="font-black text-xl uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{m.topic}</p><div className="flex flex-wrap items-center gap-6"><div className="flex items-center gap-2"><Clock size={14} className="text-primary opacity-60" /><span className="text-[11px] font-black text-text-muted uppercase tracking-widest italic">{new Date(m.scheduledAt).toLocaleString()}</span></div><div className="flex items-center gap-2"><Zap size={14} className="text-warning opacity-60" /><span className="text-[11px] font-black text-text-muted uppercase tracking-widest italic">{m.duration || 60} Min Node</span></div></div></div>
                          </div>
                          <div className="flex items-center gap-4 min-w-[220px]">
                            {isLive ? (
                              <button onClick={() => startZoomMeeting(m)} className="entry-button-animated w-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="arr-2" viewBox="0 0 24 24">
                                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                                </svg>
                                <span className="text italic">E N T R Y</span>
                                <span className="circle"></span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="arr-1" viewBox="0 0 24 24">
                                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                                </svg>
                              </button>
                            ) : isPast ? (
                              <div className="w-full h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center gap-2 opacity-60">
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] italic">Archived Class</span>
                              </div>
                            ) : (
                              <div className="w-full h-14 rounded-2xl bg-warning/5 border border-warning/10 flex items-center justify-center gap-3">
                                <Clock size={16} className="text-warning animate-pulse" />
                                <span className="text-[10px] font-black text-warning uppercase tracking-[0.3em] italic">Awaiting Sync</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {meetings.length === 0 && <div className="py-24 text-center glass rounded-[3rem] border-dashed border-white/10"><Video size={48} className="mx-auto mb-6 text-text-muted opacity-10" /><p className="text-[10px] font-black uppercase tracking-[0.6em] text-text-muted opacity-40 italic">Academic Vectors Idle</p></div>}
                  </div>
                </motion.div>
              )}
              {classTab === 'hub' && (
                <motion.div key="hub" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 relative z-10 pt-4"><div className="grid grid-cols-1 lg:grid-cols-3 gap-12"><div className="lg:col-span-2 space-y-8"><div className="space-y-4"><h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Intelligence Summary</h4><p className="text-xl font-medium leading-relaxed text-white/80 tracking-tight">{selectedCourse.description}</p></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="glass p-8 rounded-[2rem] border-white/5 flex flex-col gap-4"><Award size={24} className="text-primary" /><div><p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40 mb-1">Certification</p><p className="text-sm font-black uppercase tracking-tight">Institutional Merit</p></div></div><div className="glass p-8 rounded-[2rem] border-white/5 flex flex-col gap-4"><Users size={24} className="text-success" /><div><p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40 mb-1">Scholar Density</p><p className="text-sm font-black uppercase tracking-tight">Vectored Access Active</p></div></div></div></div><div className="space-y-8"><h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Primary Facilitator</h4><div className="glass p-10 rounded-[2.5rem] border-white/10 text-center relative overflow-hidden group"><div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent z-0 opacity-0 group-hover:opacity-100 transition-opacity" /><Avatar className="size-24 rounded-[2rem] border-4 border-background/50 ring-4 ring-primary/20 mx-auto mb-6 relative z-10 shadow-2xl"><AvatarImage src={selectedCourse.teachers?.profilePhotoUrl} /><AvatarFallback className="bg-primary/20 text-primary uppercase font-black text-2xl">{(selectedCourse.teachers?.fullName || 'T').charAt(0)}</AvatarFallback></Avatar><div className="relative z-10"><p className="font-black text-xl uppercase tracking-tighter mb-1 text-white">{selectedCourse.teachers?.fullName || selectedCourse.teachers?.username}</p><p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-40 mb-0">Master Instructor</p></div></div></div></div></motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      );
    }
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-2"><div><h1 className="text-4xl font-black tracking-tighter uppercase italic">My Classes</h1><p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-2">Active Institutional Access Tokens</p></div><div className="relative group w-full md:w-auto md:min-w-[320px]"><Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" /><Input placeholder="Filter units..." value={search} onChange={e => setSearch(e.target.value)} className="h-14 pl-14 text-center rounded-2xl bg-white/5 border-white/10 focus:border-primary/40" /></div></div>
        {loading ? (<div className="flex justify-center py-24"><div className="size-14 border-[3px] border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(243,24,76,0.3)]" /></div>) : courses.length === 0 ? (
          <div className="glass rounded-[3rem] py-32 text-center border-dashed border-white/10 group"><div className="size-24 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-500"><Package size={48} className="text-primary opacity-10 group-hover:opacity-40 transition-opacity" /></div><h2 className="text-2xl font-black tracking-tighter mb-2 uppercase italic">Registry Empty</h2><p className="text-text-muted text-[10px] max-w-sm mx-auto mb-10 font-black leading-relaxed opacity-40 uppercase tracking-widest italic">No active class protocols detected. Initialize discovery to begin.</p><Button onClick={() => setActiveTab('explore')} className="bg-primary px-10 h-14 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px]">Launch Discovery Hub</Button></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">{courses.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((course) => (<ClassCard key={course.id} course={course} onClick={() => { setSelectedCourse(course); setClassTab('vectors'); }} />))}</div>
        )}
      </motion.div>
    );
  }

  if (activeTab === 'settings') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto py-10">
        <div className="glass p-12 rounded-[3.5rem] border-white/5 text-center relative overflow-hidden bg-[#0f0405]/40"><div className="absolute -right-20 -top-20 size-80 bg-primary/5 blur-[100px] rounded-full" /><div className="relative z-10"><div className="size-24 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 shadow-2xl"><Avatar className="size-20 rounded-2xl"><AvatarImage src={user?.profilePhotoUrl} /><AvatarFallback className="bg-primary/20 text-primary font-black text-2xl uppercase">{(user?.fullName || 'S').charAt(0)}</AvatarFallback></Avatar></div><h2 className="text-3xl font-black mb-3 uppercase tracking-tighter text-white">Learner Hub Identity</h2><p className="text-text-muted text-[11px] font-black uppercase tracking-[0.3em] opacity-40 mb-10">Verified Institutional Access Verification Profile</p><div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left"><div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:border-primary/30 transition-all group"><p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 opacity-40 group-hover:text-primary transition-colors">Digital Handle</p><p className="font-black text-xl text-white tracking-widest uppercase truncate">{user?.username}</p></div><div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:border-primary/30 transition-all group"><p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 opacity-40 group-hover:text-primary transition-colors">Assigned Protocol</p><p className="font-black text-xl text-primary tracking-widest uppercase">Verified Student Agent</p></div></div><div className="mt-6 p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 text-left flex items-center justify-between group"><div><p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1 opacity-40">Registered Email</p><p className="font-bold text-white/80">{user?.email}</p></div><Button variant="outline" className="rounded-xl border-white/10 h-10 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100">Request Change</Button></div></div></div>
      </motion.div>
    );
  }

  return null;
}
