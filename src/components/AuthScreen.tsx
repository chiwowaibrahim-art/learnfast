import React, { useState } from 'react';
import { UserProfile, ClassLevel } from '../types';
import { ShieldCheck, UserPlus, LogIn, ChevronLeft, School } from 'lucide-react';

interface AuthScreenProps {
  onBack: () => void;
  onSuccess: (profile: UserProfile) => void;
}

export default function AuthScreen({ onBack, onSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Dummy Initial User data for testing and quick logins
  const [phone, setPhone] = useState('0888123456');
  const [pin, setPin] = useState('1234');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<ClassLevel>('Form 1');
  const [school, setSchool] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Built-in dummy users inside memory for seamless user testing
  const DUMMY_USERS: UserProfile[] = [
    {
      name: 'Chisomo Phiri',
      phone: '0888123456',
      pin: '1234',
      grade: 'Form 2',
      school: 'Chichiri Secondary School'
    },
    {
      name: 'Tamandani Banda',
      phone: '0999876543',
      pin: '0000',
      grade: 'Form 4',
      school: 'Dedza Secondary School'
    }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !pin) {
      setErrorMsg('Please enter both your Phone Number and PIN.');
      return;
    }

    // Try finding in our defaults or localStorage
    const saved = localStorage.getItem(`user_${phone}`);
    let user: UserProfile | undefined;

    if (saved) {
      user = JSON.parse(saved);
    } else {
      user = DUMMY_USERS.find(u => u.phone === phone);
    }

    if (user && user.pin === pin) {
      onSuccess(user);
    } else if (phone === '0888123456' && pin === '1234') {
      // Fallback for default
      onSuccess(DUMMY_USERS[0]);
    } else {
      setErrorMsg('Invalid phone number or PIN. Try using dummy credentials (0888123456 with PIN 1234).');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !pin || !school) {
      setErrorMsg('Please complete all fields to register.');
      return;
    }

    const newProfile: UserProfile = {
      name,
      phone,
      pin,
      grade,
      school
    };

    localStorage.setItem(`user_${phone}`, JSON.stringify(newProfile));
    onSuccess(newProfile);
  };

  const handleQuickDemo = (index: number) => {
    const user = DUMMY_USERS[index];
    setPhone(user.phone);
    setPin(user.pin);
    setName(user.name);
    setSchool(user.school);
    setGrade(user.grade);
    setIsLogin(true);
    onSuccess(user);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-center px-4 py-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Back Link */}
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-indigo-600 transition-colors text-sm font-semibold cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </button>

        {/* Auth Glass Card */}
        <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-2xl space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold font-sans tracking-tight text-slate-900" id="auth-app-title">LearnFast Account</h1>
            <p className="text-sm text-slate-500">
              {isLogin ? 'Enter your details to sign in and start studying' : 'Create an account to track your learning progress'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => { setIsLogin(true); setErrorMsg(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                isLogin ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-550 hover:text-slate-900'
              }`}
              id="tab-login"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Login</span>
            </button>
            <button
              onClick={() => { setIsLogin(false); setErrorMsg(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                !isLogin ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-550 hover:text-slate-900'
              }`}
              id="tab-register"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Register</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chisomo Phiri"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-205 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50 transition-colors"
                  id="reg-name"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number (Airtel / TNM)</label>
              <input
                type="tel"
                placeholder="e.g. 0888123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-205 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50 transition-colors"
                id="auth-phone"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">4-Digit Security PIN</label>
              <input
                type="password"
                maxLength={4}
                placeholder="PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-205 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50 transition-colors font-mono"
                id="auth-pin"
              />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Class Form (Grade)</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as ClassLevel)}
                    className="w-full px-3.5 py-2.5 border border-slate-205 rounded-xl bg-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    id="reg-grade"
                  >
                    <option value="Form 1">Form 1 (JCE Syllabus)</option>
                    <option value="Form 2">Form 2 (JCE Syllabus)</option>
                    <option value="Form 3">Form 3 (MSCE Syllabus)</option>
                    <option value="Form 4">Form 4 (MSCE Syllabus)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Secondary School</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Blantyre Secondary School"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-205 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-slate-50/50"
                      id="reg-school"
                    />
                    <School className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-150 cursor-pointer"
              id="auth-submit-btn"
            >
              {isLogin ? 'Sign In to Assistant' : 'Create Student Profile'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          {isLogin && (
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest text-center">Quick Demo Accounts</h4>
              <div className="grid grid-cols-2 gap-3.5">
                <button
                  onClick={() => handleQuickDemo(0)}
                  className="p-3 text-left border border-slate-200 rounded-xl hover:border-indigo-600 bg-white hover:bg-slate-50 transition-all duration-200 cursor-pointer"
                  id="demo-user-1"
                >
                  <div className="font-bold text-indigo-900 text-xs truncate">Chisomo (Form 2)</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">PIN: 1234</div>
                </button>
                <button
                  onClick={() => handleQuickDemo(1)}
                  className="p-3 text-left border border-slate-200 rounded-xl hover:border-indigo-600 bg-white hover:bg-slate-50 transition-all duration-200 cursor-pointer"
                  id="demo-user-2"
                >
                  <div className="font-bold text-indigo-900 text-xs truncate">Tamandani (Form 4)</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">PIN: 0000</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
