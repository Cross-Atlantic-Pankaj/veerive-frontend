import React from 'react';

const TypeFive = ({ context, isLastItem, lastContextCallback, formatSummary }) => {
  const summaryPoints = formatSummary(context.summary);

  return (
    <div
      ref={isLastItem ? lastContextCallback : null}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 w-full"
    >
      <div className="text-black-600 text-[10px] sm:text-xs font-semibold mb-2">
        {context.contextTitle}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="w-full sm:w-1/3 flex items-stretch">
          {context.bannerImage ? (
            <img
              src={context.bannerImage}
              alt="Banner"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-xs sm:text-sm text-gray-500">
              1000 × 630
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              {context.posts?.[0] && (
                <div className="font-semibold text-gray-800 text-[10px] sm:text-xs hover:text-indigo-600 transition-colors">
                  {context.posts[0].postTitle}
                </div>
              )}
            </div>
            <div className="flex-1">
              {context.posts?.[1] && (
                <div className="font-semibold text-gray-800 text-[10px] sm:text-xs hover:text-indigo-600 transition-colors">
                  {context.posts[1].postTitle}
                </div>
              )}
            </div>
            <div className="flex-1">
              {context.posts?.[2] && (
                <div className="font-semibold text-gray-800 text-[10px] sm:text-xs hover:text-indigo-600 transition-colors border border-black p-1 rounded">
                  {context.posts[2].postTitle}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              {summaryPoints.length > 0 ? (
                summaryPoints.map((point, i) => (
                  <div
                    key={i}
                    className="text-gray-600 text-xs sm:text-sm mb-1"
                  >
                    {point}
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-xs sm:text-sm italic">
                  Summary will be available soon
                </div>
              )}
            </div>
            <div className="flex-1">
              {context.posts?.[3] && (
                <div className="font-semibold text-gray-800 text-[10px] sm:text-xs hover:text-indigo-600 transition-colors">
                  {context.posts[3].postTitle}
                </div>
              )}
            </div>
            <div className="flex-1">
              {context.posts?.[4] && (
                <div className="font-semibold text-gray-800 text-[10px] sm:text-xs hover:text-indigo-600 transition-colors border border-black p-1 rounded">
                  kia {context.posts[4].postTitle}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypeFive; 