import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Evet",
    cancelText = "Vazgeç",
    icon = "⚠️",
    theme = "love"
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-xs overflow-hidden z-10"
                    >
                        <div className="p-6 text-center">
                            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 text-3xl border-4 border-white shadow-sm ${theme === 'danger' ? 'bg-red-50 text-red-500' : 'bg-love-50 text-love-500'}`}>
                                {icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 font-hand">{title}</h3>
                            <p className="text-gray-500 text-sm mb-6 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                                {message}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => { onConfirm(); onClose(); }}
                                    className={`flex-1 px-4 py-3 rounded-2xl font-bold text-white shadow-lg transition-transform active:scale-95 text-sm ${theme === 'danger'
                                            ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                            : 'bg-gradient-to-r from-love-500 to-purple-500 shadow-love-200'
                                        }`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
