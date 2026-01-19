import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Sadece Puanlar
const PRIZES = [
    { label: '50 Puan', value: 50, color: '#ffb3ba' },
    { label: '10 Puan', value: 10, color: '#bae1ff' },
    { label: '100 Puan', value: 100, color: '#ffdfba' },
    { label: '250 Puan', value: 250, color: '#ffffba' },
    { label: '500 Puan', value: 500, color: '#baffc9' },
    { label: '1000 Puan', value: 1000, color: '#eecbff' },
    { label: '5 Puan', value: 5, color: '#e6e6fa' },
    { label: '25 Puan', value: 25, color: '#ffe4e1' },
];

export default function WheelPage() {
    const { user, spinWheel } = useStore();
    const [spinning, setSpinning] = useState(false);
    const controls = useAnimation();
    const navigate = useNavigate();

    // Check Eligibility safely
    const isEligible = (() => {
        if (!user) return false;
        const today = new Date().toDateString();
        // If last spin wasn't today, eligible.
        if (user.lastSpinDate !== today) return true;
        // If today, check count (limit is 1 for non-admin, usually)
        // Hardcoded limit check for UI (backend enforces it too)
        return (user.spinCount || 0) < 1;
    })();

    const handleSpin = async () => {
        if (spinning) return;
        if (!isEligible) {
            toast.error("Bugünlük şansını denedin! Yarın gel ❤️");
            return;
        }

        setSpinning(true);

        // 1. Determine Prize FIRST (Deterministic)
        // Weighted random could be better, but uniform random for now
        const randomIndex = Math.floor(Math.random() * PRIZES.length);
        const selectedPrize = PRIZES[randomIndex];

        // 2. Calculate Angle to land exactly on the CENTER of that segment
        // Wheel starts at 0deg. 
        // Segment 0 is at [0, 360/N]. Center is at 360/N/2.
        // Actually CSS rotation rotates clockwise.
        // Top pointer is usually at -90deg or 0deg depending on styling.
        // Our styling: Pointer is at Top (12 o'clock).
        // 0deg usually corresponds to 3 o'clock in CSS transform? No, usually top if we rotate wrapper?
        // Let's assume standard: 0deg is 12 o'clock? Or we correct it.
        // Let's observe: Conic gradient starts at 0deg (Top, usually). 
        // Segment 0 is 0deg-Xdeg. Center is X/2 deg.
        // To land segment 0 at Top: Rotate -X/2 ?
        // To land segment i at Top: Rotate -(i * segmentAngle + segmentAngle/2).

        const segmentAngle = 360 / PRIZES.length;
        const targetAngle = randomIndex * segmentAngle + (segmentAngle / 2);

        // We want to rotate CW. 
        // Full spins (5) + angle to bring target to top.
        // If target is at 30deg (right of top), we need to rotate -30deg (CCW) or 330deg (CW) to bring it to top.
        // So: rotation = 360 - targetAngle.
        // Total rotation = 5 * 360 + (360 - targetAngle).

        // Fine tuning: Ensure it lands in center.
        const spinAngle = 360 * 5 + (360 - targetAngle);

        await controls.start({
            rotate: spinAngle,
            transition: { duration: 4, ease: "circOut" }
        });

        // 3. Award Prize
        const success = await spinWheel(selectedPrize.value);

        if (success) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
            toast.success(`${selectedPrize.value} Puan Kazandın! 🎉`);
            // Reset rotation visually? Next time we add to it? 
            // Ideally we reset without animation or accumulate.
            // For simplicity, we just leave it. 
            // If user refreshes, it resets.
        }

        setSpinning(false);
    };

    return (
        <div className="flex flex-col items-center justify-center py-10 pb-24">
            <h1 className="text-3xl font-hand font-bold text-love-600 mb-2">Şans Çarkı</h1>
            <p className="text-gray-500 mb-8 text-sm">Günde 1 kez çevir, puanları kap! 🌸</p>

            <div className="relative w-80 h-80 md:w-96 md:h-96">
                {/* Pointer (Indicator) at TOP */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                    <div className="w-8 h-12 flex flex-col items-center justify-end">
                        <div className="w-4 h-8 bg-love-600 rounded-lg shadow-lg border-2 border-white"></div>
                        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[14px] border-t-love-600 -mt-1"></div>
                    </div>
                </div>

                {/* Wheel Container */}
                <motion.div
                    animate={controls}
                    initial={{ rotate: 0 }}
                    className="w-full h-full rounded-full border-[8px] border-white shadow-[0_0_40px_rgba(255,182,193,0.6)] overflow-hidden relative"
                    style={{
                        background: `conic-gradient(
                          ${PRIZES.map((p, i) => `${p.color} ${i * (360 / PRIZES.length)}deg ${(i + 1) * (360 / PRIZES.length)}deg`).join(', ')}
                        )`
                    }}
                >
                    {/* Lines & Text */}
                    {PRIZES.map((prize, i) => {
                        const midAngle = i * (360 / PRIZES.length) + (180 / PRIZES.length); // Center of segment
                        return (
                            <div
                                key={i}
                                className="absolute top-0 left-1/2 h-1/2 w-0.5 origin-bottom flex justify-center pt-6"
                                style={{
                                    transform: `translateX(-50%) rotate(${midAngle}deg)`,
                                }}
                            >
                                {/* Text Container - Rotate text to be readable? Or vertical? */}
                                {/* Actually for conic gradient, the segment starts at 12 oclock and goes CW? */}
                                {/* No, CSS Conic Gradient starts at 12 o'clock and goes CW. */}
                                {/* So index 0 is 0deg to Xdeg. */}
                                {/* Our text needs to be in the middle of that wedge. */}

                                <div className="text-center w-20 -ml-10 transform -rotate-0">
                                    <span className="font-bold text-gray-700 text-xs shadow-sm bg-white/40 px-1 rounded block">
                                        {prize.value}
                                    </span>
                                    <span className="text-xl drop-shadow-md">✨</span>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>

                {/* Center Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg z-10 flex items-center justify-center border-4 border-love-100">
                    <div className="text-3xl">❤️</div>
                </div>
            </div>

            <button
                onClick={handleSpin}
                disabled={spinning || !isEligible}
                className="mt-12 bg-gradient-to-r from-love-400 to-love-600 text-white font-bold py-4 px-12 rounded-full shadow-xl hover:shadow-love-200/50 hover:scale-105 disabled:bg-none disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-95"
            >
                {spinning ? 'Bol Şans... 🍀' : isEligible ? 'Çarkı Çevir!' : 'Yarın Görüşürüz 👋'}
            </button>

            {!isEligible && (
                <div className="mt-4 bg-orange-50 text-orange-600 px-4 py-2 rounded-lg text-xs font-bold border border-orange-100">
                    Günlük hakkın doldu. Yarın 00:00'da yenilenecek!
                </div>
            )}
        </div>
    );
}
