import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function RelatedEvents({ relatedThemes }) {
  const router = useRouter();

  const handleThemeClick = (theme) => {
    const slugified = theme.themeTitle
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
    router.push(`/analyzer/theme-details/${slugified}`);
  };

  if (!relatedThemes.length) return null;

  return (
    <div className="mt-8 px-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 px-1">Other Key Trends in Sector</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
        {relatedThemes.map((relatedTheme) => (
          <div
            key={relatedTheme._id.toString()}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 cursor-pointer"
            onClick={() => handleThemeClick(relatedTheme)}
          >
            <div className="relative w-full h-[160px]">
              {relatedTheme.trendingScoreImage ? (
                <Image
                  src={relatedTheme.trendingScoreImage}
                  alt={relatedTheme.themeTitle || 'Trend Image'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                  1000 x 630
                </div>
              )}
            </div>

            <div className="p-5">
              {relatedTheme.themeTitle && <h2 className="text-lg font-bold text-gray-800 mb-4">
                {relatedTheme.themeTitle}
              </h2>}

              <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 rounded-lg overflow-hidden">
                <div className="p-3 text-center border-r border-white">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Trending <br /> Pulse
                  </div>
                  <div className="text-base font-bold text-blue-600">
                    {relatedTheme.trendingScore?.toFixed(2) || 'N/A'}
                  </div>
                </div>

                <div className="p-3 text-center border-r border-white">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Disruption Potential
                  </div>
                  <div className="text-base font-bold text-purple-600">
                    {relatedTheme.impactScore?.toFixed(2) || 'N/A'}
                  </div>
                </div>

                <div className="p-3 text-center">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Predictive Momentum
                  </div>
                  <div className="text-base font-bold text-indigo-600">
                    {relatedTheme.predictiveMomentumScore?.toFixed(2) || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {relatedTheme.sectors?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {relatedTheme.sectors.map((sector) => (
                      <span
                        key={sector._id}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium inline-flex items-center"
                      >
                        {sector.sectorName || 'Unknown Sector'}
                      </span>
                    ))}
                  </div>
                )}

                {relatedTheme.subSectors?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {relatedTheme.subSectors.map((subSector) => (
                      <span
                        key={subSector._id}
                        className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium inline-flex items-center"
                      >
                        {subSector.subSectorName || 'Unknown SubSector'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}