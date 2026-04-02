import React from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Shield, 
  Lock, 
  LogOut, 
  Camera,
  Bell,
  Globe,
  Settings as SettingsIcon,
  ChevronRight
} from "lucide-react";
import { cn } from "@/src/lib/utils";

interface SettingsPageProps {
  user: any;
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onLogout }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-10"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Settings</h1>
          <p className="text-text-muted font-bold">Manage your profile and account preferences.</p>
        </div>
        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <SettingsIcon size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          {[
            { id: 'profile', label: 'Profile', icon: User, active: true },
            { id: 'security', label: 'Security', icon: Lock, active: false },
            { id: 'notifications', label: 'Notifications', icon: Bell, active: false },
            { id: 'language', label: 'Language', icon: Globe, active: false },
          ].map((item) => (
            <button
              key={item.id}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl font-black text-sm transition-all",
                item.active 
                  ? "bg-white text-primary shadow-lg shadow-black/5 border border-black/5" 
                  : "text-text-muted hover:bg-white hover:text-text-main"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Section */}
          <div className="bg-white rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-b-8 border-r-8 border-black/5 space-y-8">
            <div className="flex items-center gap-8">
              <div className="relative group">
                <div className="size-24 rounded-[32px] bg-gray-100 border-4 border-white shadow-xl overflow-hidden">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary font-black text-3xl">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button className="absolute -bottom-2 -right-2 size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all">
                  <Camera size={18} />
                </button>
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tighter mb-1">{user?.username}</h3>
                <p className="text-sm font-bold text-text-muted uppercase tracking-widest">{user?.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Username</label>
                <div className="relative">
                  <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input 
                    type="text" 
                    defaultValue={user?.username}
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:bg-white focus:border-primary/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input 
                    type="email" 
                    defaultValue={user?.email}
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:bg-white focus:border-primary/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Role</label>
                <div className="relative">
                  <Shield size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input 
                    type="text" 
                    readOnly
                    defaultValue={user?.role}
                    className="w-full bg-gray-100 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-black text-primary uppercase tracking-widest outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 flex gap-4">
              <button className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Save Changes
              </button>
              <button className="flex-1 bg-gray-50 text-text-main py-4 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all">
                Reset
              </button>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-b-8 border-r-8 border-black/5 space-y-6">
            <h3 className="text-xl font-black tracking-tighter">Security</h3>
            <button className="w-full flex items-center justify-between p-6 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-all group">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-text-muted group-hover:text-primary transition-colors shadow-sm">
                  <Lock size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black tracking-tight">Change Password</p>
                  <p className="text-xs font-bold text-text-muted">Update your account password regularly.</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-text-muted" />
            </button>

            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-between p-6 bg-rose-50 rounded-3xl hover:bg-rose-100 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-rose-500 shadow-sm">
                  <LogOut size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black tracking-tight text-rose-600">Log Out</p>
                  <p className="text-xs font-bold text-rose-400">Sign out of your account on this device.</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-rose-400" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
