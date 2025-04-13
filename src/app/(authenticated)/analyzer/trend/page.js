'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function TrendAnalyzer() {
  const [themes, setThemes] = useState([]);
  const [allThemes, setAllThemes] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [subsectors, setSubsectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedSubsector, setSelectedSubsector] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const themesPerPage = 21;

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch('/api/analyzer/trend-analyzer');
        const result = await response.json();
        
        if (result.success) {
          setAllThemes(result.data);
          setThemes(result.data);
          setSectors(result.Sectordata || []);
          setSubsectors(result.Subsectordata || []);
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

  // Filter themes based on selected sector and subsector
  useEffect(() => {
    if (!allThemes.length) return;

    let filteredThemes = [...allThemes];

    // Filter by sector if selected
    if (selectedSector) {
      filteredThemes = filteredThemes.filter(theme => 
        theme.sectors.some(sector => sector._id === selectedSector)
      );
    }

    // Filter by subsector if selected
    if (selectedSubsector) {
      filteredThemes = filteredThemes.filter(theme => 
        theme.subSectors.some(subsector => subsector._id === selectedSubsector)
      );
    }

    setThemes(filteredThemes);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedSector, selectedSubsector, allThemes]);

  const indexOfLastTheme = currentPage * themesPerPage;
  const indexOfFirstTheme = indexOfLastTheme - themesPerPage;
  const currentThemes = themes.slice(indexOfFirstTheme, indexOfLastTheme);
  const totalPages = Math.ceil(themes.length / themesPerPage);

  const handleSectorChange = (e) => {
    setSelectedSector(e.target.value);
  };

  const handleSubsectorChange = (e) => {
    setSelectedSubsector(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-400 border-t-transparent"></div>
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
    <div className="py-8 bg-gray-50 min-h-screen px-12">
      {/* Filter Section */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold mb-4">Filter Themes</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
              Sector
            </label>
            <select
              id="sector"
              value={selectedSector}
              onChange={handleSectorChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sectors</option>
              {sectors.map((sector) => (
                <option key={sector._id} value={sector._id}>
                  {sector.sectorName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="subsector" className="block text-sm font-medium text-gray-700 mb-1">
              SubSector
            </label>
            <select
              id="subsector"
              value={selectedSubsector}
              onChange={handleSubsectorChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All SubSectors</option>
              {subsectors.map((subsector) => (
                <option key={subsector._id} value={subsector._id}>
                  {subsector.subSectorName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
        {currentThemes.map((theme, index) => (
          <div 
            key={theme._id || index}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md 
                     transition-shadow duration-300 border border-gray-100"
          >
            <div className="relative w-full h-[160px]">
              {theme.bannerImage ? (
                <Image
                  src={theme.bannerImage}
                  alt={theme.themeTitle}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 
                             flex items-center justify-center text-gray-400">
                  1000 x 180
                </div>
              )}
            </div>

            <div className="p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {theme.themeTitle}
              </h2>

              <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 rounded-lg overflow-hidden">
                <div className="p-3 text-center border-r border-white">
                  <div className="text-sm font-medium text-gray-500 mb-1">Trending Pulse</div>
                  <div className="text-base font-bold text-blue-600">
                    {theme.trendingScore?.toFixed(2) || 'N/A'}
                  </div>
                </div>

                <div className="p-3 text-center border-r border-white">
                  <div className="text-sm font-medium text-gray-500 mb-1">Disruption</div>
                  <div className="text-base font-bold text-purple-600">
                    {theme.impactScore?.toFixed(2) || 'N/A'}
                  </div>
                </div>

                <div className="p-3 text-center">
                  <div className="text-sm font-medium text-gray-500 mb-1">Momentum</div>
                  <div className="text-base font-bold text-indigo-600">
                    {theme.predictiveMomentumScore?.toFixed(2) || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {theme.sectors?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {theme.sectors.map(sector => (
                      <span 
                        key={sector._id} 
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm
                                 font-medium inline-flex items-center"
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
                        className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm
                                 font-medium inline-flex items-center"
                      >
                        {subSector.subSectorName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-6 pb-8">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold
            transition-all duration-200 text-sm
            ${currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 shadow-sm'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold
            transition-all duration-200 text-sm
            ${currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 shadow-sm'
            }
          `}
        >
          Next
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
} 