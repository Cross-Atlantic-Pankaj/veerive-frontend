'use client';

import React from 'react';

const ContextInfo = ({ context, currentSlide, setCurrentSlide, sliderRef }) => {
  const formatSummary = (summary) => {
    if (!summary) return ['Summary will be available soon'];
    const paragraphs = summary.split('</p>').filter((p) => p.trim().length > 0);
    const formattedPoints = [];
    paragraphs.forEach((paragraph) => {
      const cleaned = paragraph
        .replace(/<[^>]*>/g, '')
        .replace(/&/g, '&')
        .trim();
      if (cleaned.length > 0) {
        const pointText = cleaned.startsWith('•') ? cleaned.slice(1).trim() : cleaned;
        formattedPoints.push(`• ${pointText}`);
      }
    });
    return formattedPoints.length > 0 ? formattedPoints : ['Summary will be available soon'];
  };

  const nextSlide = () => {
    if (!context || !context.slides || !context.slides.length) return;
    setCurrentSlide((prev) => (prev === context.slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (!context || !context.slides || !context.slides.length) return;
    setCurrentSlide((prev) => (prev === 0 ? context.slides.length - 1 : prev - 1));
  };

  const summaryPoints = formatSummary(context.summary);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6 mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4 ml-2">{context.contextTitle}</h1>

      {context.theme && (
        <div className="bg-[#f1f8ff] p-3 mb-2 flex items-center justify-between flex-wrap gap-4">
          <span className="text-base text-[#174c77] font-medium">
            Theme: {context.theme.themeTitle}
          </span>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center bg-[#f1f8ff] border border-[#174c77] rounded px-2 py-1 gap-2">
              <div className="text-sm text-[#174c77] leading-tight text-center">Disruption Potential</div>
              <div className="bg-[#f76c3c] text-white font-bold w-8 h-8 flex items-center justify-center rounded">
                {context.theme.overallScore}
              </div>
            </div>
            <div className="flex items-center bg-[#f1f8ff] border border-[#174c77] rounded px-2 py-1 gap-2">
              <div className="text-sm text-[#174c77] leading-tight text-center">Predictive Momentum</div>
              <div className="bg-[#f76c3c] text-white font-bold w-8 h-8 flex items-center justify-center rounded">
                {context.theme.predictiveMomentumScore}
              </div>
            </div>
            <div className="flex items-center bg-[#f1f8ff] border border-[#174c77] rounded px-2 py-1 gap-2">
              <div className="text-sm text-[#174c77] leading-tight text-center">Trending Pulse</div>
              <div className="bg-[#f76c3c] text-white font-semibold w-8 h-8 flex items-center justify-center rounded">
                {context.theme.trendingScore}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 ml-2">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Summary:</h2>
        <div className="text-gray-700">
          {summaryPoints.map((point, idx) => (
            <p key={idx} className="mb-2">{point}</p>
          ))}
        </div>
      </div>

      {context.hasSlider && context.slides && context.slides.length > 0 && (
        <div className="relative mt-8 mb-6 bg-slate-700 text-white rounded-lg overflow-hidden" ref={sliderRef}>
          <div className="h-[300px] relative">
            <div className="p-6 h-full flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-4">{context.slides[currentSlide].title}</h3>
              <p className="text-gray-100">{context.slides[currentSlide].description}</p>
            </div>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {context.slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full ${currentSlide === idx ? 'bg-white' : 'bg-gray-400'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextInfo;