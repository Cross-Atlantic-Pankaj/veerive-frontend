'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function ThinkTankPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(false);
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
        console.log(`Fetching posts for page ${pageToFetch}, params: ${params}`);
        const response = await fetch(`/api/think-tank/influencer-comment?${params}`);
        const result = await response.json();
        console.log('API Response:', {
          page: result.page,
          totalPosts: result.totalPosts,
          postIds: result.data?.map((p) => p._id) || [],
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

          setTotalPosts(result.totalPosts);
          setHasMore((pageToFetch - 1) * limit + newPosts.length < result.totalPosts);
          if (reset) {
            fetchedPages.current.clear();
            fetchedPages.current.add(pageToFetch);
          }
        } else {
          console.error('API Error:', result.error);
          setPosts([]);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    },
    [loading]
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

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="space-y-6">
        {posts.map((post, index) => {
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
        })}
      </div>
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-400 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}