import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  User, 
  Mail, 
  HelpCircle, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { UserAccount } from '../types';
import { GUEST_HOUSE_INFO } from '../data/initialData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'reset'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Signup form state
  const [signupFullName, setSignupFullName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupConfirmEmail, setSignupConfirmEmail] = useState('');
  const [signupSecurityQ1, setSignupSecurityQ1] = useState('What was the name of your first elementary school?');
  const [signupSecurityA1, setSignupSecurityA1] = useState('');
  const [signupSecurityQ2, setSignupSecurityQ2] = useState('What is your favorite travel destination along the Garden Route?');
  const [signupSecurityA2, setSignupSecurityA2] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Reset form state
  const [resetUsernameOrEmail, setResetUsernameOrEmail] = useState('');
  const [resetSecurityA1, setResetSecurityA1] = useState('');
  const [resetSecurityA2, setResetSecurityA2] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const u = loginUsername.trim().toLowerCase();
    const p = loginPassword.trim();

    if (u === 'admin' && p === 'admin') {
      const adminUser: UserAccount = {
        id: 'usr-admin',
        fullName: 'Executive Administrator',
        username: 'admin',
        email: GUEST_HOUSE_INFO.adminEmail,
        role: 'admin',
        securityQuestion1: 'What was your first childhood pet?',
        securityAnswer1: 'Lagoon',
        securityQuestion2: 'What is your favorite travel destination?',
        securityAnswer2: 'Knysna'
      };
      onLoginSuccess(adminUser);
      onClose();
      return;
    }

    if (u === 'guest' && p === 'guest') {
      const guestUser: UserAccount = {
        id: 'usr-guest',
        fullName: 'Guest Trial Explorer',
        username: 'guest',
        email: 'guest.trial@tidesofknysna.co.za',
        role: 'guest',
        securityQuestion1: 'What was your first school?',
        securityAnswer1: 'Knysna Primary',
        securityQuestion2: 'What is your favorite travel destination?',
        securityAnswer2: 'The Heads'
      };
      onLoginSuccess(guestUser);
      onClose();
      return;
    }

    // Check custom signed up user in localStorage
    const savedUsers = JSON.parse(localStorage.getItem('tok_users') || '[]');
    const found = savedUsers.find((user: any) => user.username.toLowerCase() === u && user.password === p);

    if (found) {
      onLoginSuccess({
        id: found.id,
        fullName: found.fullName,
        username: found.username,
        email: found.email,
        role: 'staff',
        securityQuestion1: found.securityQuestion1,
        securityAnswer1: found.securityAnswer1,
        securityQuestion2: found.securityQuestion2,
        securityAnswer2: found.securityAnswer2
      });
      onClose();
    } else {
      setLoginError('Invalid username or password. For trial, use guest / guest, or admin / admin.');
    }
  };

  const handleQuickGuest = () => {
    setLoginUsername('guest');
    setLoginPassword('guest');
    const guestUser: UserAccount = {
      id: 'usr-guest',
      fullName: 'Guest Trial User',
      username: 'guest',
      email: 'guest.trial@tidesofknysna.co.za',
      role: 'guest',
      securityQuestion1: 'First school?',
      securityAnswer1: 'Knysna',
      securityQuestion2: 'Favorite destination?',
      securityAnswer2: 'Knysna Lagoon'
    };
    onLoginSuccess(guestUser);
    onClose();
  };

  const handleQuickAdmin = () => {
    setLoginUsername('admin');
    setLoginPassword('admin');
    const adminUser: UserAccount = {
      id: 'usr-admin',
      fullName: 'Executive Administrator',
      username: 'admin',
      email: GUEST_HOUSE_INFO.adminEmail,
      role: 'admin',
      securityQuestion1: 'First pet?',
      securityAnswer1: 'Lagoon',
      securityQuestion2: 'Favorite destination?',
      securityAnswer2: 'Knysna'
    };
    onLoginSuccess(adminUser);
    onClose();
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (signupEmail.trim().toLowerCase() !== signupConfirmEmail.trim().toLowerCase()) {
      setSignupError('Email Address and Confirm Email Address must match exactly.');
      return;
    }

    if (!signupSecurityA1.trim() || !signupSecurityA2.trim()) {
      setSignupError('Please provide answers for both Security Questions (2 off).');
      return;
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      fullName: signupFullName,
      username: signupUsername,
      password: signupPassword,
      email: signupEmail,
      securityQuestion1: signupSecurityQ1,
      securityAnswer1: signupSecurityA1,
      securityQuestion2: signupSecurityQ2,
      securityAnswer2: signupSecurityA2,
      role: 'staff'
    };

    const savedUsers = JSON.parse(localStorage.getItem('tok_users') || '[]');
    savedUsers.push(newUser);
    localStorage.setItem('tok_users', JSON.stringify(savedUsers));

    setSignupSuccess(true);
    setTimeout(() => {
      onLoginSuccess({
        id: newUser.id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        role: 'staff',
        securityQuestion1: newUser.securityQuestion1,
        securityAnswer1: newUser.securityAnswer1,
        securityQuestion2: newUser.securityQuestion2,
        securityAnswer2: newUser.securityAnswer2
      });
      onClose();
    }, 1200);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('New password and confirmation must match.');
      return;
    }

    if (!resetSecurityA1 || !resetSecurityA2) {
      setResetError('Please answer both security questions to verify identity.');
      return;
    }

    // In trial mode, allow reset verification
    setResetMessage('Password reset successfully verified! You may now sign in with your new password.');
    setTimeout(() => {
      setActiveTab('login');
      setLoginUsername(resetUsernameOrEmail);
      setLoginPassword(resetNewPassword);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative my-8 animate-scale-up">
        {/* Close Button */}
        <button 
          onClick={onClose}
          id="btn-close-auth"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Header with luxury branding */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 text-white text-center border-b border-emerald-500/30">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg mb-2.5">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-emerald-300">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <h2 className="font-serif-luxury text-lg font-bold tracking-wide text-white">
            {GUEST_HOUSE_INFO.name}
          </h2>
          <p className="text-xs text-emerald-400 italic">
            "{GUEST_HOUSE_INFO.tagline}"
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'login'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In / Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'signup'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Signup / Join Up Here
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'reset'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Reset Password
          </button>
        </div>

        {/* Form Container */}
        <div className="p-6">
          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs flex items-center gap-2 border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* 1-Click Trial Quick Login buttons */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 space-y-2">
                <span className="text-[11px] font-bold text-emerald-900 block uppercase tracking-wider">
                  Instant Trial Access:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleQuickGuest}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Guest Account (guest / guest)
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickAdmin}
                    className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-emerald-300 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm border border-slate-700"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin Account (admin / admin)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="e.g. guest or admin"
                    className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reset')}
                    className="text-[11px] text-emerald-700 hover:underline"
                  >
                    Please reset my password
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-md flex items-center justify-center gap-2"
              >
                Sign In to Reservation Suite
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">Don't have an account yet? </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  Join Up Here
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SIGNUP / JOIN UP HERE */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
              {signupError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs flex items-center gap-2 border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{signupError}</span>
                </div>
              )}

              {signupSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Account registered successfully! Logging you in...</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={signupFullName}
                  onChange={(e) => setSignupFullName(e.target.value)}
                  placeholder="e.g. Catherine Marais"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    placeholder="e.g. cmarais"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="catherine@example.com"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Email Address</label>
                <input
                  type="email"
                  required
                  value={signupConfirmEmail}
                  onChange={(e) => setSignupConfirmEmail(e.target.value)}
                  placeholder="catherine@example.com"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Security Questions 2 off */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Security Questions (2 required for password recovery)
                </span>

                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Security Question 1</label>
                  <select
                    value={signupSecurityQ1}
                    onChange={(e) => setSignupSecurityQ1(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg mb-1.5 bg-white"
                  >
                    <option value="What was the name of your first elementary school?">What was the name of your first elementary school?</option>
                    <option value="What was the name of your first childhood pet?">What was the name of your first childhood pet?</option>
                    <option value="In what city or town did your parents meet?">In what city or town did your parents meet?</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={signupSecurityA1}
                    onChange={(e) => setSignupSecurityA1(e.target.value)}
                    placeholder="Your answer to Question 1"
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Security Question 2</label>
                  <select
                    value={signupSecurityQ2}
                    onChange={(e) => setSignupSecurityQ2(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg mb-1.5 bg-white"
                  >
                    <option value="What is your favorite travel destination along the Garden Route?">What is your favorite travel destination along the Garden Route?</option>
                    <option value="What was the model of your first car?">What was the model of your first car?</option>
                    <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={signupSecurityA2}
                    onChange={(e) => setSignupSecurityA2(e.target.value)}
                    placeholder="Your answer to Question 2"
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-md"
              >
                Create Account & Join Up Here
              </button>
            </form>
          )}

          {/* TAB 3: RESET PASSWORD */}
          {activeTab === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              {resetError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs flex items-center gap-2 border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetMessage && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{resetMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Enter Username or Email Address</label>
                <input
                  type="text"
                  required
                  value={resetUsernameOrEmail}
                  onChange={(e) => setResetUsernameOrEmail(e.target.value)}
                  placeholder="e.g. guest or your email"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  Verify Security Answers (2 off):
                </span>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Answer to Security Question 1</label>
                  <input
                    type="text"
                    required
                    value={resetSecurityA1}
                    onChange={(e) => setResetSecurityA1(e.target.value)}
                    placeholder="Enter answer (e.g. Lagoon or school name)"
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Answer to Security Question 2</label>
                  <input
                    type="text"
                    required
                    value={resetSecurityA2}
                    onChange={(e) => setResetSecurityA2(e.target.value)}
                    placeholder="Enter answer (e.g. Knysna)"
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-md"
              >
                Reset Password & Verify
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs text-slate-600 hover:text-emerald-700"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
