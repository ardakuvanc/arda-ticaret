import { useState } from 'react';
import { useStore } from '../context/StoreContext';

export default function PartnerLinkForm() {
    const { linkPartners } = useStore();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLink = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        const success = await linkPartners(code.trim());
        setLoading(false);

        if (success) setCode('');
    };

    return (
        <form onSubmit={handleLink} className="flex gap-2">
            <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Partnerinin kodunu gir..."
                maxLength={6}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all font-mono"
            />
            <button
                type="submit"
                disabled={loading || code.length < 6}
                className="bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? '...' : 'Bağla'}
            </button>
        </form>
    );
}
