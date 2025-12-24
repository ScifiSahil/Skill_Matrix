import React, { useState } from 'react';
import { useAuthStore } from '../../reducers/authStore';
import { useUIStore } from '../../reducers/uiStore';
import { LogIn, User, Lock, Target, Shield, Users, BarChart3, TrendingUp } from 'lucide-react';

const Login = () => {
  const { login, loading, error } = useAuthStore();
  const { addNotification } = useUIStore();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [focusedInput, setFocusedInput] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(credentials);
    
    if (result.success) {
      addNotification({
        type: 'success',
        message: 'Login successful! Welcome back.'
      });
    } else {
      addNotification({
        type: 'error',
        message: result.error || 'Login failed. Please check your credentials.'
      });
    }
  };
  
  const quickLogin = (role) => {
    const emails = {
      user: 'user@ktf.com',
      hr: 'hr@ktf.com',
      admin: 'admin@ktf.com'
    };
    
    setCredentials({ email: emails[role], password: 'password' });
  };

  const roles = [
    { id: 'user', icon: User, label: 'User', color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'hr', icon: Users, label: 'HR', color: 'bg-green-500 hover:bg-green-600' },
    { id: 'admin', icon: Shield, label: 'Admin', color: 'bg-purple-500 hover:bg-purple-600' },
  ];
  
  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Animated Gradient Wave Background */}
      <div className="w-full md:w-1/2 relative overflow-hidden min-h-screen">
        {/* Animated SVG Background */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }}>
                <animate attributeName="stop-color" values="#667eea; #764ba2; #f093fb; #667eea" dur="8s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 1 }}>
                <animate attributeName="stop-color" values="#764ba2; #f093fb; #4facfe; #764ba2" dur="8s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
            
            <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#f093fb', stopOpacity: 1 }}>
                <animate attributeName="stop-color" values="#f093fb; #4facfe; #00f2fe; #f093fb" dur="10s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" style={{ stopColor: '#f5576c', stopOpacity: 1 }}>
                <animate attributeName="stop-color" values="#f5576c; #667eea; #764ba2; #f5576c" dur="10s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>
          
          {/* Base gradient */}
          <rect width="100%" height="100%" fill="url(#gradient1)" />
          
          {/* Animated Wave Layer 1 */}
          <path fill="url(#gradient2)" fillOpacity="0.7">
            <animate attributeName="d" dur="20s" repeatCount="indefinite"
              values="
                M0,300 Q360,150 720,300 T1440,300 L1440,900 L0,900 Z;
                M0,300 Q360,450 720,300 T1440,300 L1440,900 L0,900 Z;
                M0,300 Q360,150 720,300 T1440,300 L1440,900 L0,900 Z
              "
            />
          </path>
          
          {/* Animated Wave Layer 2 */}
          <path fill="rgba(255,255,255,0.1)">
            <animate attributeName="d" dur="15s" repeatCount="indefinite"
              values="
                M0,450 Q360,350 720,450 T1440,450 L1440,900 L0,900 Z;
                M0,450 Q360,550 720,450 T1440,450 L1440,900 L0,900 Z;
                M0,450 Q360,350 720,450 T1440,450 L1440,900 L0,900 Z
              "
            />
          </path>
          
          {/* Animated Wave Layer 3 */}
          <path fill="rgba(255,255,255,0.05)">
            <animate attributeName="d" dur="25s" repeatCount="indefinite"
              values="
                M0,600 Q360,500 720,600 T1440,600 L1440,900 L0,900 Z;
                M0,600 Q360,700 720,600 T1440,600 L1440,900 L0,900 Z;
                M0,600 Q360,500 720,600 T1440,600 L1440,900 L0,900 Z
              "
            />
          </path>
        </svg>

        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-40 right-32 w-56 h-56 bg-white/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float-slow"></div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-16 text-white">
          <div className="text-center space-y-8">
            <div className="inline-block p-6 bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl">
              <Target className="w-20 h-20" />
            </div>
            <h1 className="text-6xl font-black leading-tight">
              Kalyani Technoforge
            </h1>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-white/95">
                Digital Skill Matrix System
              </h2>
              <p className="text-xl text-white/90 font-light tracking-wide">
                Empower Your Workforce with Intelligent Insights
              </p>
            </div>
            
            {/* Taglines */}
            <div className="space-y-2 pt-4">
              <p className="text-lg text-white/85 font-medium">
                📊 Track Skills • 📈 Measure Growth • 🎯 Achieve Excellence
              </p>
              <p className="text-base text-white/75 italic">
                "Where Talent Meets Technology"
              </p>
            </div>

            {/* Features Highlight */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold">Real-time Analytics</p>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold">Team Management</p>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold">Skill Growth</p>
              </div>
            </div>

            <div className="pt-6">
              <p className="text-sm text-white/70">
                www.kalyanitechnoforge.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - White Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white absolute md:relative inset-0 md:inset-auto">
        <div className="w-full max-w-md bg-white rounded-2xl md:rounded-none p-8 md:p-0 shadow-2xl md:shadow-none">
          {/* Mobile Logo */}
          <div className="text-center mb-12 md:hidden">
            <div className="inline-block p-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <Target className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-800">Kalyani Technoforge</h1>
          </div>

          <div className="space-y-8">
            {/* Header */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Hello !</p>
              <h2 className="text-4xl font-black text-gray-900 mb-2">Good Morning</h2>
              <p className="text-gray-700 text-lg">
                <span className="text-blue-600 font-bold">Login</span> Your Account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  autoComplete="email"
                  className={`w-full px-0 py-3 bg-transparent border-b-2 transition-colors duration-200 outline-none text-gray-800 placeholder-gray-400 ${
                    focusedInput === 'email' ? 'border-blue-600' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  autoComplete="current-password"
                  className={`w-full px-0 py-3 bg-transparent border-b-2 transition-colors duration-200 outline-none text-gray-800 placeholder-gray-400 ${
                    focusedInput === 'password' ? 'border-blue-600' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded" />
                  <span className="text-sm text-gray-700">Remember</span>
                </label>
                <button type="button" className="text-sm text-blue-600 hover:underline font-semibold">
                  Forgot Password?
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded animate-shake">
                  <p className="text-sm font-semibold">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  'SUBMIT'
                )}
              </button>
            </form>

            {/* Demo Info */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Demo Access: Use quick login buttons below</p>
            </div>

            {/* Quick Access */}
            <div>
              <p className="text-center text-sm font-semibold text-gray-700 mb-4">
                Quick Access (Demo)
              </p>
              <div className="grid grid-cols-3 gap-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => quickLogin(role.id)}
                    className={`${role.color} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95`}
                  >
                    <role.icon className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold text-sm">{role.label}</p>
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-gray-600 mt-4">
                Password for all: <span className="text-red-500 font-mono font-bold">password</span>
              </p>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-500 pt-4">
              © 2025 Kalyani Technoforge Ltd.
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-30px) translateX(20px);
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 10s ease-in-out infinite;
          animation-delay: 2s;
        }

        .animate-float-slow {
          animation: float 12s ease-in-out infinite;
          animation-delay: 4s;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}} />
    </div>
  );
};

export default Login;