import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  BookOpen, Users, DollarSign, Video, Plus, Pencil, Trash2,
  ChevronRight, ChevronDown, Search, X, Calendar, Clock, Play,
  RefreshCw, Eye, ArrowLeft, Camera, Verified, ShieldCheck, Zap,
  AlertCircle, GraduationCap, ArrowRight, UserCheck, PlusCircle, Share2,
  FileText, DownloadCloud, FolderOpen, UploadCloud
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

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; description?: string; color?: string }> = ({
  label, value, icon, description, color
}) => (
  <div className={`glass rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden group hover:border-primary/40 hover:translate-y-[-4px] transition-all duration-500 ${color}`}>
    <div className="absolute -right-4 -top-4 size-20 bg-primary/5 blur-2xl rounded-full group-hover:bg-primary/10 transition-all" />
    <div className="flex items-center justify-between">
      <div className="size-11 rounded-xl flex items-center justify-center shrink-0 shadow-lg bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 transition-transform">
        {icon}
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

// —— Uiverse Button Component ——
const UiverseButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  color?: string;
  href?: string;
}> = ({ children, onClick, className = "", color = "#f3184c", href }) => {
  const content = (
    <>
      <span className="button__icon-wrapper">
        <svg viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="button__icon-svg" width="10"><path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" fill="currentColor"></path></svg>
        <svg viewBox="0 0 14 15" fill="none" width="10" xmlns="http://www.w3.org/2000/svg" className="button__icon-svg button__icon-svg--copy"><path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" fill="currentColor"></path></svg>
      </span>
      {children}
    </>
  );
  if (href) return <a href={href} className={`uiverse-button ${className}`} style={{ '--clr': color } as any}>{content}</a>;
  return <button onClick={onClick} className={`uiverse-button ${className}`} style={{ '--clr': color } as any}>{content}</button>;
};

// —— Meeting Form Modal ——
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-black text-2xl tracking-tight uppercase italic">Schedule Meeting</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1">Initialize Live Session</p>
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
              {editing ? 'Update Session' : 'Deploy Session'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// —— Recording Form Modal ——
const RecordingFormModal: React.FC<{
  moduleId: string; editing?: any;
  onClose: () => void; onSave: () => void; token: string | null;
}> = ({ moduleId, editing, onClose, onSave, token }) => {
  const [title, setTitle] = useState(editing?.title || '');
  const [youtubeUrl, setYoutubeUrl] = useState(editing?.youtubeUrl || '');
  const [topicDate, setTopicDate] = useState(editing?.topicDate ? new Date(editing.topicDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!title.trim() || !youtubeUrl.trim()) { setError('Registry requires title and secure link.'); return; }
    setLoading(true);
    try {
      if (editing) {
        await axios.put(`/api/teacher/recordings/${editing.id}`, { moduleId, title, youtubeUrl, topicDate }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('/api/teacher/recordings', { moduleId, title, youtubeUrl, topicDate }, { headers: { Authorization: `Bearer ${token}` } });
      }
      onSave();
      onClose();
    } catch (err) { setError('Failed to synchronize recording asset.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-10 pointer-events-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="glass w-full max-w-lg rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 relative z-10 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">{editing ? 'Edit Archive' : 'New Recording'}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-40">Recording Registry Protocol</p>
          </div>
          <button onClick={onClose} className="size-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-danger/10 hover:text-danger transition-all"><X size={20} /></button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-text-muted ml-4">Recording Topic</Label>
            <Input placeholder="E.g. Advanced Vector Dynamics" value={title} onChange={e => setTitle(e.target.value)} className="h-14 px-6 rounded-[1.5rem] bg-white/5 border-white/5 focus:border-primary/50 transition-all font-bold" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-text-muted ml-4">YouTube Source / Embed</Label>
            <Input placeholder="Paste URL or IFrame..." value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} className="h-14 px-6 rounded-[1.5rem] bg-white/5 border-white/5 focus:border-primary/50 transition-all font-bold" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-text-muted ml-4">Topic Archive Date</Label>
            <Input type="date" value={topicDate} onChange={e => setTopicDate(e.target.value)} className="h-14 px-6 rounded-[1.5rem] bg-white/5 border-white/5" />
          </div>

          {error && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-[10px] font-black flex items-center gap-2 uppercase tracking-widest">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-white/5">
            <Button variant="outline" onClick={onClose} className="flex-1 h-14 rounded-2xl">Cancel</Button>
            <Button onClick={handleSave} disabled={loading} className="flex-[2] h-14 rounded-2xl shadow-xl shadow-primary/20">
              {loading ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Play size={18} className="mr-2" />}
              {editing ? 'Update Archive' : 'Save Recording'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CourseFormModal: React.FC<{
  editing?: any; onClose: () => void; onSave: () => void; token: string | null;
}> = ({ editing, onClose, onSave, token }) => {
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
  const [name, setName] = useState(editing?.name || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [price, setPrice] = useState(String(editing?.price || ''));
  const [imageUrl, setImageUrl] = useState(editing?.imageUrl || '');
  const [color, setColor] = useState(editing?.color || '#f3184c');
  const [isActive, setIsActive] = useState(editing ? editing.isActive : true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim() || !description.trim() || price === '') { setError('Please fill all required fields.'); return; }
    setLoading(true);
    try {
      const data = {
        name, description, price: Number(price), imageUrl: imageUrl || null,
        color, type: 'COURSE', isActive,
        startDate: new Date().toISOString(), startTime: '09:00', endTime: '10:00'
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
    <div className="fixed inset-0 z-[110] flex flex-col items-center justify-start p-4 bg-black/90 backdrop-blur-xl overflow-y-auto" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-2xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl border-white/10 shrink-0 my-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">{editing ? 'Edit Hub' : 'Construct Hub'}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-1">Institutional Unit Metadata</p>
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
              <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="h-14 pl-[4.5rem] rounded-2xl text-lg font-black text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-text-muted ml-4">Cover Asset (URL)</Label>
            <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="h-14 px-6 rounded-2xl" />
          </div>

          <div className="space-y-4 md:col-span-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-text-muted ml-4">Class Status</Label>
            <div className="flex gap-6 items-center bg-white/[0.03] border border-white/5 p-4 rounded-3xl">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" checked={isActive} onChange={() => setIsActive(true)} className="hidden" />
                <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'border-primary' : 'border-white/20'}`}>
                  {isActive && <div className="size-2.5 bg-primary rounded-full shadow-[0_0_8px_#f3184c]" />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-text-muted opacity-40'}`}>Active</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" checked={!isActive} onChange={() => setIsActive(false)} className="hidden" />
                <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${!isActive ? 'border-danger' : 'border-white/20'}`}>
                  {!isActive && <div className="size-2.5 bg-danger rounded-full shadow-[0_0_8px_#ef4444]" />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${!isActive ? 'text-white' : 'text-text-muted opacity-40'}`}>Inactive</span>
              </label>
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
            {editing ? 'Update Unit' : 'Commit Hub'}
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

  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [classTab, setClassTab] = useState<'meetings' | 'description' | 'students' | 'recordings' | 'materials'>('meetings');
  const [showPastMeetings, setShowPastMeetings] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  const [showRecordingForm, setShowRecordingForm] = useState(false);
  const [editingRecording, setEditingRecording] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [deleteCourseConfirm, setDeleteCourseConfirm] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab !== 'classes' && activeTab !== 'dashboard') {
      setSelectedCourse(null);
    }
  }, [activeTab]);

  const now = new Date();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const r = await axios.get('/api/teacher/courses', authHeaders);
      setCourses(r.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Data retrieval failed.');
    }
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

  const [materials, setMaterials] = useState<any[]>([]);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);

  const fetchMaterials = async (courseId: string) => {
    try {
      const res = await axios.get(`/api/courses/${courseId}/materials`, authHeaders);
      setMaterials(res.data);
    } catch(err) {
      console.error("Failed to fetch materials", err);
    }
  };

  useEffect(() => {
    if (selectedCourse && classTab === 'materials') {
      fetchMaterials(selectedCourse.id);
    }
  }, [selectedCourse, classTab]);

  const handleMaterialUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedCourse) return;
    setUploadingMaterial(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      await axios.post(`/api/courses/${selectedCourse.id}/materials`, formData, authHeaders);
      fetchMaterials(selectedCourse.id);
    } catch(err) {
      console.error(err);
      alert('Upload failed. Check application logs.');
    }
    setUploadingMaterial(false);
  };

  const handleMaterialDelete = async (id: string) => {
    if (!confirm('Delete this material permanently?')) return;
    try {
      await axios.delete(`/api/materials/${id}`, authHeaders);
      if (selectedCourse) fetchMaterials(selectedCourse.id);
    } catch(err) {
      console.error(err);
      alert('Delete failed.');
    }
  };

  const handleMaterialDownload = async (id: string) => {
    try {
      const res = await axios.get(`/api/materials/${id}/download`, authHeaders);
      window.open(res.data.url, '_blank');
    } catch (err) {
      console.error(err);
      alert('Failed to get download link. Please try again.');
    }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm('Permanently decommission this course?')) return;
    await axios.delete(`/api/courses/${id}`, authHeaders);
    setSelectedCourse(null);
    fetchCourses();
  };

  const deleteMeeting = async (id: string) => {
    if (!confirm('Remove this live session?')) return;
    await axios.delete(`/api/live-classes/${id}`, authHeaders);
    fetchCourses();
  };

  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const totalStudentsEnrolled = courses.reduce((s, c) => s + (c.enrollments?.filter((e: any) => e.status === 'PAID').length || 0), 0);
  const allRecordingsCount = courses.reduce((s, c) => s + (c.recordings?.length || 0), 0);
  const upcomingMeetingsCount = courses.flatMap(c => c.live_classes || []).filter(m => new Date(m.scheduledAt) > twentyFourHoursAgo).length;

  const filteredStudents = students.filter(s => {
    const name = s.users?.fullName || s.users?.username || '';
    return name.toLowerCase().includes(search.toLowerCase()) || s.users?.email?.toLowerCase().includes(search.toLowerCase());
  });

  const renderTabContent = () => {
    if (activeTab === 'dashboard') {
      const upcoming = courses.flatMap(c => (c.live_classes || []).map((m: any) => ({ ...m, courseName: c.name, courseColor: c.color })))
        .filter(m => new Date(m.scheduledAt) > twentyFourHoursAgo)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 5);

      return (
        <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
          <div className="relative overflow-hidden rounded-[3.5rem] bg-[#0f0405] border border-white/5 p-12 md:p-16 mb-12 shadow-2xl group">
            <div className="absolute -right-20 -top-20 size-[500px] bg-primary/20 blur-[150px] rounded-full group-hover:bg-primary/30 transition-all duration-1000" />
            <div className="absolute left-1/4 -bottom-40 size-[400px] bg-primary/10 blur-[120px] rounded-full group-hover:bg-primary/15 transition-all duration-1000" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="size-20 rounded-[2rem] bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-[0_0_50px_rgba(243,24,76,0.4)] rotate-[-4deg]">
                    <GraduationCap size={40} className="text-white" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] italic uppercase">
                    Ignite <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/40">Excellence,</span>
                  </h1>
                  <p className="text-3xl md:text-4xl font-medium tracking-tight text-white/40 lowercase leading-none">
                    @{user?.username}
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-3xl w-fit">
                   <div className="w-1 h-12 bg-primary rounded-full opacity-50" />
                   <p className="text-sm text-text-muted leading-relaxed max-w-sm italic opacity-60">
                     Your academic infrastructure is fully vectored. <br />
                     <span className="text-white font-bold not-italic">OPERATIONAL</span> status for the current cycle.
                   </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-6">
                <UiverseButton onClick={() => setActiveTab('classes')} color="#84142d">
                  SCHEDULE CLASS
                </UiverseButton>
                <UiverseButton onClick={() => { setEditingCourse(null); setShowCourseForm(true); }}>
                  CREATE CLASS
                </UiverseButton>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <StatCard icon={<BookOpen size={22} />} label="ACTIVE CLASSES" value={courses.length} description="Hubs" />
            <StatCard icon={<Users size={22} />} label="REGISTERED STUDENTS" value={totalStudentsEnrolled} description="Registry" />
            <StatCard icon={<DollarSign size={22} />} label="REVENUE STREAM" value="LKR 0.00" description="Financials" />
            <StatCard icon={<Video size={22} />} label="SCHEDULED SESSIONS" value={upcomingMeetingsCount} description="Timeline" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            <div className="glass rounded-[3rem] p-10 bg-surface-2/20 border-white/5 relative overflow-hidden group">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black italic uppercase tracking-tighter flex items-center gap-3">
                  <div className="size-4 bg-primary animate-pulse rounded-full" /> Upcoming Sessions
                </h3>
                <UiverseButton onClick={() => setActiveTab('classes')} color="#84142d" className="scale-75 origin-right">
                   SCHEDULE MEETING
                </UiverseButton>
              </div>
              {upcoming.length === 0 ? (
                <div className="py-20 text-center opacity-30 italic font-black uppercase tracking-widest text-[10px]">Registry Clear</div>
              ) : (
                <div className="space-y-4">
                  {upcoming.map((m: any) => (
                    <div key={m.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">{m.courseName}</p>
                      <h4 className="font-bold text-sm truncate">{m.title}</h4>
                      <p className="text-[10px] font-mono text-text-muted mt-2">{new Date(m.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      );
    }

    if (activeTab === 'classes') {
      if (selectedCourse) {
        const course = courses.find(c => c.id === selectedCourse.id) || selectedCourse;
        const meetings = (course.live_classes || []).sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const upcomingM = meetings.filter((m: any) => showPastMeetings || new Date(m.scheduledAt) > twentyFourHoursAgo);
        const enrolledS = students.filter(s => s.moduleId === course.id);

        return (
          <motion.div key={`course-${course.id}`} initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-3 text-text-muted hover:text-primary transition-all text-[10px] font-black uppercase tracking-[0.2em] group">
              <div className="size-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20"><ArrowLeft size={16} /></div>
              Return to Hub List
            </button>

            <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-surface-2 border border-white/5 p-6 md:p-10 group">
              <div className="absolute right-0 top-0 h-full w-2 shadow-[0_0_30px_rgba(243,24,76,0.5)]" style={{ background: course.color || '#f3184c' }} />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-10">
                <div className="size-28 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-background/40" style={{ background: course.color || '#f3184c' }}>
                  {course.imageUrl && <img src={course.imageUrl} className="w-full h-full object-cover" alt="" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary">COURSE ID: {course.id.slice(0, 8)}</span>
                    <div className={`size-2.5 rounded-full animate-pulse ${course.isActive ? 'bg-success shadow-[0_0_10px_#10b981]' : 'bg-text-muted'}`} />
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4 italic uppercase">{course.name}</h1>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-text-muted">
                      <Users size={16} className="text-primary" />
                      <span className="text-sm font-black text-text-main">{enrolledS.length} <span className="text-[10px] uppercase font-black text-text-muted">Active Learners</span></span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                   <button onClick={() => { setEditingCourse(course); setShowCourseForm(true); }} className="size-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-primary transition-all group/btn shadow-xl shadow-black/20"><Pencil size={20} className="group-hover:scale-110 transition-transform" /></button>
                   <button onClick={() => setDeleteCourseConfirm(course)} className="size-14 rounded-2xl bg-danger/10 border border-danger/10 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-all shadow-xl shadow-danger/10"><Trash2 size={20} /></button>
                </div>
              </div>
            </div>

            <div className="premium-tabs">
              {[
                { id: 'meetings', icon: Calendar, label: 'MEETINGS' },
                { id: 'recordings', icon: Video, label: 'ARCHIVES' },
                { id: 'students', icon: Users, label: 'REGISTRY' },
                { id: 'materials', icon: FolderOpen, label: 'MATERIALS' },
                { id: 'description', icon: BookOpen, label: 'DESCRIPTION' }
              ].map(t => (
                <button key={t.id} onClick={() => setClassTab(t.id as any)} className={classTab === t.id ? 'active' : ''}>
                  <t.icon size={16} className="tab-icon" /> <span>{t.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {classTab === 'meetings' && (
                <motion.div key="meetings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
                     <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase">Scheduled Meetings</h2>
                     <div className="flex flex-wrap items-center gap-4">
                       <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setShowPastMeetings(!showPastMeetings)}>
                         <span className="text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Archive Log</span>
                         <div className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full relative transition-colors border ${showPastMeetings ? 'bg-primary/20 border-primary/40' : 'bg-white/5 border-white/10'}`}>
                           <motion.div animate={{ x: showPastMeetings ? (window.innerWidth < 640 ? 20 : 26) : 4 }} className={`absolute top-1 size-3 sm:size-4 rounded-full shadow-lg ${showPastMeetings ? 'bg-primary shadow-primary/40' : 'bg-white/20'}`} />
                         </div>
                       </div>
                       <UiverseButton onClick={() => { setEditingMeeting(null); setShowMeetingForm(true); }}>
                         SCHEDULE MEETING
                       </UiverseButton>
                     </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {upcomingM.length === 0 ? (
                        <div className="col-span-full py-20 glass rounded-[3rem] border-white/5 border-dashed flex items-center justify-center opacity-30 italic font-black uppercase text-xs tracking-widest">No Active Missions</div>
                      ) : upcomingM.map((m: any) => (
                        <div key={m.id} className={`glass p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-white/5 bg-surface-2/20 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 group ${new Date(m.scheduledAt) < now ? 'opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 transition-all' : ''}`}>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-2">
                               <div className={`size-2 rounded-full ${new Date(m.scheduledAt) > now ? 'bg-primary animate-pulse' : 'bg-text-muted'}`} />
                               <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${new Date(m.scheduledAt) > now ? 'text-primary' : 'text-text-muted'}`}>{new Date(m.scheduledAt) > now ? 'Live Session' : 'Past Session'}</span>
                            </div>
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-4 truncate">{m.title}</h3>
                            <p className="font-mono text-xs opacity-40 uppercase">{new Date(m.scheduledAt).toLocaleString()}</p>
                          </div>
                          <div className="flex gap-4 shrink-0">
                            <UiverseButton onClick={() => startZoomMeeting(m)}>
                              START MEETING
                            </UiverseButton>
                            <button onClick={() => { setEditingMeeting(m); setShowMeetingForm(true); }} className="size-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all shadow-lg"><Pencil size={20} /></button>
                            <button onClick={() => deleteMeeting(m.id)} className="size-14 rounded-full bg-danger/10 border border-danger/10 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-all shadow-lg"><Trash2 size={20} /></button>
                          </div>
                        </div>
                      ))}
                   </div>
                </motion.div>
              )}

              {classTab === 'description' && (
                <motion.div key="description" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-12 glass rounded-[3rem] border-white/5 bg-surface-2/20">
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-3">
                    <BookOpen size={24} className="text-primary" /> Class Description
                  </h3>
                  <div className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 relative group">
                    <div className="absolute top-6 right-6 flex items-center gap-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-40">Detail Mode</span>
                      <div className="w-10 h-5 rounded-full bg-primary/20 p-1 flex items-center cursor-pointer">
                        <div className="size-3 bg-primary rounded-full shadow-[0_0_10px_rgba(243,24,76,0.8)]" />
                      </div>
                    </div>
                    <p className="text-lg text-text-muted leading-relaxed whitespace-pre-wrap italic font-medium">
                      {course.description || "No strategic overview provided for this hub."}
                    </p>
                  </div>
                </motion.div>
              )}

              {classTab === 'recordings' && (
                <motion.div key="recordings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
                    <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase">ARCHIVES</h2>
                    <Button onClick={() => { setEditingRecording(null); setShowRecordingForm(true); }} className="rounded-2xl h-12 px-6 uppercase tracking-widest text-[10px] font-black shrink-0 w-fit">UPLOAD RECORDING</Button>
                  </div>
                  <div className="data-table-container rounded-[2.5rem] border border-white/5">
                    <table className="data-table">
                      <thead>
                        <tr><th>Archive Index</th><th>Storage Node</th><th>Timestamp</th><th className="text-right">Registry Operations</th></tr>
                      </thead>
                      <tbody>
                        {(course.recordings || []).length === 0 ? (
                           <tr><td colSpan={4} className="text-center py-24 opacity-30 font-black uppercase tracking-widest text-xs italic">Archive Registry Empty</td></tr>
                        ) : (course.recordings || []).map((v: any) => (
                           <tr key={v.id} className="group hover:bg-white/[0.02]">
                             <td className="font-black uppercase italic tracking-tighter text-base py-6 text-white">{v.title}</td>
                             <td><span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 tracking-widest uppercase italic">Verified Source</span></td>
                             <td className="text-text-muted font-mono text-[11px] opacity-40 group-hover:opacity-100 transition-all uppercase">{new Date(v.topicDate).toLocaleDateString()}</td>
                             <td>
                               <div className="flex items-center justify-end gap-3">
                                 <button onClick={() => setSelectedVideo(v)} className="size-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-primary transition-all group/play shadow-xl"><Play size={18} className="fill-white group-hover/play:fill-white" /></button>
                                 <button onClick={() => { setEditingRecording(v); setShowRecordingForm(true); }} className="size-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"><Pencil size={18} /></button>
                                 <button onClick={() => setDeleteConfirm(v)} className="size-12 rounded-2xl bg-danger/10 border border-danger/10 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-all"><Trash2 size={18} /></button>
                               </div>
                             </td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {classTab === 'students' && (
                <motion.div key="students" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                   <div className="data-table-container rounded-[2.5rem] border border-white/5">
                    <table className="data-table">
                      <thead><tr><th>Learner</th><th>Identity Vector</th><th>Status</th></tr></thead>
                      <tbody>
                        {enrolledS.length === 0 ? (
                           <tr><td colSpan={3} className="text-center py-24 opacity-30 font-black uppercase text-xs italic">Registry Empty</td></tr>
                        ) : enrolledS.map((s: any) => (
                           <tr key={s.id}>
                              <td><div className="flex items-center gap-4 py-2"><div className="size-10 rounded-2xl bg-surface-2 flex items-center justify-center border border-white/10 text-primary uppercase font-black">{(s.users?.fullName || 'U').charAt(0)}</div><span className="font-black text-sm uppercase">{s.users?.fullName || s.users?.username}</span></div></td>
                              <td className="font-mono text-xs opacity-60 uppercase">{s.users?.email}</td>
                              <td><span className={`badge ${s.users?.isActive ? 'badge-success' : 'badge-danger'}`}>{s.users?.isActive ? 'VERIFIED' : 'SUSPENDED'}</span></td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                   </div>
                </motion.div>
              )}
              {classTab === 'materials' && (
                <motion.div key="materials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                   <div className="flex justify-between items-center px-4">
                     <h2 className="text-2xl font-black italic tracking-tighter uppercase">Resource Materials</h2>
                     <div>
                       <input type="file" id="material-upload" className="hidden" onChange={handleMaterialUpload} />
                       <Button onClick={() => document.getElementById('material-upload')?.click()} disabled={uploadingMaterial} className="rounded-2xl h-12 px-8 uppercase tracking-widest text-[10px] font-black">
                         {uploadingMaterial ? <RefreshCw className="animate-spin size-4 mr-2" /> : <UploadCloud className="size-4 mr-2" />}
                         {uploadingMaterial ? 'UPLOADING...' : 'UPLOAD MATERIAL'}
                       </Button>
                     </div>
                   </div>
                   <div className="data-table-container rounded-[2.5rem] border border-white/5">
                    <table className="data-table">
                      <thead><tr><th>Material Vector</th><th>Size</th><th>Timestamp</th><th className="text-right">Actions</th></tr></thead>
                      <tbody>
                        {materials.length === 0 ? (
                           <tr><td colSpan={4} className="text-center py-24 opacity-30 font-black uppercase text-xs italic">No materials found</td></tr>
                        ) : materials.map((m: any) => (
                           <tr key={m.id} className="group hover:bg-white/[0.02]">
                              <td><div className="flex items-center gap-4 py-2"><div className="size-10 rounded-xl bg-surface-2 flex items-center justify-center border border-white/10 text-primary"><FileText size={18} /></div><span className="font-black text-sm">{m.name}</span></div></td>
                              <td className="font-mono text-[10px] opacity-60 uppercase">{m.size ? (m.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}</td>
                              <td className="font-mono text-[10px] opacity-60 uppercase">{new Date(m.createdAt).toLocaleDateString()}</td>
                              <td>
                                <div className="flex items-center justify-end gap-3">
                                  <button onClick={() => handleMaterialDownload(m.id)} className="size-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-primary transition-all group/dl shadow-xl"><DownloadCloud size={18} className="fill-white/0 group-hover/dl:fill-white/20" /></button>
                                  <button onClick={() => handleMaterialDelete(m.id)} className="size-12 rounded-2xl bg-danger/10 border border-danger/10 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-all"><Trash2 size={18} /></button>
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
            
            {showMeetingForm && <MeetingFormModal courseId={course.id} editing={editingMeeting} onClose={() => { setShowMeetingForm(false); setEditingMeeting(null); }} onSave={fetchCourses} token={token} />}
            {showCourseForm && <CourseFormModal editing={editingCourse} onClose={() => { setShowCourseForm(false); setEditingCourse(null); }} onSave={fetchCourses} token={token} />}
            {showRecordingForm && <RecordingFormModal moduleId={course.id} editing={editingRecording} onClose={() => { setShowRecordingForm(false); setEditingRecording(null); }} onSave={fetchCourses} token={token} />}
          </motion.div>
        );
      }


      return (
        <motion.div key="hub-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Class Management</h1>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
               <Input placeholder="Search Classes..." value={search} onChange={e => setSearch(e.target.value)} className="h-14 w-full md:w-80 rounded-full bg-white/5 px-8" />
               <UiverseButton onClick={() => { setEditingCourse(null); setShowCourseForm(true); }}>
                 CREATE NEW CLASS
               </UiverseButton>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(c => (
              <div key={c.id} className="glass rounded-[2.5rem] p-8 border-white/5 group hover:border-primary/40 transition-all flex flex-col">
                <div className="size-16 rounded-2xl bg-white/5 overflow-hidden mb-6 border border-white/5">
                  {c.imageUrl && <img src={c.imageUrl} className="w-full h-full object-cover" />}
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">{c.name}</h3>
                <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="text-[10px] uppercase font-black text-text-muted opacity-40">Population</span>
                     <span className="font-bold text-sm">{c.enrollments?.length || 0} Registered</span>
                   </div>
                   <button onClick={() => { setSelectedCourse(c); setClassTab('meetings'); }} className="h-10 px-4 sm:px-6 rounded-2xl bg-danger hover:bg-[#ff2056] text-white transition-all shadow-xl shadow-danger/20 flex flex-col justify-center items-center w-auto sm:w-auto overflow-hidden">
                      <div className="text-[10px] font-black uppercase whitespace-nowrap leading-none mt-0.5">ENTER CLASS</div>
                   </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      );
    }

    if (activeTab === 'students') {
      return (
        <motion.div key="students-registry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
           <h1 className="text-3xl font-black italic uppercase tracking-tighter px-2">Learner Registry</h1>
           <div className="data-table-container rounded-[2.5rem] border border-white/5 overflow-x-auto w-full">
             <table className="data-table min-w-[600px] w-full text-left">
               <thead><tr><th>Identity</th><th>Vector (Email)</th><th>Hub Status</th></tr></thead>
               <tbody>
                  {filteredStudents.map((s: any) => (
                    <tr key={s.id}>
                       <td><div className="flex items-center gap-4 py-2"><Avatar className="rounded-2xl border border-white/10"><AvatarImage src={s.users?.profilePhotoUrl} /><AvatarFallback>{(s.users?.fullName || 'U').charAt(0).toUpperCase()}</AvatarFallback></Avatar><span className="font-black uppercase">{s.users?.fullName || s.users?.username}</span></div></td>
                       <td className="font-mono text-xs opacity-60 uppercase">{s.users?.email}</td>
                       <td><span className="text-[10px] font-black italic uppercase tracking-widest text-primary">{s.modules?.name}</span></td>
                    </tr>
                  ))}
               </tbody>
             </table>
           </div>
        </motion.div>
      );
    }

    if (activeTab === 'settings') {
      return (
        <motion.div key="settings-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto py-10">
          <div className="glass p-12 rounded-[3.5rem] text-center border-white/5 relative overflow-hidden">
             <div className="size-24 rounded-[2rem] bg-primary/10 flex items-center justify-center mx-auto mb-8 border border-primary/20"><Avatar className="size-20 rounded-2xl"><AvatarImage src={user?.profilePhotoUrl} /><AvatarFallback className="text-2xl">{(user?.fullName || 'T').charAt(0)}</AvatarFallback></Avatar></div>
             <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-10">Expert Environment</h2>
             <div className="grid grid-cols-2 gap-6 text-left">
                <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5"><p className="text-[10px] font-black uppercase text-text-muted opacity-40 mb-2">Registry Name</p><p className="text-xl font-black uppercase italic tracking-tighter">{user?.fullName}</p></div>
                <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5"><p className="text-[10px] font-black uppercase text-text-muted opacity-40 mb-2">Protocol Status</p><p className="text-xl font-black text-primary italic uppercase">Verified Teacher</p></div>
             </div>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {renderTabContent()}
      </AnimatePresence>

      {showCourseForm && <CourseFormModal editing={editingCourse} onClose={() => { setShowCourseForm(false); setEditingCourse(null); }} onSave={fetchCourses} token={token} />}

      {selectedVideo && <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
      
      {deleteCourseConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
          <div className="glass max-w-md w-full p-10 rounded-[3rem] border-white/10 text-center text-white">
            <div className="size-20 rounded-3xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-8 text-danger shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <Trash2 size={40} />
            </div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4 text-white">Decommission Hub?</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted opacity-40 leading-relaxed max-w-xs mx-auto mb-10">
              Decommissioning "{deleteCourseConfirm.name}" will permanently wipe all materials, recordings, and enrollments. Enter confirm?
            </p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteCourseConfirm(null)} className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 font-black uppercase tracking-widest text-[10px]">Abort</button>
              <button 
                onClick={async () => {
                  setLoading(true);
                  try {
                    await axios.delete(`/api/courses/${deleteCourseConfirm.id}`, authHeaders);
                    const r = await axios.get('/api/teacher/courses', authHeaders);
                    setCourses(r.data);
                    setSelectedCourse(null);
                    setDeleteCourseConfirm(null);
                  } catch (err: any) {
                    setError('Purge failed! Check constraints.');
                  } finally {
                    setLoading(false);
                  }
                }} 
                disabled={loading}
                className="flex-[2] h-14 rounded-2xl bg-[#f3184c] shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px] text-white"
              >
                {loading ? 'Processing...' : 'Confirm Purge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
          <div className="glass max-w-md w-full p-10 rounded-[3rem] border-white/10 text-center text-white">
            <div className="size-20 rounded-3xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-8 text-danger shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <Trash2 size={40} />
            </div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4 text-white">Purge Archive?</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted opacity-40 leading-relaxed max-w-xs mx-auto mb-10">
              Decommissioning "{deleteConfirm.title}" will permanently remove this asset from the registry. Execute protocol?
            </p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 font-black uppercase tracking-widest text-[10px]">Abort</button>
              <button 
                onClick={async () => {
                  setLoading(true);
                  try {
                    await axios.delete(`/api/teacher/recordings/${deleteConfirm.id}`, authHeaders);
                    const r = await axios.get('/api/teacher/courses', authHeaders);
                    setCourses(r.data);
                    if (selectedCourse) {
                      const updated = r.data.find((c: any) => c.id === selectedCourse.id);
                      if (updated) setSelectedCourse(updated);
                    }
                    setDeleteConfirm(null);
                  } catch (err: any) {
                    setError('Delete operation failed.');
                  } finally {
                    setLoading(false);
                  }
                }} 
                disabled={loading}
                className="flex-[2] h-14 rounded-2xl bg-[#f3184c] shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px] text-white"
              >
                {loading ? 'Processing...' : 'Confirm Purge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-10 left-10 z-[200] max-w-md">
          <div className="bg-danger/20 border border-danger/30 p-6 rounded-[2rem] backdrop-blur-xl flex items-center gap-4 text-danger shadow-3xl">
            <AlertCircle size={24} className="shrink-0" />
            <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoPlayerModal({ video, onClose }: { video: any, onClose: () => void }) {
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      let cleanUrl = url.trim();
      if (cleanUrl.toLowerCase().includes('<iframe')) {
        const srcMatch = cleanUrl.match(/src\s*=\s*["']([^"']+)["']/i);
        if (srcMatch) cleanUrl = srcMatch[1];
      }
      let id = '';
      const regExp = /^.*(?:youtu\.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
      const match = cleanUrl.match(regExp);
      if (match && match[1].length === 11) id = match[1];
      else {
        try {
          const urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
          id = urlObj.searchParams.get('v') || cleanUrl.split('/').pop()?.split('?')[0] || '';
        } catch { id = cleanUrl.split('/').pop()?.split('?')[0] || ''; }
      }
      if (!id || id.length !== 11) return cleanUrl;
      return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&autoplay=1&enablejsapi=1`;
    } catch (e) { return url; }
  };

  const videoUrl = video.youtubeUrl || video.url || '';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-3xl overflow-y-auto">
      <div className="max-w-6xl w-full flex flex-col gap-8 my-auto text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5 text-left">
            <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(243,24,76,0.3)]">
              <Play size={20} className="fill-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Video Recording</h3>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mt-2">Class Media Asset</p>
            </div>
          </div>
          <button onClick={onClose} className="size-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all group shadow-xl">
             <X size={20} />
          </button>
        </div>

        <div className="aspect-video w-full glass rounded-[3rem] overflow-hidden border-white/10 shadow-3xl relative group bg-black">
          <iframe 
            src={getEmbedUrl(videoUrl)} 
            className="w-full h-full" 
            {...({ credentialless: "true" } as any)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-4 text-left">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Verified size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Asset Subject</p>
              <p className="text-sm font-black uppercase tracking-tight italic">{video.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-full md:w-auto px-10 h-14 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(243,24,76,0.3)] hover:scale-105 transition-all">Terminate Stream</button>
        </div>
      </div>
    </div>
  );
}
