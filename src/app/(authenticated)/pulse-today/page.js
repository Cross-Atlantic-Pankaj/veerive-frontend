'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PulseToday() {
  const [contexts, setContexts] = useState([]);
  const [sidebarMessage, setSidebarMessage] = useState(null);
  const [trendingThemes, setTrendingThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch('/api/pulse-today', { 
          signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        
        setContexts(data.contexts || []);
        setSidebarMessage(data.messages?.[0] || null);
        setTrendingThemes(data.trendingThemes || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    return () => {
      // Cleanup function
    };
  }, []);

  const formatSummary = (summary) => {
    if (!summary) return null;
    
    const cleaned = summary
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .trim();
    
    const points = cleaned.split('•').filter(s => s.trim().length > 0);
    
    if (points.length <= 3) {
      return points.map(point => `• ${point.trim()}`);
    }
    
    const groupedPoints = [];
    const idealGroupCount = points.length > 4 ? 3 : 2;
    const groupSize = Math.ceil(points.length / idealGroupCount);
    
    for (let i = 0; i < points.length; i += groupSize) {
      const group = points
        .slice(i, i + groupSize)
        .map(point => point.trim())
        .join(' ');
      groupedPoints.push(`• ${group}`);
    }
    
    return groupedPoints;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          Loading insights...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg max-w-md">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full mx-auto py-6 px-4 sm:px-6 lg:px-10 bg-white">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area */}
        <div className="w-full lg:w-[72%]">
          {contexts.map((context, index) => (
            <article key={index} className="mb-12">
              <div className="flex flex-col">
                <div className="flex flex-col md:flex-row gap-6 mb-4">
                  {/* Banner Image */}
                  <div className="w-full md:w-1/4">
                    {context.bannerImage ? (
                      <img
                        src={context.bannerImage}
                        alt="Banner"
                        className="w-full h-auto object-cover rounded-lg"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg" />
                    )}
                  </div>

                  {/* Context Title and Posts */}
                  <div className="w-full md:w-3/4 flex flex-col md:flex-row">
                    <div className="flex-1">
                      <div className="text-sm text-red-600 font-semibold mb-2">
                        {[...context.sectors, ...context.subSectors].join(' • ')}
                      </div>
                      <h1 className="text-2xl font-bold mb-3">{context.contextTitle}</h1>
                    </div>

                    {context.posts.length > 2 && (
                      <div className="w-full md:w-1/2 mt-4 md:mt-0 md:ml-6">
                        <div className="space-y-2">
                          {context.posts.map((post, idx) => (
                            <div key={idx} className="font-semibold">
                              {post.postTitle}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary and Posts */}
                <div className="pl-0">
                  <div className="text-gray-700 mb-4">
                    {context.summary ? (
                      <div className="space-y-3">
                        {formatSummary(context.summary)?.map((point, idx) => (
                          <p key={idx} className="text-justify leading-relaxed">
                            {point}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">Summary will be available soon</div>
                    )}
                  </div>

                  {context.posts.length <= 2 && (
                    <div className="flex flex-wrap gap-4">
                      {context.posts.map((post, idx) => (
                        <div key={idx} className="font-semibold">
                          {post.postTitle}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[28%]">
          {sidebarMessage && (
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-500">✦</span>
                <span className="font-semibold">{sidebarMessage.title}</span>
              </div>
              <p className="text-gray-700 text-sm">
                {sidebarMessage.content}
              </p>
            </div>
          )}

          {/* Trending Themes Section */}
          <div className="bg-gray-200 p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg text-gray-800">Trending Themes</h2>
              <Link 
                  href="/trend-analyzer" 
                  className="text-indigo-600 text-sm flex items-center hover:text-indigo-700"
                >
                  VIEW ALL →
                </Link>
            </div>
            
            <div className="space-y-3">
              {trendingThemes.map((theme) => (
                <div 
                  key={theme.id} 
                  className="border-b border-dashed border-black pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    {/* Fixed width score circle */}
                    <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full border-2 border-blue-500 text-blue-500 font-medium text-sm">
                      {theme.score.toFixed(1)}
                    </div>
                    {/* Full title display */}
                    <div className="break-words">
                      <h3 className="font-bold text-gray-800 text-sm font-bold">
                        {theme.title}
                      </h3>
                      <div className="mt-1 text-xs text-gray-500">
                        {theme.sectors.length > 0 && theme.sectors.join(' • ')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}