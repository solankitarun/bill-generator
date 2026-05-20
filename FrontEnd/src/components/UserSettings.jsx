import React, { useState } from 'react'
import api from '../api'
import { motion } from 'framer-motion'
import { 
  User, 
  Shield, 
  Lock, 
  Key, 
  CheckCircle, 
  Info, 
  ShieldCheck,
  Save,
  Fingerprint
} from 'lucide-react'

export default function UserSettings({ username, setAlert }) {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [saving, setSaving] = useState(false)

    const handleChangePassword = async (e) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            return setAlert({ show: true, message: 'New passwords do not match' })
        }

        setSaving(true)
        try {
            await api.post('/change-password', {
                username,
                currentPassword,
                newPassword
            })
            setAlert({ show: true, message: 'Password changed successfully!' })
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err) {
            console.error(err)
            setAlert({ show: true, message: err.response?.data?.message || 'Failed to change password' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-3 px-2">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Fingerprint className="w-7 h-7" />
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Account Security</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Manage credentials and profile access.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Overview */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                <User className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">Profile Details</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Username</p>
                                <p className="text-slate-900 dark:text-white font-bold text-sm">{username}</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Access Level</p>
                                <p className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2 text-sm">
                                    <ShieldCheck className="w-4 h-4" /> System Admin
                                </p>
                            </div>
                            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Account Status</p>
                                <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4" /> Verified & Active
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                        <div className="flex gap-3">
                            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1">Security Tip</h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    Rotate your password every 90 days for better protection.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Change Form */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Update Password</h3>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                                    <div className="relative group">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-bold"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                                    <div className="relative group">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-5 border-t border-slate-100 dark:border-white/5 flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="premium-button flex items-center gap-2 px-8 py-3 font-black text-[10px] uppercase tracking-widest"
                                >
                                    {saving ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Update Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
