'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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
  const [savedPosts, setSavedPosts] = useState({});
  const router = useRouter();

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
  ];

  const postTypeDisplayMap = {
    'Expert Opinion': 'Expert Opinion',
    'Infographic': 'Market Statistics',
    'Interview': 'Interview',
    'News': 'News',
    'Research Report': 'Research Report',
  };

  const getUserEmail = () => {
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      const user = JSON.parse(userDataStr);
      return user.email;
    }
    return null;
  };

  const fetchSavedStatuses = async (postIds, email) => {
    try {
      const savedStatuses = {};
      for (const postId of postIds) {
        const response = await fetch(
          `/api/post-save?postId=${postId}&email=${encodeURIComponent(email)}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        const data = await response.json();
        savedStatuses[postId] = data.isSaved || false;
      }
      setSavedPosts((prev) => ({ ...prev, ...savedStatuses }));
    } catch (error) {
      console.error('Error fetching saved statuses:', error);
      toast.error('Error checking saved posts');
    }
  };

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

  const fetchPosts = async (
    page,
    postType,
    sectorId,
    subsectorId,
    signalId,
    subsignalId
  ) => {
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
        const newPosts = page === 1 ? data.posts : [...posts, ...data.posts];
        setPosts(newPosts);
        setHasMore(data.pagination.hasMore);
        setTotalPages(data.pagination.totalPages);

        const email = getUserEmail();
        if (email && data.posts.length > 0) {
          const postIds = data.posts.map((post) => post._id);
          await fetchSavedStatuses(postIds, email);
        }
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
    fetchPosts(
      1,
      selectedPostType,
      selectedSectorId,
      selectedSubsectorId,
      selectedSignalId,
      selectedSubsignalId
    );
  }, [
    selectedPostType,
    selectedSectorId,
    selectedSubsectorId,
    selectedSignalId,
    selectedSubsignalId,
  ]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(
        page,
        selectedPostType,
        selectedSectorId,
        selectedSubsectorId,
        selectedSignalId,
        selectedSubsignalId
      );
    }
  }, [page]);

  const handlePostTypeClick = (postType) => {
    setSelectedPostType(postType);
  };

  const handleSectorClick = (sectorId) => {
    if (selectedSectorId === sectorId && !selectedSubsectorId) {
      setSelectedSectorId(null);
    } else {
      setSelectedSectorId(sectorId);
      setSelectedSubsectorId(null);
    }
    setSelectedSignalId(null);
    setSelectedSubsignalId(null);
  };

  const handleSubsectorClick = (subsectorId, parentSectorId) => {
    if (selectedSubsectorId === subsectorId) {
      setSelectedSubsectorId(null);
    } else {
      setSelectedSubsectorId(subsectorId);
      setSelectedSectorId(parentSectorId);
    }
    setSelectedSignalId(null);
    setSelectedSubsignalId(null);
  };

  const handleSignalClick = (signalId) => {
    if (selectedSignalId === signalId && !selectedSubsignalId) {
      setSelectedSignalId(null);
    } else {
      setSelectedSignalId(signalId);
      setSelectedSubsignalId(null);
    }
    setSelectedSectorId(null);
    setSelectedSubsectorId(null);
  };

  const handleSubsignalClick = (subsignalId, parentSignalId) => {
    if (selectedSubsignalId === subsignalId) {
      setSelectedSubsignalId(null);
    } else {
      setSelectedSubsignalId(subsignalId);
      setSelectedSignalId(parentSignalId);
    }
    setSelectedSectorId(null);
    setSelectedSubsectorId(null);
  };

  const toggleSectorExpand = (sectorId) => {
    setExpandedSectors((prev) => ({ ...prev, [sectorId]: !prev[sectorId] }));
  };

  const toggleSignalExpand = (signalId) => {
    setExpandedSignals((prev) => ({ ...prev, [signalId]: !prev[signalId] }));
  };

  const toggleShowAllSubsectors = (sectorId) => {
    setShowAllSubsectors((prev) => ({ ...prev, [sectorId]: !prev[sectorId] }));
  };

  const toggleShowAllSubsignals = (signalId) => {
    setShowAllSubsignals((prev) => ({ ...prev, [signalId]: !prev[signalId] }));
  };

  const handleRemoveFilter = async (filterType) => {
    let newPostType = selectedPostType;
    let newSectorId = selectedSectorId;
    let newSubsectorId = selectedSubsectorId;
    let newSignalId = selectedSignalId;
    let newSubsignalId = selectedSubsignalId;

    switch (filterType) {
      case 'postType':
        newPostType = null;
        setSelectedPostType(null);
        break;
      case 'sector':
        newSectorId = null;
        newSubsectorId = null;
        setSelectedSectorId(null);
        setSelectedSubsectorId(null);
        break;
      case 'subsector':
        newSubsectorId = null;
        setSelectedSubsectorId(null);
        break;
      case 'signal':
        newSignalId = null;
        newSubsignalId = null;
        setSelectedSignalId(null);
        setSelectedSubsignalId(null);
        break;
      case 'subsignal':
        newSubsignalId = null;
        setSelectedSubsignalId(null);
        break;
      default:
        break;
    }

    setPosts([]);
    setPage(1);
    setHasMore(true);

    await fetchPosts(
      1,
      newPostType,
      newSectorId,
      newSubsectorId,
      newSignalId,
      newSubsignalId
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleShare = async (post) => {
    try {
      const shareData = {
        title: post.postTitle,
        text: post.summary,
        url: post.sourceUrl,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareText = `${post.postTitle}\n\n${post.summary}\n\nRead more: ${post.sourceUrl}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Error sharing post');
    }
  };

  const handleSave = async (postId) => {
    const email = getUserEmail();
    if (!email) {
      router.push('/login');
      return;
    }

    try {
      const isSaved = savedPosts[postId];
      const action = isSaved ? 'unsave' : 'save';
      const response = await fetch('/api/post-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, email, action }),
      });
      const data = await response.json();
      if (response.ok) {
        setSavedPosts((prev) => ({ ...prev, [postId]: action === 'save' }));
        toast.success(data.message);
      } else {
        toast.error(data.error || `Failed to ${action} post`);
      }
    } catch (error) {
      console.error(`Error ${savedPosts[postId] ? 'unsaving' : 'saving'} post:`, error);
      toast.error(`Error ${savedPosts[postId] ? 'unsaving' : 'saving'} post`);
    }
  };

  const visibleSectors = showMoreSectors ? sectors : sectors.slice(0, 5);
  const visibleSignals = showMoreSignals ? signals : signals.slice(0, 5);

  const selectedSector = selectedSectorId
    ? sectors.find((s) => s._id === selectedSectorId)?.sectorName
    : null;
  const selectedSubsector = selectedSubsectorId
    ? sectors
        .flatMap((s) => s.subsectors)
        .find((sub) => sub._id === selectedSubsectorId)?.subSectorName
    : null;
  const selectedSignal = selectedSignalId
    ? signals.find((s) => s._id === selectedSignalId)?.signalName
    : null;
  const selectedSubsignal = selectedSubsignalId
    ? signals
        .flatMap((s) => s.subsignals)
        .find((sub) => sub._id === selectedSubsignalId)?.subSignalName
    : null;

  return (
    <div className="bg-gray-50 flex px-12">
      <div className="w-1/4 bg-white shadow-md p-6 h-fit my-5 rounded-lg">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Insights Modules</h2>
        <ul className="mb-4 space-y-2">
          <li
            key="all-posts"
            className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${
              selectedPostType === null
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handlePostTypeClick(null)}
          >
            <span>All Posts</span>
          </li>
          {postTypes.map((type) => (
            <li
              key={type}
              className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${
                selectedPostType === type
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => handlePostTypeClick(type)}
            >
              <span>{postTypeDisplayMap[type]}</span>
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
                        .slice(
                          0,
                          showAllSubsectors[sector._id]
                            ? sector.subsectors.length
                            : 4
                        )
                        .map((subsector) => (
                          <li
                            key={subsector._id}
                            className={`p-2 rounded-md cursor-pointer relative ${
                              selectedSubsectorId === subsector._id
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            } before:content-['|'] before:absolute before:left-0 before:text-gray-400 before:leading-none before:pr-2`}
                            onClick={() =>
                              handleSubsectorClick(subsector._id, sector._id)
                            }
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
                        .slice(
                          0,
                          showAllSubsignals[signal._id]
                            ? signal.subsignals.length
                            : 4
                        )
                        .map((subsignal) => (
                          <li
                            key={subsignal._id}
                            className={`p-2 rounded-md cursor-pointer relative ${
                              selectedSubsignalId === subsignal._id
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            } before:content-['|'] before:absolute before:left-0 before:text-gray-400 before:leading-none before:pr-2`}
                            onClick={() =>
                              handleSubsignalClick(subsignal._id, signal._id)
                            }
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
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedPostType && (
            <div className="flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              <span>{postTypeDisplayMap[selectedPostType]}</span>
              <button
                onClick={() => handleRemoveFilter('postType')}
                className="ml-2 text-blue-800 hover:text-blue-600"
              >
                ×
              </button>
            </div>
          )}
          {selectedSectorId && !selectedSubsectorId && (
            <div className="flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              <span>{selectedSector}</span>
              <button
                onClick={() => handleRemoveFilter('sector')}
                className="ml-2 text-blue-800 hover:text-blue-600"
              >
                ×
              </button>
            </div>
          )}
          {selectedSubsectorId && (
            <div className="flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              <span>{`${selectedSector} > ${selectedSubsector}`}</span>
              <button
                onClick={() => handleRemoveFilter('subsector')}
                className="ml-2 text-blue-800 hover:text-blue-600"
              >
                ×
              </button>
            </div>
          )}
          {selectedSignalId && !selectedSubsignalId && (
            <div className="flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              <span>{selectedSignal}</span>
              <button
                onClick={() => handleRemoveFilter('signal')}
                className="ml-2 text-blue-800 hover:text-blue-600"
              >
                ×
              </button>
            </div>
          )}
          {selectedSubsignalId && (
            <div className="flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              <span>{`${selectedSignal} > ${selectedSubsignal}`}</span>
              <button
                onClick={() => handleRemoveFilter('subsignal')}
                className="ml-2 text-blue-800 hover:text-blue-600"
              >
                ×
              </button>
            </div>
          )}
        </div>
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
                <p className="text-gray-600 text-sm mb-2">
                  {post.source} | {post.postType}
                </p>
                <div className="text-gray-700 mb-4">
                  <p dangerouslySetInnerHTML={{ __html: post.summary }} />
                </div>
                <div className="flex gap-3">
                  <a
                    href={post.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    Read More <span className="ml-1">→</span>
                  </a>
                  <button
                    onClick={() => handleSave(post._id)}
                    className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                      savedPosts[post._id]
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill={savedPosts[post._id] ? 'currentColor' : 'none'}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                    {savedPosts[post._id] ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={() => handleShare(post)}
                    className="inline-flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-medium"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    Share
                  </button>
                </div>
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