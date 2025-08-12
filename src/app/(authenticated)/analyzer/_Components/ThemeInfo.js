import React from 'react';

export default function ThemeInfo({ theme }) {
  return (
    <div className="max-w-full mx-auto md:py-6 p-3 md:px-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{theme.themeTitle}</h1>
      
      <div className="flex flex-col md:flex-row md:items-start md:gap-8 mb-4">
        {/* Sectors and Subsectors */}
        <div className="flex-1">
          {theme.sectors?.length > 0 || theme.subSectors?.length > 0 ? (
            <div>
              <div className="flex flex-wrap gap-2 mt-2">
                {theme.sectors?.map((sector) => (
                  <span
                    key={sector._id}
                    className="p-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {sector.sectorName}
                  </span>
                ))}
                {theme.subSectors?.map((subSector) => (
                  <span
                    key={subSector._id}
                    className="p-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {subSector.subSectorName}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Score Metrics */}
        <div className="flex-1 flex gap-4 flex-wrap md:justify-end mt-4 md:mt-0">
          <div className="flex items-center bg-[#f1f8ff] border border-[#174c77] rounded px-2 py-1 gap-2">
            <div className="text-sm text-[#174c77] leading-tight text-center">
              Disruption Potential
            </div>
            <div className="bg-[#f76c3c] text-white font-bold w-9 h-9 p-2 flex items-center justify-center rounded">
              {theme.impactScore?.toFixed(2)}
            </div>
          </div>
          <div className="flex items-center bg-[#f1f8ff] border border-[#174c77] rounded px-2 py-1 gap-2">
            <div className="text-sm text-[#174c77] leading-tight text-center">
              Predictive Momentum
            </div>
            <div className="bg-[#f76c3c] text-white font-bold w-9 h-9 p-2 flex items-center justify-center rounded">
              {theme.predictiveMomentumScore?.toFixed(2)}
            </div>
          </div>
          <div className="flex items-center bg-[#f1f8ff] border border-[#174c77] rounded px-2 py-1 gap-2">
            <div className="text-sm text-[#174c77] leading-tight text-center">
              Trending Pulse
            </div>
            <div className="bg-[#f76c3c] text-white font-semibold w-9 h-9 p-2 flex items-center justify-center rounded">
              {theme.trendingScore?.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {theme.themeDescription && (
        <div
          className="text-gray-600 mb-2 mt-4 text-base"
          dangerouslySetInnerHTML={{ __html: theme.themeDescription }}
        ></div>
      )}
    </div>
  );
}