import React, { useState, useEffect } from 'react'
import api from '../api'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shirt, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight,
  IndianRupee,
  Search
} from 'lucide-react'

export default function ItemMaster({ onRefreshItems, setAlert }) {
    const [items, setItems] = useState([])
    const [newItem, setNewItem] = useState({ ItemName: '', UnitPrice: '' })
    const [editingId, setEditingId] = useState(null)
    const [editItem, setEditItem] = useState({ ItemName: '', UnitPrice: '' })
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        try {
            const res = await api.get('/items')
            setItems(res.data)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching items:', err)
            setLoading(false)
        }
    }

    const handleAdd = async (e) => {
        e.preventDefault()
        try {
            await api.post('/items', newItem)
            setNewItem({ ItemName: '', UnitPrice: '' })
            fetchItems()
            if (onRefreshItems) onRefreshItems()
            setAlert({ show: true, message: 'New service added successfully!' })
        } catch (err) {
            console.error('Error adding item:', err)
            setAlert({ show: true, message: 'Failed to add service.' })
        }
    }

    const handleUpdate = async (id) => {
        try {
            await api.put(`/items/${id}`, editItem)
            setEditingId(null)
            fetchItems()
            if (onRefreshItems) onRefreshItems()
            setAlert({ show: true, message: 'Service updated successfully!' })
        } catch (err) {
            console.error('Error updating item:', err)
            setAlert({ show: true, message: 'Failed to update service.' })
        }
    }

    const handleDelete = (id) => {
        setAlert({
            show: true,
            message: 'Are you sure you want to delete this service?',
            isConfirm: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/items/${id}`)
                    fetchItems()
                    if (onRefreshItems) onRefreshItems()
                } catch (err) {
                    console.error('Error deleting item:', err)
                    setAlert({ show: true, message: 'Failed to delete service.' })
                }
            }
        })
    }

    const startEdit = (item) => {
        setEditingId(item.ItemID)
        setEditItem({ ItemName: item.ItemName, UnitPrice: item.UnitPrice })
    }

    const totalPages = Math.ceil(items.length / itemsPerPage)
    const paginatedItems = items.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
    )

    return (
        <section className="space-y-8">
            <div className="flex flex-col lg:flex-row gap-8 transition-all">
                {/* Add New Section */}
                <div className="w-full lg:w-1/3 transition-all">
                    <div className="glass-card p-6 space-y-6 sticky top-24 transition-all duration-300">
                        <div className="flex items-center gap-3 transition-colors">
                            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors">
                                <Plus className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">Add New Service</h3>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Service Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Silk Saree"
                                    value={newItem.ItemName}
                                    onChange={e => setNewItem({ ...newItem, ItemName: e.target.value })}
                                    required
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Unit Price (₹)</label>
                                <div className="relative group transition-all">
                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={newItem.UnitPrice}
                                        onChange={e => setNewItem({ ...newItem, UnitPrice: e.target.value })}
                                        required
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="premium-button w-full flex items-center justify-center gap-2 py-3 mt-4 transition-all">
                                <Plus className="w-5 h-5" />
                                Add Service
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="flex-1 transition-all">
                    <div className="glass-card overflow-hidden transition-all duration-300">
                        <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between transition-colors">
                            <div className="flex items-center gap-3 transition-colors">
                                <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors">
                                    <Shirt className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">Service List</h3>
                            </div>
                            <span className="text-slate-500 dark:text-slate-500 text-xs font-medium uppercase tracking-widest transition-colors">
                                {items.length} Total Services
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-100/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 transition-colors">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">Service Type</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">Unit Price</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right transition-colors">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5 transition-colors">
                                    <AnimatePresence mode='popLayout'>
                                        {paginatedItems.map((item, idx) => (
                                            <motion.tr 
                                                key={item.ItemID}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="px-6 py-4 transition-colors">
                                                    {editingId === item.ItemID ? (
                                                        <input
                                                            className="w-full bg-white dark:bg-slate-900 border border-indigo-500/50 rounded-lg py-1.5 px-3 text-slate-900 dark:text-white focus:outline-none ring-2 ring-indigo-500/20 transition-all shadow-inner"
                                                            value={editItem.ItemName}
                                                            onChange={e => setEditItem({ ...editItem, ItemName: e.target.value })}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span className="font-bold text-slate-800 dark:text-slate-200 transition-colors">{item.ItemName}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 transition-colors">
                                                    {editingId === item.ItemID ? (
                                                        <div className="relative w-32 transition-all">
                                                            <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 dark:text-slate-500 transition-colors" />
                                                            <input
                                                                type="number"
                                                                className="w-full bg-white dark:bg-slate-900 border border-indigo-500/50 rounded-lg py-1.5 pl-7 pr-3 text-slate-900 dark:text-white focus:outline-none ring-2 ring-indigo-500/20 transition-all shadow-inner"
                                                                value={editItem.UnitPrice}
                                                                onChange={e => setEditItem({ ...editItem, UnitPrice: e.target.value })}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold transition-colors">₹{(item.UnitPrice || 0).toFixed(2)}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right transition-colors">
                                                    <div className="flex items-center justify-end gap-2 transition-opacity">
                                                        {editingId === item.ItemID ? (
                                                            <>
                                                                <button 
                                                                    onClick={() => handleUpdate(item.ItemID)}
                                                                    className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/20"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => setEditingId(null)}
                                                                    className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button 
                                                                    onClick={() => startEdit(item)}
                                                                    className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-500/20"
                                                                >
                                                                    <Edit3 className="w-4 h-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDelete(item.ItemID)}
                                                                    className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/20"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {items.length > itemsPerPage && (
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
                </div>
            </div>
        </section>
    )
}
