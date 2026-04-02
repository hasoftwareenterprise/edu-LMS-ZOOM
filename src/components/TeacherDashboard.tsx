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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-12 gap-8 bg-gradient-to-br from-background to-surface p-8 rounded-[48px] shadow-inner"
    >
      {/* Left Column */}
      {(activeTab === 'dashboard' || activeTab === 'courses') && (
        <div className={cn("space-y-8", activeTab === 'courses' ? "col-span-12" : "col-span-12 lg:col-span-8")}>
          {/* Teacher Profile Card */}
          {activeTab === 'dashboard' && (
            <div className="bg-surface rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 border-white/20 relative overflow-hidden group hover:translate-y-[-4px] hover:translate-x-[-4px] hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)] transition-all duration-500">
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-8">
              <div className="size-32 rounded-[32px] border-4 border-primary/20 p-1 bg-surface shadow-xl shadow-white/5 animate-float overflow-hidden">
                <img 
                  src={user?.imageUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                  alt="Avatar"
                  className="w-full h-full rounded-[28px] object-cover bg-background"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-5xl font-black tracking-tighter leading-none">
                    Teacher <span className="text-primary">Panel</span>
                  </h1>
                </div>
                <p className="text-base font-bold text-text-muted max-w-md leading-relaxed">
                  Welcome back, <span className="text-text-main font-black">{user?.username || 'Teacher'}</span>! You have <span className="text-primary">{dashboardData?.upcomingClasses?.length || 0} sessions</span> scheduled for today.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-center relative">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-primary text-white px-8 py-5 rounded-[24px] font-black text-sm shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group/btn"
              >
                <div className="size-6 rounded-lg bg-surface/20 flex items-center justify-center group-hover/btn:rotate-90 transition-transform">
                  <Plus size={16} />
                </div>
                New Course
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="size-14 rounded-[24px] bg-sidebar-hover border-2 border-white/10 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                  title="More Options"
                >
                  <MoreVertical size={20} />
                </button>
                
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-56 bg-sidebar border-2 border-white/10 rounded-[24px] shadow-2xl z-50 overflow-hidden"
                    >
                      <button 
                        onClick={() => { setShowSettingsModal(true); setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-4 px-6 py-4 text-sm font-black text-text-muted hover:bg-surface hover:text-primary transition-all border-b border-white/5"
                      >
                        <Settings size={18} />
                        Settings
                      </button>
                      <button 
                        onClick={() => { /* Add profile action */ setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-4 px-6 py-4 text-sm font-black text-text-muted hover:bg-surface hover:text-primary transition-all"
                      >
                        <Users size={18} />
                        View Profile
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Quick Stats Blocks */}
          <div className="mt-12 grid grid-cols-3 gap-6 relative z-10">
            {[
              { label: "Active Courses", value: dashboardData?.stats?.activeCourses || 0, color: "text-white", bg: "bg-sidebar", icon: BookOpen },
              { label: "Total Students", value: dashboardData?.stats?.totalStudents || 0, color: "text-text-main", bg: "bg-background", icon: Users },
              { label: "Live Hours", value: "0", color: "text-text-main", bg: "bg-background", icon: Video }
            ].map((stat, i) => (
              <div key={i} className={cn("rounded-[32px] p-8 relative overflow-hidden group/stat", stat.bg)}>
                <div className="relative z-10">
                  <div className={cn("size-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover/stat:scale-110", stat.bg === 'bg-sidebar' ? "bg-surface/10 text-white" : "bg-surface text-primary shadow-sm")}>
                    <stat.icon size={18} />
                  </div>
                  <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", stat.bg === 'bg-sidebar' ? "text-white/40" : "text-text-muted")}>
                    {stat.label}
                  </p>
                  <p className={cn("text-4xl font-black tracking-tighter", stat.color)}>{stat.value}</p>
                </div>
                <div className="absolute -right-4 -bottom-4 size-20 bg-surface/5 rounded-full blur-2xl group-hover/stat:bg-surface/10 transition-all" />
              </div>
            ))}
          </div>

          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 size-64 bg-primary/5 rounded-full blur-[100px] -ml-32 -mb-32" />
        </div>
        )}

        {/* Courses Section */}
        <div className="bg-surface rounded-[40px] p-10 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border-2 border-white/20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black tracking-tighter">Active <span className="text-emerald-500">Courses</span></h2>
            <button className="text-xs text-text-muted font-black uppercase tracking-widest hover:text-primary transition-colors">Manage all</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dashboardData?.teacherModules?.length > 0 ? (
              dashboardData.teacherModules.map((course: any, idx: number) => (
                <motion.div 
                  key={course.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-background rounded-[32px] p-8 group hover:bg-surface hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 border border-transparent hover:border-white/5 relative overflow-hidden"
                >
                  <div className="aspect-[16/10] rounded-2xl mb-6 overflow-hidden relative z-10 shadow-sm border border-white/5">
                    {course.imageUrl ? (
                      <img 
                        src={course.imageUrl} 
                        alt={course.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-white"
                        style={{ backgroundColor: course.color || '#f3184c' }}
                      >
                        <span className="text-4xl font-black tracking-tighter opacity-20 uppercase">{course.name.substring(0, 2)}</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-text-main shadow-sm">
                        {course.type || 'COURSE'}
                      </div>
                      <div className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                        ${course.price}
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-black text-2xl group-hover:text-primary transition-colors tracking-tight leading-tight flex-1 pr-4">{course.name}</h3>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openEditModal(course); }}
                          className="size-10 rounded-xl bg-surface border border-white/5 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-all shadow-sm"
                        >
                          <Settings size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(course.id); }}
                          className="size-10 rounded-xl bg-surface border border-white/5 flex items-center justify-center text-text-muted hover:text-rose-500 hover:border-rose-500 transition-all shadow-sm"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-text-muted" />
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{course.enrollments?.length || 0} Students</span>
                      </div>
                      <div className="flex -space-x-2">
                        {course.enrollments?.slice(0, 3).map((en: any, i: number) => (
                          <div key={i} className="size-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
                            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${en.userId}`} alt="" />
                          </div>
                        ))}
                        {(course.enrollments?.length || 0) > 3 && (
                          <div className="size-8 rounded-full border-2 border-white bg-sidebar-hover flex items-center justify-center text-[10px] font-black text-text-muted shadow-sm">
                            +{(course.enrollments?.length || 0) - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Decorative shape */}
                  <div className="absolute -right-4 -bottom-4 size-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
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
            <h2 className="text-3xl font-black tracking-tighter">Live <span className="text-blue-500">Sessions</span></h2>
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="text-xs text-text-muted font-black uppercase tracking-widest hover:text-primary transition-colors"
            >
              Schedule
            </button>
          </div>

          <div className="space-y-6 relative z-10">
            {dashboardData?.upcomingClasses?.length > 0 ? (
              dashboardData.upcomingClasses.map((cls: any) => (
                <div key={cls.id} className="flex items-center gap-6 p-4 rounded-[24px] hover:bg-background transition-all group border border-transparent hover:border-white/5">
                  <div className="size-16 rounded-2xl bg-sidebar flex flex-col items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-[10px] font-black uppercase text-white/40">{new Date(cls.scheduledAt).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-2xl font-black leading-none">{new Date(cls.scheduledAt).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg truncate group-hover:text-primary transition-colors tracking-tight">{cls.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className="text-text-muted" />
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        {new Date(cls.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} • {cls.modules?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditClassModal(cls)}
                      className="size-10 rounded-xl bg-surface border border-white/5 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-all shadow-sm opacity-0 group-hover:opacity-100"
                      title="Edit Session"
                    >
                      <Settings size={16} />
                    </button>
                    <button 
                      onClick={() => setShowDeleteClassConfirm(cls.id)}
                      className="size-10 rounded-xl bg-surface border border-white/5 flex items-center justify-center text-text-muted hover:text-rose-500 hover:border-rose-500 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                      title="Delete Session"
                    >
                      <X size={16} />
                    </button>
                    <button 
                      onClick={() => startZoomMeeting(cls)}
                      className="size-12 rounded-2xl bg-surface border border-white/5 flex items-center justify-center text-text-muted hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm group-hover:translate-x-1"
                      title="Join Meeting"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center bg-background rounded-[32px] border-2 border-dashed border-white/5">
                <div className="size-16 rounded-2xl bg-surface shadow-sm flex items-center justify-center mx-auto mb-4">
                  <Video size={24} className="text-white/10" />
                </div>
                <p className="text-text-muted text-xs font-bold">No sessions scheduled.</p>
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
        </div>

        {/* Statistics Card */}
        {activeTab === 'dashboard' && (
        <div className="bg-surface rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 border-white/20 relative overflow-hidden hover:translate-y-[-4px] hover:translate-x-[-4px] transition-all duration-500">
          <h2 className="text-3xl font-black tracking-tighter mb-10">Perfor<span className="text-amber-500">mance</span></h2>
          <div className="space-y-8">
            {[
              { label: "Course Completion", value: 85, color: "bg-primary" },
              { label: "Student Engagement", value: 92, color: "bg-blue-500" },
              { label: "Average Rating", value: 98, color: "bg-emerald-500" }
            ].map((stat, i) => (
              <div key={i} className="group">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                  <span className="text-text-muted group-hover:text-text-main transition-colors">{stat.label}</span>
                  <span className="text-text-main">{stat.value}%</span>
                </div>
                <div className="h-3 bg-sidebar-hover rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.value}%` }}
                    className={cn("h-full rounded-full shadow-lg", stat.color)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 p-6 bg-background rounded-[32px] border border-white/5">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Monthly Growth</p>
                <p className="text-xl font-black">+0% <span className="text-xs font-bold text-emerald-500">vs last month</span></p>
              </div>
            </div>
          </div>
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
  );
};

export default TeacherDashboard;
