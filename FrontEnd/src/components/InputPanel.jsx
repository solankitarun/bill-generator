import { useState, useEffect } from 'react'
import {
    Plus,
    Minus,
    User,
    Phone,
    MapPin,
    Calendar,
    ShoppingCart,
    ChevronDown,
    Info,
    Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function InputPanel({ availableItems, addItem, customer, setCustomer }) {
    const [selectedItem, setSelectedItem] = useState('')
    const [qty, setQty] = useState(1)
    const [customName, setCustomName] = useState('')
    const [customPrice, setCustomPrice] = useState('')
    const [showSuccess, setShowSuccess] = useState(false)
    const [addedItemName, setAddedItemName] = useState('')
    const [addedItemQty, setAddedItemQty] = useState(1)

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => {
                setShowSuccess(false)
            }, 1800)
            return () => clearTimeout(timer)
        }
    }, [showSuccess])

    const handleSubmit = (e) => {
        e.preventDefault()
        let name = ''
        let price = 0

        if (selectedItem === 'Other') {
            name = customName
            price = parseFloat(customPrice)
        } else {
            const item = availableItems.find(i => i.ItemName === selectedItem)
            if (item) {
                name = item.ItemName
                price = item.UnitPrice
            }
        }

        if (!name || isNaN(price) || price < 0) return alert('Invalid Item')

        addItem({ name, price, qty, total: price * qty })

        setAddedItemName(name)
        setAddedItemQty(qty)
        setShowSuccess(true)

        // Reset
        setQty(1)
        if (selectedItem === 'Other') {
            setCustomName('')
            setCustomPrice('')
        }
    }

    return (
        <section className="relative glass-card !p-3 md:!p-5 space-y-3 md:space-y-5 h-fit transition-all duration-300">
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg shadow-emerald-500/20 pointer-events-none"
                    >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Added {addedItemQty}x {addedItemName}!</span>
                    </motion.div>
                )}
            </AnimatePresence>
            <div>
                <div className="flex items-center gap-2 mb-0.5">
                    <div className="p-1.5 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors">
                        <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white transition-colors uppercase tracking-tight">New Order</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-[9px] md:text-[10px] transition-colors">Configure laundry details</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 ml-1 uppercase tracking-widest transition-colors">Service Selection</label>
                    <div className="relative group">
                        <select
                            value={selectedItem}
                            onChange={(e) => setSelectedItem(e.target.value)}
                            required
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 md:py-2.5 px-4 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all text-xs md:text-sm font-bold"
                        >
                            <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">Choose Service...</option>
                            {availableItems.map(item => (
                                <option key={item.ItemID} value={item.ItemName} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">
                                    {item.ItemName} (₹{(item.UnitPrice || 0).toFixed(2)})
                                </option>
                            ))}
                            <option value="Other" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">Custom Item</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none transition-colors" />
                    </div>
                </div>

                {selectedItem === 'Other' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 ml-1 uppercase tracking-widest">Custom Name</label>
                            <input
                                type="text"
                                value={customName}
                                onChange={e => setCustomName(e.target.value)}
                                placeholder="Item name..."
                                required
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xs font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 ml-1 uppercase tracking-widest">Unit Price</label>
                            <input
                                type="number"
                                value={customPrice}
                                onChange={e => setCustomPrice(e.target.value)}
                                placeholder="0.00"
                                step="0.50"
                                required
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xs font-bold"
                            />
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
                    <div className="space-y-1 flex-1">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 ml-1 uppercase tracking-widest transition-colors">Quantity</label>
                        <div className="flex items-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-0.5 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                            <button
                                type="button"
                                onClick={() => setQty(Math.max(1, qty - 1))}
                                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-white rounded-lg transition-all"
                            >
                                <Minus className="w-3 h-3" />
                            </button>
                            <input
                                type="number"
                                readOnly
                                value={qty}
                                className="w-full bg-transparent text-center text-slate-900 dark:text-white font-black text-lg focus:outline-none transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setQty(qty + 1)}
                                className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-white rounded-lg transition-all"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={showSuccess}
                        className={`relative px-4 py-2 h-[44px] md:h-[48px] min-w-[120px] rounded-2xl flex items-center justify-center gap-2 text-white font-bold uppercase tracking-widest text-[9px] font-black shadow-lg transition-all duration-300 active:scale-95 ${
                            showSuccess 
                                ? 'bg-emerald-500 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-2 ring-emerald-500/30' 
                                : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]'
                        }`}
                    >
                        {showSuccess ? (
                            <>
                                <Check className="w-4 h-4 animate-in zoom-in duration-300" />
                                Added
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                Add To Draft
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="pt-6 md:pt-8 border-t border-slate-100 dark:border-white/5 space-y-5 transition-colors">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 transition-colors">
                    <User className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-[9px] font-black uppercase tracking-widest">Customer Information</h3>
                </div>

                <div className="space-y-4">
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={customer.name}
                            onChange={e => setCustomer({ ...customer, name: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xs font-bold"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Contact No"
                                value={customer.phone}
                                maxLength={10}
                                onChange={e => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, '') })}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xs font-bold"
                            />
                        </div>

                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Town"
                                value={customer.town || ''}
                                onChange={e => setCustomer({ ...customer, town: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xs font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2 transition-colors uppercase tracking-widest">
                            <Calendar className="w-3 h-3" /> Delivery Date
                        </label>
                        <input
                            type="date"
                            value={customer.returnDate || ''}
                            onChange={e => setCustomer({ ...customer, returnDate: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-3.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xs font-bold"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
