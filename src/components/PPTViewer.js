import React, { useState, useEffect } from 'react';

const PPTViewer = ({ pptUrl, className = "" }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pptUrl) {
      setIsLoading(true);
      setError(null);
      // For now, we'll assume a fixed number of slides
      // In a real implementation, you might want to fetch slide count from an API
      setTotalSlides(10); // Default assumption
      setIsLoading(false);
    }
  }, [pptUrl]);

  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  if (!pptUrl) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading presentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 rounded-lg ${className}`}>
        <div className="text-center">
          <p className="text-sm text-red-600">Error loading presentation</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* PPT Header */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-gray-700">PowerPoint Presentation</span>
          </div>
          <div className="text-xs text-gray-500">
            Slide {currentSlide + 1} of {totalSlides}
          </div>
        </div>
      </div>

      {/* PPT Content Area */}
      <div className="relative">
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`absolute left-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-200 ${
            currentSlide === 0 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:text-indigo-600 hover:shadow-lg'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-200 ${
            currentSlide === totalSlides - 1 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:text-indigo-600 hover:shadow-lg'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* PPT Frame */}
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          <iframe
            src={`${pptUrl}#slide=${currentSlide + 1}`}
            className="w-full h-full border-0"
            title="PowerPoint Presentation"
            onError={() => setError(true)}
          />
        </div>
      </div>

      {/* Slide Navigation Dots */}
      {totalSlides > 1 && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: Math.min(totalSlides, 10) }, (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentSlide 
                    ? 'bg-indigo-600' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
            {totalSlides > 10 && (
              <span className="text-xs text-gray-500 ml-2">
                +{totalSlides - 10} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Download/View Full Button */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <a
          href={pptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Full Presentation
        </a>
      </div>
    </div>
  );
};

export default PPTViewer;

