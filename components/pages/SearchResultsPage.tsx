
import React, { useState, useEffect } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import { SearchIcon, ExclamationTriangleIcon, BookOpenIcon } from '../icons/Icons';
import { mockSections } from '../../services/mockData';

interface Section {
  id: number;
  chapterId: number;
  sectionNumber: number;
  title: string;
  text: string;
}

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  const [results, setResults] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchResults = () => {
      setLoading(true);
      setError(null);

      // Simulate network delay
      setTimeout(() => {
        try {
          const lowerCaseQuery = query.toLowerCase();
          const searchResults = mockSections.filter(section =>
            section.title.toLowerCase().includes(lowerCaseQuery) ||
            section.text.toLowerCase().includes(lowerCaseQuery) ||
            String(section.sectionNumber).includes(lowerCaseQuery) ||
            `section ${section.sectionNumber}`.includes(lowerCaseQuery)
          );
          setResults(searchResults);
        } catch (err: any) {
          setError("Failed to perform search on local data.");
        } finally {
          setLoading(false);
        }
      }, 500); // 500ms delay
    };

    fetchResults();
  }, [query]);

  return (
    <div className="py-8 container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h1 className="mt-4 text-3xl font-bold font-heading text-navy dark:text-white">
          Search Results
        </h1>
        {query && (
          <p className="text-lg text-dark-gray dark:text-gray-400">
            for "<span className="font-semibold text-gold">{query}</span>"
          </p>
        )}
      </div>

      {loading && <p className="text-center">Searching...</p>}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-md flex items-center gap-4">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
          <div>
            <p className="font-bold">Search Failed</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map(section => (
                <NavLink
                  key={section.id}
                  // Link directly to the section detail page
                  to={`/section/${section.id}`}
                  className="block bg-white dark:bg-navy p-4 rounded-lg shadow-md hover:shadow-lg hover:border-gold border border-transparent transition-all duration-300"
                >
                  <h2 className="font-bold font-heading text-lg text-gold">
                    Section {section.sectionNumber}: {section.title}
                  </h2>
                  <p className="mt-2 text-sm text-dark-gray dark:text-gray-300 line-clamp-2">
                    {section.text}
                  </p>
                </NavLink>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-dark-gray dark:text-gray-400">
              <BookOpenIcon className="mx-auto h-16 w-16" />
              <h2 className="mt-4 text-2xl font-bold font-heading text-navy dark:text-white">
                No Results Found
              </h2>
              <p className="mt-2">Your search for "{query}" did not match any sections.</p>
              <p className="text-sm">Try searching for a different keyword or section number.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResultsPage;
