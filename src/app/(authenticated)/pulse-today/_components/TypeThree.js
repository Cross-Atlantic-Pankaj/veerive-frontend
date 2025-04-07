import React from 'react';

const TypeThree = ({ context, isLastItem, lastContextCallback, formatSummary }) => {
  const sectorsLabel = [...context.sectors, ...context.subSectors].join(' • ');
  const summaryPoints = formatSummary(context.summary);

  return (
    <div
      ref={isLastItem ? lastContextCallback : null}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 w-full"
    >
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
                  className="text-gray-600 text-xs sm:text-sm line-clamp-1 mb-1"
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
              className="border-t border-gray-100 pt-0.5 mt-0.5 first:border-t-0 first:mt-0"
            >
              <div className="font-semibold text-gray-800 text-[10px] sm:text-xs hover:text-indigo-600 transition-colors line-clamp-2">
                {post.postTitle}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypeThree; 