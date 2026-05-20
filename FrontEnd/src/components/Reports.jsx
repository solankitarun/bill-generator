import React, { useState, useEffect } from 'react'
import api from '../api'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Calendar, 
  AlertTriangle, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  X,
  ExternalLink,
  ClipboardList,
  IndianRupee,
  BarChart3
} from 'lucide-react'

export default function Reports() {
    const [reportType, setReportType] = useState('transactions')
    const [data, setData] = useState([])
    const [selectedBillItems, setSelectedBillItems] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const itemsPerPage = 8

    useEffect(() => {
        fetchReportData()
        setSearchTerm('')
        setCurrentPage(1)
    }, [reportType])

    const fetchReportData = async () => {
        setLoading(true)
        try {
            const endpoint = reportType === 'transactions'
                ? '/reports/financial'
                : reportType === 'monthly'
                    ? '/reports/monthly-sales'
                    : '/reports/overdue'

            const res = await api.get(endpoint)
            setData(res.data)
            setLoading(false)
        } catch (err) {
            console.error(`Error fetching ${reportType} report:`, err)
            setLoading(false)
        }
    }

    const fetchBillDetails = async (billId) => {
        try {
            const res = await api.get(`/bills/${billId}/items`)
            setSelectedBillItems(res.data)
            setShowModal(true)
        } catch (err) {
            console.error("Error fetching bill details:", err)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    // Filter Logic
    const filteredData = data.filter(item => {
        if (!searchTerm) return true
        const lowerSearch = searchTerm.toLowerCase()

        if (reportType === 'monthly') {
            return (item.MonthName && item.MonthName.toLowerCase().includes(lowerSearch)) ||
                (item.Year && item.Year.toString().includes(lowerSearch))
        }

        // For Transactions and Overdue
        return (item.CustomerName && item.CustomerName.toLowerCase().includes(lowerSearch)) ||
            (item.InvoiceNumber && item.InvoiceNumber.toLowerCase().includes(lowerSearch))
    })

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

    return (
        <section className="space-y-6">
            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative glass-card w-full max-w-2xl overflow-hidden shadow-2xl transition-all"
                        >
                            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between transition-colors">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Invoice Details</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6 overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-white/5 transition-colors">
                                            <th className="pb-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">Item</th>
                                            <th className="pb-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center transition-colors">Qty</th>
                                            <th className="pb-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right transition-colors">Price</th>
                                            <th className="pb-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right transition-colors">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 transition-colors">
                                        {selectedBillItems.map((item, idx) => (
                                            <tr key={idx} className="group transition-colors">
                                                <td className="py-4 text-slate-800 dark:text-slate-200 font-medium transition-colors">{item.ItemName}</td>
                                                <td className="py-4 text-slate-500 dark:text-slate-400 text-center transition-colors">{item.Quantity}</td>
                                                <td className="py-4 text-slate-500 dark:text-slate-400 text-right transition-colors">₹{(item.UnitPrice || 0).toFixed(2)}</td>
                                                <td className="py-4 text-emerald-600 dark:text-emerald-400 font-bold text-right transition-colors">₹{(item.TotalPrice || 0).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
                <div className="flex items-center gap-4 transition-colors">
                    <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl transition-colors">
                        <BarChart3 className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">Reports Center</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Analyze your business performance and outstanding payments.</p>
                    </div>
                </div>

                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl transition-colors">
                    <button
                        onClick={() => setReportType('transactions')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            reportType === 'transactions' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'
                        }`}
                    >
                        <ClipboardList className="w-4 h-4" /> Transactions
                    </button>
                    <button
                        onClick={() => setReportType('monthly')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            reportType === 'monthly' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'
                        }`}
                    >
                        <Calendar className="w-4 h-4" /> Monthly
                    </button>
                    <button
                        onClick={() => setReportType('overdue')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            reportType === 'overdue' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'text-rose-600 dark:text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors'
                        }`}
                    >
                        <AlertTriangle className="w-4 h-4" /> Overdue
                    </button>
                </div>
            </div>

            <div className="glass-card overflow-hidden transition-all duration-300">
                <div className="p-6 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                    <div className="relative group max-w-sm w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Quick search records..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                    </div>
                    <span className="text-slate-500 dark:text-slate-500 text-xs font-black uppercase tracking-widest transition-colors">
                        {filteredData.length} records found
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 transition-colors">
                                {reportType === 'monthly' ? (
                                    <>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">Month</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">Year</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">Total Orders</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right transition-colors">Total Revenue</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">Expected Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">Customer</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">Invoice #</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right transition-colors">Amount</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 transition-colors">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center transition-colors">
                                        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                        {reportType === 'monthly' ? (
                                            <>
                                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide text-xs transition-colors">{item.MonthName}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 transition-colors">{item.Year}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 transition-colors">{item.TotalOrders}</td>
                                                <td className="px-6 py-4 text-right text-indigo-600 dark:text-indigo-400 font-bold font-mono transition-colors">₹{(item.TotalSales || 0).toFixed(2)}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm transition-colors">{formatDate(item.ReturnDate)}</td>
                                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 transition-colors">{item.CustomerName}</td>
                                                <td className="px-6 py-4 transition-colors">
                                                    <button
                                                        onClick={() => fetchBillDetails(item.BillID)}
                                                        className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-mono font-bold transition-colors group"
                                                    >
                                                        {item.InvoiceNumber}
                                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 transition-colors">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        item.PaymentStatus === 'Paid' 
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                                    }`}>
                                                        {item.PaymentStatus || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400 font-bold font-mono transition-colors">₹{(item.GrandTotal || 0).toFixed(2)}</td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500 italic transition-colors">
                                        No records found for the selected criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredData.length > itemsPerPage && (
                    <div className="px-6 py-4 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between transition-colors">
                        <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
                            Page <span className="text-slate-900 dark:text-white font-bold transition-colors">{currentPage}</span> of <span className="text-slate-900 dark:text-white font-bold transition-colors">{totalPages}</span>
                        </p>
                        <div className="flex gap-2 transition-colors">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-lg disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-lg disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
