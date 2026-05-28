import React, { useState, useEffect } from 'react'
import api from '../api'
import { motion } from 'framer-motion'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import {
    Store,
    Tag,
    MapPin,
    Phone,
    Percent,
    Save,
    ShieldCheck,
    MessageSquare,
    CheckCircle2,
    QrCode as QrCodeIcon,
    Unplug
} from 'lucide-react'

export default function ShopMaster({ onUpdate, setAlert }) {
    const [shop, setShop] = useState({
        ShopName: '',
        Tagline: '',
        Address: '',
        Phone: '',
        TaxRate: 0.05
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [waStatus, setWaStatus] = useState('disconnected')
    const [waQrCode, setWaQrCode] = useState(null)

    useEffect(() => {
        fetchShop()
    }, [])

    const fetchShop = async () => {
        try {
            const res = await api.get('/shop')
            setShop(res.data)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching shop:', err)
            setLoading(false)
        }
    }

// Fetch WhatsApp status
const fetchWhatsAppStatus = async () => {
  try {
    const res = await api.get('/whatsapp/status');
    setWaStatus(res.data.status);
    setWaQrCode(res.data.qr || null);
  } catch (err) {
    console.error('Error fetching WhatsApp status:', err);
  }
};

useEffect(() => {
  fetchWhatsAppStatus();
  const interval = setInterval(fetchWhatsAppStatus, 5000);
  return () => clearInterval(interval);
}, []);


    const handleLogout = async () => {
    try {
        await api.post('/whatsapp/logout');
        setWaStatus('disconnected');
        setWaQrCode(null);
        setAlert({ show: true, message: 'WhatsApp logged out.' });
    } catch (err) {
        console.error('Logout error:', err);
        setAlert({ show: true, message: 'Failed to logout WhatsApp.' });
    }
};

const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.post('/shop', shop)
            if (onUpdate) onUpdate()
            setAlert({ show: true, message: 'Shop details updated successfully!' })
        } catch (err) {
            console.error('Error saving shop:', err)
            setAlert({ show: true, message: 'Failed to save shop details. Please check your connection.' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
    )

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto transition-all"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Shop Configuration */}
                <div className="lg:col-span-2 glass-card p-4 lg:p-6 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6 transition-colors">
                        <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl transition-colors">
                            <Store className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Shop Configuration</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-xs transition-colors">Customize your business profile and tax settings.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 transition-colors">
                                    <Store className="w-3 h-3" /> Shop Name
                                </label>
                                <input
                                    type="text"
                                    value={shop.ShopName}
                                    onChange={e => setShop({ ...shop, ShopName: e.target.value })}
                                    placeholder="e.g. FreshWash Laundry"
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 transition-colors">
                                    <Tag className="w-3 h-3" /> Tagline
                                </label>
                                <input
                                    type="text"
                                    value={shop.Tagline}
                                    onChange={e => setShop({ ...shop, Tagline: e.target.value })}
                                    placeholder="e.g. Premium Laundry Services"
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 transition-colors">
                                <MapPin className="w-3 h-3" /> Business Address
                            </label>
                            <textarea
                                value={shop.Address}
                                onChange={e => setShop({ ...shop, Address: e.target.value })}
                                placeholder="Full address for invoice footer"
                                rows="2"
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 transition-colors">
                                    <Phone className="w-3 h-3" /> Contact Phone
                                </label>
                                <input
                                    type="text"
                                    value={shop.Phone}
                                    onChange={e => setShop({ ...shop, Phone: e.target.value })}
                                    placeholder="Primary business number"
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 transition-colors">
                                    <Percent className="w-3 h-3" /> Tax Rate
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={shop.TaxRate}
                                    onChange={e => setShop({ ...shop, TaxRate: parseFloat(e.target.value) })}
                                    placeholder="e.g. 0.05"
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500 text-xs font-medium transition-colors">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                Changes reflect instantly on new bills.
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="premium-button flex items-center justify-center gap-2 px-8 py-3 w-full md:w-auto"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* WhatsApp Integration */}
                <div className="glass-card p-4 lg:p-6 transition-all duration-300 flex flex-col">
                    <div className="flex items-center gap-3 mb-6 transition-colors">
                        <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl transition-colors">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">WhatsApp API</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-xs transition-colors">Automated billing link.</p>
                        </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl p-6 border border-slate-200/50 dark:border-white/5 transition-colors">
                        {waStatus === 'pairing' && waQrCode ? (
                            <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-300">
                                <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 mb-5 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <QRCode value={waQrCode} size={180} className="w-full h-auto relative z-10" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Link Device</h3>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center">
                                    Scan QR code using WhatsApp to connect.
                                </p>
                            </div>
                        ) : waStatus === 'connected' ? (
                            <div className="flex flex-col items-center w-full animate-in fade-in duration-300">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-5 relative">
                                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500 relative z-10" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Device Connected</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-8 px-2">
                                    Your WhatsApp is actively ready to send automated invoices.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <Unplug className="w-4 h-4" />
                                    Disconnect Device
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center w-full opacity-60">
                                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-5">
                                    <QrCodeIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Waiting for Server</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 text-center px-4">
                                    Start your backend server to generate a secure QR code.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.section>
    )
}
