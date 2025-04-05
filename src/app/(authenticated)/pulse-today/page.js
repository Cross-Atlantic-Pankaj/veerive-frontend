'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';

export default function PulseToday() {
  const [contexts, setContexts] = useState([]);
  const [sidebarMessage, setSidebarMessage] = useState(null);
  const [trendingThemes, setTrendingThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expertPosts, setExpertPosts] = useState([]);

  const observerRef = useRef();
  const lastContextRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            console.log('Loading more...', page + 1);
            setPage((prev) => prev + 1);
          }
        },
        { threshold: 0.5 }
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
      console.log('Fetched Contexts:', data.contexts);

      setExpertPosts(data.expertPosts);

      if (pageNum === 1) {
        setContexts(data.contexts);
      } else {
        setContexts((prev) => {
          const newContexts = data.contexts.filter(
            (newContext) =>
              !prev.some((prevContext) => prevContext.id === newContext.id)
          );
          return [...prev, ...newContexts];
        });
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
    const MAX_SUMMARY_CHARS = 150;

    if (points.length > 0) {
      if (points.length <= 3) {
        const formattedPoints = points.map((point) => `• ${point.trim()}`);
        const joinedSummary = formattedPoints.join(' ');
        return joinedSummary.length > MAX_SUMMARY_CHARS
          ? [`${joinedSummary.slice(0, MAX_SUMMARY_CHARS - 3)}...`]
          : formattedPoints;
      }
      const groupedPoints = [];
      const groupSize = Math.ceil(points.length / (points.length > 4 ? 3 : 2));
      for (let i = 0; i < points.length; i += groupSize) {
        const group = points
          .slice(i, i + groupSize)
          .map((p) => p.trim())
          .join(' ');
        groupedPoints.push(`• ${group}`);
      }
      const joinedSummary = groupedPoints.join(' ');
      return joinedSummary.length > MAX_SUMMARY_CHARS
        ? [`${joinedSummary.slice(0, MAX_SUMMARY_CHARS - 3)}...`]
        : groupedPoints;
    }

    return cleaned.length > MAX_SUMMARY_CHARS
      ? [`${cleaned.slice(0, MAX_SUMMARY_CHARS - 3)}...`]
      : [cleaned];
  };

  const groupContexts = (contexts) => {
    const grouped = [];
    let currentGroup = [];
    let i = 0;

    while (i < contexts.length) {
      const context = contexts[i];
      const type = context.containerType;

      if (type === 'Type-One' || type === 'Type-Two') {
        if (
          currentGroup.length < 3 &&
          (currentGroup.every((c) =>
            ['Type-One', 'Type-Two'].includes(c.containerType)
          ) ||
            currentGroup.length === 0)
        ) {
          currentGroup.push(context);
        } else {
          grouped.push([...currentGroup]);
          currentGroup = [context];
        }
      } else if (type === 'Type-Three' || type === 'Type-Four') {
        if (currentGroup.length > 0) grouped.push([...currentGroup]);
        currentGroup = [];
        if (
          i + 1 < contexts.length &&
          ['Type-Three', 'Type-Four'].includes(contexts[i + 1].containerType) &&
          contexts[i + 1].id !== context.id
        ) {
          grouped.push([context, contexts[i + 1]]);
          i++;
        } else {
          grouped.push([context]);
        }
      } else if (type === 'Type-Five' || type === 'Type-Num') {
        if (currentGroup.length > 0) grouped.push([...currentGroup]);
        currentGroup = [];
        grouped.push([context]);
      }

      i++;
    }

    if (currentGroup.length > 0) grouped.push([...currentGroup]);
    return grouped;
  };

  const renderContextBox = (context, isLastItem) => {
    const sectorsLabel = [...context.sectors, ...context.subSectors].join(' • ');
    const summaryPoints = formatSummary(context.summary);

    switch (context.containerType) {
      case 'Type-One':
        return (
          <div
            key={context.id}
            ref={isLastItem ? lastContextRef : null}
            className="bg-white rounded-lg overflow-hidden col-span-1"
          >
            {context.bannerImage ? (
              <img
                src={context.bannerImage}
                alt="banner"
                className="w-full h-[120px] sm:h-[140px] md:h-[160px] object-cover"
              />
            ) : (
              <div className="w-full h-[120px] sm:h-[140px] md:h-[160px] bg-gray-300 flex items-center justify-center text-gray-400 text-xs sm:text-sm">
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
            ref={isLastItem ? lastContextRef : null}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col p-4 sm:p-5"
          >
            <div className="text-red-600 text-[10px] sm:text-xs font-semibold mb-2">
              {sectorsLabel}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 leading-tight">
              {context.contextTitle}
            </h2>
            <div className="mb-4">
              {summaryPoints.length > 0 ? (
                summaryPoints.map((point, i) => (
                  <div key={i} className="mb-2 text-gray-600 text-xs sm:text-sm">
                    {point}
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-xs sm:text-sm italic">
                  Summary will be available soon
                </div>
              )}
            </div>
            <div>
              {context.posts?.map((post, i) => (
                <div key={i} className="border-t border-gray-100 pt-0.5 mt-0.5">
                  <div className="font-semibold text-gray-800 text-[10px] sm:text-xs hover:text-indigo-600 transition-colors">
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
            ref={isLastItem ? lastContextRef : null}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="text-red-600 text-[10px] sm:text-xs font-semibold mb-2">
                  {sectorsLabel}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 leading-tight">
                  {context.contextTitle}
                </h2>
                <div className="mb-4">
                  {summaryPoints.length > 0 ? (
                    summaryPoints.map((point, i) => (
                      <div key={i} className="mb-2 text-gray-600 text-xs sm:text-sm">
                        {point}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-xs sm:text-sm italic">
                      Summary will be available soon
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full sm:w-1/3 pt-0 sm:pt-[calc(1rem+0.75rem)]">
                {context.posts?.map((post, i) => (
                  <div key={i} className="border-t border-gray-100 pt-0.5 mt-0.5">
                    <div className="font-semibold text-gray-800 text-[10px] sm:text-xs hover:text-indigo-600 transition-colors">
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
            ref={isLastItem ? lastContextRef : null}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6"
          >
            <div className="text-red-600 text-[10px] sm:text-xs font-semibold mb-2">
              {sectorsLabel}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 leading-tight">
              {context.contextTitle}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="mb-4">
                  {summaryPoints.length > 0 ? (
                    summaryPoints.map((point, i) => (
                      <div key={i} className="mb-2 text-gray-600 text-xs sm:text-sm">
                        {point}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-xs sm:text-sm italic">
                      Summary coming soon...
                    </div>
                  )}
                </div>
                <div>
                  {context.posts
                    ?.slice(0, Math.ceil(context.posts.length / 2))
                    .map((post, i) => (
                      <div key={i} className="border-t border-gray-100 pt-1 mt-1">
                        <div className="font-semibold text-gray-800 text-[10px] sm:text-xs hover:text-indigo-600 transition-colors">
                          {post.postTitle}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="w-full sm:w-1/3 pt-0 sm:pt-[calc(1rem+1.5rem+0.75rem)]">
                {context.posts
                  ?.slice(Math.ceil(context.posts.length / 2))
                  .map((post, i) => (
                    <div key={i} className="border-t border-gray-100 pt-1 mt-1">
                      <div className="font-semibold text-gray-800 text-[10px] sm:text-xs hover:text-indigo-600 transition-colors">
                        {post.postTitle}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      case 'Type-Five':
        return (
          <div
            ref={isLastItem ? lastContextRef : null}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6"
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
                        .slice(1, Math.ceil(context.posts.length / 2))
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
                              className="text-gray-600 text-xs sm:text-sm leading-tight mt-0"
                            >
                              {point}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400 text-xs sm:text-sm italic leading-tight mt-0">
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
            ref={isLastItem ? lastContextRef : null}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 h-fit"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="text-3xl sm:text-4xl font-bold text-indigo-600 whitespace-nowrap">
                {context.dataForTypeNum}
              </div>
              <div className="flex-1">
                {summaryPoints.length > 0 ? (
                  <ul className="text-gray-600 text-xs sm:text-sm">
                    {summaryPoints.map((point, i) => (
                      <li key={i} className="">
                        {point}
                      </li>
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

  if (error)
    return <div className="text-center text-red-500 py-10">Error: {error}</div>;

  const groupedContexts = groupContexts(contexts);

  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="w-full lg:w-[72%]">
            {groupedContexts.map((group, groupIndex) => {
              const isLastGroup = groupIndex === groupedContexts.length - 1;
              const cols = group.every((c) =>
                ['Type-One', 'Type-Two'].includes(c.containerType)
              )
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : group.every((c) =>
                    ['Type-Three', 'Type-Four'].includes(c.containerType)
                  )
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
                : 'grid-cols-1';

              return (
                <div
                  key={groupIndex}
                  className={`grid ${cols} gap-4 sm:gap-6 mb-6 sm:mb-8`}
                >
                  {group.map((context, index) => {
                    const isLastItem = isLastGroup && index === group.length - 1;
                    return (
                      <div key={context.id}>
                        {renderContextBox(context, isLastItem)}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {loading && (
              <div className="text-center py-6">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent" />
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

            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-base sm:text-lg text-gray-900">
                  Trending Themes
                </h2>
                <Link
                  href="/trend-analyzer"
                  className="text-indigo-600 text-xs sm:text-sm font-medium hover:underline"
                >
                  VIEW ALL →
                </Link>
              </div>
              <div className="space-y-4">
                {trendingThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className="border-b border-dashed border-gray-200 pb-4 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-xs sm:text-sm flex items-center justify-center">
                        {theme.score.toFixed(1)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-xs sm:text-sm text-gray-900">
                          {theme.title}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                          {theme.sectors.join(' • ')}
                        </p>
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
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
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
                    VIEW ALL →
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