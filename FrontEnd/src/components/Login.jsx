import React, { useState } from 'react'
import api from '../api'
import Background from './Background'
import { motion } from 'framer-motion'
import { 
  Droplets, 
  Lock, 
  User, 
  ArrowRight,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react'

export default function Login({ onLogin, isDarkMode, setIsDarkMode }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const [isResetMode, setIsResetMode] = useState(false)
    const [masterKey, setMasterKey] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [loginResponse, setLoginResponse] = useState(null)
    const [showProfileSelector, setShowProfileSelector] = useState(false)
    const [selectedProfile, setSelectedProfile] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            if (isResetMode) {
                const res = await api.post('/reset-password', { username, masterKey, newPassword })
                setSuccess(res.data.message)
                setTimeout(() => {
                    setIsResetMode(false)
                    setPassword('')
                    setSuccess('')
                }, 2000)
            } else {
                const res = await api.post('/login', { username, password })
                if (res.data.message === 'Login successful') {
                    const { profiles } = res.data
                    if (profiles && profiles.length > 1) {
                        setLoginResponse(res.data)
                        setShowProfileSelector(true)
                        setSelectedProfile(profiles[0])
                        setLoading(false)
                    } else {
                        const defaultProfile = profiles && profiles.length === 1 ? profiles[0] : 'User'
                        onLogin({
                            ...res.data,
                            selectedProfile: defaultProfile
                        })
                    }
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || (isResetMode ? 'Reset failed' : 'Login failed'))
        } finally {
            setLoading(false)
        }
    }

    const handleConfirmProfile = (e) => {
        e.preventDefault()
        if (!selectedProfile) return
        onLogin({
            ...loginResponse,
            selectedProfile
        })
    }

    if (showProfileSelector && loginResponse) {
        return (
            <div className="min-h-screen flex items-center justify-center relative p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                <Background isDarkMode={isDarkMode} />
                
                {/* Theme Switcher - Top Right */}
                <div className="absolute top-6 right-6 z-50">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all active:scale-95"
                        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md"
                >
                    <div className="glass-card p-8 lg:p-12 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-emerald-500" />
                        
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-600 shadow-[0_0_40px_rgba(79,70,229,0.4)] mb-2">
                                <ShieldCheck className="text-white w-10 h-10 animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors">Select Profile</h1>
                                <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1 text-sm">
                                    You have multiple profiles assigned. Please choose one to sign in.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleConfirmProfile} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-widest transition-colors">Choose Workspace Role</label>
                                
                                <div className="relative group">
                                    <select
                                        value={selectedProfile}
                                        onChange={(e) => setSelectedProfile(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-sm cursor-pointer appearance-none"
                                    >
                                        {loginResponse.profiles.map(p => (
                                            <option key={p} value={p} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">
                                                {p} Mode
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ArrowRight className="w-4 h-4 rotate-90" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    {loginResponse.profiles.map((p) => (
                                        <div
                                            key={p}
                                            onClick={() => setSelectedProfile(p)}
                                            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 text-center flex flex-col items-center gap-2 ${
                                                selectedProfile === p
                                                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-lg shadow-indigo-500/10 scale-105'
                                                    : 'bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            <div className={`p-2 rounded-xl transition-colors ${selectedProfile === p ? 'bg-indigo-500/20' : 'bg-slate-100 dark:bg-white/5'}`}>
                                                {p === 'Admin' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-wider">{p}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="premium-button w-full flex items-center justify-center gap-3 py-3 text-sm font-bold group bg-indigo-600 hover:bg-indigo-500 text-white"
                            >
                                Continue to Dashboard
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowProfileSelector(false)
                                    setLoginResponse(null)
                                }}
                                className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all uppercase tracking-widest"
                            >
                                Back to login
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Background isDarkMode={isDarkMode} />
            
            {/* Theme Switcher - Top Right */}
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all active:scale-95"
                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <div className="glass-card p-8 lg:p-12 space-y-8 relative overflow-hidden">
                    {/* Decorative Top Accent */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-blue-500" />
                    
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-600 shadow-[0_0_40px_rgba(79,70,229,0.4)] mb-2">
                            <Droplets className="text-white w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors">FreshWash</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide transition-colors">
                                {isResetMode ? 'Security Recovery' : 'Enterprise Bill Generator'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-widest transition-colors">Username</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username"
                                    className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-50 dark:focus:bg-slate-900 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {!isResetMode ? (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">Password</label>
                                    <button 
                                        type="button"
                                        onClick={() => setIsResetMode(true)}
                                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors uppercase tracking-widest"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-50 dark:focus:bg-slate-900 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                                        required
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-widest transition-colors">Master Reset Key</label>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="password"
                                            value={masterKey}
                                            onChange={(e) => setMasterKey(e.target.value)}
                                            placeholder="Emergency Key"
                                            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-50 dark:focus:bg-slate-900 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-widest transition-colors">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-50 dark:focus:bg-slate-900 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setIsResetMode(false)}
                                    className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-widest block w-full text-center"
                                >
                                    Back to Sign In
                                </button>
                            </>
                        )}

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-3 transition-colors"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                {error}
                            </motion.div>
                        )}

                        {success && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-3 transition-colors"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {success}
                            </motion.div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="premium-button w-full flex items-center justify-center gap-3 py-3 text-sm font-bold group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isResetMode ? 'Confirm Reset' : 'Sign In'}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-6 border-t border-slate-200 dark:border-white/5 flex items-center justify-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest transition-colors">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        Secure Access
                    </div>
                </div>
                
                <p className="mt-8 text-center text-slate-500 text-sm transition-colors">
                    © 2026 FreshWash Systems. All rights reserved.
                </p>
            </motion.div>
        </div>
    )
}
