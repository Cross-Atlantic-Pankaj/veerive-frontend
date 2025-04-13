'use client';
import { useEffect, useState } from 'react';

export default function TrendAnalyzer() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch('/api/analyzer/trend-analyzer');
        const result = await response.json();
        
        if (result.success) {
          setThemes(result.data);
        } else {
          setError(result.error || 'Failed to fetch themes');
        }
      } catch (err) {
        setError('Failed to fetch themes data');
        console.error('Error fetching themes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Trend Analyzer
        </span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {themes.map((theme, index) => (
          <div 
            key={theme._id || index}
            className="bg-white rounded-2xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.1)] 
                     hover:shadow-[0_0_25px_rgba(0,0,0,0.15)] 
                     transition-all duration-300 transform hover:-translate-y-1
                     border border-gray-100"
          >
            {/* Title with gradient background */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 -mx-6 -mt-6 p-6 rounded-t-2xl mb-6">
              <h2 className="text-xl font-bold text-gray-800 line-clamp-2">
                {theme.themeTitle}
              </h2>
            </div>

            {/* Scores with improved visual hierarchy */}
            <div className="space-y-4 mb-6">
              <div className="score-item">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-700 font-medium">Trending Score</span>
                  <span className="text-2xl font-bold text-blue-800">
                    {theme.trendingScore?.toFixed(2) || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="score-item">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700 font-medium">Impact Score</span>
                  <span className="text-2xl font-bold text-green-800">
                    {theme.impactScore?.toFixed(2) || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="score-item">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-purple-700 font-medium">Predictive Momentum</span>
                  <span className="text-2xl font-bold text-purple-800">
                    {theme.predictiveMomentumScore?.toFixed(2) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sectors and SubSectors with improved styling */}
            <div className="space-y-3">
              {theme.sectors?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {theme.sectors.map(sector => (
                    <span 
                      key={sector._id} 
                      className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-50 
                               text-blue-800 text-sm rounded-full border border-blue-200
                               hover:from-blue-200 hover:to-blue-100 transition-colors"
                    >
                      {sector.sectorName}
                    </span>
                  ))}
                </div>
              )}
              
              {theme.subSectors?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {theme.subSectors.map(subSector => (
                    <span 
                      key={subSector._id} 
                      className="px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-50 
                               text-purple-800 text-sm rounded-full border border-purple-200
                               hover:from-purple-200 hover:to-purple-100 transition-colors"
                    >
                      {subSector.subSectorName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 