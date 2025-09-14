import React, { useState } from 'react';

export default function ConsumerDynamics({ theme }) {
  const [expandedInsights, setExpandedInsights] = useState({});
  const [showImpactInfo, setShowImpactInfo] = useState(false);

  const consumerDynamics = theme?.trendAnalysis?.consumerDynamics;
  const behavioralInsights = consumerDynamics?.behavioralInsights || [];
  const impactAnalyser = consumerDynamics?.impactAnalyser || [];

  const toggleInsightExpansion = (index) => {
    setExpandedInsights(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getTrendIcon = (score) => {
    if (score >= 70) {
      return (
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      );
    } else if (score >= 50) {
      return (
        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>
      );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - Behavioral Insights */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Behavioral Insights</h3>
          
          {behavioralInsights.length > 0 ? (
            <div className="space-y-4">
              {behavioralInsights.map((insight, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => toggleInsightExpansion(index)}
                  >
                    {/* Icon */}
                    <div className="w-8 h-8 flex items-center justify-center">
                      {insight.icon ? (
                        <img 
                          src={insight.icon} 
                          alt="Insight Icon" 
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">💡</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Heading */}
                    <h4 className="font-semibold text-gray-800 flex-1">{insight.heading}</h4>
                    
                    {/* Expand/Collapse Icon */}
                    <div className="w-6 h-6 flex items-center justify-center">
                      {expandedInsights[index] ? (
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  {/* Expandable Content */}
                  {expandedInsights[index] && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {insight.text}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No behavioral insights available</p>
            </div>
          )}
        </div>

        {/* Right Column - Impact Analyzer */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Impact Analyzer</h3>
            <button
              onClick={() => setShowImpactInfo(true)}
              className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              <span className="text-xs font-bold">i</span>
            </button>
          </div>
          
          {impactAnalyser.length > 0 ? (
            <div className="space-y-4">
              {impactAnalyser.map((item, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">{item.consumerSegmentName}</h4>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(item.impactScore)}
                      <span className="text-sm font-medium text-gray-700">{item.impactScore}%</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-800 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.impactScore}%` }}
                    ></div>
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
              <p className="text-sm text-gray-500">No impact analysis data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Impact Analyzer Info Modal */}
      {showImpactInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Impact Analyzer</h3>
              <button
                onClick={() => setShowImpactInfo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">How to Read</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Progress Bar:</strong> Visual representation of impact percentage</li>
                  <li>• <strong>Trend Icons:</strong> Up (70%+), Flat (50-69%), Down (&lt;50%)</li>
                  <li>• <strong>Percentage:</strong> Direct impact score for each segment</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowImpactInfo(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
