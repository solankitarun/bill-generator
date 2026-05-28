import React, { useState, useEffect } from 'react'
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
  Fingerprint,
  Plus,
  Trash2,
  Users
} from 'lucide-react'

export default function UserSettings({ username, setAlert }) {
    // Current user password change states
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [saving, setSaving] = useState(false)

    // User management states
    const [usersList, setUsersList] = useState([])
    const [newUsername, setNewUsername] = useState('')
    const [newUserPassword, setNewUserPassword] = useState('')
    const [selectedNewProfiles, setSelectedNewProfiles] = useState(['User'])
    const [creatingUser, setCreatingUser] = useState(false)

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users')
            setUsersList(res.data)
        } catch (err) {
            console.error('Error fetching users:', err)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

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

    const handleCreateUser = async (e) => {
        e.preventDefault()
        if (selectedNewProfiles.length === 0) {
            return setAlert({ show: true, message: 'Please assign at least one profile!' })
        }

        setCreatingUser(true)
        try {
            await api.post('/users', {
                username: newUsername,
                password: newUserPassword,
                profiles: selectedNewProfiles
            })
            setAlert({ show: true, message: `User "${newUsername}" created successfully!` })
            setNewUsername('')
            setNewUserPassword('')
            setSelectedNewProfiles(['User'])
            fetchUsers()
        } catch (err) {
            console.error(err)
            setAlert({ show: true, message: err.response?.data?.message || 'Failed to create user' })
        } finally {
            setCreatingUser(false)
        }
    }

    const handleToggleProfile = (profile) => {
        if (selectedNewProfiles.includes(profile)) {
            setSelectedNewProfiles(selectedNewProfiles.filter(p => p !== profile))
        } else {
            setSelectedNewProfiles([...selectedNewProfiles, profile])
        }
    }

    const handleDeleteUser = async (userId, usernameToDelete) => {
        if (usernameToDelete === username) {
            return setAlert({ show: true, message: 'You cannot delete your own logged-in account!' })
        }

        if (!window.confirm(`Are you sure you want to delete user "${usernameToDelete}"?`)) {
            return
        }

        try {
            await api.delete(`/users/${userId}`)
            setAlert({ show: true, message: `User "${usernameToDelete}" deleted successfully!` })
            fetchUsers()
        } catch (err) {
            console.error(err)
            setAlert({ show: true, message: err.response?.data?.message || 'Failed to delete user' })
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-10"
        >
            <div className="flex items-center gap-3 px-2">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Fingerprint className="w-7 h-7" />
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Account & User Settings</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Manage credentials, roles, and profile access.</p>
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
                                <h4 className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1">Workspace Tip</h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    Admins have full workspace module privileges, while User profiles are restricted from accessing settings.
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

            {/* User Management Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                {/* Create User Form */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                <Plus className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Create User</h3>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Username</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={e => setNewUsername(e.target.value)}
                                        placeholder="john_doe"
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xs font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="password"
                                        value={newUserPassword}
                                        onChange={e => setNewUserPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xs font-bold"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Assign Profiles</label>
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    {['Admin', 'User'].map((profile) => {
                                        const isSelected = selectedNewProfiles.includes(profile)
                                        return (
                                            <div
                                                key={profile}
                                                onClick={() => handleToggleProfile(profile)}
                                                className={`p-3 rounded-xl border cursor-pointer text-center font-bold text-xs transition-all duration-200 ${
                                                    isSelected
                                                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-md'
                                                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'
                                                }`}
                                            >
                                                {profile}
                                            </div>
                                        )
                                    })}
                                </div>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 ml-1 leading-relaxed">
                                    You can assign one or both profiles. Assigning both will allow user to choose profile at login.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={creatingUser}
                                className="premium-button w-full flex items-center justify-center gap-2 mt-4 py-3 font-black text-[10px] uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-500"
                            >
                                {creatingUser ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        Create Account
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Active Users Table/Grid */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-6 flex flex-col h-full overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                <Users className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Workspace Users</h3>
                        </div>

                        <div className="flex-1 overflow-x-auto no-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 transition-colors">
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Username</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Assigned Profiles</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5 transition-colors">
                                    {usersList.length > 0 ? (
                                        usersList.map((usr) => (
                                            <tr key={usr._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 text-sm">
                                                    {usr.username}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        {(usr.profiles || ['User']).map((prof) => (
                                                            <span
                                                                key={prof}
                                                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                                    prof === 'Admin'
                                                                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                                                                        : 'bg-slate-150 text-slate-600 dark:bg-white/10 dark:text-slate-400 border border-slate-200/50 dark:border-white/5'
                                                                }`}
                                                            >
                                                                {prof}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => handleDeleteUser(usr._id, usr.username)}
                                                        disabled={usr.username === username}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            usr.username === username
                                                                ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                                                                : 'text-rose-500 hover:bg-rose-500/10'
                                                        }`}
                                                        title={usr.username === username ? 'Current User' : 'Delete User'}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-4 py-10 text-center text-slate-500 italic text-sm">
                                                Loading workspace users...
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
