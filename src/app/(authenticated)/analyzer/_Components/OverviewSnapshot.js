import React, { useState } from 'react';

export default function OverviewSnapshot({ theme }) {
  const [showFullSummary, setShowFullSummary] = useState(false);

  const executiveSummary = theme?.overviewSnapshot?.executiveSummary;
  const marketMetrics = theme?.overviewSnapshot?.marketMetrics || [];

  // Filter out empty market metrics
  const validMarketMetrics = marketMetrics.filter(metric => 
    metric.value && metric.text && metric.value.trim() !== '' && metric.text.trim() !== ''
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Executive Summary Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              {executiveSummary?.executiveSummaryIcon && (
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <img 
                    src={executiveSummary.executiveSummaryIcon} 
                    alt="Executive Summary" 
                    className="w-6 h-6"
                  />
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-800">Executive Summary</h3>
            </div>

            {/* Executive Summary Content - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Trend Significance */}
              {executiveSummary?.trendSignificance?.content && (
                <div className="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3 text-sm uppercase tracking-wide">Trend Significance</h4>
                  <p className="text-green-700 text-sm leading-relaxed">
                    {executiveSummary.trendSignificance.content}
                  </p>
                </div>
              )}

              {/* Potential Challenges */}
              {executiveSummary?.potentialChallenges?.content && (
                <div className="bg-gray-50 border-l-4 border-gray-400 rounded-r-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Potential Challenges</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {executiveSummary.potentialChallenges.content}
                  </p>
                </div>
              )}
            </div>

            {/* View More Button */}
            <button
              onClick={() => setShowFullSummary(!showFullSummary)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2 transition-colors group"
            >
              {showFullSummary ? 'View Less' : 'View More'}
              <svg 
                className={`w-4 h-4 transition-transform group-hover:translate-y-0.5 ${showFullSummary ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Market Metrics Section */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-6">Market Metrics</h3>
            
            {validMarketMetrics.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {validMarketMetrics.map((metric, index) => (
                  <div 
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Icon */}
                    {metric.icon && (
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <img 
                            src={metric.icon} 
                            alt="Metric Icon" 
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1">
                      {/* Value */}
                      <div className="font-bold text-2xl text-orange-500 mb-1">
                        {metric.value}
                      </div>
                      
                      {/* Text */}
                      <div className="text-sm text-gray-600 leading-tight">
                        {metric.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No market metrics available</p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
