'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';

export default function PulseToday() {
  const [contexts, setContexts] = useState([]);
  const [displayItems, setDisplayItems] = useState([]);
  const [sidebarMessage, setSidebarMessage] = useState(null);
  const [trendingThemes, setTrendingThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expertPosts, setExpertPosts] = useState([]);
  const mainContentRef = useRef(null);
  const containerRef = useRef(null);
  const loaderRef = useRef(null);
  const observerRef = useRef();

  const lastContextCallback = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            console.log('Loading more...', page + 1);
            setPage((prev) => prev + 1);
          }
        },
        { threshold: 0.1 }
      );

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, page]
  );

  const fetchData = async (pageNum) => {
    try {
      setLoading(true);
      const res = await fetch('/api/pulse-today', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pageNum }),
      });
      const data = await res.json();
      console.log('Raw API Response:', data);
      console.log('Fetched Contexts:', data.contexts);

      setExpertPosts(data.expertPosts);

      if (pageNum === 1) {
        setContexts(data.contexts);
        setDisplayItems(processInitialContexts(data.contexts));
      } else {
        const newContexts = data.contexts.filter(
          (newContext) =>
            !contexts.some((prevContext) => prevContext.id === newContext.id)
        );
        setContexts((prev) => [...prev, ...newContexts]);
        setDisplayItems((prevDisplayItems) => [
          ...prevDisplayItems,
          ...processNewContexts(newContexts, prevDisplayItems),
        ]);
      }
      setHasMore(data.hasMore);
      setSidebarMessage(data.messages?.[0] || null);
      setTrendingThemes(data.trendingThemes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const formatSummary = (summary) => {
    if (!summary) return ['No summary available'];
    const cleaned = summary
      .replace(/<[^>]*>/g, '')
      .replace(/ /g, ' ')
      .replace(/&/g, '&')
      .trim();
    const points = cleaned.split('•').filter((s) => s.trim().length > 0);
    const MAX_SUMMARY_CHARS = 50; // Reduced to 50 characters for brevity

    if (points.length > 0) {
      if (points.length <= 2) {
        const formattedPoints = points.map((point) => `• ${point.trim()}`);
        const joinedSummary = formattedPoints.join(' ');
        return joinedSummary.length > MAX_SUMMARY_CHARS
          ? [`${joinedSummary.slice(0, MAX_SUMMARY_CHARS - 3)}...`]
          : formattedPoints;
      }
      const groupedPoints = [];
      const groupSize = Math.ceil(points.length / 2);
      for (let i = 0; i < points.length; i += groupSize) {
        const group = points
          .slice(i, i + groupSize)
          .map((p) => p.trim())
          .join(' ');
        groupedPoints.push(`• ${group}`);
      }
      return groupedPoints.slice(0, 1); // Limit to one point
    }
    return cleaned.length > MAX_SUMMARY_CHARS
      ? [`${cleaned.slice(0, MAX_SUMMARY_CHARS - 3)}...`]
      : [cleaned];
  };

  const processInitialContexts = (allContexts) => {
    const allTypeOneContexts = allContexts.filter(
      (c) => c.containerType === 'Type-One'
    );
    const allOtherContexts = allContexts.filter(
      (c) => c.containerType !== 'Type-One'
    );

    let currentGroup = [];
    const typeOneGroups = [];

    allTypeOneContexts.forEach((context) => {
      if (currentGroup.length < 3) {
        currentGroup.push(context);
      }
      if (
        currentGroup.length === 3 ||
        allTypeOneContexts.indexOf(context) === allTypeOneContexts.length - 1
      ) {
        if (currentGroup.length > 0) {
          const maxDisplayOrder = Math.max(
            ...currentGroup.map((c) => c.displayOrder || 0)
          );
          typeOneGroups.push({
            type: 'group',
            items: [...currentGroup],
            displayOrder: maxDisplayOrder,
          });
          currentGroup = [];
        }
      }
    });

    const otherItems = allOtherContexts.map((context) => ({
      type: 'single',
      item: context,
      displayOrder: context.displayOrder || 0,
    }));

    return [...typeOneGroups, ...otherItems].sort(
      (a, b) => b.displayOrder - a.displayOrder
    );
  };

  const processNewContexts = (newContexts, prevDisplayItems) => {
    const newTypeOneContexts = newContexts.filter(
      (c) => c.containerType === 'Type-One'
    );
    const newOtherContexts = newContexts.filter(
      (c) => c.containerType !== 'Type-One'
    );

    const lastGroup = prevDisplayItems
      .filter((item) => item.type === 'group')
      .pop();
    let currentGroup =
      lastGroup && lastGroup.items.length < 3 ? [...lastGroup.items] : [];
    const newTypeOneGroups =
      lastGroup && lastGroup.items.length < 3
        ? []
        : prevDisplayItems.filter((item) => item.type === 'group');

    newTypeOneContexts.forEach((context) => {
      if (currentGroup.length < 3) {
        currentGroup.push(context);
      }
      if (
        currentGroup.length === 3 ||
        newTypeOneContexts.indexOf(context) === newTypeOneContexts.length - 1
      ) {
        if (currentGroup.length > 0) {
          const maxDisplayOrder = Math.max(
            ...currentGroup.map((c) => c.displayOrder || 0)
          );
          newTypeOneGroups.push({
            type: 'group',
            items: [...currentGroup],
            displayOrder: maxDisplayOrder,
          });
          currentGroup = [];
        }
      }
    });

    if (currentGroup.length > 0) {
      const maxDisplayOrder = Math.max(
        ...currentGroup.map((c) => c.displayOrder || 0)
      );
      newTypeOneGroups.push({
        type: 'group',
        items: [...currentGroup],
        displayOrder: maxDisplayOrder,
      });
    }

    const newOtherItems = newOtherContexts.map((context) => ({
      type: 'single',
      item: context,
      displayOrder: context.displayOrder || 0,
    }));

    return [...newTypeOneGroups, ...newOtherItems].sort(
      (a, b) => b.displayOrder - a.displayOrder
    );
  };

  const renderContextBox = (context, isLastItem) => {
    const sectorsLabel = [...context.sectors, ...context.subSectors].join(' • ');
    const summaryPoints = formatSummary(context.summary);

    switch (context.containerType) {
      case 'Type-One':
        return (
          <div
            key={context.id}
            ref={isLastItem ? lastContextCallback : null}
            className="bg-white rounded-lg overflow-hidden w-full"
          >
            {context.bannerImage ? (
              <img
                src={context.bannerImage}
                alt="banner"
                className="w-full h-[120px] sm:h-[140px] md:h-[160px] object-cover"
              />
            ) : (
              <div className="w-full h-[120px] sm:h[140px] md:h-[160px] bg-gray-300 flex items-center justify-center text-gray-400 text-xs sm:text-sm">
                1000 × 630
              </div>
            )}
            <div className="px-3 py-2 sm:px-4 sm:py-3">
              <div className="flex flex-wrap gap-1 sm:gap-2 mb-1">
                {[...context.sectors, ...context.subSectors].map((name, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] sm:text-xs text-black-600 relative inline-block font-medium border-b-2 border-green-500"
                  >
                    {name}
                  </span>
                ))}
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
                {context.contextTitle}
              </h3>
            </div>
          </div>
        );

      case 'Type-Two':
        return (
          <div
            ref={isLastItem ? lastContextCallback : null}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col p-4 sm:p-5 w-full"
          >
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="w-full sm:w-1/3">
                {context.bannerImage ? (
                  <img
                    src={context.bannerImage}
                    alt="Banner"
                    className="w-full h-16 sm:h-20 md:h-24 lg:h-28 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-16 sm:h-20 md:h-24 lg:h-28 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs sm:text-sm">
                    1000 × 630
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col">
                <div className="text-red-600 text-[10px] sm:text-xs font-semibold mb-1">
                  {sectorsLabel}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                  {context.contextTitle}
                </h2>
              </div>
            </div>

            <div className="mb-4">
              {summaryPoints.length > 0 ? (
                summaryPoints.map((point, i) => (
                  <div
                    key={i}
                    className="text-gray-600 text-xs sm:text-sm line-clamp-1 mb-1"
                  >
                    {point}
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-xs sm:text-sm italic line-clamp-1">
                  Summary will be available soon
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {context.posts?.slice(0, 2).map((post, i) => (
                <div
                  key={i}
                  className="flex-1 border-t border-gray-100 pt-1"
                >
                  <div className="font-semibold text-gray-800 text-[10px] sm:text-xs hover:text-indigo-600 transition-colors line-clamp-2">
                    {post.postTitle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Type-Three':
        return (
          <div
            ref={isLastItem ? lastContextCallback : null}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 w-full"
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Left Side: Banner Image and Content */}
              <div className="flex-1 flex flex-col">
                <div className="flex flex-row items-start gap-3 sm:gap-4">
                  {/* Banner Image */}
                  <div className="w-full sm:w-1/3">
                    {context.bannerImage ? (
                      <img
                        src={context.bannerImage}
                        alt="Banner"
                        className="w-full h-16 sm:h-20 md:h-24 lg:h-28 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-16 sm:h-20 md:h-24 lg:h-28 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs sm:text-sm">
                        1000 × 630
                      </div>
                    )}
                  </div>
                  {/* Sector Label and Context Title */}
                  <div className="flex-1">
                    <div className="text-red-600 text-[10px] sm:text-xs font-semibold mb-1">
                      {sectorsLabel}
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                      {context.contextTitle}
                    </h2>
                  </div>
                </div>
                {/* Summary Points */}
                <div className="mt-3">
                  {summaryPoints.length > 0 ? (
                    summaryPoints.map((point, i) => (
                      <div
                        key={i}
                        className="text-gray-600 text-xs sm:text-sm line-clamp-1 mb-1"
                      >
                        {point}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-xs sm:text-sm italic line-clamp-1">
                      Summary will be available soon
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: 3 Post Titles in Column */}
              <div className="w-full sm:w-1/3 flex flex-col justify-between">
                {context.posts?.slice(0, 3).map((post, i) => (
                  <div
                    key={i}
                    className="border-t border-gray-100 pt-0.5 mt-0.5 first:border-t-0 first:mt-0"
                  >
                    <div className="font-semibold text-gray-800 text-[10px] sm:text-xs hover:text-indigo-600 transition-colors line-clamp-2">
                      {post.postTitle}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'Type-Four':
        return (
          <div
            ref={isLastItem ? lastContextCallback : null}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 w-full"
          >
            {/* 1st Row: Banner Image, Sector Label, and Context Title */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="w-full sm:w-1/3">
                {context.bannerImage ? (
                  <img
                    src={context.bannerImage}
                    alt="Banner"
                    className="w-full h-16 sm:h-20 md:h-24 lg:h-28 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-16 sm:h-20 md:h-24 lg:h-28 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs sm:text-sm">
                    1000 × 630
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col">
                <div className="text-red-600 text-[10px] sm:text-xs font-semibold mb-1">
                  {sectorsLabel}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                  {context.contextTitle}
                </h2>
              </div>
            </div>

            {/* 2nd Row: Summary Points and One Post Title */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="mb-4">
                  {summaryPoints.length > 0 ? (
                    summaryPoints.map((point, i) => (
                      <div
                        key={i}
                        className="text-gray-600 text-xs sm:text-sm line-clamp-1 mb-1"
                      >
                        {point}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-xs sm:text-sm italic line-clamp-1">
                      Summary coming soon...
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full sm:w-1/3">
                {context.posts?.[0] && (
                  <div className="border-t border-gray-100 pt-0.5">
                    <div className="font-semibold text-gray-800 text-[10px] sm:text-xs hover:text-indigo-600 transition-colors line-clamp-2">
                      {context.posts[0].postTitle}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3rd Row: Three Post Titles in a Row */}
            <div className="flex flex-col sm:flex-row gap-2">
              {context.posts?.slice(1, 4).map((post, i) => (
                <div
                  key={i}
                  className="flex-1 border-t border-gray-100 pt-0.5"
                >
                  <div className="font-semibold text-gray-800 text-[10px] sm:text-xs hover:text-indigo-600 transition-colors line-clamp-2">
                    {post.postTitle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Type-Five':
        return (
          <div
            ref={isLastItem ? lastContextCallback : null}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 w-full"
          >
            <div className="text-black-600 text-[10px] sm:text-xs font-semibold mb-2">
              {context.contextTitle}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="w-full sm:w-1/3">
                {context.bannerImage ? (
                  <img
                    src={context.bannerImage}
                    alt="Banner"
                    className="w-full h-40 sm:h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-xs sm:text-sm text-gray-500">
                    1000 × 630
                  </div>
                )}
              </div>
              <div className="flex-1">
                {context.posts?.length > 0 && (
                  <div className="flex flex-col gap-0">
                    <div className="flex flex-col sm:flex-row items-start">
                      <div className="flex-1 w-full sm:w-auto">
                        <div className="font-semibold text-gray-800 text-[10px] sm:text-xs hover:text-indigo-600 transition-colors leading-none">
                          {context.posts[0].postTitle}
                        </div>
                      </div>
                      {context.posts
                        .slice(1, 4)
                        .map((post, i) => (
                          <div
                            key={i}
                            className="flex-1 w-full sm:w-auto border-l-0 sm:border-l border-gray-100 pl-0 sm:pl-4 mt-2 sm:mt-0"
                          >
                            <div className="font-semibold text-gray-800 text-[10px] sm:text-xs hover:text-indigo-600 transition-colors leading-none">
                              {post.postTitle}
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row items-start mt-3">
                      <div className="flex-1 w-full sm:w-auto">
                        {summaryPoints.length > 0 ? (
                          summaryPoints.map((point, i) => (
                            <div
                              key={i}
                              className="text-gray-600 text-xs sm:text-sm line-clamp-1 leading-tight mt-0"
                            >
                              {point}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400 text-xs sm:text-sm italic line-clamp-1 leading-tight mt-0">
                            Summary will be available soon
                          </div>
                        )}
                      </div>
                      {context.posts
                        .slice(Math.ceil(context.posts.length / 2))
                        .map((post, i) => (
                          <div
                            key={i}
                            className="flex-1 w-full sm:w-auto border-l-0 sm:border-l border-gray-100 pl-0 sm:pl-4 mt-2 sm:mt-0"
                          >
                            <div className="font-semibold text-gray-800 text-[10px] sm:text-xs hover:text-indigo-600 transition-colors leading-none">
                              {post.postTitle}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'Type-Num':
        return (
          <div
            ref={isLastItem ? lastContextCallback : null}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 h-fit w-full"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="text-3xl sm:text-4xl font-bold text-indigo-600 whitespace-nowrap">
                {context.dataForTypeNum}
              </div>
              <div className="flex-1">
                {summaryPoints.length > 0 ? (
                  <ul className="text-gray-600 text-xs sm:text-sm">
                    {summaryPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-xs sm:text-sm italic">
                    Summary will be soon
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (error) {
    return <div className="text-center text-red-500 py-10">Error: {error}</div>;
  }

  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
        <div
          ref={containerRef}
          className="flex flex-col lg:flex-row gap-6 lg:gap-8 relative"
        >
          <div
            ref={mainContentRef}
            className="w-full transition-all duration-300 ease-in-out lg:w-[72%]"
          >
            {displayItems.map((displayItem, index) => {
              const isLastItem = index === displayItems.length - 1 && hasMore;
              if (displayItem.type === 'group') {
                return (
                  <div
                    key={`group-${index}`}
                    className={`grid grid-cols-${Math.min(
                      displayItem.items.length,
                      3
                    )} sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 sm:mb-8`}
                  >
                    {displayItem.items.map((context) =>
                      renderContextBox(
                        context,
                        isLastItem &&
                          displayItem.items.indexOf(context) ===
                            displayItem.items.length - 1
                      )
                    )}
                  </div>
                );
              } else {
                return (
                  <div key={displayItem.item.id} className="mb-6 sm:mb-8">
                    {renderContextBox(displayItem.item, isLastItem)}
                  </div>
                );
              }
            })}

            {hasMore && (
              <div ref={loaderRef} className="text-center py-6">
                {loading && (
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent" />
                )}
              </div>
            )}
          </div>

          <div className="w-full lg:w-[28%]">
            {sidebarMessage && (
              <div className="bg-white p-4 sm:p-5 rounded-xl shadow-md mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-teal-500 text-base sm:text-lg">✦</span>
                  <span className="font-semibold text-gray-900 text-base sm:text-lg">
                    {sidebarMessage.title}
                  </span>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {sidebarMessage.content}
                </p>
              </div>
            )}

            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg text-gray-800">
                  Trending Themes
                </h2>
                <Link
                  href="/trend-analyzer"
                  className="text-indigo-600 text-sm flex items-center hover:text-indigo-700"
                >
                  VIEW More →
                </Link>
              </div>

              <div className="space-y-3">
                {trendingThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className="border-b border-dashed border-gray-300 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full border-2 border-blue-500 text-blue-500 font-medium text-sm">
                        {theme.score.toFixed(1)}
                      </div>

                      <div className="break-words">
                        <h3 className="font-medium text-gray-800 text-sm">
                          {theme.title}
                        </h3>
                        <div className="mt-1 text-xs text-gray-500">
                          {theme.sectors.length > 0 && theme.sectors[0]}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white mt-6 p-4 sm:p-5 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-base sm:text-lg text-gray-900">
                  Trending Expert Opinion
                </h2>
              </div>
              <div className="space-y-4">
                {expertPosts.map((post, index) => (
                  <div
                    key={index}
                    className="border-b border-dashed border-gray-200 pb-3 last:border-none"
                  >
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors">
                      {post.postTitle}
                    </h3>
                  </div>
                ))}
              </div>
              {hasMore && (
                <div className="mt-4 text-right">
                  <Link
                    href="/trend-analyzer"
                    className="text-indigo-600 text-xs sm:text-sm font-medium hover:underline"
                  >
                    VIEW More →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </Suspense>
  );
}