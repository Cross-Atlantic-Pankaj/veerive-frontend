'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function TrendAnalyzer() {
  const [themes, setThemes] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalThemes, setTotalThemes] = useState(0);
  const limit = 9;
  const fetchedPages = useRef(new Set());
  const isInitialMount = useRef(true);
  const lastFetchFilter = useRef('');
  const router = useRouter();

  const observer = useRef(null);
  const lastThemeElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        debounce((entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prev) => prev + 1);
          }
        }, 300),
        { threshold: 0.1 }
      );
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const fetchThemes = useCallback(
    async (pageToFetch, reset = false) => {
      if (loading && !reset) return;
      if (fetchedPages.current.has(pageToFetch) && !reset && lastFetchFilter.current === selectedFilter) return;

      setLoading(true);
      fetchedPages.current.add(pageToFetch);
      try {
        const params = new URLSearchParams({ page: pageToFetch, limit });
        if (selectedFilter) {
          const isSector = sectors.some((sector) => sector.sectorId === selectedFilter);
          if (isSector) {
            params.append('sectorId', selectedFilter);
          } else {
            params.append('subSectorId', selectedFilter);
          }
        }

        console.log(`Fetching themes for page ${pageToFetch}, params: ${params}`);
        const response = await fetch(`/api/analyzer/trend-analyzer?${params}`);
        const result = await response.json();
        console.log('API Response:', result);

        if (result.success) {
          const newThemes = result.data || [];
          console.log(`Fetched page ${pageToFetch} theme IDs:`, newThemes.map(t => t._id.toString()));

          setThemes((prev) => {
            const existingIds = new Set(prev.map((theme) => theme._id.toString()));
            const uniqueNewThemes = newThemes.filter((theme) => !existingIds.has(theme._id.toString()) || reset);
            const updatedThemes = reset ? uniqueNewThemes : [...prev, ...uniqueNewThemes];
            console.log('Updated themes state:', updatedThemes.map(t => ({ _id: t._id, title: t.themeTitle })));
            return updatedThemes;
          });

          setTotalThemes(result.totalThemes);
          setHasMore((pageToFetch - 1) * limit + newThemes.length < result.totalThemes);
          if (reset) {
            setSectors(result.Sectordata || []);
            fetchedPages.current.clear();
            fetchedPages.current.add(pageToFetch);
            lastFetchFilter.current = selectedFilter;
            console.log('Sectors set to:', result.Sectordata);
          }
        } else {
          setError(result.error || 'Failed to fetch themes');
        }
      } catch (err) {
        setError('Failed to fetch themes data');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    },
    [selectedFilter, sectors, loading]
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchThemes(1, true);
    } else if (selectedFilter !== lastFetchFilter.current) {
      setThemes([]);
      setPage(1);
      setHasMore(true);
      fetchThemes(1, true);
    }
  }, [selectedFilter, fetchThemes]);

  useEffect(() => {
    if (page > 1) {
      fetchThemes(page);
    }
  }, [page, fetchThemes]);

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  const clearFilters = () => {
    setSelectedFilter('');
  };

  const handleThemeClick = (theme) => {
    const slug = slugify(theme.themeTitle);
    console.log('Navigating to slug:', slug);
    router.push(`/analyzer/theme-details/${slug}`);
  };
  
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gray-50 min-h-screen px-12">
      <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Get Trends of Your Choice</h2>
          {selectedFilter && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear Filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-6">
          <div className="flex-1 min-w-[250px]">
            <label htmlFor="filter" className="block text-base font-semibold text-gray-700 mb-2">
              Sector / SubSector
            </label>
            <div className="relative">
              <select
                id="filter"
                value={selectedFilter}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="">All Trends</option>
                {sectors.map((sector) => (
                  <optgroup key={sector.sectorId} label={sector.sectorName}>
                    <option value={sector.sectorId}>{sector.sectorName}</option>
                    {sector.subsectors.map((subsector) => (
                      <option
                        key={subsector.subSectorId}
                        value={subsector.subSectorId}
                        className="pl-6"
                      >
                        -- {subsector.subSectorName}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {themes.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Trend available</h3>
          <p className="text-gray-500 text-center max-w-md">
            No themes match your current filter criteria. Try adjusting your filters or check back later.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {themes.map((theme, index) => {
            const isLastElement = themes.length === index + 1;
            return (
              <div
                key={theme._id.toString()}
                ref={isLastElement ? lastThemeElementRef : null}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 cursor-pointer"
                onClick={() => handleThemeClick(theme)}
              >
                <div className="relative w-full h-[160px]">
                  {theme.trendingScoreImage ? (
                    <Image
                      src={theme.trendingScoreImage}
                      alt={theme.themeTitle || 'Trend Image'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                      1000 x 180
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">{theme.themeTitle || 'No Title'}</h2>

                  <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 rounded-lg overflow-hidden">
                    <div className="p-3 text-center border-r border-white">
                      <div className="text-sm font-medium text-gray-500 mb-1">Trending <br /> Pulse</div>
                      <div className="text-base font-bold text-blue-600">{theme.trendingScore?.toFixed(2) || 'N/A'}</div>
                    </div>

                    <div className="p-3 text-center border-r border-white">
                      <div className="text-sm font-medium text-gray-500 mb-1">Disruption Potential</div>
                      <div className="text-base font-bold text-purple-600">{theme.impactScore?.toFixed(2) || 'N/A'}</div>
                    </div>

                    <div className="p-3 text-center">
                      <div className="text-sm font-medium text-gray-500 mb-1">Predictive Momentum</div>
                      <div className="text-base font-bold text-indigo-600">{theme.predictiveMomentumScore?.toFixed(2) || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {theme.sectors?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {theme.sectors.map((sector) => (
                          <span
                            key={sector._id}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium inline-flex items-center"
                          >
                            {sector.sectorName || 'Unknown Sector'}
                          </span>
                        ))}
                      </div>
                    )}

                    {theme.subSectors?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {theme.subSectors.map((subSector) => (
                          <span
                            key={subSector._id}
                            className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium inline-flex items-center"
                          >
                            {subSector.subSectorName || 'Unknown SubSector'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-400 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}