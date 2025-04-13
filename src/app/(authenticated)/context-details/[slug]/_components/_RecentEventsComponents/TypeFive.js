import React from 'react';
import Link from 'next/link';
import slugify from 'slugify';

const TypeFive = ({ context, formatSummary }) => {
  const formattedSummaryPoints = formatSummary(context.summary);
  const summaryPoints = formattedSummaryPoints.slice(0, 1);

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
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 w-full cursor-pointer">
        <div className="text-black-600 text-lg font-semibold mb-2">
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
                  <div className="font-semibold text-gray-800 text-[13px]">
                    {context.posts[0].postId?.postTitle || 'Untitled Post'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                {context.posts?.[1] && (
                  <div className="font-semibold text-gray-800 text-[13px]">
                    {context.posts[1].postId?.postTitle || 'Untitled Post'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                {context.posts?.[2] && (
                  <div className="font-semibold text-gray-800 text-[13px] border border-black p-1 rounded">
                    {context.posts[2].postId?.postTitle || 'Untitled Post'}
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
                      className="text-gray-600 text-xs sm:text-sm mb-1 line-clamp-3"
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
                  <div className="font-semibold text-gray-800 text-[13px]">
                    {context.posts[3].postId?.postTitle || 'Untitled Post'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                {context.posts?.[4] && (
                  <div className="font-semibold text-gray-800 text-[13px] border border-black p-1 rounded">
                    {context.posts[4].postId?.postTitle || 'Untitled Post'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TypeFive;