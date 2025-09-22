'use client';

import React, { useState, useRef, useEffect } from 'react';

const SimplePDFSlideshow = ({ contextId, className = '' }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadedPages, setLoadedPages] = useState(new Set());
  const containerRef = useRef(null);
  const iframeRefs = useRef({});

  // Fetch PDF URL and get page count from the API
  useEffect(() => {
    const fetchPdfData = async () => {
      if (!contextId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // First, get the PDF URL
        const pdfResponse = await fetch(`/api/ppt-file/${contextId}/pdf`);
        if (pdfResponse.ok) {
          const blob = await pdfResponse.blob();
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          
          // Try to get page count from images API
          try {
            const imagesResponse = await fetch(`/api/ppt-file/${contextId}/images`);
            if (imagesResponse.ok) {
              const imagesData = await imagesResponse.json();
              console.log('Images API response:', imagesData);
              setTotalPages(imagesData.totalSlides || 5); // Reduced default
            } else {
              console.warn('Images API failed, using default page count');
              setTotalPages(5); // Reduced fallback
            }
          } catch (err) {
            console.warn('Could not fetch page count, using default:', err);
            setTotalPages(5); // Reduced fallback
          }
          
          setIsLoading(false);
        } else {
          setError('Failed to fetch PDF');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching PDF:', err);
        setError('Error fetching PDF');
        setIsLoading(false);
      }
    };

    fetchPdfData();

    // Cleanup function to revoke the object URL when component unmounts
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [contextId]);

  // Preload all pages when PDF URL is available
  useEffect(() => {
    if (pdfUrl && totalPages > 0) {
      // Mark all pages as loaded after a short delay to allow iframes to load
      const timer = setTimeout(() => {
        const allPages = new Set();
        for (let i = 1; i <= totalPages; i++) {
          allPages.add(i);
        }
        setLoadedPages(allPages);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [pdfUrl, totalPages]);

  // Handle smooth page transitions
  useEffect(() => {
    if (pdfUrl && !isLoading) {
      setIsTransitioning(true);
      
      // Reset transition state after a short delay
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [currentPage, pdfUrl, isLoading]);

  const goToNextPage = () => {
    if (currentPage < totalPages && !isTransitioning) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1 && !isTransitioning) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && !isTransitioning && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

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

  if (!pdfUrl || totalPages === 0) {
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
            const isLoaded = loadedPages.has(pageNumber);
            
            return (
              <iframe
                key={pageNumber}
                ref={(el) => {
                  if (el) iframeRefs.current[pageNumber] = el;
                }}
                src={`${pdfUrl}#page=${pageNumber}&toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH&zoom=FitH&pagemode=none`}
                className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-300 ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
                title={`PDF Page ${pageNumber}`}
                style={{
                  pointerEvents: 'none',
                  userSelect: 'none',
                  overflow: 'hidden',
                  transform: 'scale(1)',
                  transformOrigin: 'top left'
                }}
              />
            );
          })}
          
          {/* Loading overlay during transitions */}
          {isTransitioning && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-30 z-20">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        {totalPages > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1 || isTransitioning}
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
              disabled={currentPage >= totalPages || isTransitioning}
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
                    disabled={isTransitioning}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentPage === pageNumber
                        ? 'bg-orange-500'
                        : 'bg-gray-300 hover:bg-gray-400'
                    } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              href={pdfUrl}
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

export default SimplePDFSlideshow;
