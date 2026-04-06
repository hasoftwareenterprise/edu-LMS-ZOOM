import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Clock, Mail, RefreshCw } from 'lucide-react';

interface AwaitingApprovalPageProps {
  user: any;
  onLogout: () => void;
}

export default function AwaitingApprovalPage({ user, onLogout }: AwaitingApprovalPageProps) {
  const displayName = user?.fullName || user?.username || user?.email?.split('@')[0] || 'Teacher';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md text-center"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="text-white font-black text-xl tracking-tight">EDU-LMS</span>
        </div>

        {/* Icon */}
        <div className="size-24 rounded-full bg-warning/15 border-2 border-warning/30 flex items-center justify-center mx-auto mb-6">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <Clock size={40} className="text-warning" />
          </motion.div>
        </div>

        {/* Content */}
        <h1 className="text-2xl font-black mb-3">Awaiting Approval</h1>
        <p className="text-text-muted mb-2">
          Hi <span className="text-text-main font-bold">{displayName}</span>,
        </p>
        <p className="text-text-muted text-sm leading-relaxed mb-8">
          Your teacher account has been successfully created and is currently
          <span className="text-warning font-bold"> pending admin review</span>.
          You'll receive access once an administrator approves your application.
        </p>

        {/* Status Card */}
        <div className="card mb-6 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-8 rounded-lg bg-warning/15 flex items-center justify-center">
              <Clock size={16} className="text-warning" />
            </div>
            <div>
              <p className="font-bold text-sm">Application Submitted</p>
              <p className="text-text-muted text-xs">Under admin review</p>
            </div>
            <div className="ml-auto badge-warning">Pending</div>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-text-muted">
              <span className="size-5 rounded-full bg-success/15 text-success flex items-center justify-center text-xs">✓</span>
              Account created successfully
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <span className="size-5 rounded-full bg-warning/15 text-warning flex items-center justify-center text-xs">⏳</span>
              Profile review by admin
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <span className="size-5 rounded-full bg-white/10 flex items-center justify-center text-xs">○</span>
              Dashboard access granted
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-4 rounded-xl bg-surface border border-border mb-8 flex gap-3 text-left">
          <Mail size={18} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm mb-0.5">Need help?</p>
            <p className="text-text-muted text-xs">Contact your institute administrator to expedite your approval. You can also try logging in again later — your credentials are saved.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.reload()}
            className="btn-ghost flex-1 flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} />
            Check Again
          </button>
          <button
            onClick={onLogout}
            className="btn-primary flex-1"
          >
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
}
