'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function ThinkTankPage() {
  const [posts, setPosts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [signals, setSignals] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedSectors, setExpandedSectors] = useState({});
  const [expandedSignals, setExpandedSignals] = useState({});
  const [selectedSubSector, setSelectedSubSector] = useState(null);
  const limit = 10;
  const fetchedPages = useRef(new Set());
  const isInitialMount = useRef(true);
  const observer = useRef(null);

  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loading) {
            console.log('IntersectionObserver triggered, incrementing page');
            setPage((prev) => {
              const nextPage = prev + 1;
              console.log('New page set:', nextPage);
              return nextPage;
            });
          }
        },
        { threshold: 0.1 }
      );
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchPosts = useCallback(
    async (pageToFetch, reset = false) => {
      if (loading && !reset) {
        console.log('Fetch skipped: Already loading');
        return;
      }
      if (fetchedPages.current.has(pageToFetch) && !reset) {
        console.log(`Fetch skipped: Page ${pageToFetch} already fetched`);
        return;
      }

      setLoading(true);
      fetchedPages.current.add(pageToFetch);
      try {
        const params = new URLSearchParams({ page: pageToFetch, limit });
        if (selectedSubSector) {
          params.append('subSectorId', selectedSubSector);
        }
        console.log(`Fetching posts for page ${pageToFetch}, params: ${params}`);
        const response = await fetch(`/api/think-tank/influencer-comment?${params}`);
        const result = await response.json();
        console.log('API Response:', {
          page: result.page,
          totalPosts: result.totalPosts,
          postIds: result.data?.map((p) => p._id) || [],
          sectors: result.sectors?.map((s) => s.sectorName) || [],
          signals: result.signals?.map((s) => s.signalName) || [],
        });

        if (result.success) {
          const newPosts = result.data || [];
          console.log(`Fetched page ${pageToFetch} post IDs:`, newPosts.map((p) => p._id));

          setPosts((prev) => {
            const existingIds = new Set(prev.map((post) => post._id));
            const uniqueNewPosts = newPosts.filter((post) => !existingIds.has(post._id));
            const updatedPosts = reset ? uniqueNewPosts : [...prev, ...uniqueNewPosts];
            console.log('Updated posts state:', updatedPosts.map((p) => ({ _id: p._id, title: p.postTitle })));
            const uniqueIds = new Set(updatedPosts.map((p) => p._id));
            if (uniqueIds.size !== updatedPosts.length) {
              console.warn('Duplicate IDs detected:', updatedPosts.map((p) => p._id));
            }
            return updatedPosts;
          });

          if (reset) {
            setSectors(result.sectors || []);
            setSignals(result.signals || []);
            setExpandedSectors({});
            setExpandedSignals({});
          }

          setTotalPosts(result.totalPosts);
          setHasMore((pageToFetch - 1) * limit + newPosts.length < result.totalPosts);
          if (reset) {
            fetchedPages.current.clear();
            fetchedPages.current.add(pageToFetch);
          }
        } else {
          console.error('API Error:', result.error);
          setPosts([]);
          if (reset) {
            setSectors([]);
            setSignals([]);
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setPosts([]);
        if (reset) {
          setSectors([]);
          setSignals([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [loading, selectedSubSector]
  );

  useEffect(() => {
    if (isInitialMount.current) {
      console.log('Initial mount, fetching page 1');
      isInitialMount.current = false;
      fetchPosts(1, true);
    }
  }, [fetchPosts]);

  useEffect(() => {
    if (page > 1) {
      console.log('Fetching next page:', page);
      fetchPosts(page);
    }
  }, [page, fetchPosts]);

  const toggleSector = (sectorId) => {
    setExpandedSectors((prev) => ({
      ...prev,
      [sectorId]: !prev[sectorId],
    }));
  };

  const toggleSignal = (signalId) => {
    setExpandedSignals((prev) => ({
      ...prev,
      [signalId]: !prev[signalId],
    }));
  };

  const handleSubSectorClick = (subSectorId) => {
    if (selectedSubSector === subSectorId) {
      setSelectedSubSector(null);
    } else {
      setSelectedSubSector(subSectorId);
    }
    setPage(1);
    setPosts([]);
    fetchedPages.current.clear();
    fetchPosts(1, true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-6">
      <div className="md:w-1/3 bg-white rounded-lg shadow-sm p-6 h-fit">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sectors</h2>
          <div className="space-y-3">
            {sectors.map((sector) => (
              <div key={sector._id}>
                <div
                  className="flex items-center justify-between cursor-pointer p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => toggleSector(sector._id)}
                >
                  <span className="text-gray-800 font-semibold">{sector.sectorName}</span>
                  <span className="text-gray-600 text-lg font-medium">
                    {expandedSectors[sector._id] ? '−' : '+'}
                  </span>
                </div>
                {expandedSectors[sector._id] && (
                  <div className="ml-4 mt-2 space-y-2 animate-fade-in">
                    {sector.subSectors.map((subSector) => (
                      <div
                        key={subSector._id}
                        className={`text-gray-600 text-sm pl-3 border-l-2 border-blue-200 hover:text-gray-800 transition-colors cursor-pointer ${
                          selectedSubSector === subSector._id ? 'font-bold text-blue-600' : ''
                        }`}
                        onClick={() => handleSubSectorClick(subSector._id)}
                      >
                        {subSector.subSectorName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Signals</h2>
          <div className="space-y-3">
            {signals.map((signal) => (
              <div key={signal._id}>
                <div
                  className="flex items-center justify-between cursor-pointer p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => toggleSignal(signal._id)}
                >
                  <span className="text-gray-800 font-semibold">{signal.signalName}</span>
                  <span className="text-gray-600 text-lg font-medium">
                    {expandedSignals[signal._id] ? '−' : '+'}
                  </span>
                </div>
                {expandedSignals[signal._id] && (
                  <div className="ml-4 mt-2 space-y-2 animate-fade-in">
                    {signal.subSignals.map((subSignal) => (
                      <div
                        key={subSignal._id}
                        className="text-gray-600 text-sm pl-3 border-l-2 border-blue-200 hover:text-gray-800 transition-colors"
                      >
                        {subSignal.subSignalName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="md:w-2/3">
        <div className="space-y-6">
          {posts.length === 0 && !loading ? (
            <p className="text-gray-600">No posts found{selectedSubSector ? ' for the selected subsector.' : '.'}</p>
          ) : (
            posts.map((post, index) => {
              const isLastElement = posts.length === index + 1;
              return (
                <div
                  key={post._id}
                  ref={isLastElement ? lastPostElementRef : null}
                  className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2">
                      {post.sectors.slice(0, 3).map((sector) => (
                        <span
                          key={sector._id}
                          className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full"
                        >
                          {sector.sectorName}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{post.postTitle}</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">{post.summary}</p>
                  {post.sourceUrl && (
                    <a
                      href={post.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Read Full
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-400 border-t-transparent"></div>
          </div>
        )}
      </div>
    </div>
  );
}