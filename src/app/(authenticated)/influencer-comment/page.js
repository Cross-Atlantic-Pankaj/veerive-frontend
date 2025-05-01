'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedPostType, setSelectedPostType] = useState(null);
  const [selectedSectorId, setSelectedSectorId] = useState(null);
  const [selectedSubsectorId, setSelectedSubsectorId] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [sectors, setSectors] = useState([]);
  const [showMoreSectors, setShowMoreSectors] = useState(false);
  const [expandedSectors, setExpandedSectors] = useState({});
  const [showAllSubsectors, setShowAllSubsectors] = useState({});

  const observer = useRef();
  const lastPostElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  const postTypes = [
    'Expert Opinion',
    'Infographic',
    'Interview',
    'News',
    'Research Report',
    'Loyalty Programs'
  ];

  const fetchSectorsAndSignals = async () => {
    try {
      const response = await fetch('/api/ContextSectorSignals');
      const data = await response.json();
      console.log('Fetched sectors data:', data);
      if (data.success) {
        setSectors(data.data.sectors || []);
      }
    } catch (error) {
      console.error('Error fetching sectors:', error);
    }
  };

  const fetchPosts = async (page, postType, sectorId, subsectorId) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      if (postType) queryParams.append('postType', postType);
      if (subsectorId) queryParams.append('subsectorId', subsectorId);
      else if (sectorId) queryParams.append('sectorId', sectorId);

      const url = `/api/influencer-comment?${queryParams.toString()}`;
      console.log('Fetching posts from URL:', url);

      const response = await fetch(url);
      const data = await response.json();
      console.log('Fetched posts response:', data);

      if (data.success) {
        setPosts(prevPosts => page === 1 ? data.posts : [...prevPosts, ...data.posts]);
        setHasMore(data.pagination.hasMore);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('API error:', data.error);
        setPosts([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSectorsAndSignals();
  }, []);

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, selectedPostType, selectedSectorId, selectedSubsectorId);
  }, [selectedPostType, selectedSectorId, selectedSubsectorId]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, selectedPostType, selectedSectorId, selectedSubsectorId);
    }
  }, [page]);

  const handlePostTypeClick = (postType) => {
    setSelectedPostType(prev => prev === postType ? null : postType);
    // No clearing of sector or subsector filters
  };

  const handleSectorClick = (sectorId) => {
    setSelectedSectorId(prev => prev === sectorId && !selectedSubsectorId ? null : sectorId);
    // No clearing of category filter
    setSelectedSubsectorId(null); // Clear subsector when selecting a new sector
  };

  const handleSubsectorClick = (subsectorId, parentSectorId) => {
    setSelectedSubsectorId(prev => prev === subsectorId ? null : subsectorId);
    setSelectedSectorId(parentSectorId);
    // No clearing of category filter
  };

  const toggleSectorExpand = (sectorId) => {
    setExpandedSectors(prev => ({ ...prev, [sectorId]: !prev[sectorId] }));
  };

  const toggleShowAllSubsectors = (sectorId) => {
    setShowAllSubsectors(prev => ({ ...prev, [sectorId]: !prev[sectorId] }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const visibleSectors = showMoreSectors ? sectors : sectors.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-1/4 bg-white shadow-md p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Categories</h2>
        <ul className="mb-6">
          <li
            key="all-posts"
            className={`p-2 cursor-pointer rounded-md mb-2 flex items-center justify-between ${
              selectedPostType === null ? 'bg-blue-100 text-blue-800' : 'text-gray-800 hover:bg-gray-100'
            }`}
            onClick={() => handlePostTypeClick(null)}
          >
            <span>All Posts</span>
            <span className="text-gray-500">+</span>
          </li>
          {postTypes.map((type) => (
            <li
              key={type}
              className={`p-2 cursor-pointer rounded-md mb-2 flex items-center justify-between ${
                selectedPostType === type ? 'bg-blue-100 text-blue-800' : 'text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handlePostTypeClick(type)}
            >
              <span>{type}</span>
              <span className="text-gray-500">+</span>
            </li>
          ))}
        </ul>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Sectors</h2>
        <ul className="mb-6">
          {visibleSectors.map((sector) => (
            <div key={sector._id}>
              <li
                className="p-2 rounded-md mb-2 flex items-center justify-between text-gray-800 hover:bg-gray-100"
                onClick={() => toggleSectorExpand(sector._id)} // Expand toggle only
              >
                <span>{sector.sectorName}</span>
                <span
                  className="cursor-pointer text-gray-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSectorExpand(sector._id); // Expand toggle on click
                  }}
                >
                  {expandedSectors[sector._id] ? '−' : '+'}
                </span>
              </li>
              {expandedSectors[sector._id] && (
                <ul className="ml-4">
                  <li
                    className={`p-2 cursor-pointer rounded-md mb-2 ${
                      selectedSectorId === sector._id && !selectedSubsectorId
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-800 hover:bg-gray-100'
                    }`}
                    onClick={() => handleSectorClick(sector._id)} // Filter on sector click
                  >
                    {sector.sectorName}
                  </li>
                  {sector.subsectors && (
                    <>
                      {sector.subsectors
                        .slice(0, showAllSubsectors[sector._id] ? sector.subsectors.length : 4)
                        .map((subsector) => (
                          <li
                            key={subsector._id}
                            className={`p-2 cursor-pointer rounded-md mb-2 ${
                              selectedSubsectorId === subsector._id
                                ? 'bg-blue-100 text-blue-800'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            onClick={() => handleSubsectorClick(subsector._id, sector._id)}
                          >
                            {subsector.subSectorName}
                          </li>
                        ))}
                      {sector.subsectors.length > 4 && (
                        <li
                          key={`${sector._id}-more`}
                          className="p-2 cursor-pointer rounded-md text-blue-600 hover:bg-gray-100"
                          onClick={() => toggleShowAllSubsectors(sector._id)}
                        >
                          {showAllSubsectors[sector._id] ? 'Less' : `More (${sector.subsectors.length - 4})`}
                        </li>
                      )}
                    </>
                  )}
                </ul>
              )}
            </div>
          ))}
          {sectors.length > 5 && (
            <li
              key="more-less"
              className="p-2 cursor-pointer rounded-md text-blue-600 hover:bg-gray-100"
              onClick={() => setShowMoreSectors(!showMoreSectors)}
            >
              {showMoreSectors ? 'Less' : 'More'}
            </li>
          )}
        </ul>
      </div>

      <div className="w-3/4 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {selectedPostType ? `${selectedPostType} Posts` : 'All Posts'}
          {selectedSectorId && sectors.find(s => s._id === selectedSectorId)?.sectorName
            && ` - ${sectors.find(s => s._id === selectedSectorId).sectorName}`}
          {selectedSubsectorId && sectors
            .flatMap(s => s.subsectors)
            .find(sub => sub._id === selectedSubsectorId)?.subSectorName
            && ` - ${sectors
              .flatMap(s => s.subsectors)
              .find(sub => sub._id === selectedSubsectorId).subSectorName}`}
        </h1>
        {posts.length === 0 && !isLoading ? (
          <p className="text-gray-600">No posts found.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <div
                key={`${post._id}-${index}`}
                ref={index === posts.length - 1 ? lastPostElementRef : null}
                className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex space-x-2">
                    {post.sectors.slice(0, 3).map((sector, i) => (
                      <span
                        key={`${sector}-${i}`}
                        className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded-full"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm">
                    {formatDate(post.date || new Date())}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  {post.postTitle}
                </h2>
                <p className="text-gray-700 mb-4">{post.summary}</p>
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm font-medium"
                >
                  read full comment <span className="ml-1">→</span>
                </a>
              </div>
            ))}
          </div>
        )}
        {isLoading && (
          <div className="text-center mt-4">
            <p className="text-gray-600">Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
}