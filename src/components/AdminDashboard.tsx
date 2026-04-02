import React from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Activity, 
  BookOpen, 
  Search, 
  MoreVertical,
  ArrowUpRight,
  TrendingUp,
  X
} from "lucide-react";
import axios from "axios";
import { cn } from "@/src/lib/utils";

interface AdminDashboardProps {
  user: any;
  dashboardData: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, dashboardData }) => {
  const handleClearData = async () => {
    if (!window.confirm("Are you sure you want to clear all courses and classes? This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/clear-data", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Data cleared successfully. Please refresh the page.");
      window.location.reload();
    } catch (err) {
      console.error("Failed to clear data", err);
      alert("Failed to clear data");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter">
            Admin <span className="text-primary">Control</span>
          </h1>
          <p className="text-text-muted font-bold">System overview and management dashboard.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleClearData}
            className="bg-rose-50 text-rose-600 px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 border border-rose-100 shadow-sm hover:bg-rose-100 transition-all"
          >
            <X size={20} />
            Clear All Data
          </button>
          <button className="bg-white text-text-main px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 border border-black/5 shadow-sm hover:bg-gray-50 transition-all">
            <Shield size={20} className="text-primary" />
            System Logs
          </button>
          <button className="bg-primary text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            <UserPlus size={20} />
            Add Teacher
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Students", value: "1,284", icon: Users, color: "text-blue-500", bg: "bg-blue-50", trend: "+12%" },
          { label: "Total Teachers", value: "42", icon: UserPlus, color: "text-primary", bg: "bg-primary/5", trend: "+2" },
          { label: "Active Courses", value: "86", icon: BookOpen, color: "text-purple-500", bg: "bg-purple-50", trend: "+5" },
          { label: "System Health", value: "99.9%", icon: Activity, color: "text-green-500", bg: "bg-green-50", trend: "Stable" }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[32px] border-b-4 border-r-4 border-black/5 flex flex-col gap-4 group transition-all duration-500 hover:border-primary/30 shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
          >
            <div className="flex items-center justify-between">
              <div className={cn("size-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
              <span className={cn("text-[10px] font-black px-2 py-1 rounded-full", stat.trend.includes('+') ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400")}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-mono font-black mt-0.5">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Enrollments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black flex items-center gap-3 tracking-tighter">
              <TrendingUp className="text-primary" />
              Recent Activity
            </h2>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="bg-gray-50 border border-black/5 rounded-xl py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/30 transition-all"
              />
            </div>
          </div>
          <div className="bg-white rounded-[32px] border-b-8 border-r-8 border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-black/5">
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Joined</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {[
                  { name: "John Doe", email: "john@mail.com", role: "STUDENT", status: "Active", date: "2 mins ago" },
                  { name: "Sarah Smith", email: "sarah@mail.com", role: "TEACHER", status: "Active", date: "1 hour ago" },
                  { name: "Mike Ross", email: "mike@mail.com", role: "STUDENT", status: "Pending", date: "3 hours ago" },
                  { name: "Emma Watson", email: "emma@mail.com", role: "STUDENT", status: "Active", date: "Yesterday" },
                  { name: "David Miller", email: "david@mail.com", role: "TEACHER", status: "Inactive", date: "2 days ago" }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                          {row.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black tracking-tight">{row.name}</p>
                          <p className="text-[10px] text-text-muted font-bold">{row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-full",
                        row.role === 'TEACHER' ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {row.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("size-1.5 rounded-full", row.status === 'Active' ? "bg-green-500" : row.status === 'Pending' ? "bg-yellow-500" : "bg-red-500")} />
                        <span className="text-xs font-bold text-text-muted">{row.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-text-muted">{row.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical size={16} className="text-text-muted" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health Sidebar */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-3 tracking-tighter">
            <Activity className="text-primary" />
            Server Status
          </h2>
          <div className="bg-white p-6 rounded-[32px] border-b-8 border-r-8 border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-sm font-black tracking-tight">Main Server</p>
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Operational</p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-text-muted" />
            </div>
            
            <div className="space-y-4">
              {[
                { label: "CPU Usage", value: 24 },
                { label: "Memory", value: 48 },
                { label: "Storage", value: 12 }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${item.value}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
