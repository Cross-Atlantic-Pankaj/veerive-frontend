import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ImpactAndOpinions({ theme }) {
  const [expertOpinions, setExpertOpinions] = useState([]);
  const [relatedThemes, setRelatedThemes] = useState([]);
  const [currentTheme, setCurrentTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [showChartInfo, setShowChartInfo] = useState(false);

  const impactAndOpinions = theme?.trendAnalysis?.impactAndOpinions;
  const title = impactAndOpinions?.title;
  const disruptivePotential = impactAndOpinions?.disruptivePotential;
  const trendMomentum = impactAndOpinions?.trendMomentum;

  useEffect(() => {
    const fetchExpertOpinions = async () => {
      try {
        const response = await fetch(`/api/analyzer/expert-opinions?themeId=${theme._id}`);
        if (response.ok) {
          const data = await response.json();
          setExpertOpinions(data.expertOpinions || []);
        }
      } catch (error) {
        console.error('Error fetching expert opinions:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedThemes = async () => {
      try {
        setChartLoading(true);
        const response = await fetch(`/api/analyzer/related-themes?themeId=${theme._id}`);
        if (response.ok) {
          const data = await response.json();
          setRelatedThemes(data.relatedThemes || []);
          setCurrentTheme(data.currentTheme || null);
        }
      } catch (error) {
        console.error('Error fetching related themes:', error);
      } finally {
        setChartLoading(false);
      }
    };

    if (theme?._id) {
      fetchExpertOpinions();
      fetchRelatedThemes();
    }
  }, [theme?._id]);

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
        return 'bg-green-500 text-white';
      case 'bearish':
        return 'bg-red-500 text-white';
      case 'neutral':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  // Chart colors for different themes
  const chartColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  
  const getChartColor = (index) => {
    return chartColors[index % chartColors.length];
  };

  // Prepare chart data - filter out invalid data points
  const chartData = relatedThemes
    .filter(theme => 
      theme.disruptivePotential !== null && 
      theme.disruptivePotential !== undefined && 
      theme.trendMomentum !== null && 
      theme.trendMomentum !== undefined &&
      !isNaN(theme.disruptivePotential) && 
      !isNaN(theme.trendMomentum)
    )
    .map((theme, index) => ({
      ...theme,
      color: getChartColor(index)
    }));

  // Add current theme to chart data if available and valid
  if (currentTheme && 
      currentTheme.disruptivePotential !== null && 
      currentTheme.disruptivePotential !== undefined && 
      currentTheme.trendMomentum !== null && 
      currentTheme.trendMomentum !== undefined &&
      !isNaN(currentTheme.disruptivePotential) && 
      !isNaN(currentTheme.trendMomentum)) {
    chartData.unshift({
      ...currentTheme,
      color: '#FF0000', // Red for current theme
      isCurrent: true
    });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Context and Explanation Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Context and Explanation</h2>
        <div className="text-gray-600 leading-relaxed">
          {title?.explanation || 'No explanation available for this trend.'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Disruptive Potential and Trend Momentum */}
        <div className="lg:col-span-1 space-y-6 bg-blue-50 rounded-lg p-4">
          {/* Disruptive Potential */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Disruptive Potential</h3>
            
            {disruptivePotential?.highLowContainer && (
              <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {disruptivePotential.highLowContainer.icon && (
                      <div className="w-6 h-6 flex items-center justify-center">
                        <img 
                          src={disruptivePotential.highLowContainer.icon} 
                          alt="Disruptive Potential Icon" 
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {disruptivePotential.highLowContainer.impactArea || 'Impact Area'}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-medium ${
                    disruptivePotential.highLowContainer.impactRating?.toLowerCase() === 'high' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {disruptivePotential.highLowContainer.impactRating || 'Low'}
                  </span>
                </div>
              </div>
            )}

            {disruptivePotential?.content && (
              <div className="text-sm text-gray-600 leading-relaxed mt-3">
                {disruptivePotential.content}
              </div>
            )}
          </div>

          {/* Trend Momentum */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Trend Momentum</h3>
            
            {trendMomentum?.highLowContainer && (
              <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {trendMomentum.highLowContainer.icon && (
                      <div className="w-6 h-6 flex items-center justify-center">
                        <img 
                          src={trendMomentum.highLowContainer.icon} 
                          alt="Trend Momentum Icon" 
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {trendMomentum.highLowContainer.impactArea || 'Impact Area'}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-medium ${
                    trendMomentum.highLowContainer.impactRating?.toLowerCase() === 'high' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {trendMomentum.highLowContainer.impactRating || 'Low'}
                  </span>
                </div>
              </div>
            )}

            {trendMomentum?.content && (
              <div className="text-sm text-gray-600 leading-relaxed mt-3">
                {trendMomentum.content}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Chart and Market Leaders & Influencer Opinions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scatter Plot Chart */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Fintech Trends Quadrant: Predictive Momentum vs Disruption Potential</h3>
              <button
                onClick={() => setShowChartInfo(true)}
                className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <span className="text-xs font-bold">i</span>
              </button>
            </div>
            
            {chartLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : chartData.length > 0 ? (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    data={chartData}
                    margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      type="number" 
                      dataKey="trendMomentum" 
                      name="Predictive Momentum"
                      domain={[0, 5]}
                      tickCount={6}
                      tickFormatter={(value) => value.toFixed(1)}
                      label={{ value: 'Predictive Momentum (1-5)', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="disruptivePotential" 
                      name="Disruption Potential"
                      domain={[0, 5]}
                      tickCount={6}
                      tickFormatter={(value) => value.toFixed(1)}
                      label={{ value: 'Disruption Potential (1-5)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                              <p className="font-semibold text-gray-800">{data.name}</p>
                              <p className="text-sm text-gray-600">
                                Predictive Momentum: {data.trendMomentum?.toFixed(1) || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Disruption Potential: {data.disruptivePotential?.toFixed(1) || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Overall Score: {data.overallScore?.toFixed(1) || 'N/A'}
                              </p>
                              {data.isCurrent && (
                                <p className="text-sm text-red-600 font-medium">Current Theme</p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter dataKey="trendMomentum">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No related themes found for comparison.</p>
              </div>
            )}
          </div>

          {/* Market Leaders & Influencer Opinions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="text-lg">📄</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Market Leaders & Influencer Opinions</h3>
            </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : expertOpinions.length > 0 ? (
            <div className="space-y-4">
              {expertOpinions.map((opinion, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <span className="text-sm">👤</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {opinion.sourceName || 'Unknown Expert'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {opinion.sourceType || 'Industry Expert'}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        "{opinion.summary}"
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-3 py-1 rounded text-xs font-medium ${getSentimentColor(opinion.sentiment)}`}>
                        {opinion.sentiment || 'Neutral'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No expert opinions available for this trend.</p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Chart Info Modal */}
      {showChartInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Chart Data Information</h3>
              <button
                onClick={() => setShowChartInfo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Data Source</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  This chart displays themes that share sub-sectors with the current theme. 
                  The data is fetched from the Theme collection and shows the top 7 related themes 
                  based on their overall score.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Current Theme Data</h4>
                {currentTheme ? (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Theme Name:</span>
                        <p className="text-gray-600">{currentTheme.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Overall Score:</span>
                        <p className="text-gray-600">{currentTheme.overallScore?.toFixed(2) || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Disruption Potential:</span>
                        <p className="text-gray-600">{currentTheme.disruptivePotential?.toFixed(2) || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Trend Momentum:</span>
                        <p className="text-gray-600">{currentTheme.trendMomentum?.toFixed(2) || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No current theme data available</p>
                )}
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Related Themes Data</h4>
                {chartData.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {chartData.filter(theme => !theme.isCurrent).map((theme, index) => (
                        <div key={theme.id} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: theme.color }}
                            ></div>
                            <span className="text-sm font-medium text-gray-700">{theme.name}</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            DP: {theme.disruptivePotential?.toFixed(1) || 'N/A'} | 
                            TM: {theme.trendMomentum?.toFixed(1) || 'N/A'} | 
                            Score: {theme.overallScore?.toFixed(1) || 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No related themes data available</p>
                )}
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Chart Legend</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Red Point:</strong> Current theme being analyzed</li>
                  <li>• <strong>Colored Points:</strong> Related themes sharing sub-sectors</li>
                  <li>• <strong>X-Axis:</strong> Predictive Momentum (1-5 scale)</li>
                  <li>• <strong>Y-Axis:</strong> Disruption Potential (1-5 scale)</li>
                  <li>• <strong>Hover:</strong> Shows detailed information for each point</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowChartInfo(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
