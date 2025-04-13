'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import {
  TypeOne,
  TypeTwo,
  TypeThree,
  TypeFour,
  TypeFive,
  TypeNum,
} from './_components';

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
          if (entries[0].isIntersecting && !loading) {
            console.log('Observer Triggered for Page:', page + 1);
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

      const newContexts = data.contexts.filter(
        (newContext) => !contexts.some((prev) => prev.id === newContext.id)
      );

      if (pageNum === 1) {
        setContexts(data.contexts);
        setDisplayItems(processInitialContexts(data.contexts));
      } else {
        setContexts((prev) => {
          const updatedContexts = [...prev, ...newContexts];
          console.log('Updated Contexts:', updatedContexts);
          return updatedContexts;
        });
        setDisplayItems((prevDisplayItems) => {
          const newDisplayItems = processNewContexts(newContexts, prevDisplayItems).sort(
            (a, b) => {
              const aOrder = a.type === 'group' ? a.displayOrder : a.item.displayOrder || 0;
              const bOrder = b.type === 'group' ? b.displayOrder : b.item.displayOrder || 0;
              return aOrder - bOrder;
            }
          );
          const updatedDisplayItems = [...prevDisplayItems, ...newDisplayItems];
          console.log('Updated Display Items:', updatedDisplayItems);
          return updatedDisplayItems;
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

  const processInitialContexts = (allContexts) => {
    const uniqueContexts = Array.from(new Map(allContexts.map((c) => [c.id, c])).values());
    const allTypeOneContexts = uniqueContexts.filter((c) => c.containerType === 'Type-One');
    const allOtherContexts = uniqueContexts.filter((c) => c.containerType !== 'Type-One');

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
          const maxDisplayOrder = Math.max(...currentGroup.map((c) => c.displayOrder || 0));
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

    const result = [...typeOneGroups, ...otherItems].sort((a, b) => {
      const aOrder = a.type === 'group' ? a.displayOrder : a.item.displayOrder || 0;
      const bOrder = b.type === 'group' ? b.displayOrder : b.item.displayOrder || 0;
      return aOrder - bOrder;
    });

    console.log('Processed Initial Display Items:', result);
    return result;
  };

  const processNewContexts = (newContexts, prevDisplayItems) => {
    const uniqueNewContexts = Array.from(new Map(newContexts.map((c) => [c.id, c])).values());
    const newTypeOneContexts = uniqueNewContexts.filter((c) => c.containerType === 'Type-One');
    const newOtherContexts = uniqueNewContexts.filter((c) => c.containerType !== 'Type-One');

    const allExistingTypeOneIds = new Set();
    prevDisplayItems.forEach((item) => {
      if (item.type === 'group') {
        item.items.forEach((context) => allExistingTypeOneIds.add(context.id));
      }
    });

    const filteredNewTypeOneContexts = newTypeOneContexts.filter(
      (context) => !allExistingTypeOneIds.has(context.id)
    );

    let lastGroupIndex = -1;
    let lastGroup = null;
    if (prevDisplayItems.length > 0) {
      for (let i = prevDisplayItems.length - 1; i >= 0; i--) {
        if (prevDisplayItems[i].type === 'group' && prevDisplayItems[i].items.length < 3) {
          lastGroupIndex = i;
          lastGroup = { ...prevDisplayItems[i] };
          break;
        }
      }
    }

    let currentGroup = lastGroup ? [...lastGroup.items] : [];
    const newTypeOneGroups = [];

    filteredNewTypeOneContexts.forEach((context) => {
      if (currentGroup.length < 3) {
        currentGroup.push(context);
      }
      if (
        currentGroup.length === 3 ||
        filteredNewTypeOneContexts.indexOf(context) === filteredNewTypeOneContexts.length - 1
      ) {
        if (currentGroup.length > 0) {
          const maxDisplayOrder = Math.max(...currentGroup.map((c) => c.displayOrder || 0));
          if (lastGroupIndex !== -1 && currentGroup.length <= 3) {
            const updatedLastGroup = {
              type: 'group',
              items: [...currentGroup],
              displayOrder: maxDisplayOrder,
            };
            prevDisplayItems[lastGroupIndex] = updatedLastGroup;
          } else {
            newTypeOneGroups.push({
              type: 'group',
              items: [...currentGroup],
              displayOrder: maxDisplayOrder,
            });
          }
          currentGroup = [];
        }
      }
    });

    const newOtherItems = newOtherContexts.map((context) => ({
      type: 'single',
      item: context,
      displayOrder: context.displayOrder || 0,
    }));

    const result = [...newTypeOneGroups, ...newOtherItems];
    console.log('Processed New Display Items:', result);
    return result;
  };

  const renderContextBox = (context, isLastItem, key) => {
    const props = {
      context,
      isLastItem,
      lastContextCallback,
      formatSummary,
    };

    switch (context.containerType) {
      case 'Type-One':
        return <TypeOne key={key} {...props} />;
      case 'Type-Two':
        return <TypeTwo key={key} {...props} />;
      case 'Type-Three':
        return <TypeThree key={key} {...props} />;
      case 'Type-Four':
        return <TypeFour key={key} {...props} />;
      case 'Type-Five':
        return <TypeFive key={key} {...props} />;
      case 'Type-Num':
        return <TypeNum key={key} {...props} />;
      default:
        return null;
    }
  };

  if (error) {
    return <div className="text-center text-red-500 py-10">Error: {error}</div>;
  }

  return (
    <Suspense
      fallback={
        <div className="w-full py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      }
    >
      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-24 lg:py-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
        <div ref={containerRef} className="flex flex-col lg:flex-row gap-6 lg:gap-8 relative">
          <div
            ref={mainContentRef}
            className="w-full transition-all duration-300 ease-in-out lg:w-[72%]"
          >
            {displayItems.map((displayItem, index) => {
              const isLastItem = index === displayItems.length - 1 && hasMore;
              if (displayItem.type === 'group') {
                const groupKey = `group-${displayItem.items
                  .map((item) => item.id)
                  .join('-')}-${index}`;
                return (
                  <div
                    key={groupKey}
                    className={`grid grid-cols-${Math.min(displayItem.items.length, 3)} sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-0.5 sm:mb-6`}
                  >
                    {displayItem.items.map((context, itemIndex) =>
                      renderContextBox(
                        context,
                        isLastItem && itemIndex === displayItem.items.length - 1,
                        `${groupKey}-${context.id}-${itemIndex}`
                      )
                    )}
                  </div>
                );
              } else {
                const singleKey = `${displayItem.item.id}-${index}`;
                return (
                  <div key={singleKey} className="mb-0.5 sm:mb-6">
                    {renderContextBox(displayItem.item, isLastItem, singleKey)}
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
                <h2 className="font-semibold text-lg text-gray-800">Trending Themes</h2>
                <Link href="/trend-analyzer" className="text-indigo-600 text-sm flex items-center hover:text-indigo-700">
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
                        <h3 className="font-medium text-gray-800 text-sm">{theme.title}</h3>
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
                  <a
                    key={post._id}
                    href={post.SourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border-b border-dashed border-gray-300 pb-3 last:border-none hover:text-indigo-600 transition-colors"
                  >
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors">
                      {post.postTitle}
                    </h3>
                  </a>
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