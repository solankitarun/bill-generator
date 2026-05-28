import React, { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    RotateCcw,
    Printer,
    MessageSquare,
    Trash2,
    Droplets,
    ArrowRight,
    Info,
    Calendar,
    Phone,
    MapPin
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa';

export default function BillPreview({ shopDetails, customer, billItems, removeItem, invoiceNum, onReset, onPrint, setAlert, isEditing, lastAddedId }) {
    const billRef = useRef();

    const subtotal = billItems.reduce((acc, item) => acc + item.total, 0)
    const taxRate = (shopDetails?.TaxRate !== undefined && shopDetails?.TaxRate !== null) ? shopDetails.TaxRate : 0.05
    const tax = subtotal * taxRate
    const total = subtotal + tax

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // en-GB uses DD/MM/YYYY
    }

    const handleWhatsApp = () => {
        if (!customer.phone) return setAlert({ show: true, message: "Customer contact number is required!" });

        // Construct Text Summary
        let message = `*${shopDetails?.ShopName || 'FreshWash'} - Bill Summary*\n\n`;
        message += `*Customer:* ${customer.name || 'Guest'}\n`;
        message += `*Bill No:* ${invoiceNum}\n`;
        message += `*Date:* ${formatDate(new Date())}\n`;
        if (customer.returnDate) message += `*Return Date:* ${formatDate(customer.returnDate)}\n`;
        message += `\n*Items:*\n`;

        billItems.forEach(item => {
            message += `- ${item.name} (${item.qty}): ₹${item.total.toFixed(2)}\n`;
        });

        message += `\n*Subtotal:* ₹${subtotal.toFixed(2)}\n`;
        message += `*Tax:* ₹${tax.toFixed(2)}\n`;
        message += `*Grand Total: ₹${total.toFixed(2)}*\n\n`;
        message += `Thank you for choosing ${shopDetails?.ShopName}!`;

        const whatsappUrl = `https://wa.me/91${customer.phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    return (
        <section className="space-y-4 print:block max-h-full overflow-hidden">
            {/* Action Bar */}
            <div className="flex items-center gap-3 print:hidden">
                <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors">
                    <Droplets className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white transition-colors leading-none tracking-tight uppercase">Bill Preview</h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">{isEditing ? 'Editing Mode' : 'Draft View'}</p>
                </div>
            </div>

            {/* Bill Paper */}
            <div className="glass-card !p-4 sm:!p-8 md:!p-10 bill-paper relative overflow-hidden transition-all duration-500 bg-white dark:bg-slate-900/40" ref={billRef}>
                {/* Decorative top bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600 print:block" />

                {/* Invoice Header - Optimized for Single Screen */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6 md:mb-10">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20 [print-color-adjust:exact]">
                            <Droplets className="text-white w-7 h-7 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                                {shopDetails?.ShopName || 'FreshWash'}
                            </h1>
                            <p className="text-indigo-600 dark:text-indigo-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] transition-colors">{shopDetails?.Tagline || 'LAUNDRY SERVICES'}</p>
                        </div>
                    </div>

                    <div className="w-full md:w-auto text-left md:text-right space-y-1">
                        <div className="flex items-center md:justify-end gap-2">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Inv #</span>
                            <span className="text-base md:text-lg font-mono font-black text-slate-900 dark:text-indigo-400 tracking-tight uppercase leading-none">{invoiceNum}</span>
                        </div>
                        <div className="flex md:justify-end items-center gap-4 text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {new Date().toLocaleDateString('en-GB')}</span>
                        </div>
                    </div>
                </div>

                {/* Info Grid - Re-structured for Desktop Presence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-12 mb-6 md:mb-10 border-y-2 border-slate-100 dark:border-white/5 py-6 md:py-8">
                    <div className="space-y-3">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Billed To</p>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-slate-900 dark:text-white">{customer.name || 'Walk-in Customer'}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-indigo-500" /> {customer.phone || 'No Contact'}</p>
                            {customer.town && <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> {customer.town}</p>}
                        </div>
                    </div>
                    <div className="mt-6 md:mt-0 space-y-3 md:text-right">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Service Details</p>
                        <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Expected Return</p>
                            <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                                {customer.returnDate ? new Date(customer.returnDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'ASAP'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Items Table - Desktop Solid Style */}
                <div className="overflow-x-auto -mx-4 sm:mx-0 mb-6 md:mb-10">
                    {/* Desktop table (visible on sm and up) */}

                        <table className="min-w-full table-fixed hidden sm:block rounded-lg overflow-hidden">
    <thead>
        <tr className="border-b-2 border-slate-900 dark:border-white/20 transition-colors">
            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-left w-2/5">Service / Item Description</th>
            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-center w-1/12">Qty</th>
            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-right w-1/6">Unit Price</th>
            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-right w-1/6">Line Total</th>
            <th className="py-4 px-4 text-center print:hidden w-8"></th>
        </tr>
    </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 transition-colors">
                            <AnimatePresence mode='popLayout'>
                                {billItems.map((item) => (
                                    <motion.tr key={item.id} layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 10 }} className={`group hover:bg-indigo-50 dark:hover:bg-slate-800/30 transition-colors odd:bg-gray-50 dark:odd:bg-gray-800/20 even:bg-white dark:even:bg-slate-900/10 ${item.id === lastAddedId ? 'bg-emerald-100/30 animate-pulse' : ''}`}>
                                        <td className="py-4 px-4 w-2/5"><p className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">{item.name}</p></td>
                                        <td className="py-4 px-4 w-1/12 text-center text-sm font-bold text-slate-600 dark:text-slate-400">{item.qty}</td>
                                        <td className="py-4 px-4 w-1/6 text-right text-sm font-medium text-slate-600 dark:text-slate-400">₹{item.price.toFixed(2)}</td>
                                        <td className="py-4 px-4 w-1/6 text-right text-sm font-black text-slate-900 dark:text-white">₹{item.total.toFixed(2)}</td>
                                        <td className="py-4 px-4 w-8 text-right print:hidden">
                                            <button onClick={() => removeItem(item.id)} className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                    {/* Mobile list (visible on xs only) */}
                    <div className="space-y-4 sm:hidden">
                        {billItems.map((item) => (
                            <div key={item.id} className="p-4 bg-white dark:bg-slate-900/10 rounded-lg shadow-sm flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
                                    <button onClick={() => removeItem(item.id)} className="p-1 text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                    <span>Qty: {item.qty}</span>
                                    <span>₹{item.price.toFixed(2)}</span>
                                    <span className="font-bold">₹{item.total.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex-1 max-w-sm text-[10px] text-slate-400 dark:text-slate-500 font-medium italic space-y-2">
                        <p className="flex items-start gap-2">
                            <Info className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                            Payments are non-refundable once service is completed. Please check items at delivery.
                        </p>
                    </div>
                    <div className="w-full md:w-80 space-y-4">
                        <div className="space-y-3 p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10">
                            <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
                                <span className="uppercase tracking-widest font-bold text-[10px]">Subtotal</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
                                <span className="uppercase tracking-widest font-bold text-[10px]">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">₹{tax.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-indigo-600 text-white rounded-3xl flex justify-between items-center shadow-xl shadow-indigo-600/20 [print-color-adjust:exact]">
                            <span className="text-xs font-black uppercase tracking-widest">Grand Total</span>
                            <span className="text-2xl md:text-3xl font-black tracking-tighter">₹{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="mt-10 pt-6 border-t border-slate-100 dark:border-white/5 text-center space-y-1">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">*** Thank you for choosing {shopDetails?.ShopName || 'FreshWash'} ***</p>
                    <p className="text-[9px] text-slate-300 dark:text-slate-600 font-medium italic">Computer generated invoice. No physical signature required.</p>
                </div>
            </div>

            {/* Save & Print / Reset Buttons - Below Bill on all screens */}
            <div className="flex items-center gap-3 print:hidden justify-end">
    <button
        onClick={onReset}
        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all font-bold text-[10px] uppercase tracking-widest border border-transparent hover:border-rose-500/20"
    >
        <RotateCcw className="w-4 h-4" />
        Reset
    </button>
    <button
        onClick={handleWhatsApp}
        aria-label="WhatsApp"
        className="flex items-center justify-center px-4 py-2 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest border border-[#25D366]/20"
    >
                <FaWhatsapp className="w-4 h-4" />
    </button>
    <button
        onClick={onPrint}
        aria-label="Print"
        className="flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-bold text-[10px] uppercase tracking-widest gap-2"
    >
        <Printer className="w-4 h-4" />
        <span className="ml-1">{isEditing ? 'Update' : 'Save'}</span>
    </button>
</div>
        </section>
    )
}
