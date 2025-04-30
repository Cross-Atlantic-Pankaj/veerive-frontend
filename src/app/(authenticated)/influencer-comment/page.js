'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedPostType, setSelectedPostType] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedSubsector, setSelectedSubsector] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [sectors, setSectors] = useState([]);
  const [showMoreSectors, setShowMoreSectors] = useState(false);
  const [expandedSectors, setExpandedSectors] = useState({});

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
      const response = await fetch('http://localhost:3000/api/ContextSectorSignals');
      const data = await response.json();
      if (data.success) {
        setSectors(data.data.sectors);
      }
    } catch (error) {
      console.error('Error fetching sectors:', error);
    }
  };

  const fetchPosts = async (page, postType, sector, subsector) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      if (postType) queryParams.append('postType', postType);
      if (subsector) queryParams.append('subsector', subsector);
      else if (sector) queryParams.append('sector', sector); // Use 'sector' instead of '§or'

      const url = `/api/influencer-comment?${queryParams.toString()}`;
      console.log('Fetching posts with URL:', url);

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        if (page === 1) {
          setPosts(data.posts);
        } else {
          setPosts((prevPosts) => [...prevPosts, ...data.posts]);
        }
        setHasMore(data.pagination.hasMore);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Error fetching posts:', data.error);
      }
    } catch (error) {
      console.error('Fetch error:', error);
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
    fetchPosts(1, selectedPostType, selectedSector, selectedSubsector);
  }, [selectedPostType, selectedSector, selectedSubsector]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, selectedPostType, selectedSector, selectedSubsector);
    }
  }, [page]);

  const handlePostTypeClick = (postType) => {
    if (postType === selectedPostType) {
      setSelectedPostType(null);
    } else {
      setSelectedPostType(postType);
    }
  };

  const handleSectorClick = (sector) => {
    if (selectedSector === sector && !selectedSubsector) {
      setSelectedSector(null);
    } else {
      setSelectedSector(sector);
      setSelectedSubsector(null);
    }
  };

  const handleSubsectorClick = (subsector) => {
    if (selectedSubsector === subsector) {
      setSelectedSubsector(null);
    } else {
      setSelectedSubsector(subsector);
      const parentSector = sectors.find(s => s.subsectors.some(sub => sub.subSectorName === subsector));
      setSelectedSector(parentSector ? parentSector.sectorName : null);
    }
  };

  const toggleSectorExpand = (sectorId) => {
    setExpandedSectors((prev) => ({
      ...prev,
      [sectorId]: !prev[sectorId]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const visibleSectors = showMoreSectors ? sectors : sectors.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-1/4 bg-white shadow-md p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Categories</h2>
        <ul className="mb-6">
          <li
            className={`p-2 cursor-pointer rounded-md mb-2 flex items-center justify-between ${
              selectedPostType === null
                ? 'bg-blue-100 text-blue-800'
                : 'text-gray-800 hover:bg-gray-100'
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
                selectedPostType === type
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-800 hover:bg-gray-100'
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
                className="p-2 cursor-pointer rounded-md mb-2 flex items-center justify-between text-gray-800 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSectorExpand(sector._id);
                }}
              >
                <span>{sector.sectorName}</span>
                <span className="text-gray-500">
                  {expandedSectors[sector._id] ? '−' : '+'}
                </span>
              </li>
              {expandedSectors[sector._id] && (
                <ul className="ml-4">
                  <li
                    className={`p-2 cursor-pointer rounded-md mb-2 ${
                      selectedSector === sector.sectorName && !selectedSubsector
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-800 hover:bg-gray-100'
                    }`}
                    onClick={() => handleSectorClick(sector.sectorName)}
                  >
                    {sector.sectorName}
                  </li>
                  {sector.subsectors && sector.subsectors.map((subsector) => (
                    <li
                      key={subsector._id}
                      className={`p-2 cursor-pointer rounded-md mb-2 ${
                        selectedSubsector === subsector.subSectorName
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => handleSubsectorClick(subsector.subSectorName)}
                    >
                      {subsector.subSectorName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {sectors.length > 5 && (
            <li
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
          {selectedSector && ` - ${selectedSector}`}
          {selectedSubsector && ` - ${selectedSubsector}`}
        </h1>
        {posts.length === 0 && !isLoading ? (
          <p className="text-gray-600">No posts found.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <div
                key={`${post.postTitle}-${index}`}
                ref={index === posts.length - 1 ? lastPostElementRef : null}
                className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex space-x-2">
                    {post.sectors.map((sector, i) => (
                      <span
                        key={i}
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

                 {/* Source | Post Type */}
                 <p className="text-gray-600 text-sm mb-2">
                  {post.source} | {post.postType}
                </p>
                
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