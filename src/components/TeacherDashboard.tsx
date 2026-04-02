import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Video, 
  BookOpen, 
  Plus, 
  MoreVertical, 
  Clock, 
  Calendar,
  ArrowRight,
  Settings,
  Search,
  X,
  Image as ImageIcon,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import axios from "axios";

interface TeacherDashboardProps {
  user: any;
  dashboardData: any;
  startZoomMeeting: (meeting: any) => void;
  activeTab?: string;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, dashboardData, startZoomMeeting, activeTab = 'dashboard' }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [newCourse, setNewCourse] = useState({ 
    name: '', 
    description: '', 
    imageUrl: '',
    color: '#f3184c',
    type: 'COURSE', // COURSE or CLASS
    price: '0',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00'
  });
  const [newClass, setNewClass] = useState({
    title: '',
    moduleId: '',
    scheduledAtDate: new Date().toISOString().split('T')[0],
    scheduledAtTime: '10:00'
  });
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [showDeleteClassConfirm, setShowDeleteClassConfirm] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleCreateOrUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const token = localStorage.getItem("token");
      if (editingCourseId) {
        await axios.put(`/api/courses/${editingCourseId}`, newCourse, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStatusMessage({ type: 'success', text: 'Course updated successfully!' });
      } else {
        await axios.post("/api/courses", newCourse, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStatusMessage({ type: 'success', text: 'Course created successfully!' });
      }
      setTimeout(() => {
        setShowCreateModal(false);
        setEditingCourseId(null);
        setNewCourse({ 
          name: '', 
          description: '', 
          imageUrl: '',
          color: '#f3184c',
          type: 'COURSE',
          price: '0',
          startDate: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '10:00'
        });
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Failed to save course", err);
      setStatusMessage({ type: 'error', text: 'Failed to save course. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const token = localStorage.getItem("token");
      const scheduledAt = new Date(`${newClass.scheduledAtDate}T${newClass.scheduledAtTime}`).toISOString();
      
      if (editingClassId) {
        await axios.put(`/api/live-classes/${editingClassId}`, {
          title: newClass.title,
          moduleId: newClass.moduleId,
          scheduledAt
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStatusMessage({ type: 'success', text: 'Live class updated successfully!' });
      } else {
        await axios.post("/api/live-classes", {
          title: newClass.title,
          moduleId: newClass.moduleId,
          scheduledAt
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStatusMessage({ type: 'success', text: 'Live class scheduled successfully!' });
      }
      
      setTimeout(() => {
        setShowScheduleModal(false);
        setEditingClassId(null);
        setNewClass({
          title: '',
          moduleId: '',
          scheduledAtDate: new Date().toISOString().split('T')[0],
          scheduledAtTime: '10:00'
        });
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Failed to schedule class", err);
      setStatusMessage({ type: 'error', text: 'Failed to schedule class. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.reload();
    } catch (err) {
      console.error("Failed to delete course", err);
    }
  };

  const openEditModal = (course: any) => {
    setEditingCourseId(course.id);
    setNewCourse({
      name: course.name,
      description: course.description,
      imageUrl: course.imageUrl || '',
      color: course.color || '#f3184c',
      type: course.type || 'COURSE',
      price: course.price.toString(),
      startDate: new Date(course.startDate).toISOString().split('T')[0],
      startTime: course.startTime,
      endTime: course.endTime
    });
    setShowCreateModal(true);
  };

  const handleDeleteClass = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/live-classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.reload();
    } catch (err) {
      console.error("Failed to delete class", err);
    }
  };

  const openEditClassModal = (cls: any) => {
    setEditingClassId(cls.id);
    const dateObj = new Date(cls.scheduledAt);
    setNewClass({
      title: cls.title,
      moduleId: cls.moduleId,
      scheduledAtDate: dateObj.toISOString().split('T')[0],
      scheduledAtTime: dateObj.toTimeString().slice(0, 5)
    });
    setShowScheduleModal(true);
  };

  return (
    <>
      {/* Premium Dashboard Background */}
      <div className="dashboard-bg">
        <div className="dashboard-bg-shape top-[-10%] left-[-10%] size-[500px]" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1, filter: 'blur(120px)', borderRadius: '9999px' }} />
        <div className="dashboard-bg-shape bottom-[-10%] right-[-10%] size-[400px]" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.1, animationDelay: '2s', filter: 'blur(120px)', borderRadius: '9999px' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 grid grid-cols-12 gap-10 p-6 lg:p-14 w-full max-w-[1800px] mx-auto min-h-screen"
      >
      {/* Left Column */}
      {(activeTab === 'dashboard' || activeTab === 'courses') && (
        <div className={cn("space-y-8", activeTab === 'courses' ? "col-span-12" : "col-span-12 lg:col-span-8")}>
          {/* Teacher Profile Card */}
          {activeTab === 'dashboard' && (
            <div className="bento-card !rounded-[48px] p-12 relative overflow-hidden group shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]">
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 relative z-10">
                <div className="flex items-center gap-12">
                  <div className="relative">
                    <div className="size-32 rounded-[32px] bg-gradient-to-tr from-primary to-accent p-1 shadow-2xl transition-all duration-700" style={{ borderRadius: '32px' }}>
                      <div className="w-full h-full rounded-[28px] overflow-hidden bg-surface relative" style={{ borderRadius: '28px' }}>
                        <img 
                          src={user?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'T')}&background=ff1e56&color=fff&bold=true`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 size-8 bg-emerald-500 rounded-full border-4 border-black flex items-center justify-center shadow-xl">
                      <div className="size-2 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                  
                  <div>
                    <h1 className="text-6xl font-black text-white tracking-tighter mb-4 font-heading leading-none">
                      <span className="opacity-30 uppercase">Hey</span> {user?.name?.split(' ')[0] || 'Teacher'}!
                    </h1>
                    <div className="flex items-center gap-4">
                      <p className="text-text-muted text-xl font-medium tracking-tight">
                        You have <span className="text-white font-black underline decoration-primary decoration-[6px] underline-offset-8 decoration-primary/50">{dashboardData?.upcomingClasses?.length || 0} classes</span> scheduled.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full xl:w-auto">
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex-1 xl:flex-none h-16 px-10 rounded-2xl bg-primary text-white font-black text-[10px] tracking-widest uppercase shadow-lg hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 group/btn border border-white/10"
                    style={{ backgroundColor: 'var(--color-primary)', borderRadius: '24px' }}
                  >
                    <Plus size={18} strokeWidth={3} className="group-hover/btn:rotate-90 transition-transform duration-500" />
                    CREATE
                  </button>
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-all text-white/50 hover:text-white"
                    style={{ borderRadius: '24px' }}
                  >
                    <MoreVertical size={24} />
                  </button>
                </div>
              </div>
              {/* Internal Accent */}
              <div className="absolute top-0 right-0 size-64 bg-white/[0.03] rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            </div>
          )}

          {/* Quick Stats Blocks */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: "Active Courses", value: dashboardData?.stats?.activeCourses || 0, color: "text-white", bg: "bg-primary shadow-[0_30px_60px_-15px_rgba(255,30,86,0.4)]", icon: BookOpen, accent: "primary" },
                { label: "Total Students", value: dashboardData?.stats?.totalStudents || 0, color: "text-white", bg: "glass-dark border-white/10", icon: Users, accent: "accent" },
                { label: "Live Hours", value: "0", color: "text-white", bg: "glass-dark border-white/10", icon: Video, accent: "info" }
              ].map((stat, i) => (
                <div key={i} className={cn("rounded-[48px] p-12 group/stat transition-all duration-500 overflow-hidden relative shadow-lg hover:shadow-2xl hover:-translate-y-2", stat.bg)}>
                  <div className="relative z-10">
                    <div className={cn("size-24 rounded-[32px] flex items-center justify-center mb-10 transition-all duration-500 group-hover/stat:rotate-12 group-hover/stat:scale-110", i === 0 ? "bg-white/20 text-white" : "bg-white/5 text-primary")}>
                      <stat.icon size={36} strokeWidth={2.5} />
                    </div>
                    <p className="text-[12px] font-black uppercase tracking-[0.3em] text-white/40 mb-4 font-heading">
                      {stat.label}
                    </p>
                    <p className="text-7xl font-black tracking-tighter leading-none text-white font-heading">{stat.value}</p>
                  </div>
                  <div className="absolute -right-8 -bottom-8 size-40 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
                </div>
              ))}
            </div>
          )}

          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 size-64 bg-primary/5 rounded-full blur-[100px] -ml-32 -mb-32" />

        {/* Manage Courses */}
        <div className="bento-card relative overflow-hidden group/courses !p-12 mb-10">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h2 className="text-4xl font-black tracking-tighter font-heading text-white uppercase">Active <span className="text-emerald-500">Modules</span></h2>
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Your curriculum overview</p>
            </div>
            <button className="h-12 px-8 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-all shadow-xl">
              VIEW ALL
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            {dashboardData?.teacherModules?.length > 0 ? (
              dashboardData.teacherModules.map((course: any, idx: number) => (
                <motion.div 
                  key={course.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-sidebar rounded-[44px] p-8 group hover:bg-surface-hover hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] transition-all duration-700 border border-white/5 relative overflow-hidden"
                >
                  <div className="aspect-[16/10] rounded-[36px] mb-8 overflow-hidden relative z-10 shadow-2xl border border-white/10">
                    {course.imageUrl ? (
                      <img 
                        src={course.imageUrl} 
                        alt={course.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-white"
                        style={{ backgroundColor: course.color || '#f3184c' }}
                      >
                        <span className="text-5xl font-black tracking-tighter opacity-15 uppercase font-heading">{course.name.substring(0, 2)}</span>
                      </div>
                    )}
                    {/* Overlay Labels */}
                    <div className="absolute top-6 left-6 flex gap-3">
                      <div className="bg-black/60 backdrop-blur-xl px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white border border-white/10 shadow-2xl">
                        {course.type || 'COURSE'}
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-heading font-black text-2xl group-hover:text-primary transition-colors tracking-tight leading-tight flex-1 pr-6 uppercase">{course.name}</h3>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openEditModal(course); }}
                        className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-all shadow-xl"
                      >
                        <Settings size={20} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-white/5 flex items-center justify-center">
                          <Users size={14} className="text-primary" />
                        </div>
                        <span className="text-xs font-black text-text-muted uppercase tracking-widest leading-none">{course.enrollments?.length || 0} Students</span>
                      </div>
                      <div className="text-2xl font-black text-white font-heading tracking-tighter leading-none">${course.price}</div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 py-20 text-center bg-background rounded-[32px] border-2 border-dashed border-white/5">
                <div className="size-20 rounded-3xl bg-surface shadow-sm flex items-center justify-center mx-auto mb-6">
                  <BookOpen size={32} className="text-white/10" />
                </div>
                <p className="text-text-muted font-bold">No courses created yet.</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 text-primary font-black text-xs uppercase tracking-widest hover:underline"
                >
                  Create your first course
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Right Column */}
      {(activeTab === 'dashboard' || activeTab === 'live') && (
      <div className={cn("space-y-8", activeTab === 'live' ? "col-span-12" : "col-span-12 lg:col-span-4")}>
        {/* Live Sessions Card */}
        <div className="bg-surface rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 border-white/20 relative overflow-hidden hover:translate-y-[-4px] hover:translate-x-[-4px] transition-all duration-500">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h2 className="text-4xl font-black tracking-tighter font-heading text-white uppercase">Live <span className="text-primary italic">Rooms</span></h2>
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-all shadow-xl"
            >
              SCHEDULE
            </button>
          </div>

          <div className="space-y-6 relative z-10">
            {dashboardData?.upcomingClasses?.length > 0 ? (
              dashboardData.upcomingClasses.map((cls: any) => (
                <div key={cls.id} className="flex items-center gap-6 p-6 rounded-[32px] bg-white/[0.03] border border-white/5 hover:bg-white/10 hover:border-primary/50 transition-all duration-500 group/session shadow-lg">
                  <div className="size-16 rounded-[24px] bg-sidebar flex flex-col items-center justify-center text-white shrink-0 group-hover/session:rotate-6 transition-transform shadow-2xl border border-white/10">
                    <span className="text-[10px] font-black uppercase text-white/40 font-heading tracking-tighter">{new Date(cls.scheduledAt).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-2xl font-black leading-none font-heading">{new Date(cls.scheduledAt).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-black text-xl text-white group-hover/session:text-primary transition-colors tracking-tight line-clamp-1 uppercase uppercase">{cls.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                       <div className="flex items-center gap-2">
                         <Clock size={12} className="text-text-muted" />
                         <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{new Date(cls.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                       <div className="size-1 bg-white/10 rounded-full" />
                       <span className="text-[10px] font-black text-primary uppercase tracking-widest">{cls.modules?.name}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => startZoomMeeting(cls)}
                    className="size-12 rounded-2xl bg-white text-background flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-2xl transform active:scale-95"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-20 text-center rounded-[32px] bg-white/[0.02] border-2 border-dashed border-white/10">
                <Video size={48} className="text-white/5 mx-auto mb-6" />
                <p className="text-text-muted text-sm font-black uppercase tracking-widest">No active sessions</p>
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 size-48 bg-primary/5 rounded-full blur-[100px] -mr-24 -mt-24 pointer-events-none" />
        </div>

        {/* Performance Card */}
        {activeTab === 'dashboard' && (
          <div className="bento-card relative overflow-hidden group/perf !p-12 mb-10">
            <h2 className="text-4xl font-black tracking-tighter mb-12 font-heading text-white uppercase">Perfor<span className="text-amber-500">mance</span></h2>
            <div className="space-y-10 relative z-10">
              {[
                { label: "Course Completion", value: 85, color: "bg-primary shadow-[0_0_20px_rgba(255,30,86,0.3)]" },
                { label: "Student Satisfaction", value: 94, color: "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" },
                { label: "Active Engagement", value: 78, color: "bg-accent shadow-[0_0_20px_rgba(139,92,246,0.3)]" }
              ].map((stat, i) => (
                <div key={i} className="space-y-4 group/item">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] group-hover/item:text-white transition-colors">{stat.label}</span>
                    <span className="text-lg font-black text-white font-heading">{stat.value}%</span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.value}%` }}
                      transition={{ duration: 1.5, delay: i * 0.2, ease: "circOut" }}
                      className={cn("h-full rounded-full transition-all duration-1000", stat.color)}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Growth Indicator */}
            <div className="mt-12 p-8 bg-white/[0.03] rounded-[36px] border border-white/5 relative z-10 overflow-hidden group/growth">
              <div className="flex items-center gap-6 relative z-10">
                <div className="size-16 rounded-[24px] bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner group-hover/growth:scale-110 transition-transform">
                  <TrendingUp size={32} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Monthly Momentum</p>
                  <p className="text-3xl font-black text-white font-heading">+12.4% <span className="text-xs font-bold text-emerald-500 ml-2">INCREASE</span></p>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 size-32 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
            </div>
            <div className="absolute -left-12 -bottom-12 size-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
          </div>
        )}

        {/* Help Card */}
        {activeTab === 'dashboard' && (
        <div className="bg-sidebar rounded-[40px] p-10 text-white relative overflow-hidden group shadow-2xl shadow-black/20">
          <div className="relative z-10">
            <div className="size-16 rounded-2xl bg-surface/10 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
              <MessageSquare size={28} className="text-primary" />
            </div>
            <h3 className="text-3xl font-black tracking-tighter mb-4 leading-tight">Need help with your classes?</h3>
            <p className="text-base font-bold text-white/40 mb-10 leading-relaxed">Access our instructor resources, community forums, and 24/7 support center.</p>
            <button className="w-full bg-surface text-[#1e1e1e] py-5 rounded-[24px] font-black text-sm hover:bg-primary hover:text-white transition-all shadow-xl">
              Resources Center
            </button>
          </div>
          {/* Decorative shapes */}
          <div className="absolute -right-10 -top-10 size-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all" />
          <div className="absolute -left-20 -bottom-20 size-64 bg-surface/5 rounded-full blur-[80px]" />
        </div>
        )}
      </div>
      )}

      {/* Create Course Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-surface w-full max-w-2xl rounded-[48px] p-12 relative z-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter mb-2">{editingCourseId ? 'Edit Course' : 'Create New Course'}</h2>
                    <p className="text-text-muted font-bold">Launch a new learning experience for your students.</p>
                  </div>
                  <button onClick={() => { setShowCreateModal(false); setEditingCourseId(null); }} className="size-12 rounded-2xl bg-sidebar-hover flex items-center justify-center hover:bg-primary hover:text-white transition-all group">
                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                <form onSubmit={handleCreateOrUpdateCourse} className="space-y-8">
                  {statusMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-4 rounded-2xl text-sm font-bold text-center",
                        statusMessage.type === 'success' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}
                    >
                      {statusMessage.text}
                    </motion.div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Course Name</label>
                        <input 
                          required
                          type="text" 
                          value={newCourse.name}
                          onChange={e => setNewCourse({...newCourse, name: e.target.value})}
                          placeholder="e.g. Advanced Mathematics" 
                          className="w-full bg-background border-2 border-transparent rounded-2xl py-5 px-8 text-base font-bold focus:bg-surface focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Type</label>
                        <div className="grid grid-cols-2 gap-4">
                          {['COURSE', 'CLASS'].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setNewCourse({...newCourse, type})}
                              className={cn(
                                "py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2",
                                newCourse.type === type 
                                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                  : "bg-background text-text-muted border-transparent hover:bg-surface hover:border-white/5"
                              )}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Description</label>
                        <textarea 
                          required
                          rows={4}
                          value={newCourse.description}
                          onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                          placeholder="Describe what students will learn..." 
                          className="w-full bg-background border-2 border-transparent rounded-2xl py-5 px-8 text-base font-bold focus:bg-surface focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Price ($)</label>
                          <input 
                            required
                            type="number" 
                            value={newCourse.price}
                            onChange={e => setNewCourse({...newCourse, price: e.target.value})}
                            className="w-full bg-background border-2 border-transparent rounded-2xl py-5 px-8 text-base font-bold focus:bg-surface focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Start Date</label>
                          <input 
                            required
                            type="date" 
                            value={newCourse.startDate}
                            onChange={e => setNewCourse({...newCourse, startDate: e.target.value})}
                            className="w-full bg-background border-2 border-transparent rounded-2xl py-5 px-8 text-base font-bold focus:bg-surface focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Theme Color</label>
                        <div className="flex gap-3">
                          {['#f3184c', '#1e1e1e', '#3b82f6', '#10b981', '#f59e0b'].map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setNewCourse({...newCourse, color})}
                              className={cn(
                                "size-10 rounded-xl transition-all border-4",
                                newCourse.color === color ? "border-primary/20 scale-110" : "border-transparent"
                              )}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Cover Image URL (Optional)</label>
                        <div className="relative group/input">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within/input:text-primary transition-colors">
                            <ImageIcon size={20} />
                          </div>
                          <input 
                            type="url" 
                            value={newCourse.imageUrl}
                            onChange={e => setNewCourse({...newCourse, imageUrl: e.target.value})}
                            placeholder="https://images.unsplash.com/..." 
                            className="w-full bg-background border-2 border-transparent rounded-2xl py-5 pl-16 pr-8 text-base font-bold focus:bg-surface focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                          />
                        </div>
                      </div>
                      <div className="aspect-video rounded-3xl bg-background border-2 border-dashed border-white/5 flex items-center justify-center overflow-hidden relative group/preview">
                        {newCourse.imageUrl ? (
                          <img src={newCourse.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center text-white"
                            style={{ backgroundColor: newCourse.color }}
                          >
                            <div className="text-center">
                              <ImageIcon size={32} className="text-white/20 mx-auto mb-2" />
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Color Preview</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => { setShowCreateModal(false); setEditingCourseId(null); }}
                      className="flex-1 bg-sidebar-hover text-text-main py-5 rounded-[24px] font-black text-base hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className="flex-[2] bg-primary text-white py-5 rounded-[24px] font-black text-base shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        editingCourseId ? "Update Course" : "Create Course"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Schedule Live Class Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScheduleModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-surface w-full max-w-2xl rounded-[48px] p-12 relative z-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter mb-2">Schedule Live Class</h2>
                    <p className="text-text-muted font-bold">Set up a new Zoom session for your students.</p>
                  </div>
                  <button onClick={() => setShowScheduleModal(false)} className="size-12 rounded-2xl bg-sidebar-hover flex items-center justify-center hover:bg-primary hover:text-white transition-all group">
                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                <form onSubmit={handleScheduleClass} className="space-y-8">
                  {statusMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-4 rounded-2xl text-sm font-bold text-center",
                        statusMessage.type === 'success' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}
                    >
                      {statusMessage.text}
                    </motion.div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Session Title</label>
                        <input 
                          required
                          type="text" 
                          value={newClass.title}
                          onChange={e => setNewClass({...newClass, title: e.target.value})}
                          placeholder="e.g. Introduction to Calculus" 
                          className="w-full bg-background border-2 border-transparent rounded-2xl py-5 px-8 text-base font-bold focus:bg-surface focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Select Course</label>
                        <select 
                          required
                          value={newClass.moduleId}
                          onChange={e => setNewClass({...newClass, moduleId: e.target.value})}
                          className="w-full bg-background border-2 border-transparent rounded-2xl py-5 px-8 text-base font-bold focus:bg-surface focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none"
                        >
                          <option value="" disabled>Select a course...</option>
                          {dashboardData?.teacherModules?.map((mod: any) => (
                            <option key={mod.id} value={mod.id}>{mod.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Date</label>
                          <input 
                            required
                            type="date" 
                            value={newClass.scheduledAtDate}
                            onChange={e => setNewClass({...newClass, scheduledAtDate: e.target.value})}
                            className="w-full bg-background border-2 border-transparent rounded-2xl py-5 px-8 text-base font-bold focus:bg-surface focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Time</label>
                          <input 
                            required
                            type="time" 
                            value={newClass.scheduledAtTime}
                            onChange={e => setNewClass({...newClass, scheduledAtTime: e.target.value})}
                            className="w-full bg-background border-2 border-transparent rounded-2xl py-5 px-8 text-base font-bold focus:bg-surface focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                          />
                        </div>
                      </div>
                      <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 mt-4">
                        <h4 className="text-blue-800 font-bold text-sm mb-2 flex items-center gap-2">
                          <Video size={16} />
                          Automatic Zoom Integration
                        </h4>
                        <p className="text-blue-600/80 text-xs leading-relaxed">
                          A unique Zoom meeting will be automatically generated for this class using your configured Zoom API keys. Students can join directly from their dashboard.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowScheduleModal(false)}
                      className="flex-1 bg-sidebar-hover text-text-main py-5 rounded-[24px] font-black text-base hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className="flex-[2] bg-primary text-white py-5 rounded-[24px] font-black text-base shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Scheduling...
                        </>
                      ) : (
                        "Schedule Class"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface w-full max-w-md rounded-[40px] p-10 relative z-10 shadow-2xl text-center"
            >
              <div className="size-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-6">
                <X size={40} />
              </div>
              <h3 className="text-2xl font-black tracking-tighter mb-2">Delete Course?</h3>
              <p className="text-text-muted font-bold mb-8">This action cannot be undone. All enrollments and data will be lost.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-4 rounded-2xl bg-sidebar-hover font-black text-sm hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteCourse(showDeleteConfirm)}
                  className="flex-1 py-4 rounded-2xl bg-rose-500 text-white font-black text-sm hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showDeleteClassConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteClassConfirm(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface w-full max-w-md rounded-[40px] p-10 relative z-10 shadow-2xl text-center"
            >
              <div className="size-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-6">
                <X size={40} />
              </div>
              <h3 className="text-2xl font-black tracking-tighter mb-2">Delete Session?</h3>
              <p className="text-text-muted font-bold mb-8">This action cannot be undone. The Zoom meeting will be canceled.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteClassConfirm(null)}
                  className="flex-1 py-4 rounded-2xl bg-sidebar-hover font-black text-sm hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteClass(showDeleteClassConfirm)}
                  className="flex-1 py-4 rounded-2xl bg-rose-500 text-white font-black text-sm hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-surface w-full max-w-xl rounded-[48px] p-12 relative z-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter mb-2">Settings</h2>
                    <p className="text-text-muted font-bold">Manage your instructor profile and preferences.</p>
                  </div>
                  <button onClick={() => setShowSettingsModal(false)} className="size-12 rounded-2xl bg-sidebar-hover flex items-center justify-center hover:bg-primary hover:text-white transition-all group">
                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="p-6 bg-background rounded-[32px] border border-white/5">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">Profile Information</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-text-muted">Username</span>
                        <span className="text-sm font-black text-text-main">{user?.username}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-text-muted">Email</span>
                        <span className="text-sm font-black text-text-main">{user?.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-text-muted">Role</span>
                        <span className="text-sm font-black text-primary uppercase tracking-widest text-[10px] bg-primary/10 px-2 py-1 rounded-full">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button className="w-full py-5 rounded-[24px] bg-sidebar text-white font-black text-sm hover:bg-black transition-all shadow-xl">
                      Change Password
                    </button>
                    <button 
                      onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/";
                      }}
                      className="w-full py-5 rounded-[24px] bg-rose-50 text-rose-600 font-black text-sm hover:bg-rose-100 transition-all"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </motion.div>
    </>
  );
};

export default TeacherDashboard;
