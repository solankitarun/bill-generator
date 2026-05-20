import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, HelpCircle, X } from 'lucide-react'

export default function CustomAlert({ message, isOpen, onClose, isConfirm, onConfirm, onCancel }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative glass-card w-full max-w-sm overflow-hidden p-8 text-center"
                    >
                        <div className={`mx-auto w-16 h-16 rounded-3xl flex items-center justify-center mb-6 ${
                            isConfirm ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                            {isConfirm ? <HelpCircle className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">
                            {isConfirm ? 'Confirmation' : 'Attention'}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                            {message}
                        </p>

                        <div className="flex gap-3">
                            {isConfirm ? (
                                <>
                                    <button 
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 font-bold hover:bg-white/5 hover:text-white transition-all"
                                        onClick={() => { onCancel && onCancel(); onClose(); }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="flex-1 premium-button px-4 py-2.5"
                                        onClick={() => { onConfirm && onConfirm(); onClose(); }}
                                    >
                                        Proceed
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className="w-full premium-button px-4 py-2.5"
                                    onClick={onClose}
                                >
                                    Dismiss
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
