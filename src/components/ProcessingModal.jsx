import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function ProcessingModal({ isOpen, message = "Lütfen bekle aşkım..." }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-xl border border-love-100 max-w-xs text-center relative overflow-hidden"
                    >
                        {/* Background floating hearts animation could go here, but let's keep it simple and clean first */}

                        <div className="relative mb-6">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border-4 border-love-100 border-t-love-500"
                            />
                            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-love-50 text-3xl">
                                ❤️
                            </div>
                        </div>

                        <h3 className="font-bold text-lg text-gray-800 mb-2 font-hand">{message}</h3>
                        <p className="text-xs text-gray-400">İşlemin yapılıyor...</p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
