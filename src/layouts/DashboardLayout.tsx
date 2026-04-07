import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Users, Settings, LogOut,
  Bell, Search, Menu, X, GraduationCap, ShieldCheck,
  ShoppingBag, UserCheck, ChevronRight, Video, Verified
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function getNavItems(role: string, pendingCount?: number): NavItem[] {
  if (role === 'ADMIN') {
    return [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'teachers', icon: UserCheck, label: 'Teachers', badge: pendingCount },
      { id: 'students', icon: GraduationCap, label: 'Students' },
      { id: 'classes', icon: BookOpen, label: 'Classes' },
      { id: 'purchases', icon: ShoppingBag, label: 'Purchases' },
      { id: 'settings', icon: Settings, label: 'Settings' },
    ];
  }
  if (role === 'TEACHER') {
    return [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'classes', icon: BookOpen, label: 'My Classes' },
      { id: 'students', icon: Users, label: 'My Students' },
      { id: 'settings', icon: Settings, label: 'Profile' },
    ];
  }
  // STUDENT
  return [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'explore', icon: ShoppingBag, label: 'Explore Classes' },
    { id: 'classes', icon: BookOpen, label: 'My Classes' },
    { id: 'settings', icon: Settings, label: 'Profile' },
  ];
}

function getRoleLabel(role: string) {
  if (role === 'ADMIN') return 'Administrator';
  if (role === 'TEACHER') return 'Teacher';
  return 'Student';
}

const SidebarItem: React.FC<{
  item: NavItem; active: boolean; collapsed: boolean; onClick: () => void;
}> = ({ item, active, collapsed, onClick }) => {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`sidebar-item group ${active ? 'active' : 'opacity-60'} ${collapsed ? 'justify-center px-1' : ''}`}
    >
      <span className={`sidebar-icon shrink-0 transition-transform group-hover:scale-110 mb-2 ${active ? 'text-primary' : 'text-white/40'}`}>
        <Icon size={32} />
      </span>
      {!collapsed && <span className={`flex-1 text-left truncate font-bold text-[11px] uppercase tracking-wider ${active ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{item.label}</span>}
      {!collapsed && item.badge !== undefined && item.badge > 0 && (
        <span className="bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-md min-w-[16px] text-center leading-none">
          {item.badge}
        </span>
      )}
    </button>
  );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children, user, onLogout, activeTab, setActiveTab
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const navItems = getNavItems(user?.role || 'STUDENT');
  const roleColor = user?.role === 'ADMIN' ? 'bg-warning/15 text-warning' :
    user?.role === 'TEACHER' ? 'bg-primary/15 text-primary' : 'bg-success/15 text-success';

  const displayName = user?.fullName || user?.username || user?.email?.split('@')[0] || 'User';
  const activeLabel = navItems.find(n => n.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-background text-text-main overflow-hidden font-sans">

      {/* ── Desktop Sidebar ── */}
      <aside className={`hidden md:flex flex-col py-8 relative z-20 transition-all duration-300 ease-in-out border-r border-white/5 
          ${(user?.role === 'TEACHER' || user?.role === 'STUDENT') ? 'institutional-sidebar-gradient' : 'bg-[#1a0507]'}
          ${collapsed ? 'w-[88px]' : 'w-[280px]'}`}>

        {/* Logo + Toggle */}
        <div className={`flex items-center mb-8 px-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 pl-1">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <GraduationCap size={16} className="text-white" />
              </div>
              <span className="text-white font-black text-lg tracking-tight">EDU-LMS</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted
                       hover:text-text-main hover:bg-white/10 transition-all shrink-0"
          >
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-8 px-3 overflow-hidden mt-6">
          {navItems.map(item => (
            <SidebarItem
              key={item.id}
              item={item}
              active={activeTab === item.id}
              collapsed={collapsed}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 mt-4 pt-4 border-t border-white/5 flex flex-col gap-1.5">
          <button
            onClick={onLogout}
            title={collapsed ? 'Logout' : undefined}
            className={`sidebar-item ${collapsed ? 'justify-center px-2' : ''} hover:text-danger hover:bg-danger/10`}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-30 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed inset-y-0 left-0 w-64 border-r border-border z-40 md:hidden flex flex-col py-6 ${(user?.role === 'TEACHER' || user?.role === 'STUDENT') ? 'institutional-sidebar-gradient' : 'bg-sidebar'}`}
            >
              <div className="flex items-center justify-between px-4 mb-8">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                    <GraduationCap size={16} className="text-white" />
                  </div>
                  <span className="text-white font-black text-lg tracking-tight">EDU-LMS</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted">
                  <X size={16} />
                </button>
              </div>
              <nav className="flex-1 flex flex-col gap-1 px-2 overflow-y-auto">
                {navItems.map(item => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    active={activeTab === item.id}
                    collapsed={false}
                    onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  />
                ))}
              </nav>
              <div className="px-2 mt-4 pt-4 border-t border-border">
                <button onClick={onLogout} className="sidebar-item w-full hover:text-danger hover:bg-danger/10">
                  <LogOut size={18} /> <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background">

        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-background shrink-0 gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden size-9 rounded-xl bg-surface border border-border flex items-center justify-center text-text-muted"
          >
            <Menu size={18} />
          </button>

          {/* Page title space */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2.5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
              <span className="opacity-50">EDU</span>
              <span className="text-primary opacity-50">-</span>
              <span className="opacity-50">LMS</span>
              <div className="size-1 bg-white/10 rounded-full" />
              <span className="text-text-main opacity-100">{activeLabel}</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              {/* Modern Ripple Effect (Header Top Corner Only) */}
              <div className="absolute inset-0 animate-ripple-header rounded-full border border-primary/40 pointer-events-none" />

              <div className="custom-avatar-container cursor-pointer hover:scale-105 transition-transform">
                <div className="custom-avatar-inner-wrap">
                  <div className="avatar-character">
                    <div className="inner">
                      <div className="hair-side"></div>
                      <div className="hair-above"></div>
                      <div className="head">
                        <div className="face">
                          <div className="eyes">
                            <div className="eye-left eye-base"></div>
                            <div className="eye-right eye-base"></div>
                          </div>
                          <div className="nose"></div>
                          <div className="mouth"></div>
                        </div>
                      </div>
                      <div className="ears">
                        <div className="ear-left"></div>
                        <div className="ear-right"></div>
                      </div>
                      <div className="neck"></div>
                    </div>
                    <div className="body"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 size-3 bg-success rounded-full border-2 border-background shadow-lg" title="Online" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-4 md:p-6 min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="mobile-nav">
        {navItems.slice(0, 4).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label.split(' ')[0]}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-0.5 ml-3 size-2 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
        <button onClick={onLogout} className="mobile-nav-item">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default DashboardLayout;
