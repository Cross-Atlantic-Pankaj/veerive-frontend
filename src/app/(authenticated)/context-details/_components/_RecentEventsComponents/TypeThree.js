import React from 'react';
import Link from 'next/link';

const TypeThree = ({ context, formatSummary }) => {
  const sectorsLabel = [...(context.sectors || []), ...(context.subSectors || [])]
    .map(item => item.sectorName || item.subSectorName || 'Unknown')
    .join(' • ');
  const formattedSummaryPoints = formatSummary(context.summary);
  const summaryPoints = formattedSummaryPoints.slice(0, 3);

  return (
    <Link href={`/context-details?id=${context.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 w-full cursor-pointer">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 flex flex-col">
            <div className="flex flex-row items-start gap-3 sm:gap-4">
              <div className="w-full sm:w-1/3">
                {context.bannerImage ? (
                  <img
                    src={context.bannerImage}
                    alt="Banner"
                    className="w-full h-16 sm:h-20 md:h-24 lg:h-28 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-16 sm:h-20 md:h-24 lg:h-28 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs sm:text-sm">
                    1000 × 630
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-red-600 text-[10px] sm:text-xs font-semibold mb-1">
                  {sectorsLabel}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                  {context.contextTitle}
                </h2>
              </div>
            </div>
            <div className="mt-3">
              {summaryPoints.length > 0 ? (
                summaryPoints.map((point, i) => (
                  <div
                    key={i}
                    className="text-gray-600 text-xs sm:text-sm mb-1 line-clamp-1"
                  >
                    {point}
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-xs sm:text-sm italic line-clamp-1">
                  Summary will be available soon
                </div>
              )}
            </div>
          </div>

          <div className="w-full sm:w-1/3 flex flex-col justify-between">
            {context.posts?.slice(0, 3).map((post, i) => (
              <div
                key={i}
                className="border-t border-gray-300 pt-0.5 mt-0.5 first:border-t-0 first:mt-0"
              >
                <div className="font-semibold text-gray-800 text-sm my-2">
                  {post.postId?.postTitle || 'Untitled Post'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TypeThree;