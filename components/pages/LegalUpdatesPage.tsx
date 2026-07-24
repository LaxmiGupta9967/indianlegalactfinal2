
import React, { useState, useEffect, useMemo } from 'react';
import { LegalUpdate } from '../../types';
import {
  SearchIcon,
  ClockIcon,
  FilterIcon,
  BookOpenIcon,
  LegalScaleIcon,
  ExclamationTriangleIcon
} from '../icons/Icons';
import { mockLegalUpdates } from '../../services/mockData';

type SortOrder = 'date-desc' | 'date-asc' | 'topic-asc';

const ShimmerCard: React.FC = () => (
  <div className="bg-white dark:bg-navy p-6 rounded-lg shadow-md animate-pulse">
    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
    <div className="flex items-center gap-4 text-xs mb-4">
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
    </div>
    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-32 mt-2"></div>
  </div>
);

const LegalUpdatesPage: React.FC = () => {
  const [updates, setUpdates] = useState<LegalUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');
  const [activeTopic, setActiveTopic] = useState('All');

  useEffect(() => {
    const fetchUpdates = () => {
      setLoading(true);
      setError(null);
      // Simulate a network request with a timeout
      setTimeout(() => {
        try {
          // Use the imported mock data
          setUpdates(mockLegalUpdates);
          setLastRefreshed(new Date());
        } catch (err: any) {
          console.error("Fetch error:", err);
          setError("Could not load mock legal updates.");
        } finally {
          setLoading(false);
        }
      }, 500); // 500ms delay
    };

    fetchUpdates();
  }, []);

  const topics = useMemo(() => {
    if (!updates || updates.length === 0) return ['All'];
    return ['All', ...Array.from(new Set(updates.map(u => u.topic).filter(Boolean)))];
  }, [updates]);

  const processedUpdates = useMemo(() => {
    return updates
      .filter(update => {
        const matchesTopic = activeTopic === 'All' || update.topic === activeTopic;
        const matchesSearch =
          searchTerm.trim() === '' ||
          update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (update.summary && update.summary.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesTopic && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortOrder) {
          case 'date-asc':
            return a.date.getTime() - b.date.getTime();
          case 'topic-asc':
            return a.topic.localeCompare(b.topic);
          case 'date-desc':
          default:
            return b.date.getTime() - a.date.getTime();
        }
      });
  }, [updates, activeTopic, searchTerm, sortOrder]);

  return (
    <div className="py-8 animate-fade-in container mx-auto px-4 sm:px-6 lg:px-8">
      <header className="text-center mb-8">
        <LegalScaleIcon className="w-12 h-12 mx-auto text-gold mb-4" />
        <h1 className="font-heading text-4xl font-bold text-navy dark:text-white">
          Legal Updates & Recent Judgments
        </h1>
        <p className="mt-2 text-lg text-dark-gray dark:text-gray-300">
          Daily news and analysis from the world of Indian law.
        </p>

        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
          {lastRefreshed && !loading ? (
            <>
              <ClockIcon className="w-4 h-4" />
              <span>Last Refreshed: {lastRefreshed.toLocaleString()}</span>
            </>
          ) : (
            <span>{loading ? 'Fetching latest updates...' : ''}</span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8">
        <main className="lg:col-span-3">
          {/* Controls */}
          <div className="bg-white dark:bg-navy p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row gap-4 items-center sticky top-20 z-40">
            <div className="relative w-full md:flex-grow">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-light-neutral dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="w-full md:w-auto px-4 py-2 bg-light-neutral dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="date-desc">Sort: Newest First</option>
              <option value="date-asc">Sort: Oldest First</option>
              <option value="topic-asc">Sort: By Topic</option>
            </select>
          </div>
          
          {/* Content Area */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-md flex items-start gap-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold">Failed to Fetch Updates</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
            
            {loading && !error && Array.from({ length: 4 }).map((_, i) => <ShimmerCard key={i} />)}

            {!loading && !error && processedUpdates.length === 0 && (
              <div className="text-center py-20 text-dark-gray dark:text-gray-400 bg-white dark:bg-navy rounded-lg shadow-md">
                <BookOpenIcon className="mx-auto h-16 w-16" />
                <h2 className="mt-4 text-2xl font-bold font-heading text-navy dark:text-white">No Updates Found</h2>
                <p className="mt-2">Try adjusting your search or filter settings, or check back later.</p>
              </div>
            )}

            {!loading && !error && processedUpdates.map(update => (
              <article key={update.id} className="bg-white dark:bg-navy p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-gold/20 text-gold text-xs font-bold rounded-full self-start">{update.topic}</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{update.date.toLocaleDateString()}</p>
                </div>

                <h2 className="font-heading text-xl font-bold text-navy dark:text-white mb-2">{update.title}</h2>
                <p className="text-dark-gray dark:text-gray-300 text-sm mb-4 line-clamp-3">{update.summary}</p>

                <a
                  href={update.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-gold text-navy px-5 py-2 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
                >
                  Read Full Article
                </a>
              </article>
            ))}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white dark:bg-navy p-4 rounded-lg shadow-md">
              <h3 className="font-heading text-lg font-bold text-gold flex items-center gap-2 mb-3">
                <FilterIcon className="w-5 h-5" />
                Popular Topics
              </h3>

              <ul className="space-y-2">
                {topics.map(topic => (
                  <li key={topic}>
                    <button
                      onClick={() => setActiveTopic(topic)}
                      className={`w-full text-left text-sm px-3 py-2 rounded transition-colors ${
                        activeTopic === topic
                          ? 'bg-gold/20 text-gold font-semibold'
                          : 'text-dark-gray dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      aria-pressed={activeTopic === topic}
                    >
                      {topic}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <footer className="text-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">Sources: LiveLaw, Bar & Bench, PRS India.</p>
      </footer>
    </div>
  );
};

export default LegalUpdatesPage;
