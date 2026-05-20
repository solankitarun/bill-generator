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
    ShieldCheck
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
            className="max-w-4xl mx-auto transition-all"
        >
            <div className="glass-card p-4 lg:p-6 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4 transition-colors">
                    <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl transition-colors">
                        <Store className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Shop Configuration</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] transition-colors">Customize your business profile and tax settings.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {
  /* WhatsApp connection UI */
  waStatus === 'pairing' && waQrCode && (
    <div className="mb-4 flex flex-col items-center">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Scan QR code to connect WhatsApp</p>
      <QRCode value={waQrCode} size={180} />
    </div>
  )
}
{
  waStatus === 'connected' && (
    <button
      type="button"
      onClick={handleLogout}
      className="mb-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
    >
      Disconnect WhatsApp
    </button>
  )
}
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 transition-colors">
                            <MapPin className="w-3 h-3" /> Business Address
                        </label>
                        <textarea
                            value={shop.Address}
                            onChange={e => setShop({ ...shop, Address: e.target.value })}
                            placeholder="Full address for invoice footer"
                            rows="1"
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 transition-colors">
                                <Phone className="w-3 h-3" /> Contact Phone
                            </label>
                            <input
                                type="text"
                                value={shop.Phone}
                                onChange={e => setShop({ ...shop, Phone: e.target.value })}
                                placeholder="Primary business number"
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 transition-colors">
                                <Percent className="w-3 h-3" /> Tax Rate
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={shop.TaxRate}
                                onChange={e => setShop({ ...shop, TaxRate: parseFloat(e.target.value) })}
                                placeholder="e.g. 0.05"
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500 text-[10px] font-medium transition-colors">
                            <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
                            Changes are reflected instantly on new bills.
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="premium-button flex items-center gap-2 px-8 py-3"
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
        </motion.section>
    )
}
