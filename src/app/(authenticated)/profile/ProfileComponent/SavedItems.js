'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  TypeOne,
  TypeTwo,
  TypeThree,
  TypeFour,
  TypeFive,
  TypeNum,
} from './_components';

export default function SavedItems() {
  const [savedItems, setSavedItems] = useState({ contexts: [], posts: [], themes: [] });
  const [savedStatus, setSavedStatus] = useState({ contexts: {}, posts: {}, themes: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const getUserEmail = () => {
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      const user = JSON.parse(userDataStr);
      return user.email;
    }
    return null;
  };

  const formatSummary = (summary) => {
    if (!summary || summary.trim() === '') return ['Summary will be available soon'];

    const parser = new DOMParser();
    const doc = parser.parseFromString(summary, 'text/html');

    const pointTags = ['li', 'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

    const collectPoints = (node, points = []) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        if (pointTags.includes(tagName)) {
          const innerHTML = node.innerHTML.trim();
          if (innerHTML.length > 0) {
            points.push(innerHTML);
          }
        } else {
          Array.from(node.childNodes).forEach((child) => collectPoints(child, points));
        }
      }
      return points;
    };

    let formattedPoints = collectPoints(doc.body);

    formattedPoints = formattedPoints
      .map((point) =>
        point
          .replace(/&/g, '&')
          .replace(/\s+/g, ' ')
          .trim()
      )
      .filter((point) => point.length > 0);

    formattedPoints = formattedPoints.map((point) => `• ${point}`);

    return formattedPoints.length > 0 ? formattedPoints : ['Summary will be available soon'];
  };

  const normalizeTitle = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\$/g, 'dollar')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  useEffect(() => {
    const fetchSavedItems = async () => {
      const userDataStr = localStorage.getItem('user');
      if (!userDataStr) {
        setError('User not logged in');
        setIsLoading(false);
        return;
      }

      const { email } = JSON.parse(userDataStr);
      if (!email) {
        setError('User email not found');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user-saved-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (response.ok) {
          setSavedItems({
            contexts: data.savedItems.contexts || [],
            posts: data.savedItems.posts || [],
            themes: data.savedItems.themes || [],
          });
          setSavedStatus({
            contexts: Object.fromEntries(
              data.savedItems.contexts.map((context) => [context._id, true])
            ),
            posts: Object.fromEntries(
              data.savedItems.posts.map((post) => [post._id, true])
            ),
            themes: Object.fromEntries(
              data.savedItems.themes.map((theme) => [theme._id, true])
            ),
          });
        } else {
          throw new Error(data.error || 'Failed to fetch saved items');
        }
      } catch (err) {
        console.error('Error fetching saved items:', err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedItems();
  }, []);

  const handleUnsaveContext = async (contextId) => {
    const email = getUserEmail();
    if (!email) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/context-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextId, email, action: 'unsave' }),
      });
      const data = await response.json();
      if (response.ok) {
        setSavedItems((prev) => ({
          ...prev,
          contexts: prev.contexts.filter((context) => context._id !== contextId),
        }));
        setSavedStatus((prev) => ({
          ...prev,
          contexts: { ...prev.contexts, [contextId]: false },
        }));
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to unsave context');
      }
    } catch (error) {
      console.error('Error unsaving context:', error);
      toast.error('Error unsaving context');
    }
  };

  const handleUnsavePost = async (postId) => {
    const email = getUserEmail();
    if (!email) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/post-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, email, action: 'unsave' }),
      });
      const data = await response.json();
      if (response.ok) {
        setSavedItems((prev) => ({
          ...prev,
          posts: prev.posts.filter((post) => post._id !== postId),
        }));
        setSavedStatus((prev) => ({
          ...prev,
          posts: { ...prev.posts, [postId]: false },
        }));
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to unsave post');
      }
    } catch (error) {
      console.error('Error unsaving post:', error);
      toast.error('Error unsaving post');
    }
  };

  const handleUnsaveTheme = async (themeId) => {
    const email = getUserEmail();
    if (!email) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/theme-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId, email, action: 'unsave' }),
      });
      const data = await response.json();
      if (response.ok) {
        setSavedItems((prev) => ({
          ...prev,
          themes: prev.themes.filter((theme) => theme._id !== themeId),
        }));
        setSavedStatus((prev) => ({
          ...prev,
          themes: { ...prev.themes, [themeId]: false },
        }));
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to unsave theme');
      }
    } catch (error) {
      console.error('Error unsaving theme:', error);
      toast.error('Error unsaving theme');
    }
  };

  const handleShareContext = async (context) => {
    try {
      const slug = context.contextTitle
        ? normalizeTitle(context.contextTitle)
        : `context-${context._id}`;
      const shareData = {
        title: context.contextTitle,
        text: `Check out this context: ${context.contextTitle}\nSectors: ${context.sectorNames.join(', ')}\nSub-Sectors: ${context.subSectorNames.join(', ')}`,
        url: window.location.origin + `/context-details/${slug}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareText = `${context.contextTitle}\n\nSectors: ${context.sectorNames.join(', ')}\nSub-Sectors: ${context.subSectorNames.join(', ')}\n\nCheck out this context: ${window.location.origin}/context-details/${slug}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing context:', error);
      toast.error('Error sharing context');
    }
  };

  const handleSharePost = async (post) => {
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
      console.error('Error sharing post:', error);
      toast.error('Error sharing post');
    }
  };

  const handleShareTheme = async (theme) => {
    try {
      const slugified = theme.themeTitle
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '');

      const shareData = {
        title: theme.themeTitle,
        text: `Check out this trend: ${theme.themeTitle}`,
        url: window.location.origin + `/analyzer/theme-details/${slugified}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareText = `${theme.themeTitle}\n\nCheck out this trend: ${window.location.origin}/analyzer/theme-details/${slugified}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing theme:', error);
      toast.error('Error sharing theme');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full mt-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mt-8 text-red-600 text-center">
        Error: {error}
      </div>
    );
  }

  const hasItems =
    savedItems.contexts.length > 0 ||
    savedItems.posts.length > 0 ||
    savedItems.themes.length > 0;

  if (!hasItems) {
    return <></>;
  }

  const groupedContexts = {
    'Type-Two': [],
    'Type-Three': [],
    'Type-Four': [],
    'Type-Five': [],
    'Type-Num': [],
    'Type-One': [],
  };

  savedItems.contexts.forEach((context, index) => {
    const type = context.containerType || 'Type-One';
    groupedContexts[type].push({ ...context, index });
  });

  const containerTypes = [
    'Type-Two',
    'Type-Three',
    'Type-Four',
    'Type-Five',
    'Type-Num',
    'Type-One',
  ];

  return (
    <div className="w-full mt-4">
      <p className="text-xl font-semibold text-gray-800 mt-5 flex justify-center items-center mb-3">
        Saved Items
      </p>
      <div className="space-y-6">
        {/* Contexts */}
        {containerTypes.map((type) =>
          groupedContexts[type].length > 0 ? (
            <div key={type} className="w-full space-y-4">
              {type === 'Type-One' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {groupedContexts[type].map(({ index, ...context }) => (
                    <TypeOne
                      key={context._id}
                      context={{ ...context, id: context._id }}
                      formatSummary={formatSummary}
                      handleUnsave={handleUnsaveContext}
                      handleShare={handleShareContext}
                    />
                  ))}
                </div>
              ) : (
                groupedContexts[type].map(({ index, ...context }) => {
                  const props = {
                    context: { ...context, id: context._id },
                    formatSummary,
                    handleUnsave: handleUnsaveContext,
                    handleShare: handleShareContext,
                  };
                  switch (type) {
                    case 'Type-Two':
                      return <TypeTwo key={context._id} {...props} />;
                    case 'Type-Three':
                      return <TypeThree key={context._id} {...props} />;
                    case 'Type-Four':
                      return <TypeFour key={context._id} {...props} />;
                    case 'Type-Five':
                      return <TypeFive key={context._id} {...props} />;
                    case 'Type-Num':
                      return <TypeNum key={context._id} {...props} />;
                    default:
                      return null;
                  }
                })
              )}
            </div>
          ) : null
        )}

        {/* Posts */}
        {savedItems.posts.length > 0 && (
          <div className="w-full space-y-6">
            {savedItems.posts.map((post, index) => (
              <div
                key={`${post._id}-${index}`}
                className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex space-x-2">
                    {post.sectorNames.slice(0, 3).map((sector, i) => (
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
                  {post.sourceName} | {post.postType}
                </p>
                <div className="text-gray-700 mb-4">
                  <p dangerouslySetInnerHTML={{ __html: post.summary }} />
                </div>
                <div className="flex gap-3">
                  <a
                    href={post.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm font-medium"
                  >
                    read full comment <span className="ml-1">→</span>
                  </a>
                  <button
                    onClick={() => handleUnsavePost(post._id)}
                    className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                      savedStatus.posts[post._id]
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill={savedStatus.posts[post._id] ? 'currentColor' : 'none'}
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
                    {savedStatus.posts[post._id] ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={() => handleSharePost(post)}
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

        {/* Themes */}
        {savedItems.themes.length > 0 && (
          <div className="w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
              {savedItems.themes.map((theme) => {
                const slugified = theme.themeTitle
                  .toString()
                  .toLowerCase()
                  .trim()
                  .replace(/\s+/g, '-')
                  .replace(/[^\w-]+/g, '')
                  .replace(/--+/g, '-')
                  .replace(/^-+|-+$/g, '');

                return (
                  <div
                    key={theme._id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 cursor-pointer"
                    onClick={() => router.push(`/analyzer/theme-details/${slugified}`)}
                  >
                    <div className="relative w-full h-[160px]">
                      <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                        1000 x 630
                      </div>
                    </div>

                    <div className="p-5">
                      {theme.themeTitle && (
                        <h2 className="text-lg font-bold text-gray-800 mb-4">
                          {theme.themeTitle}
                        </h2>
                      )}

                      <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 rounded-lg overflow-hidden">
                        <div className="p-3 text-center border-r border-white">
                          <div className="text-sm font-medium text-gray-500 mb-1">
                            Trending <br /> Pulse
                          </div>
                          <div className="text-base font-bold text-blue-600">
                            {theme.trendingScore?.toFixed(2) || 'N/A'}
                          </div>
                        </div>

                        <div className="p-3 text-center border-r border-white">
                          <div className="text-sm font-medium text-gray-500 mb-1">
                            Disruption Potential
                          </div>
                          <div className="text-base font-bold text-purple-600">
                            {theme.impactScore?.toFixed(2) || 'N/A'}
                          </div>
                        </div>

                        <div className="p-3 text-center">
                          <div className="text-sm font-medium text-gray-500 mb-1">
                            Predictive Momentum
                          </div>
                          <div className="text-base font-bold text-indigo-600">
                            {theme.predictiveMomentumScore?.toFixed(2) || 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {theme.sectorNames?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {theme.sectorNames.map((sector, index) => (
                              <span
                                key={`${sector}-${index}`}
                                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium inline-flex items-center"
                              >
                                {sector}
                              </span>
                            ))}
                          </div>
                        )}

                        {theme.subSectorNames?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {theme.subSectorNames.map((subSector, index) => (
                              <span
                                key={`${subSector}-${index}`}
                                className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium inline-flex items-center"
                              >
                                {subSector}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnsaveTheme(theme._id);
                          }}
                          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                            savedStatus.themes[theme._id]
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2"
                            fill={savedStatus.themes[theme._id] ? 'currentColor' : 'none'}
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
                          {savedStatus.themes[theme._id] ? 'Saved' : 'Save'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareTheme(theme);
                          }}
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
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}