import React, { useState } from 'react';

export default function ConsumerDynamics({ theme }) {
  const [showImpactInfo, setShowImpactInfo] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState({});

  const consumerDynamics = theme?.trendAnalysis?.consumerDynamics;
  const behavioralInsights = consumerDynamics?.behavioralInsights || [];
  const impactAnalyser = consumerDynamics?.impactAnalyser?.data || [];
  const impactAnalyserInfo = consumerDynamics?.impactAnalyser?.info;
  const overallIcon = consumerDynamics?.overallIcon;
  const consumerDynamicsInfo = consumerDynamics?.info;
  const methodologyIcon = consumerDynamics?.methodologyIcon;

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      
      {/* Behavioral Insights Container */}
      <div className="rounded-xl shadow-sm border border-gray-400 p-4" style={{backgroundColor: '#f2fbfb'}}>
           <div className="flex items-center gap-3 mb-4">
             {overallIcon && (
               <div className="w-8 h-8 flex items-center justify-center">
                 <img 
                   src={overallIcon} 
                   alt="Behavioral Insights Icon" 
                   className="w-6 h-6 object-contain"
                 />
               </div>
             )}
             <h3 className="text-lg font-bold text-gray-800">Behavioral Insights</h3>
           </div>
          
          {behavioralInsights.length > 0 ? (
            <div className="space-y-3">
              {behavioralInsights.map((insight, index) => (
                <div key={index} className="bg-transparent border border-gray-400 rounded-lg p-3">
                  <div className="flex items-center gap-3">
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
                    <h4 
                      className="font-semibold text-gray-800 flex-1 text-sm"
                      dangerouslySetInnerHTML={{ __html: insight.heading }}
                    ></h4>
                  </div>
                  
                  {/* Content - With 2-line truncation and View More */}
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    {expandedInsights[index] ? (
                      <div 
                        className="text-xs text-gray-500 leading-relaxed consumer-dynamics-content"
                        dangerouslySetInnerHTML={{ __html: insight.text }}
                      ></div>
                    ) : (
                      <div 
                        className="text-xs text-gray-500 leading-relaxed consumer-dynamics-content"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: '1.4'
                        }}
                        dangerouslySetInnerHTML={{ __html: insight.text }}
                      ></div>
                    )}
                    
                    {/* View More Button */}
                    {insight.text && (
                      <button
                        onClick={() => toggleInsightExpansion(index)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 transition-colors mt-2"
                      >
                        {expandedInsights[index] ? 'View Less' : 'View More'}
                        <svg 
                          className={`w-3 h-3 transition-transform ${expandedInsights[index] ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
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

      {/* Impact Analyzer Container */}
      <div className="rounded-xl shadow-sm border border-gray-400 p-4" style={{backgroundColor: '#f2fbfb'}}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Impact Analyzer</h3>
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
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-600 text-sm">{item.consumerSegmentName}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500">{item.impactScore}</span>
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

      {/* Consumer Dynamics Info Modal */}
      {showImpactInfo && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200 ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {methodologyIcon && (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img 
                      src={methodologyIcon} 
                      alt="Methodology Icon" 
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-800">Consumer Dynamics Information</h3>
              </div>
              <button
                onClick={() => setShowImpactInfo(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {consumerDynamicsInfo ? (
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: consumerDynamicsInfo }}
                ></div>
              ) : (
                <p className="text-gray-500">No information available for this section.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
