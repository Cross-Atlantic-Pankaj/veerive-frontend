import Image from 'next/image';

export default function ThemeInfo({ theme }) {
  return (
    <div className="max-full mx-auto py-6 px-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{theme.themeTitle}</h1>
      
      <div className="space-y-4">
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

      {theme.themeDescription && (
        <div
          className="text-gray-600 mb-2 mt-4 text-base"
          dangerouslySetInnerHTML={{ __html: theme.themeDescription }}
        ></div>
      )}

      <div className="flex divide-x divide-black-500 bg-gray-50 rounded-lg text-sm">
        <div className="flex">
          <span className="text-gray-500 mr-2 text-base">
            Trending Pulse{' '}
            <span className="text-purple-600 font-bold text-base">
              {theme.trendingScore?.toFixed(2) || 'N/A'}
            </span>
          </span>
        </div>
        <div className="flex px-2">
          <span className="text-gray-500 mr-2 text-base">
            Disruption Potential{' '}
            <span className="text-purple-600 font-bold text-base">
              {theme.impactScore?.toFixed(2) || 'N/A'}
            </span>
          </span>
        </div>
        <div className="flex px-2">
          <span className="text-gray-500 mr-2 text-base">
            Predictive Momentum{' '}
            <span className="text-purple-600 font-bold text-base">
              {theme.predictiveMomentumScore?.toFixed(2) || 'N/A'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}