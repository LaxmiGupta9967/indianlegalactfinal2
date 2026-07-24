
// File: components/pages/ActsPage.tsx

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpenIcon, LinkIcon } from '../icons/Icons';
import { mockActs } from '../../services/mockData';

// Define a type for the Act object we expect from the mock data
interface Act {
    id: number;
    slug: string;
    name: string;
    description: string;
    sectionsCount: number | string; // Allow string for formatted counts like '4,200+'
    casesLinked: string;
}

const ActsPage: React.FC = () => {
    const [acts, setActs] = useState<Act[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchActs = () => {
            setLoading(true);
            setError(null);
            // Simulate a network request with a timeout
            setTimeout(() => {
                try {
                    setActs(mockActs);
                } catch (err: any) {
                    setError('Failed to load mock data.');
                    console.error("Failed to fetch acts:", err);
                } finally {
                    setLoading(false);
                }
            }, 500); // 500ms delay to simulate loading
        };

        fetchActs();
    }, []); // The empty dependency array ensures this runs only once on component mount

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <BookOpenIcon className="mx-auto h-12 w-12 text-gold mb-4" />
                <h1 className="mt-4 text-4xl font-bold font-heading text-navy dark:text-white">The Model Acts</h1>
                <p className="mt-2 text-lg text-dark-gray dark:text-gray-300">
                    Browse BNS, BNSS, and BSA by chapter and section.
                </p>
            </div>

            <div className="space-y-8">
                {loading && <p className="text-center">Loading acts...</p>}
                {error && <p className="text-center text-red-500">Error: {error}</p>}
                {!loading && !error && acts.map((act) => (
                    <div key={act.id} className="bg-white dark:bg-navy p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                       <h2 className="font-heading text-2xl font-bold text-gold">{act.name} ({act.slug.toUpperCase()})</h2>
                       <p className="mt-2 text-dark-gray dark:text-gray-300">{act.description}</p>
                       <div className="mt-4 flex items-center gap-6 text-sm text-dark-gray dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                           <span><strong>{act.sectionsCount}</strong> Sections</span>
                           <span><strong>{act.casesLinked}</strong> Cases Linked</span>
                       </div>
                       <div className="mt-4">
                            <NavLink to={`/act/${act.slug}`} className="font-semibold text-gold hover:underline flex items-center gap-1">
                                Explore Act <LinkIcon className="w-4 h-4" />
                            </NavLink>
                       </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActsPage;
