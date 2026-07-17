import React, { useState } from "react";
import { Lock, User, Activity, AlertCircle, Eye, EyeOff } from "lucide-react";
import { api } from "../services/api";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const data = await api.auth.login(username.trim(), password);
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4">
      {/* Container Card */}
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 card-shadow-lg space-y-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          <div className="p-3.5 bg-gradient-to-tr from-teal-500 to-indigo-600 text-white rounded-2xl shadow-md">
            <Activity className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800 uppercase">CARE CLINIC HMS</h1>
            <p className="text-xs text-slate-500 font-medium">Health Management System Clinician Portal</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 smooth-transition bg-white text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 smooth-transition bg-white text-slate-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md hover:shadow-lg smooth-transition flex items-center justify-center gap-2"
          >
            {loading ? "Authenticating..." : "Access Clinician Portal"}
          </button>
        </form>

        {/* Presentation Hints Box */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 space-y-2">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Presentation Credentials</span>
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Username: <code className="text-teal-600 bg-white px-1.5 py-0.5 rounded border border-slate-100">admin</code></span>
            <span>Password: <code className="text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-slate-100">password</code></span>
          </div>
        </div>

      </div>
    </div>
  );
}
