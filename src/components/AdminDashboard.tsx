import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    Users, BookOpen, DollarSign, ShieldCheck, UserCheck,
    Trash2, Search, RefreshCw, ChevronRight, X,
    CheckCircle2, AlertCircle, TrendingUp, Key, Activity, 
    UserX, GraduationCap, ShoppingBag, Eye, Edit3, Save, 
    Calendar, Video, Briefcase, Award, Hash, Mail, Phone,
    MoreVertical, ExternalLink
} from 'lucide-react';
import { Button } from './ui/interfaces-button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface AdminDashboardProps {
    user: any;
    dashboardData: any;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    token: string | null;
}

const ProtocolCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`protocol-card relative overflow-hidden group ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        {children}
    </div>
);

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ElementType; trend?: string; color?: string }> = ({
    label, value, icon: Icon, trend, color = 'primary'
}) => (
    <div className="protocol-card !p-6 flex flex-col gap-4 group hover:translate-y-[-4px] transition-all duration-500">
        <div className="flex items-center justify-between">
            <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 bg-${color}/10 text-${color} border border-${color}/20 group-hover:scale-110 transition-transform`}>
                <Icon size={18} />
            </div>
            {trend && (
                <div className="flex items-center gap-1 bg-success/10 text-success text-[8px] font-black px-2 py-1 rounded-lg border border-success/20 uppercase tracking-widest">
                    <TrendingUp size={10} /> {trend}
                </div>
            )}
        </div>
        <div>
            <p className="text-white/80 text-[11px] font-black uppercase tracking-[0.2em] mb-2 opacity-80 italic">{label}</p>
            <p className="text-3xl font-black text-white tracking-tighter leading-none italic">{value}</p>
        </div>
    </div>
);

// --- Sub-components for Modals / Details ---

const DetailRow = ({ label, value, icon: Icon }: { label: string, value: string, icon?: React.ElementType }) => (
    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-1 shadow-inner">
        <div className="flex items-center gap-2 text-primary opacity-80 mb-1">
            {Icon && <Icon size={12} />}
            <p className="text-[9px] font-black uppercase tracking-widest">{label}</p>
        </div>
        <p className="text-sm font-bold text-white italic tracking-tight">{value || 'UNSPECIFIED'}</p>
    </div>
);

export default function AdminDashboard({ user, dashboardData: initialStats, activeTab, setActiveTab, token }: AdminDashboardProps) {
    const [data, setData] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(initialStats);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editData, setEditData] = useState<any>({});

    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);
    const displayName = user?.fullName || user?.username;

    const fetchStats = async () => {
        try {
            const r = await axios.get('/api/admin/stats', authHeaders);
            setStats(r.data);
        } catch {}
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            switch(activeTab) {
                case 'teachers': endpoint = '/api/admin/teachers'; break;
                case 'students': endpoint = '/api/admin/students'; break;
                case 'classes': endpoint = '/api/admin/courses'; break;
                case 'purchases': endpoint = '/api/admin/purchases'; break;
                case 'dashboard': endpoint = '/api/admin/teachers'; break; // for preview
            }
            if (endpoint) {
                const r = await axios.get(endpoint, authHeaders);
                setData(r.data);
            }
        } catch (err) {
            console.error("Fetch Data Error:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchData();
        setSelectedItem(null);
        setIsEditMode(false);
    }, [activeTab]);

    const handleToggleStatus = async (id: string, current: boolean) => {
        try {
            await axios.put(`/api/admin/users/${id}/toggle`, {}, authHeaders);
            fetchData();
        } catch { alert("SECURITY OVERRIDE FAILED"); }
    };

    const handleDelete = async (id: string, type: 'user' | 'course') => {
        if (!window.confirm("ARE YOU SURE YOU WANT TO DELETE THIS RECORD? THIS ACTION IS PERMANENT.")) return;
        try {
            const endpoint = type === 'user' ? `/api/admin/users/${id}` : `/api/admin/courses/${id}`;
            await axios.delete(endpoint, authHeaders);
            fetchData();
            setSelectedItem(null);
        } catch { alert("SECURITY OVERRIDE FAILED: NODE PROTECTED"); }
    };

    const handleSaveEdit = async () => {
        try {
            const endpoint = activeTab === 'classes' ? `/api/admin/courses/${selectedItem.id}` : `/api/admin/users/${selectedItem.id}`;
            await axios.put(endpoint, editData, authHeaders);
            fetchData();
            setSelectedItem(null);
            setIsEditMode(false);
        } catch { alert("PROTOCOL UPDATE FAILED"); }
    };

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const name = (item.name || item.fullName || item.username || '').toLowerCase();
            return name.includes(search.toLowerCase());
        });
    }, [data, search]);

    // ── Overview / Dashboard ──
    if (activeTab === 'dashboard') {
        const topTeachers = data.slice(0, 5);
        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div className="protocol-card !p-10 md:!p-14 relative overflow-hidden">
                    <div className="protocol-header-glow scale-150 rotate-12" />
                    <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="size-16 rounded-[1.5rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
                                    <ShieldCheck size={32} className="text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary opacity-60 ml-1 italic">SYSTEM.STABLE_v4.0</p>
                                </div>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                                Control <span className="text-gradient">Registry</span>, <br />Administrator.
                            </h1>
                            <p className="text-text-muted text-sm md:text-base max-w-xl leading-relaxed font-bold opacity-60 uppercase tracking-tighter border-l-2 border-primary/20 pl-6">
                                Synchronized metrics reflecting <span className="text-text-main opacity-100">{stats?.totalStudents || 0} learners</span> and <span className="text-text-main opacity-100">{stats?.approvedTeachers || 0} facilitators</span> within your ecosystem.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
                    <StatCard label="Total Learners" value={stats?.totalStudents || 0} icon={Users} color="primary" />
                    <StatCard label="Verified Tutors" value={stats?.approvedTeachers || 0} icon={UserCheck} color="success" />
                    <StatCard label="Active Classes" value={stats?.activeModules || 0} icon={BookOpen} color="warning" />
                    <StatCard label="Locked Revenue" value={`${Number(stats?.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} color="success" />
                    <StatCard label="Monthly Fiscal" value={stats?.purchasesThisMonth || 0} icon={ShoppingBag} color="primary" />
                    <StatCard label="Security Queue" value={stats?.pendingTeachers || 0} icon={AlertCircle} color="danger" trend="Review" />
                </div>

                <div className="grid grid-cols-1 gap-10">
                    <div className="space-y-8">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="font-black text-2xl tracking-tighter italic uppercase underline decoration-primary/40 decoration-4">Facilitator Logs</h2>
                            <button onClick={() => setActiveTab('teachers')} className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-2 transition-transform">Registry Access <ChevronRight size={14} /></button>
                        </div>
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead><tr><th>Identity Handle</th><th>Status</th></tr></thead>
                                <tbody>
                                    {topTeachers.map((u: any) => (
                                        <tr key={u.id}>
                                            <td>
                                                <div className="flex items-center gap-4 py-1">
                                                    <Avatar className="size-10 rounded-xl ring-2 ring-primary/20">
                                                        <AvatarImage src={u.profilePhotoUrl} />
                                                        <AvatarFallback>{(u.fullName || u.username || 'A').charAt(0).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-black text-sm tracking-tight">{u.fullName || u.username}</p>
                                                        <p className="text-[9px] font-black text-text-muted opacity-40 uppercase tracking-widest">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className={`size-2 rounded-full ${u.approvalStatus === 'APPROVED' ? 'bg-success shadow-[0_0_10px_#10b981]' : 'bg-warning shadow-[0_0_10px_#f59e0b]'}`} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{u.approvalStatus}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // ── Universal Table Headers ──
    const renderTableHeaders = () => {
        switch(activeTab) {
            case 'teachers':
                return (<tr><th>Identity Facet</th><th>Expertise Vector</th><th>Yield (Earnings)</th><th>Security</th><th className="text-center">Actions</th></tr>);
            case 'students':
                return (<tr><th>Learner Identity</th><th>Institution</th><th>Academic Reach</th><th>Status</th><th className="text-center">Actions</th></tr>);
            case 'classes':
                return (<tr><th>Academic Class</th><th>Primary Facilitator</th><th>Fiscal Node</th><th>Lifecycle</th><th className="text-center">Actions</th></tr>);
            case 'purchases':
                return (<tr><th>Transaction Hash</th><th>Learner Node</th><th>Asset Target</th><th>Timestamp</th><th>Fiscal Value</th></tr>);
            default: return null;
        }
    };

    // ── Table Cell Renderers ──
    const renderRow = (item: any) => {
        const isSuspended = activeTab === 'classes' ? !item.isActive : item.approvalStatus === 'SUSPENDED' || !item.isActive;
        const statusColor = isSuspended ? 'bg-danger shadow-[0_0_8px_#f43f5e]' : 'bg-success shadow-[0_0_8px_#10b981]';
        
        switch(activeTab) {
            case 'teachers':
                const earnings = item.modules?.reduce((sum: number, m: any) => sum + m.enrollments?.filter((e: any) => e.status === 'PAID').reduce((s: number, en: any) => s + Number(en.amount), 0), 0) || 0;
                return (
                    <tr key={item.id} className="group hover:bg-white/[0.015]">
                        <td>
                            <div className="flex items-center gap-4 py-2">
                                <Avatar className="size-11 rounded-2xl ring-2 ring-primary/20">
                                    <AvatarImage src={item.profilePhotoUrl} />
                                    <AvatarFallback>{(item.fullName || item.username || 'A').charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-black text-base tracking-tight">{item.fullName || item.username}</p>
                                    <p className="text-[9px] font-black text-text-muted opacity-40 uppercase tracking-widest">{item.email}</p>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div className="flex items-center gap-2">
                                <Award size={14} className="text-primary opacity-40" />
                                <span className="text-[10px] font-black uppercase tracking-tighter truncate max-w-[150px]">{item.subjectSpecialization || 'GENERALIST'}</span>
                            </div>
                        </td>
                        <td className="font-black text-success text-sm italic underline decoration-success/20">LKR {earnings.toLocaleString()}</td>
                        <td>
                            <div className="flex items-center gap-2">
                                <div className={`size-2.5 rounded-full ${statusColor}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{item.approvalStatus}</span>
                            </div>
                        </td>
                        <td>
                            <div className="flex items-center justify-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setSelectedItem(item); setEditData(item); setIsEditMode(false); }} className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Eye size={16} /></button>
                                <button onClick={() => { setSelectedItem(item); setEditData(item); setIsEditMode(true); }} className="size-9 rounded-xl bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-all"><Edit3 size={16} /></button>
                                <button onClick={() => handleDelete(item.id, 'user')} className="size-9 rounded-xl bg-danger/10 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-all"><Trash2 size={16} /></button>
                            </div>
                        </td>
                    </tr>
                );
            case 'students':
                return (
                    <tr key={item.id} className="group hover:bg-white/[0.015]">
                        <td>
                            <div className="flex items-center gap-4 py-2">
                                <Avatar className="size-11 rounded-2xl ring-2 ring-success/20">
                                    <AvatarImage src={item.profilePhotoUrl} />
                                    <AvatarFallback>{(item.fullName || item.username || 'S').charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-black text-base tracking-tight">{item.fullName || item.username}</p>
                                    <p className="text-[9px] font-black text-text-muted opacity-40 uppercase tracking-widest">ID: {item.id.slice(0, 8)}</p>
                                </div>
                            </div>
                        </td>
                        <td className="text-[10px] font-black uppercase text-text-muted opacity-60 italic">{item.school || 'Private Sector'}</td>
                        <td className="text-[10px] font-black text-primary italic uppercase tracking-tighter">{item.enrollments?.length || 0} Courses Accessed</td>
                        <td>
                            <div className="flex items-center gap-2">
                                <div className={`size-2.5 rounded-full ${item.isActive ? 'bg-success' : 'bg-danger'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{item.isActive ? 'ACTIVE' : 'DISABLED'}</span>
                            </div>
                        </td>
                        <td>
                            <div className="flex items-center justify-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setSelectedItem(item); setEditData(item); setIsEditMode(false); }} className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Eye size={16} /></button>
                                <button onClick={() => { setSelectedItem(item); setEditData(item); setIsEditMode(true); }} className="size-9 rounded-xl bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-all"><Edit3 size={16} /></button>
                                <button onClick={() => handleDelete(item.id, 'user')} className="size-9 rounded-xl bg-danger/10 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-all"><Trash2 size={16} /></button>
                            </div>
                        </td>
                    </tr>
                );
            case 'classes':
                return (
                    <tr key={item.id} className="group hover:bg-white/[0.015]">
                        <td>
                            <div className="flex items-center gap-4 py-2">
                                <div className="size-11 rounded-2xl bg-surface-2 border border-white/5 overflow-hidden flex items-center justify-center text-primary">
                                    {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <BookOpen size={20} />}
                                </div>
                                <div>
                                    <p className="font-black text-base tracking-tight">{item.name}</p>
                                    <p className="text-[9px] font-black text-text-muted opacity-40 uppercase tracking-widest">Type: {item.type}</p>
                                </div>
                            </div>
                        </td>
                        <td>
                            <p className="text-sm font-bold text-white italic tracking-tighter">{item.users?.fullName || item.users?.username || 'SYSTEM'}</p>
                        </td>
                        <td className="font-black text-primary text-sm italic">LKR {Number(item.price).toLocaleString()}</td>
                        <td>
                            <div className="flex items-center gap-2">
                                <div className={`size-2.5 rounded-full ${item.isActive ? 'bg-success' : 'bg-danger'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{item.isActive ? 'OPERATIONAL' : 'OFFLINE'}</span>
                            </div>
                        </td>
                        <td>
                            <div className="flex items-center justify-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setSelectedItem(item); setEditData(item); setIsEditMode(false); }} className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Eye size={16} /></button>
                                <button onClick={() => { setSelectedItem(item); setEditData(item); setIsEditMode(true); }} className="size-9 rounded-xl bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-all"><Edit3 size={16} /></button>
                                <button onClick={() => handleDelete(item.id, 'course')} className="size-9 rounded-xl bg-danger/10 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-all"><Trash2 size={16} /></button>
                            </div>
                        </td>
                    </tr>
                );
            case 'purchases':
                return (
                    <tr key={item.id}>
                        <td className="font-mono text-[10px] opacity-40">#{item.id.slice(0, 12).toUpperCase()}</td>
                        <td>
                            <div className="flex items-center gap-3">
                                <p className="text-xs font-black text-white italic">{item.users?.fullName || item.users?.username}</p>
                            </div>
                        </td>
                        <td className="text-xs font-bold text-text-muted italic">{item.modules?.name}</td>
                        <td className="text-[10px] font-black uppercase text-text-muted opacity-40">{new Date(item.paidAt).toLocaleString()}</td>
                        <td className="font-black text-success text-sm italic">LKR {Number(item.amount).toLocaleString()}</td>
                    </tr>
                );
            default: return null;
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 px-2">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">{activeTab} Hub</h1>
                    <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Institutional Management Access Port</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group flex-1 md:min-w-[400px]">
                        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-all scale-75 group-focus-within:scale-100" />
                        <Input 
                            placeholder="GENERATE SEARCH PARAMETERS..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            className="h-16 pl-16 rounded-[2rem] bg-white/[0.03] border-white/10 italic font-bold focus:bg-white/[0.05]" 
                        />
                    </div>
                    <button onClick={fetchData} className="size-16 rounded-[2rem] protocol-card flex items-center justify-center shrink-0 hover:text-primary transition-all"><RefreshCw size={22} className={loading ? 'animate-spin' : ''} /></button>
                </div>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>{renderTableHeaders()}</thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={10} className="py-24 text-center"><div className="size-14 border-[3px] border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(243,24,76,0.3)] mx-auto" /></td></tr>
                        ) : filteredData.length === 0 ? (
                            <tr><td colSpan={10} className="text-center py-24 font-black opacity-20 uppercase tracking-[0.4em] text-xs italic">Registry Empty</td></tr>
                        ) : filteredData.map(renderRow)}
                    </tbody>
                </table>
            </div>

            {/* ── Detail / Edit Modal ── */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                            onClick={() => setSelectedItem(null)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden protocol-card !p-0 flex flex-col"
                        >
                            <div className="p-8 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.01]">
                                <div className="flex items-center gap-4">
                                    <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Hash size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black italic tracking-tighter uppercase">{isEditMode ? 'Modify Attribute' : 'Registry Profile'}</h2>
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] opacity-40 italic">ID Vector: {selectedItem.id}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedItem(null)} className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-text-muted hover:bg-danger/10 hover:text-danger transition-all"><X size={24} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {isEditMode ? (
                                        // ── Edit Form Inputs ──
                                        Object.keys(selectedItem).map(key => {
                                            if (['id', 'createdAt', 'updatedAt', 'modules', 'enrollments', 'live_classes', 'users', 'password'].includes(key)) return null;
                                            if (typeof selectedItem[key] === 'object' && selectedItem[key] !== null) return null;
                                            
                                            if (key === 'isActive') {
                                                return (
                                                    <div key={key} className="space-y-2">
                                                        <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-2 opacity-80 backdrop-blur-sm">System Status</label>
                                                        <select 
                                                            value={editData[key] ? 'true' : 'false'} 
                                                            onChange={e => setEditData({...editData, [key]: e.target.value === 'true'})}
                                                            className="w-full h-14 bg-white/5 border border-white/20 rounded-xl px-5 font-bold text-sm text-white italic outline-none focus:border-primary/60 transition-colors shadow-2xl"
                                                        >
                                                            <option value="true" className="bg-[#1a0507]">ACTIVE NODE</option>
                                                            <option value="false" className="bg-[#1a0507]">SUSPENDED NODE</option>
                                                        </select>
                                                    </div>
                                                );
                                            }

                                            if (key === 'approvalStatus') {
                                                return (
                                                    <div key={key} className="space-y-2">
                                                        <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-2 opacity-80">Security Protocol</label>
                                                        <select 
                                                            value={editData[key]} 
                                                            onChange={e => setEditData({...editData, [key]: e.target.value})}
                                                            className="w-full h-14 bg-white/5 border border-white/20 rounded-xl px-5 font-bold text-sm text-white italic outline-none focus:border-primary/60 transition-colors shadow-2xl"
                                                        >
                                                            <option value="PENDING" className="bg-[#1a0507]">PENDING VERIFICATION</option>
                                                            <option value="APPROVED" className="bg-[#1a0507]">AUTHORIZED NODE</option>
                                                            <option value="SUSPENDED" className="bg-[#1a0507]">TERMINATED ACCESS</option>
                                                        </select>
                                                    </div>
                                                );
                                            }

                                            if (key === 'type' && activeTab === 'classes') {
                                                return (
                                                    <div key={key} className="space-y-2">
                                                        <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-2 opacity-80">Class Protocol</label>
                                                        <select 
                                                            value={editData[key]} 
                                                            onChange={e => setEditData({...editData, [key]: e.target.value})}
                                                            className="w-full h-14 bg-white/5 border border-white/20 rounded-xl px-5 font-bold text-sm text-white italic outline-none focus:border-primary/60 transition-colors shadow-2xl"
                                                        >
                                                            <option value="LIVE" className="bg-[#1a0507]">LIVE BROADCAST</option>
                                                            <option value="RECORDED" className="bg-[#1a0507]">ARCHIVAL ACCESS</option>
                                                        </select>
                                                    </div>
                                                );
                                            }
                                            
                                            return (
                                                <div key={key} className="space-y-2">
                                                    <label className="text-[10px] font-black text-primary/80 uppercase tracking-widest pl-2 opacity-90">{key.replace(/([A-Z])/g, ' $1')}</label>
                                                    <Input 
                                                        value={editData[key] || ''} 
                                                        onChange={e => setEditData({...editData, [key]: e.target.value})} 
                                                        className="h-14 bg-white/5 border-white/20 rounded-xl font-bold text-white italic focus:bg-white/10"
                                                    />
                                                </div>
                                            );
                                        })
                                    ) : (
                                        // ── View Details Display ──
                                        <>
                                            <DetailRow label="Full Name" value={selectedItem.fullName || selectedItem.name} icon={UserCheck} />
                                            <DetailRow label="Primary Vector" value={selectedItem.email || 'N/A'} icon={Mail} />
                                            <DetailRow label="Phone Link" value={selectedItem.mobileNumber || 'N/A'} icon={Phone} />
                                            {activeTab === 'teachers' && (
                                                <>
                                                    <DetailRow label="NIC Identifier" value={selectedItem.nicNumber} />
                                                    <DetailRow label="Institutional Source" value={selectedItem.instituteName} />
                                                    <DetailRow label="Qualification Array" value={selectedItem.educationQualifications} />
                                                </>
                                            )}
                                            {activeTab === 'students' && (
                                                <>
                                                    <DetailRow label="School Node" value={selectedItem.school} />
                                                    <DetailRow label="Grade Vector" value={selectedItem.gradeYear} />
                                                </>
                                            )}
                                            {activeTab === 'classes' && (
                                                <>
                                                    <DetailRow label="Facilitator" value={selectedItem.users?.fullName} />
                                                    <DetailRow label="Price Point" value={selectedItem.price} icon={DollarSign} />
                                                    <DetailRow label="Protocol Type" value={selectedItem.type} />
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Deep Relationships (Classes, Students, Modules) */}
                                {!isEditMode && (
                                    <div className="mt-10 space-y-6">
                                        <h3 className="text-sm font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                                            <div className="size-1.5 bg-primary rounded-full" />
                                            Cross-Link Registry
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedItem.modules && selectedItem.modules.map((m: any) => (
                                                <div key={m.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary italic font-black">{m.name.charAt(0)}</div>
                                                        <div>
                                                            <p className="text-xs font-black text-white italic">{m.name}</p>
                                                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40">Price: LKR {Number(m.price).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-all" />
                                                </div>
                                            ))}
                                            {selectedItem.enrollments && selectedItem.enrollments.map((e: any) => (
                                                <div key={e.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-10 rounded-xl bg-success/10 flex items-center justify-center text-success italic font-black uppercase tracking-tighter">ENR</div>
                                                        <div>
                                                            <p className="text-xs font-black text-white italic">{e.modules?.name || e.users?.fullName || 'Registry Node'}</p>
                                                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40">{e.status} • {new Date(e.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {selectedItem.live_classes && selectedItem.live_classes.map((lc: any) => (
                                                <div key={lc.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                                                    <Video size={16} className="text-primary opacity-40" />
                                                    <div>
                                                        <p className="text-xs font-black text-white italic">{lc.title}</p>
                                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40">{new Date(lc.scheduledAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 bg-black/40 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
                                {isEditMode ? (
                                    <>
                                        <Button variant="ghost" onClick={() => setIsEditMode(false)} className="h-14 px-8 rounded-[1.25rem] text-text-muted font-black uppercase tracking-widest text-[10px]">Cancel Changes</Button>
                                        <Button onClick={handleSaveEdit} className="protocol-button !h-14 !px-12 flex items-center gap-3">
                                            <Save size={18} />
                                            Commit Protocol Update
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        {activeTab === 'teachers' && selectedItem.approvalStatus === 'PENDING' && (
                                            <Button onClick={async () => {
                                                await axios.put(`/api/admin/teachers/${selectedItem.id}/approve`, {}, authHeaders);
                                                fetchData();
                                                setSelectedItem(null);
                                            }} className="bg-success text-white h-14 px-10 rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] hover:bg-success/80 shadow-lg shadow-success/20">Authorize Node</Button>
                                        )}
                                        <Button onClick={() => setIsEditMode(true)} className="protocol-button !h-14 !px-12 flex items-center gap-3 shadow-lg shadow-primary/20">
                                            <Edit3 size={18} />
                                            Modify Hierarchy
                                        </Button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

