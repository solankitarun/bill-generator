import React, { useState, useEffect } from 'react'
import api from '../api'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Trash2, 
  Edit3, 
  HandCoins,
  Phone,
  Calendar,
  Hash,
  User
} from 'lucide-react'

export default function PaymentManager({ setAlert, onEdit }) {
    const [pendingBills, setPendingBills] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)

    const itemsPerPage = 6

    useEffect(() => {
        fetchPendingBills()
    }, [])

    const fetchPendingBills = async () => {
        try {
            const res = await api.get('/bills/pending')
            setPendingBills(res.data)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching pending bills:', err)
            setLoading(false)
        }
    }

    const handleMarkPaid = (billId, invoiceNum) => {
        setAlert({
            show: true,
            message: `Confirm payment for Invoice ${invoiceNum}?`,
            isConfirm: true,
            onConfirm: async () => {
                try {
                    await api.put(`/bills/${billId}/pay`)
                    setAlert({ show: true, message: 'Payment confirmed successfully!' })
                    fetchPendingBills()
                } catch (err) {
                    console.error('Error updating payment:', err)
                    setAlert({ show: true, message: 'Failed to update payment status.' })
                }
            }
        })
    }

    const handleDelete = (billId, invoiceNum) => {
        setAlert({
            show: true,
            message: `Are you sure you want to delete Invoice ${invoiceNum}?`,
            isConfirm: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/bills/${billId}`)
                    setAlert({ show: true, message: 'Bill deleted successfully!' })
                    fetchPendingBills()
                } catch (err) {
                    console.error('Error deleting bill:', err)
                    setAlert({ show: true, message: 'Failed to delete bill.' })
                }
            }
        })
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
    const filteredBills = pendingBills.filter(bill =>
        bill.CustomerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.InvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Pagination Logic
    const totalPages = Math.ceil(filteredBills.length / itemsPerPage)
    const paginatedBills = filteredBills.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1) // Reset to page 1 on search
    }

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
    )

    return (
        <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative group flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search Invoice or Customer..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-50 dark:focus:bg-slate-900 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-sm transition-colors">
                    Showing <span className="text-slate-900 dark:text-white font-medium">{filteredBills.length}</span> pending payments
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="glass-card !p-0 overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 transition-colors">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">
                                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Date</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">
                                    <div className="flex items-center gap-2"><Hash className="w-4 h-4" /> Invoice #</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">
                                    <div className="flex items-center gap-2"><User className="w-4 h-4" /> Customer</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">
                                    <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> Contact</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right transition-colors">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center transition-colors">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/5 transition-colors">
                            <AnimatePresence mode='wait'>
                                {paginatedBills.length > 0 ? (
                                    paginatedBills.map((bill, idx) => (
                                        <motion.tr 
                                            key={bill.BillID}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 transition-colors">{formatDate(bill.BillDate)}</td>
                                            <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white tracking-tight transition-colors uppercase">{bill.InvoiceNumber}</td>
                                            <td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-300 font-bold transition-colors">{bill.CustomerName}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 transition-colors">{bill.CustomerPhone}</td>
                                            <td className="px-6 py-4 text-sm text-right font-black text-emerald-600 dark:text-emerald-400 transition-colors">₹{bill.GrandTotal.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2 transition-opacity">
                                                    <button
                                                        onClick={() => handleMarkPaid(bill.BillID, bill.InvoiceNumber)}
                                                        className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/20"
                                                        title="Mark Paid"
                                                    >
                                                        <HandCoins className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onEdit(bill)}
                                                        className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-500/20"
                                                        title="Edit Bill"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(bill.BillID, bill.InvoiceNumber)}
                                                        className="p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/20"
                                                        title="Delete Bill"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : null}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden pb-4">
                <AnimatePresence mode='wait'>
                    {paginatedBills.length > 0 ? (
                        paginatedBills.map((bill, idx) => (
                            <motion.div
                                key={bill.BillID}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card !p-5 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{bill.InvoiceNumber}</p>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white transition-colors">{bill.CustomerName}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-1 transition-colors">
                                            <Calendar className="w-3 h-3" /> {formatDate(bill.BillDate)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest transition-colors">Total Amount</p>
                                        <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 transition-colors">₹{bill.GrandTotal.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 transition-colors">
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-bold flex items-center gap-2 transition-colors">
                                        <Phone className="w-3.5 h-3.5 text-indigo-500" /> {bill.CustomerPhone}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleMarkPaid(bill.BillID, bill.InvoiceNumber)}
                                            className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                                        >
                                            <HandCoins className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onEdit(bill)}
                                            className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(bill.BillID, bill.InvoiceNumber)}
                                            className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="glass-card !p-12 text-center transition-colors">
                            <CheckCircle className="w-12 h-12 text-emerald-500/40 mx-auto mb-4" />
                            <p className="text-slate-400 dark:text-slate-500 font-bold text-lg transition-colors">No pending payments.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {filteredBills.length > itemsPerPage && (
                <div className="px-6 py-4 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-between transition-colors">
                    <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
                        Page <span className="text-slate-900 dark:text-white font-medium transition-colors">{currentPage}</span> of <span className="text-slate-900 dark:text-white font-medium transition-colors">{totalPages}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </section>
    )
}
