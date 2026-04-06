"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ArrowLeft, Eye, EyeOff, ChevronRight, User, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';
import axios from 'axios';

interface SignupPageProps {
  onBack: () => void;
  onSignupSuccess: (requiresApproval: boolean) => void;
}

type SignupRole = 'STUDENT' | 'TEACHER';

const RoleCard: React.FC<{
  role: SignupRole; selected: boolean; onClick: () => void;
  icon: React.ElementType; title: string; desc: string;
}> = ({ role, selected, onClick, icon: Icon, title, desc }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full p-6 h-full rounded-[2rem] border-2 text-left transition-all duration-300 group flex flex-col ${
      selected
        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5'
        : 'border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/5'
    }`}
  >
    <div className={`size-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${selected ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-white/5'}`}>
      <Icon size={24} className={selected ? 'text-white' : 'text-text-muted transition-colors group-hover:text-text-main'} />
    </div>
    <div className="flex-1">
        <p className={`font-black text-lg mb-1.5 ${selected ? 'text-white' : 'text-text-main transition-colors group-hover:text-white'}`}>{title}</p>
        <p className="text-text-muted text-xs leading-relaxed font-medium">{desc}</p>
    </div>
    {selected && (
      <div className="mt-4 flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-wider">
        <CheckCircle2 size={12} />
        Selected Role
      </div>
    )}
  </button>
);

const Field: React.FC<{
  label: string; name: string; type?: string; required?: boolean; optional?: string;
  value: string; onChange: (v: string) => void; placeholder?: string; options?: string[];
  rows?: number;
}> = ({ label, name, type = 'text', required, optional, value, onChange, placeholder, options, rows }) => (
  <div className="form-group mb-4 last:mb-0">
    <label htmlFor={name} className="form-label flex items-center gap-1.5 mb-1.5">
      {label}
      {required ? <span className="text-primary">*</span> : <span className="text-text-muted/40 font-bold lowercase text-[10px]">(optional)</span>}
    </label>
    {options ? (
      <select id={name} value={value} onChange={e => onChange(e.target.value)} className="w-full">
        <option value="">Select {label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : rows ? (
      <textarea
        id={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none py-3"
      />
    ) : (
      <input id={name} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full" />
    )}
  </div>
);

const PasswordField: React.FC<{ value: string; onChange: (v: string) => void; required?: boolean }> = ({ value, onChange, required }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="form-group">
      <label htmlFor="password" className="form-label">Password {required && <span className="text-primary">*</span>}</label>
      <div className="relative">
        <input
          id="password"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Min 6 characters"
          className="w-full pr-11"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
};

export default function SignupPage({ onBack, onSignupSuccess }: SignupPageProps) {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<SignupRole>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');

  // Teacher fields
  const [nicNumber, setNicNumber] = useState('');
  const [educationQualifications, setEducationQualifications] = useState('');
  const [zoomSdkKey, setZoomSdkKey] = useState('');
  const [zoomSdkSecret, setZoomSdkSecret] = useState('');
  const [zoomAccountId, setZoomAccountId] = useState('');
  const [zoomClientId, setZoomClientId] = useState('');
  const [zoomClientSecret, setZoomClientSecret] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [businessRegNo, setBusinessRegNo] = useState('');
  const [shortBio, setShortBio] = useState('');
  const [subjectSpecialization, setSubjectSpecialization] = useState('');

  // Student fields
  const [school, setSchool] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gradeYear, setGradeYear] = useState('');
  const [nicStudent, setNicStudent] = useState('');

  const handleMobileChange = (v: string) => {
    setMobileNumber(v);
    if (sameAsMobile) setWhatsappNumber(v);
  };
  const handleSameAsMobile = (checked: boolean) => {
    setSameAsMobile(checked);
    if (checked) setWhatsappNumber(mobileNumber);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim() || !mobileNumber.trim()) {
      setError('Please fill all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (selectedRole === 'TEACHER' && (!nicNumber.trim() || !educationQualifications.trim())) {
      setError('Please fill all required teacher fields.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        email, username, password, role: selectedRole,
        fullName, mobileNumber,
        whatsappNumber: sameAsMobile ? mobileNumber : whatsappNumber,
        profilePhotoUrl: profilePhotoUrl || null,
      };

      if (selectedRole === 'TEACHER') {
        Object.assign(payload, {
          nicNumber, educationQualifications,
          zoomSdkKey: zoomSdkKey || null,
          zoomSdkSecret: zoomSdkSecret || null,
          zoomAccountId: zoomAccountId || null,
          zoomClientId: zoomClientId || null,
          zoomClientSecret: zoomClientSecret || null,
          googleClientId: googleClientId || null,
          googleClientSecret: googleClientSecret || null,
          instituteName: instituteName || null,
          businessRegNo: businessRegNo || null,
          shortBio: shortBio || null,
          subjectSpecialization: subjectSpecialization || null,
        });
      } else {
        Object.assign(payload, {
          school: school || null,
          dateOfBirth: dateOfBirth || null,
          gradeYear: gradeYear || null,
          nicNumber: nicStudent || null,
        });
      }

      const res = await axios.post('/api/auth/signup', payload);
      onSignupSuccess(res.data.requiresApproval === true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background overflow-x-hidden overflow-y-scroll selection:bg-primary/30 selection:text-white">
      {/* Background patterns */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
          <div className="absolute -top-24 -left-24 size-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 -right-24 size-96 bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <header className="flex items-center justify-between px-6 sm:px-10 py-6 z-10 sticky top-0 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <Sparkles size={20} className="text-primary" />
          </div>
          <span className="font-black text-xl tracking-tight text-white uppercase italic">EDU-LMS</span>
        </div>
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-text-muted hover:text-white text-[10px] font-black uppercase tracking-widest transition-all group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          Protocol Exit
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center px-4 py-10 pb-40 z-10 w-full max-w-4xl mx-auto">
        <div className="w-full">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${step === 'role' ? 'bg-primary/10 border border-primary/20 text-white shadow-xl shadow-primary/5' : 'text-text-muted opacity-50'}`}>
              <span className={`size-7 rounded-xl flex items-center justify-center text-[10px] font-black ${step === 'role' ? 'bg-primary text-white shadow-lg' : 'bg-success text-white'}`}>
                {step === 'role' ? '01' : '✓'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Select Protocol</span>
            </div>
            <div className="h-px w-10 bg-white/10" />
            <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${step === 'form' ? 'bg-primary/10 border border-primary/20 text-white shadow-xl shadow-primary/5' : 'text-text-muted opacity-50'}`}>
              <span className={`size-7 rounded-xl flex items-center justify-center text-[10px] font-black ${step === 'form' ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-text-muted border border-white/10'}`}>
                02
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deployment Details</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 'role' && (
              <motion.div 
                key="role" 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -30 }}
                className="max-w-3xl mx-auto w-full"
              >
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white mb-3">Join the platform</h1>
                    <p className="text-text-muted font-medium">Choose your journey to high-quality education</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                  <RoleCard
                    role="STUDENT"
                    selected={selectedRole === 'STUDENT'}
                    onClick={() => setSelectedRole('STUDENT')}
                    icon={GraduationCap}
                    title="I am a Student"
                    desc="Enroll in professional courses, join live Zoom classes, and track your progress seamlessly."
                  />
                  <RoleCard
                    role="TEACHER"
                    selected={selectedRole === 'TEACHER'}
                    onClick={() => setSelectedRole('TEACHER')}
                    icon={BookOpen}
                    title="I am a Teacher"
                    desc="Publish your courses, schedule live meetings, and manage your student community with ease."
                  />
                </div>

                {selectedRole === 'TEACHER' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    className="glass p-5 rounded-[2rem] border-warning/20 mb-10 flex gap-4"
                  >
                    <div className="size-12 rounded-2xl bg-warning/10 flex items-center justify-center shrink-0 border border-warning/20">
                        <span className="text-xl">⏳</span>
                    </div>
                    <div>
                      <p className="text-warning font-black text-sm uppercase tracking-wider">Approval Required</p>
                      <p className="text-text-muted text-xs leading-relaxed mt-1 font-medium italic">Our team reviews all teacher accounts within 24 hours to ensure high educational standards. Access is granted upon approval.</p>
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="h-8 px-6 text-[10px] font-black rounded-full bg-primary text-white hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex items-center gap-2 group uppercase tracking-[0.2em]"
                  >
                    Continue as {selectedRole === 'TEACHER' ? 'Teacher' : 'Student'}
                    <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                <p className="text-center text-text-muted text-sm mt-8 font-medium">
                  Already registered?{' '}
                  <button type="button" onClick={onBack} className="text-white font-black hover:text-primary underline-offset-4 hover:underline">Sign In Here</button>
                </p>
              </motion.div>
            )}

            {step === 'form' && (
              <motion.div 
                key="form" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto pb-24"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-white">{selectedRole === 'TEACHER' ? 'Expert Portfolio' : 'Student Profile'}</h2>
                    <p className="text-text-muted text-sm">Please fill in your details correctly</p>
                  </div>
                  <button type="button" onClick={() => setStep('role')} className="text-[10px] font-black uppercase text-primary tracking-widest hover:text-primary-hover flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 transition-all">
                    Change Role
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Common Basic Info */}
                  <div className="glass rounded-[2rem] p-8 border-white/5 relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <User size={64} className="text-white" />
                    </div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6">Identity & Contact</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">
                      <Field label="Full Name" name="fullName" required value={fullName} onChange={setFullName} placeholder="e.g. John Doe" />
                      <Field label="Username" name="username" required value={username} onChange={e => setUsername(e.toLowerCase().replace(/\s/g, ''))} placeholder="e.g. johndoe" />
                      <div className="sm:col-span-2">
                        <Field label="Email (Gmail Preferred)" name="email" type="email" required value={email} onChange={setEmail} placeholder="john@gmail.com" />
                      </div>
                      <PasswordField value={password} onChange={setPassword} required />
                      <Field label="Profile Photo URL" name="profilePhotoUrl" value={profilePhotoUrl} onChange={setProfilePhotoUrl} placeholder="https://..." />
                      
                      <div className="sm:col-span-2 h-px bg-white/5" />
                      
                      <Field label="Mobile Number" name="mobileNumber" type="tel" required value={mobileNumber} onChange={handleMobileChange} placeholder="+94 7X XXX XXXX" />
                      
                      <div className="form-group">
                        <label className="form-label mb-1.5">WhatsApp Number <span className="text-primary">*</span></label>
                        <input
                          type="tel"
                          value={sameAsMobile ? mobileNumber : whatsappNumber}
                          onChange={e => setWhatsappNumber(e.target.value)}
                          disabled={sameAsMobile}
                          placeholder="+94 7X XXX XXXX"
                          className="w-full"
                        />
                        <label className="flex items-center gap-2.5 mt-3 group cursor-pointer w-fit">
                          <input
                            type="checkbox"
                            className="size-4 rounded-lg accent-primary border-white/10 bg-white/5"
                            checked={sameAsMobile}
                            onChange={e => handleSameAsMobile(e.target.checked)}
                          />
                          <span className="text-xs text-text-muted font-bold group-hover:text-text-main transition-colors">Same as mobile number</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Teacher Fields */}
                  {selectedRole === 'TEACHER' && (
                    <div className="space-y-6">
                      <div className="glass rounded-[2rem] p-8 border-white/5">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6">Educational & Professional</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">
                          <Field label="NIC" name="nicNumber" required value={nicNumber} onChange={setNicNumber} placeholder="99XXXXXXXXXV" />
                          <Field label="Subject Specialization" name="subjectSpecialization" value={subjectSpecialization} onChange={setSubjectSpecialization} placeholder="e.g. Physics, Math" />
                          <Field label="Institute Name" name="instituteName" value={instituteName} onChange={setInstituteName} placeholder="Your institute" />
                          <Field label="Business Reg. No." name="businessRegNo" value={businessRegNo} onChange={setBusinessRegNo} placeholder="REG/2024/001" />
                          <div className="sm:col-span-2">
                            <Field label="Education Qualifications" name="educationQualifications" required value={educationQualifications} onChange={setEducationQualifications} rows={3} placeholder="Tell us about your degrees and achievements..." />
                          </div>
                          <div className="sm:col-span-2">
                            <Field label="Professional Bio" name="shortBio" value={shortBio} onChange={setShortBio} rows={2} placeholder="Brief intro for your profile..." />
                          </div>
                        </div>
                      </div>

                      <div className="glass rounded-[2rem] p-8 border-white/5 bg-primary/5">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">External Integration</p>
                            <span className="badge text-[9px] font-black bg-primary/20 text-primary uppercase px-2 py-0.5 rounded-md">Safety Sync</span>
                        </div>
                        <p className="text-xs text-text-muted mb-6 leading-relaxed">Optionally provide your integration keys. These are encrypted and allow the platform to automate class scheduling.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">
                          <Field label="ZOOM SDK Key" name="zoomSdkKey" value={zoomSdkKey} onChange={setZoomSdkKey} placeholder="Key" />
                          <Field label="ZOOM SDK Secret" name="zoomSdkSecret" type="password" value={zoomSdkSecret} onChange={setZoomSdkSecret} placeholder="Secret" />
                          <div className="sm:col-span-2 h-px bg-white/5" />
                          <Field label="Google Client ID" name="googleClientId" value={googleClientId} onChange={setGoogleClientId} placeholder="ID" />
                          <Field label="Google Client Secret" name="googleClientSecret" type="password" value={googleClientSecret} onChange={setGoogleClientSecret} placeholder="Secret" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Student Fields */}
                  {selectedRole === 'STUDENT' && (
                    <div className="glass rounded-[2rem] p-8 border-white/5">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6">Education Tracking</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">
                        <div className="sm:col-span-2">
                            <Field label="School / Institution" name="school" value={school} onChange={setSchool} placeholder="Name of your institution" />
                        </div>
                        <Field label="NIC (If available)" name="nicStudent" value={nicStudent} onChange={setNicStudent} placeholder="99XXXXXXV" />
                        <Field label="Date of Birth" name="dateOfBirth" type="date" value={dateOfBirth} onChange={setDateOfBirth} />
                        <div className="sm:col-span-2">
                            <Field
                                label="Current Grade / Year of Study"
                                name="gradeYear"
                                value={gradeYear}
                                onChange={setGradeYear}
                                options={['Grade 9','Grade 10','Grade 11','A/L Year 1','A/L Year 2','Undergraduate Year 1','Undergraduate Year 2','Undergraduate Year 3','Undergraduate Year 4','Postgraduate']}
                            />
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-[1.5rem] bg-danger/10 border border-danger/20 text-danger text-xs font-bold flex items-center gap-2 shadow-lg shadow-danger/5"
                    >
              <span className="size-2 bg-danger rounded-full animate-pulse" />
                      {error}
                    </motion.div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
                    <button 
                        type="button" 
                        onClick={() => setStep('role')} 
                        className="btn-ghost flex-1 py-4 text-xs font-black uppercase tracking-widest border border-white/10 rounded-[1.5rem] hover:bg-white/5"
                    >
                        Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-[2] py-4 text-sm font-black uppercase tracking-widest rounded-full relative group shadow-xl shadow-primary/20"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <User size={16} />
                          <span>{selectedRole === 'TEACHER' ? 'Submit Application' : 'Create My Account'}</span>
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="h-48 pointer-events-none" /> {/* Bottom Spacer for scrolling clearance */}

      {/* Sticky Footer Info */}
      <footer className="mt-auto px-6 py-12 text-center border-t border-white/5 w-full bg-background/50 backdrop-blur-md relative z-20">
            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] opacity-40">
                EDU-LMS Security Encrypted &bull; ISO 27001 Compliant &bull; 2024
            </p>
      </footer>
    </div>
  );
}
