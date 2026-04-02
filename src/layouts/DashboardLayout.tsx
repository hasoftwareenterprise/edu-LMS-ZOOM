import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  Search,
  MessageSquare,
  User as UserIcon,
  Menu,
  X,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-4 p-2 rounded-2xl transition-all duration-500 w-full group relative",
      active 
        ? "bg-primary text-white shadow-[0_20px_40px_-5px_rgba(255,30,86,0.4)] scale-105" 
        : "text-text-muted hover:text-text-main hover:bg-white/5"
    )}
    style={active ? { background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)' } : {}}
  >
    <div className={cn(
      "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
      active ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"
    )}>
      <Icon size={20} className={cn("transition-transform duration-500", active ? "scale-110" : "group-hover:scale-110")} />
    </div>
    <span className={cn(
      "font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap overflow-hidden",
      collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
    )}>
      {label}
    </span>
    {collapsed && (
      <div className="absolute left-full ml-4 px-4 py-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50 shadow-2xl">
        {label}
      </div>
    )}
  </button>
);

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, user, onLogout, activeTab, setActiveTab }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ];

    if (user?.role === 'TEACHER') {
      return [
        ...baseItems,
        { id: 'courses', icon: BookOpen, label: 'Manage Courses' },
        { id: 'live', icon: Video, label: 'Live Sessions' },
        { id: 'students', icon: Users, label: 'My Students' },
        { id: 'messages', icon: MessageSquare, label: 'Messages' },
      ];
    }

    return [
      ...baseItems,
      { id: 'courses', icon: BookOpen, label: 'My Courses' },
      { id: 'live', icon: Video, label: 'Live Classes' },
      { id: 'community', icon: Users, label: 'Community' },
      { id: 'messages', icon: MessageSquare, label: 'Messages' },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex h-screen bg-sidebar text-text-main overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={cn(
          "flex flex-col py-8 items-center relative z-20 transition-all duration-500 ease-in-out",
          collapsed ? "w-[100px]" : "w-[260px]"
        )}
      >
        <div className="flex items-center justify-between w-full px-6 mb-12">
          <div className={cn("flex items-center gap-2 transition-all duration-500", collapsed ? "opacity-0 scale-50" : "opacity-100 scale-100")}>
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
              <div className="size-4 bg-surface rounded-sm rotate-45" />
            </div>
            <span className="text-white font-black text-xl tracking-tighter">math.</span>
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="size-10 rounded-xl bg-surface/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-surface/10 transition-all"
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-3 w-full px-4">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.id}
              icon={item.icon} 
              label={item.label} 
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
              collapsed={collapsed}
            />
          ))}
          
          <div className="mt-auto flex flex-col gap-3">
            <div className="h-px bg-surface/5 mx-4 my-2" />
            <SidebarItem 
              icon={Settings} 
              label="Settings" 
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              collapsed={collapsed}
            />
            <SidebarItem 
              icon={LogOut} 
              label="Logout" 
              onClick={onLogout} 
              collapsed={collapsed}
            />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-background rounded-l-[48px] shadow-2xl border-l border-white/5">
        {/* Header */}
        <header className="h-24 flex items-center justify-between px-10 bg-background z-10">
          <div className="flex items-center gap-6 flex-1">
            <div className="bg-surface rounded-2xl px-8 py-3 shadow-sm border border-white/5 font-bold text-base">
              Dashboard
            </div>
            <div className="relative w-full max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text" 
                placeholder="What assignment are you looking for?" 
                className="w-full bg-surface border border-white/10 rounded-2xl py-2.5 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-primary/50 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button 
              onClick={toggleDarkMode}
              className="size-12 flex items-center justify-center bg-surface rounded-2xl border border-white/5 text-text-main hover:bg-background transition-colors shadow-sm"
            >
              {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <button className="size-12 flex items-center justify-center bg-surface rounded-2xl border border-white/5 text-text-main hover:bg-background transition-colors shadow-sm relative">
              <Bell size={22} />
              <span className="absolute top-3.5 right-3.5 size-2.5 bg-primary rounded-full border-2 border-white" />
            </button>
            <button className="size-12 flex items-center justify-center bg-surface rounded-2xl border border-white/5 text-text-main hover:bg-background transition-colors shadow-sm">
              <MessageSquare size={22} />
            </button>
            <div className="flex items-center gap-4 pl-5 border-l border-white/10">
              <div className="size-12 rounded-2xl bg-surface border border-white/5 flex items-center justify-center overflow-hidden shadow-sm">
                <img 
                  src={user?.imageUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                  alt={user?.name || 'User'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-black tracking-tight">{user?.name || user?.email?.split('@')[0] || 'User'}</p>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                    {user?.role || 'STUDENT'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
