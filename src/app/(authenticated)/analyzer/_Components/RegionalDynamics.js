import React, { useState } from 'react';

export default function RegionalDynamics({ theme }) {
  const [expandedRegions, setExpandedRegions] = useState({});
  const [showRegionalInfo, setShowRegionalInfo] = useState(false);

  const regionalDynamics = theme?.trendAnalysis?.regionalDynamics;
  const regionalInsights = regionalDynamics?.regionalInsights;
  const overallSummary = regionalInsights?.overallSummary;
  const regions = regionalInsights?.regions || [];
  const overallIcon = regionalDynamics?.overallIcon;

  const toggleRegionExpansion = (index) => {
    setExpandedRegions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const formatDescription = (description, isExpanded) => {
    if (!description) return '';
    
    if (isExpanded) {
      return description;
    }
    
    // All regions show up to 3 lines
    const maxChars = 225; // 3 lines for all regions
    if (description.length <= maxChars) {
      return description;
    }
    
    // Find the last space before the limit to avoid cutting words
    const truncated = description.substring(0, maxChars);
    const lastSpace = truncated.lastIndexOf(' ');
    const finalText = lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;
    
    return finalText + '...';
  };


  return (
    <div className="mb-6">
      {/* Regional Insights Container */}
      <div className="rounded-xl shadow-sm border border-gray-100 p-6" style={{backgroundColor: '#f2fbfb'}}>
        {/* Header with Icon */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {overallIcon && (
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src={overallIcon} 
                  alt="Regional Insights Icon" 
                  className="w-6 h-6 object-contain"
                />
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-800">Regional Insights</h3>
          </div>
          <button
            onClick={() => setShowRegionalInfo(true)}
            className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <span className="text-xs font-bold">i</span>
          </button>
        </div>
        
        {/* Overall Summary */}
        {overallSummary && (
          <div 
            className="text-sm text-gray-600 leading-relaxed mb-6"
            dangerouslySetInnerHTML={{ __html: overallSummary }}
          ></div>
        )}

        {/* Regions Grid - 2 columns */}
          {regions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regions.map((region, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 relative">
                {/* Region Score in upper right corner */}
                {region.regionScore && (
                  <div className="absolute top-3 right-3 w-8 h-8 bg-white border-4 border-red-600 text-black rounded-full flex items-center justify-center text-sm font-bold">
                    {region.regionScore}
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-3 pr-12">
                  {/* Region Icon */}
                    <div className="w-8 h-8 flex items-center justify-center">
                      {region.regionId?.regionIcon ? (
                        <img 
                          src={region.regionId.regionIcon} 
                          alt="Region Map Icon" 
                          className="w-6 h-6 object-contain"
                        />
                      ) : region.regionMapIcon ? (
                        <img 
                          src={region.regionMapIcon} 
                          alt="Region Map Icon" 
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">🌍</span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-800">
                      {region.regionId?.regionName || region.regionName || `Region ${index + 1}`}
                    </h4>
                  </div>
                  
                {/* Region Description */}
                  {(region.regionId?.regionDescription || region.regionDescription) && (
                    <div className="text-sm text-gray-600 leading-relaxed">
                      <div 
                        className="whitespace-pre-wrap font-sans"
                        dangerouslySetInnerHTML={{ __html: formatDescription(
                          region.regionId?.regionDescription || region.regionDescription, 
                          expandedRegions[index]
                        ) }}
                      ></div>
                      
                    {(region.regionId?.regionDescription || region.regionDescription)?.length > 225 && (
                        <button
                          onClick={() => toggleRegionExpansion(index)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 mt-2 transition-colors"
                        >
                          {expandedRegions[index] ? 'View Less' : 'View More'}
                          <svg 
                            className={`w-4 h-4 transition-transform ${expandedRegions[index] ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        {/* No regions available */}
        {regions.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No regional insights available</p>
          </div>
        )}
      </div>

      {/* Regional Dynamics Info Modal */}
      {showRegionalInfo && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200 ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Regional Dynamics Information</h3>
              <button
                onClick={() => setShowRegionalInfo(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {regionalDynamics?.info ? (
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: regionalDynamics.info }}
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
