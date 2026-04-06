import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    Users, BookOpen, DollarSign, ShieldCheck, UserCheck,
    Trash2, Search, Filter, RefreshCw, ChevronRight, X,
    CheckCircle2, AlertCircle, TrendingUp, Zap, Globe, Package,
    Shield, Verified, Key, Activity, ArrowRight, UserX
} from 'lucide-react';
import { Button } from './ui/interfaces-button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

interface AdminDashboardProps {
    user: any;
    dashboardData: any;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    token: string | null;
}

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ElementType; trend?: string; color?: string }> = ({
    label, value, icon: Icon, trend, color = 'primary'
}) => (
    <div className="glass rounded-[2rem] p-7 flex flex-col gap-6 relative overflow-hidden group hover:border-primary/40 transition-all duration-500 hover:translate-y-[-4px]">
        <div className={`absolute -right-4 -top-4 size-24 bg-${color}/5 blur-2xl rounded-full group-hover:bg-${color}/10 transition-all`} />
        <div className="flex items-center justify-between">
            <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg bg-${color}/10 text-${color} border border-${color}/20 group-hover:scale-110 transition-transform`}>
                <Icon size={22} />
            </div>
            {trend && (
                <div className="flex items-center gap-1.5 bg-success/10 text-success text-[10px] font-black px-3 py-1.5 rounded-xl border border-success/20">
                    <TrendingUp size={12} /> {trend}
                </div>
            )}
        </div>
        <div>
            <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.25em] mb-1.5 opacity-60 leading-none">{label}</p>
            <p className="text-4xl font-black text-text-main tracking-tighter leading-none">{value}</p>
        </div>
    </div>
);

export default function AdminDashboard({ user, dashboardData, activeTab, setActiveTab, token }: AdminDashboardProps) {
    const [activeView, setActiveView] = useState<'teachers' | 'students' | 'courses'>('teachers');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
    const displayName = user?.fullName || user?.username;

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = activeView === 'teachers' ? '/api/admin/teachers' :
                activeView === 'students' ? '/api/admin/students' : '/api/admin/courses';
            const r = await axios.get(endpoint, authHeaders);
            setData(r.data);
        } catch { }
        setLoading(false);
    };

    useEffect(() => {
        if (activeTab === 'admin' || activeTab === 'dashboard') fetchData();
    }, [activeTab, activeView]);

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await axios.put(`/api/admin/users/${userId}/status`, { isActive: !currentStatus }, authHeaders);
            fetchData();
        } catch (err) {
            alert('Action unauthorized by security protocol.');
        }
    };

    // ── Overview / Control Center ──
    if (activeTab === 'dashboard') {
        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div className="relative overflow-hidden rounded-[3rem] bg-surface-2 border border-white/5 p-10 md:p-14 mb-8">
                    <div className="absolute -right-20 -top-20 size-[450px] bg-primary/10 blur-[130px] rounded-full" />
                    <div className="absolute left-1/3 -bottom-20 size-[320px] bg-primary/5 blur-[100px] rounded-full" />

                    <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="size-16 rounded-[1.5rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/40"><ShieldCheck size={32} className="text-white" /></div>
                                <div className="flex flex-col">
                                    <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1 flex items-center gap-2 mb-1.5 w-fit">
                                        <span className="size-2 bg-success rounded-full shadow-[0_0_8px_#10b981]" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted">Global Node Alpha Ready</span>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary opacity-60 ml-1">LMS.ADMIN_v3_STABLE</p>
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95]">
                                Global Control <br />Center, <span className="text-gradient font-black underline decoration-white/5 decoration-4">{displayName}</span>.
                            </h1>
                            <p className="text-text-muted text-sm md:text-base max-w-xl leading-relaxed font-black opacity-60 uppercase tracking-tighter">
                                Synchronized identity management enabled. <br />Your ecosystem currently supports <span className="text-text-main opacity-100 italic">{dashboardData?.totalStudents || 0} active learning vectors</span> and <span className="text-text-main opacity-100 italic">{dashboardData?.totalTeachers || 0} institutional facilitators</span>.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
                            <div className="glass p-6 rounded-[2rem] flex flex-col gap-4 border-dashed group hover:border-primary/40 transition-all cursor-pointer">
                                <Key size={20} className="text-primary group-hover:scale-125 transition-transform" />
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-40 mb-1">Access Protocol</p>
                                    <p className="text-sm font-black text-white italic">Verify Class Requests &rarr;</p>
                                </div>
                            </div>
                            <div className="glass p-6 rounded-[2rem] flex flex-col gap-4 border-dashed group hover:border-success/40 transition-all cursor-pointer">
                                <Activity size={20} className="text-success group-hover:scale-125 transition-transform" />
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-40 mb-1">Node Integrity</p>
                                    <p className="text-sm font-black text-white italic">Health Diagnostics &rarr;</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="Learner Registry" value={dashboardData?.totalStudents || 0} icon={Users} trend="+12%" />
                    <StatCard label="Facilitator Registry" value={dashboardData?.totalTeachers || 0} icon={UserCheck} trend="+4%" />
                    <StatCard label="Established Classes" value={dashboardData?.totalCourses || 0} icon={BookOpen} trend="+8%" />
                    <StatCard label="Locked Revenue" value={`${(0).toLocaleString()}`} icon={DollarSign} trend="+22%" color="success" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="font-black text-2xl tracking-tighter italic uppercase">Identity Vector Logs</h2>
                            <button onClick={() => setActiveTab('admin')} className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">Full Registry Registry <ChevronRight size={14} /></button>
                        </div>
                        <div className="data-table-container border border-white/5 rounded-[2.5rem] shadow-2xl shadow-black/30 overflow-hidden">
                            <table className="data-table">
                                <thead><tr><th>Identity Handle</th><th>Protocol</th><th>Risk Status</th></tr></thead>
                                <tbody>
                                    {data.slice(0, 5).map((u: any) => (
                                        <tr key={u.id}>
                                            <td>
                                                <div className="flex items-center gap-4 py-1">
                                                    <Avatar className="size-10 rounded-xl ring-2 ring-primary/20">
                                                        <AvatarImage src={u.profilePhotoUrl} />
                                                        <AvatarFallback>{(u.fullName || u.username || 'A').charAt(0).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-black text-sm tracking-tight">{u.fullName || u.username}</p>
                                                        <p className="text-[9px] font-black text-text-muted opacity-40 uppercase tracking-widest">Enrolled 2024</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="text-[10px] font-black tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full text-text-muted">{u.role}</span></td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className={`size-2.5 rounded-full ${u.isActive ? 'bg-success shadow-[0_0_10px_#10b981]' : 'bg-danger shadow-[0_0_10px_#f43f5e]'}`} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{u.isActive ? 'VERIFIED' : 'SUSPENDED'}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="font-black text-2xl tracking-tighter italic uppercase px-2">Security Hub</h2>
                        <div className="space-y-4">
                            <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden group">
                                <div className="absolute -right-10 -top-10 size-40 bg-danger/5 blur-3xl opacity-0 group-hover:opacity-100 transition-all rounded-full" />
                                <div className="relative z-10 flex flex-col gap-6">
                                    <div className="size-14 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center text-danger group-hover:scale-110 transition-transform">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl italic tracking-tighter mb-2">Threat Mitigation</h3>
                                        <p className="text-[11px] font-black text-text-muted opacity-40 uppercase tracking-widest leading-loose">Automated protocol monitoring active. Ensure consistent identity reviews for new facilitators.</p>
                                    </div>
                                    <Button variant="outline" className="w-fit h-12 px-8 rounded-2xl border-danger/20 text-danger hover:bg-danger hover:text-white mt-2">Initialize Audit</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // ── Management Console ──
    if (activeTab === 'admin') {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 px-2">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter">Identity Console</h1>
                        <p className="text-text-muted text-sm font-black uppercase tracking-widest opacity-40 mt-1">Ecosystem User Management Protocol</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative group flex-1 md:min-w-[400px]">
                            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                            <Input placeholder="Filter identity handles..." value={search} onChange={e => setSearch(e.target.value)} className="h-16 pl-16 rounded-[2rem] bg-white/[0.03] border-white/10" />
                        </div>
                        <button onClick={fetchData} className="size-16 rounded-[2rem] glass hover:text-primary transition-all flex items-center justify-center shrink-0 border-white/10"><RefreshCw size={22} /></button>
                    </div>
                </div>

                <Tabs value={activeView} onValueChange={(v: any) => setActiveView(v)} className="w-full">
                    <TabsList className="mb-8">
                        <TabsTrigger value="teachers">Facilitator Registry</TabsTrigger>
                        <TabsTrigger value="students">Learner Registry</TabsTrigger>
                        <TabsTrigger value="courses">Academic Classes</TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                        <TabsContent value={activeView}>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="data-table-container border border-white/5 rounded-[2.5rem] shadow-2xl shadow-black/20 overflow-hidden">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>{activeView === 'courses' ? 'Class Label' : 'Identified User'}</th>
                                            <th>{activeView === 'courses' ? 'Owner / Faculty' : 'Vector Link (Email)'}</th>
                                            <th>{activeView === 'courses' ? 'Fiscal Node' : 'Joined Protocol'}</th>
                                            <th>Security Status</th>
                                            <th className="text-center w-[120px]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={5} className="py-24 text-center"><div className="size-14 border-[3px] border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(243,24,76,0.3)] mx-auto" /></td></tr>
                                        ) : data.length === 0 ? (
                                            <tr><td colSpan={5} className="text-center py-24 font-black opacity-20 uppercase tracking-[0.4em] text-xs italic">Registry Empty</td></tr>
                                        ) : data.filter(item => {
                                            const val = (item.name || item.fullName || item.username || '').toLowerCase();
                                            return val.includes(search.toLowerCase());
                                        }).map((item) => (
                                            <tr key={item.id} className="group hover:bg-white/[0.015]">
                                                <td>
                                                    <div className="flex items-center gap-4 py-2">
                                                        {activeView === 'courses' ? (
                                                            <div className="size-12 rounded-2xl shrink-0 overflow-hidden shadow-lg border border-white/5" style={{ background: item.color || '#f3184c' }}>
                                                                {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />}
                                                            </div>
                                                        ) : (
                                                            <Avatar className="size-12 rounded-[1.25rem] ring-2 ring-primary/20">
                                                                <AvatarImage src={item.profilePhotoUrl} />
                                                                <AvatarFallback>{(item.fullName || item.username || 'A').charAt(0).toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                        )}
                                                        <div>
                                                            <p className="font-black text-base tracking-tight">{item.name || item.fullName || item.username}</p>
                                                            <p className="text-[9px] font-black text-text-muted opacity-40 uppercase tracking-widest">{activeView === 'courses' ? `ID: ${item.id.slice(0, 8)}` : `Protocol established`}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-text-muted text-xs font-mono font-black opacity-50 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                                                    {activeView === 'courses' ? (item.teachers?.fullName || item.teachers?.username) : item.email}
                                                </td>
                                                <td>
                                                    {activeView === 'courses' ? (
                                                        <span className="lkr-amount font-black text-success text-sm italic">{Number(item.price).toLocaleString()}</span>
                                                    ) : (
                                                        <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg border border-white/10">{item.createdAt?.slice(0, 10)}</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`size-2.5 rounded-full ${item.status === 'PAID' || item.isActive ? 'bg-success shadow-[0_0_10px_#10b981]' : 'bg-danger shadow-[0_0_10px_#f43f5e]'}`} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{item.status === 'PAID' || item.isActive ? 'VERIFIED' : 'SUSPENDED'}</span>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => activeView !== 'courses' && toggleUserStatus(item.id, item.isActive)}
                                                            className={`size-10 rounded-xl flex items-center justify-center transition-all ${item.isActive ? 'bg-danger/10 text-danger hover:bg-danger hover:text-white' : 'bg-success/10 text-success hover:bg-success hover:text-white'}`}
                                                            title={item.isActive ? "Suspend Node" : "Authorize Node"}
                                                        >
                                                            {item.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                                                        </button>
                                                        <button className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted hover:bg-white/10 hover:text-white transition-all"><X size={18} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        </TabsContent>
                    </AnimatePresence>
                </Tabs>
            </motion.div>
        );
    }

    if (activeTab === 'settings') {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto py-10">
                <div className="glass p-10 rounded-3xl border-white/10 text-center">
                    <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={32} className="text-primary" />
                    </div>
                    <h2 className="text-2xl font-black mb-2 uppercase">System Configuration</h2>
                    <p className="text-text-muted text-sm font-bold opacity-60 mb-8">Manage global platform parameters and security protocols.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 opacity-40">Admin Identifier</p>
                            <p className="font-bold text-white uppercase">{user?.username}</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 opacity-40">System Role</p>
                            <p className="font-bold text-primary uppercase">Root Administrator</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-20 italic font-black uppercase tracking-[0.5em] text-xs">
            System Idle: Module Not Initialized
        </div>
    );
}
