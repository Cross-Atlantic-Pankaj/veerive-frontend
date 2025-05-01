'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedPostType, setSelectedPostType] = useState(null);
  const [selectedSectorId, setSelectedSectorId] = useState(null);
  const [selectedSubsectorId, setSelectedSubsectorId] = useState(null);
  const [selectedSignalId, setSelectedSignalId] = useState(null);
  const [selectedSubsignalId, setSelectedSubsignalId] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [sectors, setSectors] = useState([]);
  const [signals, setSignals] = useState([]);
  const [showMoreSectors, setShowMoreSectors] = useState(false);
  const [showMoreSignals, setShowMoreSignals] = useState(false);
  const [expandedSectors, setExpandedSectors] = useState({});
  const [expandedSignals, setExpandedSignals] = useState({});
  const [showAllSubsectors, setShowAllSubsectors] = useState({});
  const [showAllSubsignals, setShowAllSubsignals] = useState({});

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
      console.log('Fetched sectors and signals data:', data);
      if (data.success) {
        setSectors(data.data.sectors || []);
        setSignals(data.data.signals || []);
      }
    } catch (error) {
      console.error('Error fetching sectors and signals:', error);
    }
  };

  const fetchPosts = async (page, postType, sectorId, subsectorId, signalId, subsignalId) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      if (postType) queryParams.append('postType', postType);
      if (subsectorId) queryParams.append('subsectorId', subsectorId);
      else if (sectorId) queryParams.append('sectorId', sectorId);
      if (subsignalId) queryParams.append('subsignalId', subsignalId);
      else if (signalId) queryParams.append('signalId', signalId);

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
    fetchPosts(1, selectedPostType, selectedSectorId, selectedSubsectorId, selectedSignalId, selectedSubsignalId);
  }, [selectedPostType, selectedSectorId, selectedSubsectorId, selectedSignalId, selectedSubsignalId]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, selectedPostType, selectedSectorId, selectedSubsectorId, selectedSignalId, selectedSubsignalId);
    }
  }, [page]);

  const handlePostTypeClick = (postType) => {
    setSelectedPostType(prev => prev === postType ? null : postType);
  };

  const handleSectorClick = (sectorId) => {
    setSelectedSectorId(prev => prev === sectorId && !selectedSubsectorId ? null : sectorId);
    setSelectedSubsectorId(null);
    setSelectedSignalId(null);
    setSelectedSubsignalId(null);
  };

  const handleSubsectorClick = (subsectorId, parentSectorId) => {
    setSelectedSubsectorId(prev => prev === subsectorId ? null : subsectorId);
    setSelectedSectorId(parentSectorId);
    setSelectedSignalId(null);
    setSelectedSubsignalId(null);
  };

  const handleSignalClick = (signalId) => {
    setSelectedSignalId(prev => prev === signalId && !selectedSubsignalId ? null : signalId);
    setSelectedSubsignalId(null);
    setSelectedSectorId(null);
    setSelectedSubsectorId(null);
  };

  const handleSubsignalClick = (subsignalId, parentSignalId) => {
    setSelectedSubsignalId(prev => prev === subsignalId ? null : subsignalId);
    setSelectedSignalId(parentSignalId);
    setSelectedSectorId(null);
    setSelectedSubsectorId(null);
  };

  const toggleSectorExpand = (sectorId) => {
    setExpandedSectors(prev => ({ ...prev, [sectorId]: !prev[sectorId] }));
  };

  const toggleSignalExpand = (signalId) => {
    setExpandedSignals(prev => ({ ...prev, [signalId]: !prev[signalId] }));
  };

  const toggleShowAllSubsectors = (sectorId) => {
    setShowAllSubsectors(prev => ({ ...prev, [sectorId]: !prev[sectorId] }));
  };

  const toggleShowAllSubsignals = (signalId) => {
    setShowAllSubsignals(prev => ({ ...prev, [signalId]: !prev[signalId] }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const visibleSectors = showMoreSectors ? sectors : sectors.slice(0, 5);
  const visibleSignals = showMoreSignals ? signals : signals.slice(0, 5);

  return (
    <div className="bg-gray-50 flex px-12">
      <div className="w-1/4 bg-white shadow-md p-6 h-fit my-5 rounded-lg">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Categories</h2>
        <ul className="mb-4 space-y-2">
          <li
            key="all-posts"
            className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${
              selectedPostType === null ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handlePostTypeClick(null)}
          >
            <span>All Posts</span>
          </li>
          {postTypes.map((type) => (
            <li
              key={type}
              className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${
                selectedPostType === type ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => handlePostTypeClick(type)}
            >
              <span>{type}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-lg font-bold text-gray-700 mb-4">Sectors</h2>
        <ul className="mb-4 space-y-2">
          {visibleSectors.map((sector) => (
            <div key={sector._id}>
              <li
                className={`p-2 rounded-md flex items-center justify-between text-gray-600 hover:bg-gray-100 ${
                  expandedSectors[sector._id] ? 'bg-gray-100' : ''
                }`}
                onClick={() => toggleSectorExpand(sector._id)}
              >
                <span>{sector.sectorName}</span>
                <span
                  className="cursor-pointer text-gray-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSectorExpand(sector._id);
                  }}
                >
                  {expandedSectors[sector._id] ? '−' : '+'}
                </span>
              </li>
              {expandedSectors[sector._id] && (
                <ul className="ml-4 mt-1 space-y-1">
                  <li
                    className={`p-2 rounded-md cursor-pointer relative ${
                      selectedSectorId === sector._id && !selectedSubsectorId
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    } before:content-['|'] before:absolute before:left-0 before:text-gray-400 before:leading-none before:pr-2`}
                    onClick={() => handleSectorClick(sector._id)}
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
                            className={`p-2 rounded-md cursor-pointer relative ${
                              selectedSubsectorId === subsector._id
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            } before:content-['|'] before:absolute before:left-0 before:text-gray-400 before:leading-none before:pr-2`}
                            onClick={() => handleSubsectorClick(subsector._id, sector._id)}
                          >
                            {subsector.subSectorName}
                          </li>
                        ))}
                      {sector.subsectors.length > 4 && (
                        <li
                          key={`${sector._id}-more`}
                          className="p-2 rounded-md cursor-pointer text-blue-600 hover:bg-gray-100"
                          onClick={() => toggleShowAllSubsectors(sector._id)}
                        >
                          {showAllSubsectors[sector._id] ? 'Less' : 'More'}
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
              key="more-less-sectors"
              className="p-2 rounded-md cursor-pointer text-blue-600 hover:bg-gray-100"
              onClick={() => setShowMoreSectors(!showMoreSectors)}
            >
              {showMoreSectors ? 'Less' : 'More'}
            </li>
          )}
        </ul>

        <h2 className="text-lg font-bold text-gray-700 mb-4">Signals</h2>
        <ul className="space-y-2">
          {visibleSignals.map((signal) => (
            <div key={signal._id}>
              <li
                className={`p-2 rounded-md flex items-center justify-between text-gray-600 hover:bg-gray-100 ${
                  expandedSignals[signal._id] ? 'bg-gray-100' : ''
                }`}
                onClick={() => toggleSignalExpand(signal._id)}
              >
                <span>{signal.signalName}</span>
                <span
                  className="cursor-pointer text-gray-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSignalExpand(signal._id);
                  }}
                >
                  {expandedSignals[signal._id] ? '−' : '+'}
                </span>
              </li>
              {expandedSignals[signal._id] && (
                <ul className="ml-4 mt-1 space-y-1">
                  <li
                    className={`p-2 rounded-md cursor-pointer relative ${
                      selectedSignalId === signal._id && !selectedSubsignalId
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    } before:content-['|'] before:absolute before:left-0 before:text-gray-400 before:leading-none before:pr-2`}
                    onClick={() => handleSignalClick(signal._id)}
                  >
                    {signal.signalName}
                  </li>
                  {signal.subsignals && (
                    <>
                      {signal.subsignals
                        .slice(0, showAllSubsignals[signal._id] ? signal.subsignals.length : 4)
                        .map((subsignal) => (
                          <li
                            key={subsignal._id}
                            className={`p-2 rounded-md cursor-pointer relative ${
                              selectedSubsignalId === subsignal._id
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            } before:content-['|'] before:absolute before:left-0 before:text-gray-400 before:leading-none before:pr-2`}
                            onClick={() => handleSubsignalClick(subsignal._id, signal._id)}
                          >
                            {subsignal.subSignalName}
                          </li>
                        ))}
                      {signal.subsignals.length > 4 && (
                        <li
                          key={`${signal._id}-more`}
                          className="p-2 rounded-md cursor-pointer text-blue-600 hover:bg-gray-100"
                          onClick={() => toggleShowAllSubsignals(signal._id)}
                        >
                          {showAllSubsignals[signal._id] ? 'Less' : 'More'}
                        </li>
                      )}
                    </>
                  )}
                </ul>
              )}
            </div>
          ))}
          {signals.length > 5 && (
            <li
              key="more-less-signals"
              className="p-2 rounded-md cursor-pointer text-blue-600 hover:bg-gray-100"
              onClick={() => setShowMoreSignals(!showMoreSignals)}
            >
              {showMoreSignals ? 'Less' : 'More'}
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
          {selectedSignalId && signals.find(s => s._id === selectedSignalId)?.signalName
            && ` - ${signals.find(s => s._id === selectedSignalId).signalName}`}
          {selectedSubsignalId && signals
            .flatMap(s => s.subsignals)
            .find(sub => sub._id === selectedSubsignalId)?.subSignalName
            && ` - ${signals
              .flatMap(s => s.subsignals)
              .find(sub => sub._id === selectedSubsignalId).subSignalName}`}
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
                <h2 className="text-lg font-bold text-gray-900 mb-2">{post.postTitle}</h2>
                <p className="text-gray-600 text-sm mb-2">
                  {post.source} | {post.postType}
                </p>
                <div className="text-gray-700 mb-4">
                  <p dangerouslySetInnerHTML={{ __html: post.summary }} />
                </div>
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