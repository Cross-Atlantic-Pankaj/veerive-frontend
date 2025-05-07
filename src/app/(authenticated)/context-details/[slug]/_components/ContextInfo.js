'use client';

import React from 'react';

const ContextInfo = ({ context, currentSlide, setCurrentSlide, sliderRef }) => {
	const nextSlide = () => {
		if (!context || !context.slides || !context.slides.length) return;
		setCurrentSlide((prev) =>
			prev === context.slides.length - 1 ? 0 : prev + 1
		);
	};

	const prevSlide = () => {
		if (!context || !context.slides || !context.slides.length) return;
		setCurrentSlide((prev) =>
			prev === 0 ? context.slides.length - 1 : prev - 1
		);
	};

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6 mb-6">
			<h1 className="text-2xl font-bold text-gray-900 mb-4 ml-2">
				{context.contextTitle}
			</h1>

			{(context.originalContextSector?.length > 0 || context.originalContextSubSector?.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-2 mb-3">
          {context.originalContextSector?.map((sector) => (
            <span
              key={sector._id}
              className="p-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
            >
              {sector}
            </span>
          ))}
          {context.originalContextSubSector?.map((subSector) => (
            <span
              key={subSector._id}
              className="p-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
            >
              {subSector}
            </span>
          ))}
        </div>
      )}

{(context.originalContextSignalCategory?.length > 0 || context.originalContextSignalSubCategory?.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-2 mb-3">
          {context.originalContextSignalCategory?.map((signal) => (
            <span
              key={signal._id}
              className="p-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
            >
              {signal}
            </span>
          ))}
          {context.originalContextSignalSubCategory?.map((subSignal) => (
            <span
              key={subSignal._id}
              className="p-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
            >
              {subSignal}
            </span>
          ))}
        </div>
      )}
			{context.originalTheme && (
				<div className="bg-[#f1f8ff] p-3 mb-2 flex items-center justify-between flex-wrap gap-4">
					<span className="text-base text-[#174c77] font-medium">
						Theme: {context.originalTheme.themeTitle}
					</span>
					<div className="flex gap-4 flex-wrap">
						<div className="flex items-center bg-[#f1f8ff] border border-[#174c77] rounded px-2 py-1 gap-2">
							<div className="text-sm text-[#174c77] leading-tight text-center">
								Disruption Potential
							</div>
							<div className="bg-[#f76c3c] text-white font-bold w-8 h-8 flex items-center justify-center rounded">
								{context.originalTheme.impactScore}
							</div>
						</div>
						<div className="flex items-center bg-[#f1f8ff] border border-[#174c77] rounded px-2 py-1 gap-2">
							<div className="text-sm text-[#174c77] leading-tight text-center">
								Predictive Momentum
							</div>
							<div className="bg-[#f76c3c] text-white font-bold w-8 h-8 flex items-center justify-center rounded">
								{context.originalTheme.predictiveMomentumScore}
							</div>
						</div>
						<div className="flex items-center bg-[#f1f8ff] border border-[#174c77] rounded px-2 py-1 gap-2">
							<div className="text-sm text-[#174c77] leading-tight text-center">
								Trending Pulse
							</div>
							<div className="bg-[#f76c3c] text-white font-semibold w-8 h-8 flex items-center justify-center rounded">
								{context.originalTheme.trendingScore}
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="mb-6 ml-2">
				<h2 className="text-lg font-bold text-gray-800 mb-2">Summary:</h2>
				<ul className="text-gray-700 list-disc list-inside">
					<div dangerouslySetInnerHTML={{ __html: context.summary }} />
				</ul>
			</div>

			{context.hasSlider && context.slides && context.slides.length > 0 && (
				<div
					className="relative mt-8 mb-6 bg-slate-700 text-white rounded-lg overflow-hidden"
					ref={sliderRef}
				>
					<div className="h-full relative">
						<div className="p-6 h-full flex flex-col justify-center px-20">
							<h3 className="text-xl font-bold mb-4">
								{context.slides[currentSlide].title}
							</h3>

							<p
								dangerouslySetInnerHTML={{
									__html: context.slides[currentSlide].description,
								}}
								className="text-gray-100"
							></p>
						</div>
						<button
							onClick={prevSlide}
							className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors"
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
						<button
							onClick={nextSlide}
							className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors"
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
						<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
							{context.slides.map((_, idx) => (
								<button
									key={idx}
									onClick={() => setCurrentSlide(idx)}
									className={`w-2 h-2 rounded-full ${
										currentSlide === idx ? 'bg-white' : 'bg-gray-400'
									}`}
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
