import React from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  Clock, 
  Star, 
  TrendingUp, 
  Video, 
  BookOpen, 
  Calendar, 
  ArrowRight,
  ChevronRight,
  Settings,
  Search
} from "lucide-react";
import { cn } from "@/src/lib/utils";

interface StudentDashboardProps {
  user: any;
  dashboardData: any;
  startZoomMeeting: (meeting: any) => void;
  activeTab?: string;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, dashboardData, startZoomMeeting, activeTab = 'dashboard' }) => {
  const today = new Date();
  const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dates = [5, 5, 6, 7, 8, 9, 9]; // Mock dates for the visual

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-12 gap-8 bg-gradient-to-br from-background to-surface p-8 rounded-[48px] shadow-inner"
    >
      {/* Left Column */}
      {(activeTab === 'dashboard' || activeTab === 'live') && (
      <div className={cn("space-y-8", activeTab === 'live' ? "col-span-12" : "col-span-12 lg:col-span-8")}>
        {/* User Profile Card */}
        {activeTab === 'dashboard' && (
        <div className="bg-surface rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 border-white/20 relative overflow-hidden group hover:translate-y-[-4px] hover:translate-x-[-4px] transition-all duration-500">
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-8">
              <div className="size-32 rounded-[32px] border-4 border-primary/20 p-1 bg-surface shadow-xl shadow-white/5 animate-float overflow-hidden">
                {user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt={user.name || 'User'}
                    className="w-full h-full rounded-[28px] object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <img 
                    src={user?.imageUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                    alt="Avatar"
                    className="w-full h-full rounded-[28px] object-cover bg-background"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-5xl font-black tracking-tighter leading-none">
                    {user.name || user.email.split('@')[0]}
                  </h1>
                  <div className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
                    Student
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-text-muted">
                    <Calendar size={14} className="text-primary" />
                    Member since: <span className="text-text-main font-black">April 2026</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-text-muted">
                    <BookOpen size={14} className="text-primary" />
                    Enrolled in: <span className="text-text-main font-black">{dashboardData?.enrolledCourses?.length || 0} Courses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date Picker Mockup */}
          <div className="mt-12 bg-sidebar rounded-[32px] p-8 flex items-center justify-between relative z-10 shadow-2xl shadow-black/20">
            <button className="size-10 rounded-full bg-surface/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-surface/10 transition-all">
              <ChevronRight className="rotate-180" size={20} />
            </button>
            <div className="flex items-center gap-10">
              {days.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-3 group/day cursor-pointer">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                    day === 'Tue' ? "text-primary" : "text-white/20 group-hover/day:text-white/40"
                  )}>
                    {dates[i]}
                  </span>
                  <div className={cn(
                    "size-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all",
                    day === 'Tue' 
                      ? "bg-primary text-white shadow-xl shadow-primary/40 scale-110" 
                      : "text-white/40 hover:bg-surface/5 hover:text-white"
                  )}>
                    {day}
                  </div>
                </div>
              ))}
            </div>
            <button className="size-10 rounded-full bg-surface/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-surface/10 transition-all">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 size-64 bg-primary/5 rounded-full blur-[100px] -ml-32 -mb-32" />
        </div>
        )}

        {/* Timetable Section */}
        <div className="bg-surface rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 border-white/20 relative overflow-hidden">
          <h2 className="text-3xl font-black tracking-tighter mb-10">Time<span className="text-emerald-500">table</span></h2>
          <div className="relative">
            {/* Time markers */}
            <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest mb-8">
              {['10 am', '1 pm', '2 pm', '3 pm', '4 pm', '5 pm', '6 pm'].map((time, i) => (
                <div key={i} className="relative">
                  <span className={cn(time === '10 am' ? "text-primary" : "")}>{time}</span>
                  {time === '10 am' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 size-1.5 bg-primary rounded-full" />}
                </div>
              ))}
            </div>
            
            {/* Grid lines */}
            <div className="absolute top-10 left-0 right-0 h-px bg-black/5" />
            
            {/* Session Card */}
            <div className="mt-10">
              {dashboardData?.upcomingClasses?.length > 0 ? (
                <div className="bg-sidebar rounded-[32px] p-8 flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                    <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Video className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-black text-xl tracking-tight mb-1">
                        {dashboardData.upcomingClasses[0].title}
                      </h3>
                      <p className="text-white/40 text-sm font-bold">
                        {dashboardData.upcomingClasses[0].modules?.name} • Group session
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => startZoomMeeting(dashboardData.upcomingClasses[0])}
                    className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Join Now
                  </button>
                </div>
              ) : (
                <div className="bg-background rounded-[32px] p-12 text-center border-2 border-dashed border-white/5">
                  <p className="text-text-muted font-bold">No sessions scheduled for this time.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Right Column */}
      {(activeTab === 'dashboard' || activeTab === 'courses') && (
      <div className={cn("space-y-8", activeTab === 'courses' ? "col-span-12" : "col-span-12 lg:col-span-4")}>
        {/* Enrolled Courses Section */}
        <div className="bg-surface rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 border-white/20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tighter">My <span className="text-blue-500">Courses</span></h2>
            <button className="text-xs text-text-muted font-black uppercase tracking-widest hover:text-primary transition-colors">View all</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardData?.enrolledCourses?.length > 0 ? (
              dashboardData.enrolledCourses.map((course: any) => (
                <div key={course.id} className="group relative bg-background rounded-[32px] p-6 border border-white/5 hover:border-primary/20 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("size-12 rounded-2xl flex items-center justify-center text-white shadow-lg", course.color || 'bg-primary')}>
                      <BookOpen size={20} />
                    </div>
                    <div className="bg-surface px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 shadow-sm">
                      {course.type || 'COURSE'}
                    </div>
                  </div>
                  <h3 className="text-lg font-black tracking-tight mb-2 group-hover:text-primary transition-colors">{course.name}</h3>
                  <p className="text-xs text-text-muted font-bold line-clamp-2 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="size-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + course.id}`} alt="" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">+12 students</span>
                    </div>
                    <button className="size-10 rounded-xl bg-surface border border-white/5 flex items-center justify-center text-text-muted group-hover:text-primary group-hover:border-primary/20 transition-all shadow-sm">
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 bg-background rounded-[32px] p-12 text-center border-2 border-dashed border-white/5">
                <p className="text-text-muted font-bold">You haven't enrolled in any courses yet.</p>
                <button className="mt-4 text-primary font-black uppercase tracking-widest text-xs hover:underline">Browse Catalog</button>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Card */}
        {activeTab === 'dashboard' && (
        <div className="bg-surface rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 border-white/20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tighter">Statis<span className="text-primary">tics</span></h2>
            <button className="text-xs text-text-muted font-black uppercase tracking-widest hover:text-primary transition-colors">View all</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-sidebar rounded-[32px] p-6 text-white">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Today's tasks</p>
              <p className="text-4xl font-black mb-4">5</p>
              <button className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-primary transition-colors">
                details <ArrowRight size={12} />
              </button>
            </div>
            <div className="bg-background rounded-[32px] p-6">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Completed Tasks</p>
              <p className="text-4xl font-black mb-4">{dashboardData?.stats?.completedTasks || 0}</p>
              <button className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-primary transition-colors">
                view history <ArrowRight size={12} />
              </button>
            </div>
          </div>

          <div className="mt-6 bg-background rounded-[32px] p-6">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Task statistics</p>
            <div className="h-20 flex items-end gap-1">
              {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                <div key={i} className="flex-1 bg-primary/10 rounded-t-lg relative group">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg transition-all group-hover:bg-primary/80"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Premium Card */}
        {activeTab === 'dashboard' && (
        <div className="bg-surface rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 border-white/20 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Star className="text-primary" size={24} />
            </div>
            <h3 className="text-2xl font-black tracking-tighter mb-2">Premium subscription</h3>
            <p className="text-sm font-bold text-text-muted mb-8">Buy Premium and get access to new courses</p>
            <button className="w-full bg-sidebar text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all">
              Go Premium
            </button>
          </div>
          <div className="absolute -right-10 -top-10 size-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
        </div>
        )}
      </div>
      )}
    </motion.div>
  );
};

export default StudentDashboard;
