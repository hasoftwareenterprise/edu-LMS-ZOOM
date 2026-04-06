import { useState, useEffect, useCallback } from "react";
import { Component as LoginPage } from "./components/ui/animated-characters-login-page";
import SignupPage from "./components/SignupPage";
import AwaitingApprovalPage from "./components/AwaitingApprovalPage";
import DashboardLayout from "./layouts/DashboardLayout";
import ZoomMeetingSDK from "./components/ZoomMeetingSDK";
import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import AdminDashboard from "./components/AdminDashboard";
import SettingsPage from "./components/SettingsPage";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import axios from "axios";

type AuthMode = "login" | "signup" | "signup-success-pending";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeMeeting, setActiveMeeting] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

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
    setActiveTab("dashboard");
  };

  const handleSignupSuccess = (requiresApproval: boolean) => {
    if (requiresApproval) {
      setAuthMode("signup-success-pending");
    } else {
      setAuthMode("login");
    }
  };

  // ── Zoom Meeting Launch (preserved exactly as original) ──
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
        userName: user.fullName || user.username || user.email.split('@')[0],
        userEmail: user.email,
        signature,
        sdkKey: sdkKey || import.meta.env.VITE_ZOOM_SDK_KEY || "YOUR_SDK_KEY"
      });
    } catch (err) {
      console.error("Failed to get Zoom signature", err);
      setError("Failed to start meeting. Please check your Zoom configuration.");
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="size-10 bg-primary rounded-xl flex items-center justify-center">
          <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
        <p className="text-text-muted text-sm font-bold">Loading EDU-LMS...</p>
      </div>
    );
  }

  // ── Auth screens ──
  if (!user) {
    if (authMode === "signup") {
      return (
        <SignupPage
          onBack={() => setAuthMode("login")}
          onSignupSuccess={handleSignupSuccess}
        />
      );
    }
    if (authMode === "signup-success-pending") {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center"
          >
            <div className="size-20 rounded-full bg-warning/15 border-2 border-warning/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={36} className="text-warning" />
            </div>
            <h1 className="text-2xl font-black mb-3">Application Submitted!</h1>
            <p className="text-text-muted text-sm mb-6">
              Your teacher account is pending admin approval. You'll be notified once it's reviewed.
            </p>
            <button
              onClick={() => setAuthMode("login")}
              className="btn-primary w-full"
            >
              Back to Login
            </button>
          </motion.div>
        </div>
      );
    }
    return <LoginPage onLogin={handleLogin} onSignupClick={() => setAuthMode("signup")} />;
  }

  // ── Awaiting Approval (TEACHER with PENDING status) ──
  if (user.role === 'TEACHER' && user.approvalStatus === 'PENDING') {
    return <AwaitingApprovalPage user={user} onLogout={handleLogout} />;
  }

  // ── Suspended account ──
  if (user.approvalStatus === 'SUSPENDED') {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="size-20 rounded-full bg-danger/15 border-2 border-danger/30 flex items-center justify-center mb-6">
          <AlertCircle size={36} className="text-danger" />
        </div>
        <h1 className="text-2xl font-black mb-2">Account Suspended</h1>
        <p className="text-text-muted text-sm mb-6">Your account has been suspended. Please contact the administrator.</p>
        <button onClick={handleLogout} className="btn-primary">Logout</button>
      </div>
    );
  }

  // ── Active Meeting (preserved exactly as original) ──
  if (activeMeeting) {
    return <ZoomMeetingSDK {...activeMeeting} />;
  }

  const renderContent = () => {
    // Settings tab is shared for all roles
    if (activeTab === 'settings') {
      return <SettingsPage user={user} onLogout={handleLogout} />;
    }
    if (user.role === 'ADMIN') {
      return <AdminDashboard user={user} dashboardData={dashboardData} token={token} activeTab={activeTab} setActiveTab={setActiveTab} />;
    }
    if (user.role === 'TEACHER') {
      return <TeacherDashboard user={user} dashboardData={dashboardData} startZoomMeeting={startZoomMeeting} activeTab={activeTab} setActiveTab={setActiveTab} token={token} />;
    }
    return <StudentDashboard user={user} dashboardData={dashboardData} startZoomMeeting={startZoomMeeting} activeTab={activeTab} setActiveTab={setActiveTab} token={token} />;
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={handleLogout}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3.5 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center gap-3 text-sm font-bold"
          >
            <AlertCircle size={18} className="shrink-0" />
            <p className="flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-danger/60 hover:text-danger text-lg leading-none">×</button>
          </motion.div>
        )}
      </AnimatePresence>
      {renderContent()}
    </DashboardLayout>
  );
}

