import React from 'react';
import Link from 'next/link';
import slugify from 'slugify';

const TypeTwo = ({ context, formatSummary }) => {
  const sectorsLabel = [...(context.sectors || []), ...(context.subSectors || [])]
    .map((item) => item.sectorName || item.subSectorName || 'Unknown')
    .join(' • ');
  const formattedSummaryPoints = formatSummary(context.summary);
  const summaryPoints = formattedSummaryPoints.slice(0, 3);

  const slug = context.contextTitle
    ? slugify(context.contextTitle, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      })
    : `context-${context.id}`;
  const fullSlug = `${slug}-${context.id}`;

  return (
    <Link href={`/context-details/${fullSlug}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col p-4 sm:p-5 w-full cursor-pointer">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
          <div className="flex-1 flex flex-col">
            <div className="text-red-600 text-[10px] sm:text-xs font-semibold mb-1">
              {sectorsLabel}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
              {context.contextTitle}
            </h2>
          </div>
        </div>

        <div className="mb-4">
          {summaryPoints.length > 0 ? (
            summaryPoints.map((point, i) => (
              <div
                key={i}
                className="text-gray-600 text-xs sm:text-sm line-clamp-1 mb-1 lg:pr-16"
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

        <div className="flex flex-col sm:flex-row gap-2">
          {context.posts?.slice(0, 2).map((post, i) => (
            <div key={i} className="font-semibold text-gray-800 text-sm lg:pr-6">
              {post.postId?.postTitle || 'Untitled Post'}
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default TypeTwo;