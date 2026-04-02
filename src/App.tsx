import { useState, useEffect, useCallback } from "react";
import { Component as LoginPage } from "./components/ui/animated-characters-login-page";
import SignupPage from "./components/SignupPage";
import DashboardLayout from "./layouts/DashboardLayout";
import ZoomMeetingSDK from "./components/ZoomMeetingSDK";
import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import AdminDashboard from "./components/AdminDashboard";
import SettingsPage from "./components/SettingsPage";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, 
  BookOpen, 
  AlertCircle
} from "lucide-react";
import axios from "axios";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeMeeting, setActiveMeeting] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const fetchDashboardData = useCallback(async (authToken: string) => {
    try {
      const res = await axios.get("/api/dashboard", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setDashboardData(res.data);
    } catch (err: any) {
      console.error("Dashboard data fetch error:", err.response?.status, err.response?.data);
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch dashboard data";
      setError(errorMsg);
      
      if (err.response?.status === 403 && err.response?.data?.code === "KICK_OUT") {
        console.warn("Kicking out user:", errorMsg);
        handleLogout();
      }
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      fetchDashboardData(savedToken);
    }
    setLoading(false);
  }, [fetchDashboardData]);

  const handleLogin = (data: any) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setToken(data.token);
    fetchDashboardData(data.token);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    setActiveMeeting(null);
    setDashboardData(null);
    setAuthMode("login");
  };

  const startZoomMeeting = async (meeting: any) => {
    try {
      const cleanMeetingNumber = meeting.zoomMeetingId.toString().replace(/\s/g, '');
      const response = await axios.post("/api/zoom/signature", {
        meetingNumber: cleanMeetingNumber,
        role: user.role === 'TEACHER' || user.role === 'ADMIN' ? 1 : 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { signature, sdkKey } = response.data;
      
      setActiveMeeting({
        meetingNumber: cleanMeetingNumber,
        passWord: meeting.zoomPassword || "password",
        userName: user.username || user.email.split('@')[0],
        userEmail: user.email,
        signature,
        sdkKey: sdkKey || import.meta.env.VITE_ZOOM_SDK_KEY || "YOUR_SDK_KEY"
      });
    } catch (err) {
      console.error("Failed to get Zoom signature", err);
    }
  };

  if (loading) return <div className="h-screen bg-background flex items-center justify-center text-text-main font-mono">Initializing EDU-LMS...</div>;

  if (!user) {
    if (authMode === "signup") {
      return <SignupPage onBack={() => setAuthMode("login")} onSignupSuccess={() => setAuthMode("login")} />;
    }
    return <LoginPage onLogin={handleLogin} onSignupClick={() => setAuthMode("signup")} />;
  }

  if (activeMeeting) {
    return <ZoomMeetingSDK {...activeMeeting} />;
  }

  const renderDashboard = () => {
    if (user.role === 'ADMIN') return <AdminDashboard user={user} dashboardData={dashboardData} />;
    if (user.role === 'TEACHER') return <TeacherDashboard user={user} dashboardData={dashboardData} startZoomMeeting={startZoomMeeting} activeTab={activeTab} />;
    return <StudentDashboard user={user} dashboardData={dashboardData} startZoomMeeting={startZoomMeeting} activeTab={activeTab} />;
  };

  return (
    <DashboardLayout 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      <div className="max-w-7xl mx-auto mb-6">
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3"
          >
            <AlertCircle size={20} />
            <p className="text-sm font-bold flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500/60 hover:text-red-500 transition-colors">×</button>
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {(activeTab === 'dashboard' || activeTab === 'courses' || activeTab === 'live') && (
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderDashboard()}
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SettingsPage user={user} onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
