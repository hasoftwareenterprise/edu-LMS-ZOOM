import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  BookOpen, Users, DollarSign, Video, Plus, Pencil, Trash2,
  ChevronRight, ChevronDown, Search, X, Calendar, Clock,
  RefreshCw, Eye, ArrowLeft, Camera, Verified, ShieldCheck, Zap,
  AlertCircle, GraduationCap, ArrowRight, UserCheck, PlusCircle, Share2
} from 'lucide-react';
import { Button } from './ui/interfaces-button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import GradientButton from './ui/button-1';

interface TeacherDashboardProps {
  user: any;
  dashboardData: any;
  startZoomMeeting: (meeting: any) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  token: string | null;
}

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ElementType; description?: string }> = ({
  label, value, icon: Icon, description
}) => (
  <div className="glass rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden group hover:border-primary/40 hover:translate-y-[-4px] transition-all duration-500">
    <div className="absolute -right-4 -top-4 size-20 bg-primary/5 blur-2xl rounded-full group-hover:bg-primary/10 transition-all" />
    <div className="flex items-center justify-between">
      <div className="size-11 rounded-xl flex items-center justify-center shrink-0 shadow-lg bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 transition-transform">
        <Icon size={20} />
      </div>
      {description && (
        <span className="text-[10px] font-black tracking-widest text-text-muted opacity-40 uppercase">{description}</span>
      )}
    </div>
    <div>
      <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.25em] mb-1.5 opacity-60">{label}</p>
      <p className="text-4xl font-black text-text-main tracking-tighter leading-none">{value}</p>
    </div>
  </div>
);

// ── Meeting Form Modal ──
const MeetingFormModal: React.FC<{
  courseId: string; editing?: any;
  onClose: () => void; onSave: () => void; token: string | null;
}> = ({ courseId, editing, onClose, onSave, token }) => {
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
  const [title, setTitle] = useState(editing?.title || '');
  const [topic, setTopic] = useState(editing?.topic || '');
  const [date, setDate] = useState(editing ? new Date(editing.scheduledAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(editing ? new Date(editing.scheduledAt).toTimeString().slice(0, 5) : new Date().toTimeString().slice(0, 5));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!title.trim() || !date || !time) { setError('Please fill all required fields.'); return; }
    setLoading(true);
    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      if (editing) {
        await axios.put(`/api/live-classes/${editing.id}`, { title, scheduledAt }, authHeaders);
      } else {
        await axios.post('/api/live-classes', { title, topic, moduleId: courseId, scheduledAt }, authHeaders);
      }
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-black text-2xl tracking-tight">{editing ? 'Edit Class' : 'Schedule a Live Class'}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1">Set the class title, date, and time</p>
          </div>
          <button onClick={onClose} className="size-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-danger/20 hover:text-danger transition-all"><X size={18} /></button>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-text-muted ml-4">Meeting Identity</Label>
            <Input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Unit 04 Review: Advance Mechanics" className="h-14 px-6 rounded-[1.5rem]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-text-muted ml-4">Schedule Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-14 px-6 rounded-[1.5rem]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-text-muted ml-4">Start Time</Label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="h-14 px-6 rounded-[1.5rem]" />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-[10px] font-black flex items-center gap-2 uppercase tracking-widest">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-white/5">
            <Button variant="outline" onClick={onClose} className="flex-1 h-14 rounded-2xl">Cancel</Button>
            <Button onClick={handleSave} disabled={loading} className="flex-[2] h-14 rounded-2xl shadow-xl shadow-primary/20">
              {loading ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Zap size={18} className="mr-2" />}
              {editing ? 'Update Class' : 'Schedule Class'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ── Course Form Modal ──
const CourseFormModal: React.FC<{
  editing?: any; onClose: () => void; onSave: () => void; token: string | null;
}> = ({ editing, onClose, onSave, token }) => {
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
  const [name, setName] = useState(editing?.name || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [price, setPrice] = useState(String(editing?.price || ''));
  const [imageUrl, setImageUrl] = useState(editing?.imageUrl || '');
  const [driveFolder, setDriveFolder] = useState(editing?.googleDriveFolderName || '');
  const [color, setColor] = useState(editing?.color || '#f3184c');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim() || !description.trim() || price === '') { setError('Please fill all required fields.'); return; }
    setLoading(true);
    try {
      const data = {
        name, description, price: Number(price), imageUrl: imageUrl || null,
        color, type: 'COURSE',
        startDate: new Date().toISOString(), startTime: '09:00', endTime: '10:00',
        googleDriveFolderName: driveFolder || null
      };
      if (editing) {
        await axios.put(`/api/courses/${editing.id}`, data, authHeaders);
      } else {
        await axios.post('/api/courses', data, authHeaders);
      }
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md overflow-y-auto pt-20" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
          <div>
            <h2 className="text-3xl font-black tracking-tighter">{editing ? 'Edit Class' : 'Create New Class Hub'}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-1">Class Details & Pricing</p>
          </div>
          <button onClick={onClose} className="size-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-danger/20 hover:text-danger transition-all"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6 md:col-span-2">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-text-muted ml-4">Class Hub Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pure Mathematics 2025 Theory" className="h-14 px-6 rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-text-muted ml-4">Class Description</Label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the mission of this class..." className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all font-semibold text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-text-muted ml-4">Enrollment Fee (LKR)</Label>
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[11px] font-black text-text-muted opacity-40 uppercase tracking-tighter">LKR</span>
              <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="h-14 pl-16 rounded-2xl text-lg font-black text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-text-muted ml-4">Cover Asset (URL)</Label>
            <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="h-14 px-6 rounded-2xl" />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-text-muted ml-4">Google Drive Handle</Label>
            <div className="relative group">
              <BookOpen size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input value={driveFolder} onChange={e => setDriveFolder(e.target.value.replace(/\s+/g, '-'))} placeholder="ALMaths-V1" className="h-14 pl-14 rounded-2xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-text-muted ml-4">Class Accent Color</Label>
            <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 h-14 px-5 rounded-2xl">
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="size-9 rounded-xl cursor-pointer bg-transparent border-none p-0 overflow-hidden" />
              <span className="text-sm font-mono font-black text-text-muted opacity-60">{color.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-8 p-4 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="flex gap-4 pt-10 mt-6 border-t border-white/5">
          <Button variant="outline" onClick={onClose} className="flex-1 h-14 rounded-2xl">Cancel</Button>
          <Button onClick={handleSave} disabled={loading} className="flex-[2] h-14 rounded-2xl shadow-xl shadow-primary/20">
            {loading ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <ShieldCheck size={18} className="mr-2" />}
            {editing ? 'Save Changes' : 'Create Class'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default function TeacherDashboard({ user, dashboardData, startZoomMeeting, activeTab, setActiveTab, token }: TeacherDashboardProps) {
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [studentCourseFilter, setStudentCourseFilter] = useState('');

  // Course management state
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [classTab, setClassTab] = useState<'meetings' | 'details' | 'students'>('meetings');
  const [showPastMeetings, setShowPastMeetings] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);

  const displayName = user?.fullName || user?.username;
  const now = new Date();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const r = await axios.get('/api/teacher/courses', authHeaders);
      setCourses(r.data);
    } catch { }
    setLoading(false);
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = studentCourseFilter ? `?moduleId=${studentCourseFilter}` : '';
      const r = await axios.get(`/api/teacher/students${params}`, authHeaders);
      setStudents(r.data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'classes' || activeTab === 'dashboard') fetchCourses();
    if (activeTab === 'students') fetchStudents();
  }, [activeTab, studentCourseFilter]);

  const deleteCourse = async (id: string) => {
    if (!confirm('Permanently decommission this course? All associated meeting data will be erased.')) return;
    await axios.delete(`/api/courses/${id}`, authHeaders);
    setSelectedCourse(null);
    fetchCourses();
  };

  const deleteMeeting = async (id: string) => {
    if (!confirm('Remove this live session from the records?')) return;
    await axios.delete(`/api/live-classes/${id}`, authHeaders);
    if (selectedCourse) {
      const r = await axios.get('/api/teacher/courses', authHeaders);
      const updated = r.data.find((c: any) => c.id === selectedCourse.id);
      if (updated) setSelectedCourse(updated);
      setCourses(r.data);
    }
  };

  // Computed stats
  const totalStudentsEnrolled = courses.reduce((s, c) => s + (c.enrollments?.filter((e: any) => e.status === 'PAID').length || 0), 0);
  const totalRevenueGenerated = courses.reduce((s, c) => s + (c.enrollments?.filter((e: any) => e.status === 'PAID').reduce((r: number, e: any) => r + Number(e.amount), 0) || 0), 0);
  const upcomingMeetingsCount = courses.flatMap(c => c.live_classes || []).filter(m => new Date(m.scheduledAt) > now).length;

  const filteredStudents = students.filter(s => {
    const name = s.users?.fullName || s.users?.username || '';
    return name.toLowerCase().includes(search.toLowerCase()) || s.users?.email?.toLowerCase().includes(search.toLowerCase());
  });

  // ── Overview / Dashboard ──
  if (activeTab === 'dashboard') {
    const upcoming = courses.flatMap(c => (c.live_classes || []).map((m: any) => ({ ...m, courseName: c.name, courseColor: c.color })))
      .filter(m => new Date(m.scheduledAt) > now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 5);

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
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/80">Vector Authority: Online</span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-40 ml-1">Verified Institutional Identity</p>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] italic uppercase">
                  Ignite <br /><span className="text-gradient">Excellence,</span> <br />
                  <span className="text-3xl md:text-4xl text-white/40 not-italic tracking-normal lowercase font-medium">@{displayName}</span>
                </h1>
              </div>

              <p className="text-text-muted text-sm md:text-lg max-w-xl leading-relaxed font-bold opacity-80 border-l-4 border-primary/40 pl-6 py-2">
                Your academic infrastructure is fully vectored. <br />
                <span className="text-white font-black">{upcomingMeetingsCount} SESSIONS</span> identified for the current cycle.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-6 shrink-0 items-start">
              {/* Premium Animated Button 1 */}
              <button className="animated-button" onClick={() => { setActiveTab('classes'); setEditingMeeting(null); setTimeout(() => setShowMeetingForm(true), 50); }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="arr-2" viewBox="0 0 24 24">
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                </svg>
                <span className="text">Schedule Class</span>
                <span className="circle"></span>
                <svg xmlns="http://www.w3.org/2000/svg" className="arr-1" viewBox="0 0 24 24">
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                </svg>
              </button>

              {/* Premium Animated Button 2 (Secondary) */}
              <button className="animated-button secondary" onClick={() => { setActiveTab('classes'); setEditingCourse(null); setTimeout(() => setShowCourseForm(true), 50); }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="arr-2" viewBox="0 0 24 24">
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                </svg>
                <span className="text">Create Class</span>
                <span className="circle"></span>
                <svg xmlns="http://www.w3.org/2000/svg" className="arr-1" viewBox="0 0 24 24">
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Active Classes" value={courses.length} icon={BookOpen} description="Operational" />
          <StatCard label="Learners" value={totalStudentsEnrolled} icon={Users} description="Registry" />
          <StatCard label="Institutional Revenue" value={`${totalRevenueGenerated.toLocaleString()}`} icon={DollarSign} description="LKR" />
          <StatCard label="Upcoming Sessions" value={upcomingMeetingsCount} icon={Video} description="Vectored" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-black text-2xl tracking-tighter uppercase italic">Institutional Feed</h2>
              <div className="size-8 rounded-full border-2 border-white/5 flex items-center justify-center"><ChevronRight size={16} className="text-text-muted" /></div>
            </div>
            {upcoming.length === 0 ? (
              <div className="glass rounded-[2.5rem] p-16 text-center border-dashed border-white/10 group hover:border-primary/20 transition-all">
                <div className="size-16 rounded-3xl bg-white/[0.03] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Video size={32} className="text-text-muted opacity-20" />
                </div>
                <p className="text-text-muted text-xs font-black uppercase tracking-[0.3em]">No Broadcasts Identified</p>
              </div>
            ) : (
              <div className="space-y-5">
                {upcoming.map((m, idx) => {
                  const dt = new Date(m.scheduledAt);
                  const isNow = Math.abs(dt.getTime() - now.getTime()) < 30 * 60 * 1000;
                  return (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} key={m.id} className="glass rounded-[2rem] p-6 flex items-center gap-6 group hover:border-primary/20 transition-all relative overflow-hidden">
                      <div className="absolute right-0 top-0 h-full w-1.5 opacity-40" style={{ background: m.courseColor || '#f3184c' }} />
                      <div className="size-16 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-2xl border-4 border-background/20" style={{ background: m.courseColor || '#f3184c' }}>
                        <span className="text-[10px] font-black text-white/90 uppercase leading-none mb-1 tracking-tighter">{dt.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-2xl font-black text-white leading-none tracking-tighter">{dt.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                            <div className="size-2 rounded-full" style={{ background: m.courseColor || '#f3184c' }} />
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{m.courseName}</span>
                          </div>
                          {isNow && <span className="text-[10px] font-black text-primary animate-pulse tracking-[0.2em] uppercase flex items-center gap-1.5"><div className="size-1.5 bg-primary rounded-full shadow-[0_0_10px_#f3184c]" /> LIVE POINT</span>}
                        </div>
                        <h3 className="font-black text-xl truncate tracking-tight">{m.title}</h3>
                        <div className="flex items-center gap-4 mt-2 opacity-50">
                          <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-tighter"><Clock size={14} className="text-primary" /> {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <div className="size-1 bg-white/20 rounded-full" />
                          <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-tighter"><Users size={14} className="text-primary" /> Enrolled Students</span>
                        </div>
                      </div>
                      {isNow && m.zoomMeetingId ? (
                        <Button onClick={() => startZoomMeeting(m)} className="rounded-2xl px-6 h-12 shadow-lg shadow-primary/30 group-hover:scale-105 transition-all">Launch</Button>
                      ) : (
                        <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all cursor-pointer">
                          <ChevronRight size={20} />
                        </div>
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
                <div key={c.id} onClick={() => { setSelectedCourse(c); setClassTab('details'); setActiveTab('classes'); }} className="glass rounded-[1.5rem] p-5 flex items-center gap-5 cursor-pointer hover:bg-white/[0.05] hover:border-primary/20 transition-all group">
                  <div className="relative shrink-0">
                    <div className="size-14 rounded-2xl ring-4 ring-background overflow-hidden" style={{ background: c.color || '#f3184c' }}>
                      {c.imageUrl && <img src={c.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" alt="" />}
                    </div>
                    <div className="absolute -top-1 -right-1 size-5 bg-background rounded-full p-1 flex items-center justify-center border border-white/10 shadow-lg">
                      <div className="size-full rounded-full" style={{ background: c.color || '#f3184c' }} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-base truncate tracking-tight mb-1">{c.name}</p>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">Connect Class →</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={() => setActiveTab('classes')} className="w-full h-15 rounded-[1.5rem] bg-white/[0.02] border-dashed font-black text-xs space-x-2">
                <span>VIEW ALL CLASS PROTOCOLS</span>
                <ArrowRight size={14} className="opacity-40" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Classes Section ──
  if (activeTab === 'classes') {
    if (selectedCourse) {
      const course = courses.find(c => c.id === selectedCourse.id) || selectedCourse;
      const meetings = (course.live_classes || []).sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const upcomingM = meetings.filter((m: any) => new Date(m.scheduledAt) > twentyFourHoursAgo);
      const pastM = meetings.filter((m: any) => new Date(m.scheduledAt) <= twentyFourHoursAgo);
      const enrolledS = students.filter(s => s.moduleId === course.id);

      return (
        <>
          <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-3 text-text-muted hover:text-primary transition-all text-[10px] font-black uppercase tracking-[0.2em] group">
              <div className="size-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20"><ArrowLeft size={16} /></div>
              Class Center
            </button>

            <div className="relative overflow-hidden rounded-[3rem] bg-surface-2 border border-white/5 p-10 group">
              <div className="absolute right-0 top-0 h-full w-2 shadow-[0_0_30px_rgba(243,24,76,0.5)]" style={{ background: course.color || '#f3184c' }} />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-10">
                <div className="relative shrink-0">
                  <div className="size-28 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-background/40" style={{ background: course.color || '#f3184c' }}>
                    {course.imageUrl && <img src={course.imageUrl} className="w-full h-full object-cover" alt="" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary">CLASS IDENTITY: {course.id.slice(0, 8)}</span>
                    <div className={`size-2.5 rounded-full animate-pulse ${course.isActive ? 'bg-success shadow-[0_0_10px_#10b981]' : 'bg-text-muted'}`} />
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4">{course.name}</h1>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-40">Financial:</span>
                      <span className="lkr-amount font-black text-success text-xl">{Number(course.price).toLocaleString()}</span>
                    </div>
                    <div className="size-1 bg-white/10 rounded-full" />
                    <div className="flex items-center gap-2 text-text-muted">
                      <Users size={16} className="text-primary" />
                      <span className="text-sm font-black text-text-main">{enrolledS.length} <span className="text-[10px] uppercase font-black text-text-muted">Active Learners</span></span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 shrink-0 self-end md:self-center">
                  <button onClick={() => { setEditingCourse(course); setShowCourseForm(true); }} className="size-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-primary transition-all group/btn shadow-xl shadow-black/20"><Pencil size={20} className="group-hover:scale-110 transition-transform" /></button>
                  <button onClick={() => deleteCourse(course.id)} className="size-14 rounded-2xl bg-danger/10 border border-danger/10 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-all shadow-xl shadow-danger/10"><Trash2 size={20} /></button>
                </div>
              </div>
            </div>

            <div className="w-full">
              <div className="mb-10 premium-tabs">
                <input
                  type="radio"
                  name="class-tabs"
                  id="tab-1"
                  className="premium-tab-radio"
                  checked={classTab === 'meetings'}
                  onChange={() => setClassTab('meetings')}
                />
                <label className="premium-tab-label" htmlFor="tab-1">Live Classes</label>

                <input
                  type="radio"
                  name="class-tabs"
                  id="tab-2"
                  className="premium-tab-radio"
                  checked={classTab === 'details'}
                  onChange={() => setClassTab('details')}
                />
                <label className="premium-tab-label" htmlFor="tab-2">Class Details</label>

                <input
                  type="radio"
                  name="class-tabs"
                  id="tab-3"
                  className="premium-tab-radio"
                  checked={classTab === 'students'}
                  onChange={() => { setClassTab('students'); fetchStudents(); }}
                />
                <label className="premium-tab-label" htmlFor="tab-3">Enrolled Students</label>

                <div className="premium-tabs-indicator"></div>
              </div>

              <div className="w-full">
                <AnimatePresence mode="wait">
                  {classTab === 'details' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-10 rounded-[2.5rem] space-y-10 relative overflow-hidden">
                      <div className="absolute -left-20 -top-20 size-60 bg-primary/5 blur-[80px] rounded-full" />
                      <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="size-1 bg-primary rounded-full shadow-[0_0_10px_#f3184c]" />
                          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Mission Description</h3>
                        </div>
                        <p className="text-xl font-medium text-text-main/80 leading-relaxed tracking-tight max-w-3xl">{course.description}</p>
                      </div>

                      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8 pt-10 border-t border-white/5">
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] opacity-40">Protocol Status</p>
                          <div className="flex items-center gap-2">
                            <span className={`size-3 rounded-full ${course.isActive ? 'bg-success' : 'bg-text-muted'}`} />
                            <span className="text-sm font-black uppercase">{course.isActive ? 'Operational' : 'Idle'}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] opacity-40">Access Level</p>
                          <span className="text-sm font-black uppercase text-primary tracking-widest">Public Institutional</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {classTab === 'meetings' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                      <div className="flex items-center justify-between px-2">
                        <div>
                          <h3 className="font-black text-xl tracking-tighter">Live Classes</h3>
                          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40 mt-1">Total: {meetings.length} class(es)</p>
                        </div>
                        <button className="animated-button" onClick={() => { setEditingMeeting(null); setShowMeetingForm(true); }}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="arr-2" viewBox="0 0 24 24">
                            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                          </svg>
                          <span className="text">Schedule Class</span>
                          <span className="circle"></span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="arr-1" viewBox="0 0 24 24">
                            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                          </svg>
                        </button>
                      </div>

                      <div className="space-y-5">
                        {upcomingM.length === 0 ? (
                          <div className="glass rounded-[2rem] py-20 text-center border-dashed border-white/10">
                            <Video size={40} className="text-text-muted opacity-10 mx-auto mb-4" />
                            <p className="text-text-muted font-black text-xs uppercase tracking-[0.3em]">No Upcoming Logistics</p>
                          </div>
                        ) : upcomingM.map((m: any) => {
                          const dt = new Date(m.scheduledAt);
                          const isNow = now.getTime() > dt.getTime() - 15 * 60 * 1000 && now.getTime() < dt.getTime() + 24 * 60 * 60 * 1000;
                          return (
                            <div key={m.id} className="glass rounded-[2.5rem] p-7 flex items-center justify-between group hover:border-primary/30 transition-all shadow-xl shadow-black/10">
                              <div className="flex items-center gap-6">
                                <div className="size-16 rounded-[1.5rem] bg-white/[0.03] border border-white/5 flex items-center justify-center text-text-muted group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500 shadow-inner">
                                  <Video size={28} strokeWidth={1.5} />
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-3">
                                    <h4 className="font-black text-xl tracking-tight leading-none">{m.title}</h4>
                                    {isNow && <span className="bg-primary/20 text-primary text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border border-primary/20 animate-pulse tracking-widest">Active Point</span>}
                                  </div>
                                  <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] opacity-40 h-fit leading-none flex items-center gap-2">
                                    <Clock size={12} className="text-primary" /> {dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} @ {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
                                  <button onClick={() => { setEditingMeeting(m); setShowMeetingForm(true); }} className="size-10 rounded-xl flex items-center justify-center text-text-muted hover:bg-white/10 hover:text-white transition-all"><Pencil size={16} /></button>
                                  <button onClick={() => deleteMeeting(m.id)} className="size-10 rounded-xl flex items-center justify-center text-text-muted hover:bg-danger/20 hover:text-danger transition-all"><Trash2 size={16} /></button>
                                </div>
                                {isNow && m.zoomMeetingId && (
                                  <Button onClick={() => startZoomMeeting(m)} className="h-12 rounded-2xl px-6 bg-primary text-white shadow-lg shadow-primary/20">Launch Interface</Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {pastM.length > 0 && (
                        <div className="pt-6 border-t border-white/5">
                          <button onClick={() => setShowPastMeetings(!showPastMeetings)} className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:text-primary transition-all flex items-center gap-3 ml-2">
                            <div className="size-6 rounded-lg bg-white/5 flex items-center justify-center">{showPastMeetings ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</div>
                            Archived Logs ({pastM.length})
                          </button>
                          <AnimatePresence>
                            {showPastMeetings && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-6 space-y-3 overflow-hidden ml-4">
                                {pastM.map((m: any) => (
                                  <div key={m.id} className="glass border-white/5 p-4 rounded-2xl flex items-center justify-between text-[11px] font-black uppercase tracking-widest opacity-40 hover:opacity-80 transition-all group">
                                    <div className="flex items-center gap-3">
                                      <div className="size-2 bg-text-muted rounded-full group-hover:bg-primary transition-colors" />
                                      <span>{m.title}</span>
                                    </div>
                                    <span className="font-mono text-[9px]">{new Date(m.scheduledAt).toLocaleDateString()}</span>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {classTab === 'students' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="data-table-container rounded-2xl border border-white/5">
                        <table className="data-table">
                          <thead><tr><th>Student</th><th>Email</th><th>Status</th></tr></thead>
                          <tbody>
                            {enrolledS.length === 0 ? (
                              <tr><td colSpan={3} className="text-center py-24 opacity-30 italic font-black uppercase tracking-[0.3em] text-xs">No Students Enrolled</td></tr>
                            ) : enrolledS.map((s: any) => (
                              <tr key={s.id} className="group hover:bg-white/[0.02]">
                                <td>
                                  <div className="flex items-center gap-4 py-1">
                                    <div className="size-11 rounded-2xl bg-surface-2 border border-white/10 flex items-center justify-center shrink-0 relative group-hover:scale-105 transition-transform">
                                      <UserCheck size={20} className="text-primary opacity-60" />
                                    </div>
                                    <div>
                                      <p className="font-black text-sm tracking-tight">{s.users?.fullName || s.users?.username}</p>
                                      <p className="text-[9px] font-black uppercase text-text-muted opacity-40">Reg: {s.createdAt.slice(0, 10)}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-text-muted text-xs font-mono opacity-60 group-hover:opacity-100 transition-opacity uppercase">{s.users?.email}</td>
                                <td>
                                  <div className="flex items-center gap-2">
                                    <span className={`size-2.5 rounded-full ${s.users?.isActive ? 'bg-success shadow-[0_0_10px_#10b981]' : 'bg-danger shadow-[0_0_10px_#f43f5e]'}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{s.users?.isActive ? 'Verified' : 'Suspended'}</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {showMeetingForm && (
              <MeetingFormModal
                courseId={course.id} editing={editingMeeting}
                onClose={() => { setShowMeetingForm(false); setEditingMeeting(null); }}
                onSave={async () => { const r = await axios.get('/api/teacher/courses', authHeaders); setCourses(r.data); const updated = r.data.find((c: any) => c.id === course.id); if (updated) setSelectedCourse(updated); }}
                token={token}
              />
            )}
            {showCourseForm && (
              <CourseFormModal editing={editingCourse} onClose={() => { setShowCourseForm(false); setEditingCourse(null); }} onSave={fetchCourses} token={token} />
            )}
          </motion.div>
        </>
      );
    }

    return (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-2">
            <div>
              <h1 className="text-3xl font-black tracking-tighter">Institutional Classes</h1>
              <p className="text-text-muted text-sm font-black uppercase tracking-widest opacity-40 mt-1">Manage and update your classroom units</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative group flex-1 md:w-80">
                <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                <Input placeholder="Search your classes..." value={search} onChange={e => setSearch(e.target.value)} className="h-14 pl-16 rounded-2xl bg-white/[0.03]" />
              </div>
              <button className="animated-button" onClick={() => { setEditingCourse(null); setShowCourseForm(true); }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="arr-2" viewBox="0 0 24 24">
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                </svg>
                <span className="text">Create Class</span>
                <span className="circle"></span>
                <svg xmlns="http://www.w3.org/2000/svg" className="arr-1" viewBox="0 0 24 24">
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                </svg>
              </button>
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="glass rounded-[3rem] py-32 text-center border-dashed border-white/10">
              <div className="size-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <BookOpen size={40} className="text-text-muted opacity-20" />
              </div>
              <h3 className="text-xl font-black italic tracking-tighter mb-2 opacity-50 uppercase">No active classes found</h3>
              <p className="text-text-muted text-xs font-black uppercase tracking-[0.3em]">Create your first class to begin</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((c) => {
                const paid = c.enrollments?.filter((e: any) => e.status === 'PAID').length || 0;
                return (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={c.id} className="group glass rounded-[2.5rem] p-8 border-white/5 hover:border-primary/30 transition-all shadow-xl hover:shadow-primary/5">
                    <div className="flex items-start justify-between mb-6">
                      <div className="size-16 rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                        {c.imageUrl ? <img src={c.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-primary opacity-20 font-black text-2xl">?</div>}
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                        <div className="size-2 rounded-full animate-pulse" style={{ background: c.color || '#f3184c' }} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Active Class</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-black tracking-tighter mb-2 truncate group-hover:text-primary transition-all uppercase italic">{c.name}</h3>
                    <p className="text-text-muted text-[11px] line-clamp-2 leading-relaxed opacity-50 mb-8 font-medium h-9">{c.description}</p>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] opacity-40">Students</span>
                        <span className="text-sm font-black flex items-center gap-2">
                          <Users size={14} className="text-primary" /> {paid} Enrolled
                        </span>
                      </div>
                      <div className="flex gap-2.5">
                        <button onClick={() => { setSelectedCourse(c); setClassTab('details'); }} className="size-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/20 transition-all shadow-lg shadow-black/20"><ChevronRight size={20} /></button>
                        <button onClick={() => { setSelectedCourse(c); setClassTab('meetings'); }} className="size-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-lg shadow-black/20"><Calendar size={18} /></button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
        {showCourseForm && (
          <CourseFormModal editing={editingCourse} onClose={() => { setShowCourseForm(false); setEditingCourse(null); }} onSave={fetchCourses} token={token} />
        )}
      </>
    );
  }

  // ── Community / Students Section ──
  if (activeTab === 'students') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div className="px-2">
          <h1 className="text-3xl font-black tracking-tighter">My Students</h1>
          <p className="text-text-muted text-sm font-black uppercase tracking-widest opacity-40 mt-1">All enrolled students</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="md:col-span-3 relative group">
            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
            <Input placeholder="Search learner identities (name, email)..." value={search} onChange={e => setSearch(e.target.value)} className="h-16 pl-16 rounded-[2rem] bg-white/[0.03]" />
          </div>
          <div className="h-16 bg-white/[0.03] border border-white/10 rounded-[2rem] px-6 flex items-center relative overflow-hidden group">
            <select value={studentCourseFilter} onChange={e => setStudentCourseFilter(e.target.value)} className="w-full bg-transparent text-white outline-none font-black text-xs uppercase tracking-widest cursor-pointer relative z-10 appearance-none">
              <option value="" className="bg-surface-2">All Active Hubs</option>
              {courses.map(c => <option key={c.id} value={c.id} className="bg-surface-2">{c.name.toUpperCase()}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-6 text-text-muted group-hover:text-primary transition-all" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><div className="size-14 border-[3px] border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(243,24,76,0.3)]" /></div>
        ) : (
          <div className="data-table-container rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/20">
            <table className="data-table">
              <thead><tr><th>Learner</th><th className="hidden lg:table-cell">Identity Vector</th><th>Hub Affiliation</th><th>Protocol Status</th></tr></thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-24 font-black opacity-20 uppercase tracking-[0.4em] text-xs italic">Registry Empty</td></tr>
                ) : filteredStudents.map((s: any) => (
                  <tr key={s.id} className="group hover:bg-white/[0.015]">
                    <td>
                      <div className="flex items-center gap-4 py-2">
                        <Avatar className="size-11 rounded-2xl ring-2 ring-primary/20">
                          <AvatarImage src={s.users?.profilePhotoUrl} />
                          <AvatarFallback>{(s.users?.fullName || s.users?.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-black text-base tracking-tight">{s.users?.fullName || s.users?.username}</span>
                          <div className="lg:hidden text-[9px] font-mono text-text-muted opacity-40 uppercase">{s.users?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell text-text-muted text-xs font-mono font-black opacity-40 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">{s.users?.email}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-primary" />
                        <span className="text-[10px] font-black uppercase text-text-main opacity-80">{s.modules?.name}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${s.users?.isActive ? 'badge-success shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'badge-danger'}`}>{s.users?.isActive ? 'VERIFIED' : 'SUSPENDED'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    );
  }

  if (activeTab === 'settings') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto py-10">
        <div className="glass p-12 rounded-[3.5rem] border-white/5 text-center relative overflow-hidden bg-[#0f0405]/40">
          <div className="absolute -left-20 -bottom-20 size-80 bg-primary/5 blur-[100px] rounded-full" />
          <div className="relative z-10">
            <div className="size-24 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Avatar className="size-20 rounded-2xl">
                <AvatarImage src={user?.profilePhotoUrl} />
                <AvatarFallback className="bg-primary/20 text-primary font-black text-2xl uppercase">{(user?.fullName || 'T').charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <h2 className="text-3xl font-black mb-3 uppercase tracking-tighter text-white">Expert Portfolio Handle</h2>
            <p className="text-text-muted text-[11px] font-black uppercase tracking-[0.3em] opacity-40 mb-10">Verified Institutional Facilitator Identity</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:border-primary/30 transition-all group">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 opacity-40 group-hover:text-primary transition-colors">Expert Identity</p>
                <p className="font-black text-xl text-white tracking-widest uppercase truncate">{user?.username}</p>
              </div>
              <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:border-primary/30 transition-all group">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 opacity-40 group-hover:text-primary transition-colors">Protocol Access</p>
                <p className="font-black text-xl text-primary tracking-widest uppercase">Verified Teacher</p>
              </div>
            </div>
            <div className="mt-6 p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 text-left flex items-center justify-between group">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1 opacity-40">Registered Email</p>
                <p className="font-bold text-white/80">{user?.email}</p>
              </div>
              <Button variant="outline" className="rounded-xl border-white/10 h-10 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100">Request Change</Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-20 italic font-black uppercase tracking-[0.5em] text-xs">
      Protocol Idle: No Content Mapped
    </div>
  );
}
