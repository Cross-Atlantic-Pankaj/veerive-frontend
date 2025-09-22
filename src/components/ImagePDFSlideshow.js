'use client';

import React, { useState, useRef, useEffect } from 'react';

const ImagePDFSlideshow = ({ contextId, className = '' }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageImages, setPageImages] = useState({});
  const [loadingPages, setLoadingPages] = useState(new Set());
  const containerRef = useRef(null);

  // Fetch page count and preload images
  useEffect(() => {
    const fetchPageData = async () => {
      if (!contextId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get page count from images API
        const imagesResponse = await fetch(`/api/ppt-file/${contextId}/images`);
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          console.log('Images API response:', imagesData);
          setTotalPages(imagesData.totalSlides || 5);
          
          // Preload all page images
          preloadPageImages(imagesData.totalSlides || 5);
        } else {
          console.warn('Images API failed, using default page count');
          setTotalPages(5);
          preloadPageImages(5);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching page data:', err);
        setError('Error fetching PDF data');
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [contextId]);

  const preloadPageImages = async (pageCount) => {
    const newPageImages = {};
    const newLoadingPages = new Set();
    
    // Add all pages to loading set
    for (let i = 1; i <= pageCount; i++) {
      newLoadingPages.add(i);
    }
    setLoadingPages(newLoadingPages);

    // Preload all pages
    const loadPromises = Array.from({ length: pageCount }, async (_, index) => {
      const pageNumber = index + 1;
      try {
        const response = await fetch(`/api/ppt-file/${contextId}/page-images?page=${pageNumber}`);
        if (response.ok) {
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          newPageImages[pageNumber] = imageUrl;
        }
      } catch (err) {
        console.error(`Error loading page ${pageNumber}:`, err);
      }
    });

    await Promise.all(loadPromises);
    
    setPageImages(newPageImages);
    setLoadingPages(new Set());
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(pageImages).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [pageImages]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (totalPages === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center text-gray-600">
          <p>No PDF available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* PDF Page Container */}
      <div 
        ref={containerRef}
        className="relative bg-gray-100 flex items-center justify-center min-h-[600px] overflow-hidden"
      >
        {/* PDF Page Display */}
        <div className="w-full h-[600px] flex items-center justify-center overflow-hidden relative">
          {/* Render all pages but only show the current one */}
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;
            const isActive = pageNumber === currentPage;
            const imageUrl = pageImages[pageNumber];
            const isLoading = loadingPages.has(pageNumber);
            
            return (
              <div
                key={pageNumber}
                className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`PDF Page ${pageNumber}`}
                    className="w-full h-full object-contain"
                    style={{
                      pointerEvents: 'none',
                      userSelect: 'none'
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100 text-gray-600">
                    <p>Page {pageNumber} not available</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Navigation Controls */}
        {totalPages > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg z-30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Next Button */}
            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg z-30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Page Indicator and Controls */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            {/* Page Info */}
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>

            {/* Page Dots */}
            <div className="flex space-x-2">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentPage === pageNumber
                        ? 'bg-orange-500'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                );
              })}
              {totalPages > 10 && (
                <span className="text-xs text-gray-500 ml-2">
                  ...{totalPages}
                </span>
              )}
            </div>

            {/* Download Button */}
            <a
              href={`/api/ppt-file/${contextId}/pdf`}
              download
              className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePDFSlideshow;
