'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import PostCard from './_components/PostCard';
import SectorSubSectorCard from './_components/SectorSubSectorCard';
import ContextInfo from './_components/ContextInfo';
import TrendingThemes from './_components/TrendingThemes';
// import TrendingExpertOpinion from './_components/TrendingExpertOpinion';

export default function ContextDetails() {
  const searchParams = useSearchParams();
  const contextId = searchParams.get('id');

  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const sliderRef = useRef(null);

  useEffect(() => {
    if (!contextId) {
      setError('No context ID provided');
      setLoading(false);
      return;
    }

    const fetchContextDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/context-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contextId }),
        });

        if (!response.ok) throw new Error('Failed to fetch context details');

        const data = await response.json();
        setContext(data.context);
      } catch (err) {
        console.error('Error fetching context details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContextDetails();
  }, [contextId]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-800">{error}</p>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Context Not Found</h1>
        <p className="text-gray-600">The requested context could not be found.</p>
      </div>
    );
  }

  const sortedSectors = context.sectors
    ? [...context.sectors].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    : [];
  const sortedSubSectors = context.subSectors
    ? [...context.subSectors].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    : [];

  return (
    <div className="min-h-screen bg-white py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#f0f0f0] py-4 flex justify-center mb-4">
          <form onSubmit={handleSearch} className="flex w-1/2">
            <input
              type="text"
              className="flex-grow px-2 py-3 text-sm text-gray-800 bg-white border border-gray-300 rounded-l-md focus:outline-none"
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-[#5d4be6] w-10 flex items-center justify-center rounded-r-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        <ContextInfo context={context} currentSlide={currentSlide} setCurrentSlide={setCurrentSlide} sliderRef={sliderRef} />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
            {context.posts?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-blue-700 mb-4 bg-yellow-200 w-fit px-2">Explore Event</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {context.posts.map((post) => (
                    <PostCard key={post.postId} post={post} />
                  ))}
                </div>
              </div>
            )}

            {(sortedSectors.length > 0 || sortedSubSectors.length > 0) && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-blue-700 mb-4 bg-yellow-200 w-fit px-2">Related Events</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedSectors.map((sector) => (
                    <SectorSubSectorCard key={sector.sectorId} item={sector} type="sector" />
                  ))}
                  {sortedSubSectors.map((subSector) => (
                    <SectorSubSectorCard key={subSector.subSectorId} item={subSector} type="subSector" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:w-1/3">
            <TrendingThemes trendingThemes={context.trendingThemes} />
            {/* <TrendingExpertOpinion/> */}
          </div>
        </div>
      </div>
    </div>
  );
}