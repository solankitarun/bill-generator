import React, { useState, useEffect } from 'react'
import api from '../api'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  Star, 
  Zap, 
  ArrowUpRight,
  IndianRupee
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
}

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/reports/dashboard')
                setStats(res.data)
                setLoading(false)
            } catch (err) {
                console.error("Error fetching dashboard stats:", err)
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
    )

    const cards = [
        { 
            title: "Today's Revenue", 
            value: `₹${(stats?.today?.Revenue || 0).toFixed(2)}`, 
            icon: IndianRupee, 
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-500/10'
        },
        { 
            title: "Today's Orders", 
            value: stats?.today?.Orders || 0, 
            icon: ShoppingBag, 
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-500/10'
        },
        { 
            title: "Pending Collections", 
            value: stats?.pendingDeliveries || 0, 
            icon: Clock, 
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-500/10'
        }
    ]

    return (
        <motion.section 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4 sm:space-y-6"
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {cards.map((card, idx) => (
                    <motion.div 
                        key={idx}
                        variants={item}
                        className="glass-card !p-4 sm:!p-6 group hover:border-indigo-500/30 dark:hover:border-white/20 transition-all duration-300"
                    >
                        <div className="flex items-start justify-between">
                            <div className={`p-2 sm:p-3 rounded-xl ${card.bg} ${card.color} transition-colors`}>
                                <card.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1 transition-colors uppercase tracking-wider">
                                <ArrowUpRight className="w-3 h-3" />
                                +12%
                            </span>
                        </div>
                        <div className="mt-3 sm:mt-4">
                            <h3 className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors">{card.title}</h3>
                            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 transition-colors leading-none">{card.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Popular Services */}
                <motion.div variants={item} className="glass-card !p-5 sm:!p-8 transition-all">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors">
                            <Star className="w-4 h-4" />
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white transition-colors uppercase tracking-tight">Popular Services</h3>
                    </div>

                    <div className="space-y-5 sm:space-y-6">
                        {stats?.topItems && stats.topItems.length > 0 ? (
                            stats.topItems.map((item, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-[11px] sm:text-xs transition-colors">
                                        <span className="text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wide">{item.ItemName}</span>
                                        <span className="text-slate-500 dark:text-slate-400 font-medium">{item.TotalQty} orders</span>
                                    </div>
                                    <div className="h-1.5 sm:h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(item.TotalQty / stats.topItems[0].TotalQty) * 100}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-center py-10 transition-colors">No service data available yet.</p>
                        )}
                    </div>
                </motion.div>

                {/* Quick Insights */}
                <motion.div variants={item} className="glass-card !p-5 sm:!p-8 flex flex-col justify-between transition-all">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg transition-colors">
                                <Zap className="w-4 h-4" />
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white transition-colors uppercase tracking-tight">Quick Insights</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                            <div className="p-4 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 transition-colors">
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest transition-colors">Average Order Value</p>
                                <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 transition-colors leading-none">
                                    ₹{stats?.today?.Orders > 0
                                        ? (stats.today.Revenue / stats.today.Orders).toFixed(2)
                                        : '0.00'}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 transition-colors">
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest transition-colors">Busiest Service</p>
                                <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 transition-colors leading-none truncate">{stats?.topItems?.[0]?.ItemName || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-indigo-600/5 dark:bg-indigo-600/10 border border-indigo-500/20 rounded-2xl transition-colors">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400 transition-colors shrink-0" />
                            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 transition-colors leading-relaxed">
                                Your revenue is up by <span className="text-emerald-600 dark:text-emerald-400 font-black">12%</span> today.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.section>
    )
}
