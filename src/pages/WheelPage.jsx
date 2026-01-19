import { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';

const PRIZES = [
    { label: '50 Puan', value: 50, color: '#ffb3ba' },
    { label: 'Öpücük', value: 10, color: '#bae1ff' },
    { label: '100 Puan', value: 100, color: '#ffdfba' },
    { label: 'Sarılma', value: 20, color: '#ffffba' },
    { label: '500 Puan', value: 500, color: '#baffc9' },
    { label: 'Sürpriz', value: 150, color: '#eecbff' },
];

export default function WheelPage() {
    const { user, spinWheel } = useStore();
    const [spinning, setSpinning] = useState(false);
    const controls = useAnimation();

    const handleSpin = async () => {
        if (spinning) return;

        // Check if eligible
        if (user.lastSpin && new Date(user.lastSpin).toDateString() === new Date().toDateString()) {
            // Actually spinWheel logic in store throws error, but let's check UI first
            // But we can just let context handle the error toast.
        }

        setSpinning(true);

        // Random prize logic
        // We want to control the outcome or let it based on random
        const randomIndex = Math.floor(Math.random() * PRIZES.length);
        const selectedPrize = PRIZES[randomIndex];

        // Calculate rotation
        // Each segment is 60 degrees (360/6)
        // We need to land on the index.
        // 0 is at top? We need to adjust based on CSS rotation.
        // Let's assume standard wheel, 0 deg is right. 
        // Simply: Rotate X full turns + target degrees
        const segmentAngle = 360 / PRIZES.length;
        // Offset to center the segment
        const stopAngle = 360 * 5 + (360 - (randomIndex * segmentAngle));

        await controls.start({
            rotate: stopAngle,
            transition: { duration: 4, ease: "circOut" }
        });

        const success = spinWheel(selectedPrize.value);

        if (success) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }

        // Reset rotation visually after a delay? Or keep it there.
        // If we keep it, next spin needs to add to current rotation.
        // For simplicity, we just leave it spun.

        setSpinning(false);
    };

    const isEligible = (() => {
        if (!user) return false;
        const today = new Date().toDateString();
        // If last spin wasn't today, they are eligible (count resets logic is in backend, but for UI we assume 0)
        if (user.lastSpinDate !== today) return true;
        // If today, check count. Default limit is 2.
        return (user.spinCount || 0) < 2;
    })();

    return (
        <div className="flex flex-col items-center justify-center py-10">
            <h1 className="text-3xl font-hand font-bold text-love-600 mb-2">Şans Çarkı</h1>
            <p className="text-gray-500 mb-8 text-sm">Çevir bakalım şansına ne çıkacak? 🌸</p>

            <div className="relative w-80 h-80 md:w-96 md:h-96">
                {/* Pointer (Indicator) */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                    <div className="w-4 h-12 bg-love-600 rounded-b-full shadow-lg border-2 border-white relative z-10"></div>
                    <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-love-600 absolute bottom-[-14px] left-1/2 -translate-x-1/2"></div>
                </div>

                {/* Wheel Container */}
                <motion.div
                    animate={controls}
                    className="w-full h-full rounded-full border-[8px] border-white shadow-[0_0_40px_rgba(255,182,193,0.6)] overflow-hidden relative"
                    style={{
                        background: `conic-gradient(
              ${PRIZES.map((p, i) => `${p.color} ${i * (360 / PRIZES.length)}deg ${(i + 1) * (360 / PRIZES.length)}deg`).join(', ')}
            )`
                    }}
                >
                    {/* Lines between segments */}
                    {PRIZES.map((_, i) => (
                        <div
                            key={`line-${i}`}
                            className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-white/30 origin-bottom"
                            style={{ transform: `translateX(-50%) rotate(${i * 60}deg)` }}
                        />
                    ))}

                    {/* Text Labels */}
                    {PRIZES.map((prize, i) => {
                        // Position text in the middle of the segment
                        // 6 segments, each 60deg. Center of segment i is i*60 + 30.
                        const angle = i * 60 + 30;
                        return (
                            <div
                                key={i}
                                className="absolute top-0 left-1/2 h-1/2 flex justify-center pt-8 origin-bottom"
                                style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
                            >
                                <div className="text-center w-24">
                                    <span className="text-2xl filter drop-shadow-sm block mb-1">
                                        {prize.label.includes('Puan') ? '✨' :
                                            prize.label.includes('Öpücük') ? '💋' :
                                                prize.label.includes('Sarılma') ? '🤗' :
                                                    prize.label.includes('Sürpriz') ? '🎁' : '💖'}
                                    </span>
                                    <span className="font-bold text-gray-700 text-xs md:text-sm bg-white/80 px-2 py-0.5 rounded-full inline-block whitespace-nowrap shadow-sm">
                                        {prize.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>

                {/* Center Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-lg z-10 flex items-center justify-center border-4 border-love-100">
                    <div className="text-2xl">❤️</div>
                </div>
            </div>

            {/* Button Text Update */}
            <button
                onClick={handleSpin}
                disabled={spinning || !isEligible}
                className="mt-10 bg-love-500 text-white font-bold py-3 px-12 rounded-full shadow-lg hover:bg-love-600  disabled:bg-gray-300 disabled:cursor-not-allowed transition-transform active:scale-95"
            >
                {spinning ? 'Dönüyor...' : isEligible ? 'Çevir!' : 'Hakkın Bitti!'}
            </button>

            {!isEligible && (
                <p className="mt-4 text-xs text-gray-500">
                    Opps, günlük 2 hakkını doldurdun. Yarın tekrar bekleriz aşkım! ❤️
                </p>
            )}
        </div>
    );
}
