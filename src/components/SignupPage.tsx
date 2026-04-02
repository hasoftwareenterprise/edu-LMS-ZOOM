"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Sparkles, ArrowLeft, Mail } from "lucide-react";
import { motion } from "framer-motion";

interface SignupPageProps {
  onBack: () => void;
  onSignupSuccess: () => void;
}

export default function SignupPage({ onBack, onSignupSuccess }: SignupPageProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, role: "STUDENT" }),
      });
      const data = await response.json();
      if (response.ok) {
        onSignupSuccess();
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Section - Branding */}
      <div className="relative hidden lg:flex flex-col justify-between bg-sidebar p-12 text-white overflow-hidden">
        <div className="relative z-20">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="size-4 text-primary" />
            </div>
            <span className="tracking-tight font-black">EDU-LMS</span>
          </div>
        </div>

        <div className="relative z-20">
          <h2 className="text-5xl font-black tracking-tighter mb-6 leading-none">
            START YOUR <br />
            <span className="text-primary">LEARNING</span> <br />
            JOURNEY.
          </h2>
          <p className="text-white/40 max-w-md font-bold">
            Join thousands of students and start learning from the best instructors in the industry.
          </p>
        </div>

        <div className="relative z-20 flex items-center gap-8 text-sm text-white/40 font-bold">
          <span>© 2026 EDU-LMS</span>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 right-1/4 size-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Right Section - Form */}
      <div className="flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[420px]"
        >
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-8 font-bold text-sm"
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>

          <div className="mb-10">
            <h1 className="text-4xl font-black tracking-tighter mb-2">Create Account</h1>
            <p className="text-text-muted text-sm font-bold">Join the EDU-LMS community today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-bold text-text-main">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12 bg-white border-black/5 rounded-2xl focus:border-primary/30 transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-text-main">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-white border-black/5 rounded-2xl focus:border-primary/30 transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold text-text-main">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-white border-black/5 rounded-2xl focus:border-primary/30 transition-all shadow-sm"
              />
            </div>

            {error && (
              <div className="p-4 text-sm text-primary bg-primary/5 border border-primary/10 rounded-2xl font-bold">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-black bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6">
            <Button 
              variant="outline" 
              className="w-full h-12 border-black/5 rounded-2xl hover:bg-gray-50 transition-all font-bold"
              type="button"
            >
              <Mail className="mr-2 size-5" />
              Sign up with Google
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
