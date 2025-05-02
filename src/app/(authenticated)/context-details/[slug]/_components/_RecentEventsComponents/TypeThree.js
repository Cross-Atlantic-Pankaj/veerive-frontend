import React from 'react';
import Link from 'next/link';
import slugify from 'slugify';

const TypeThree = ({ context, formatSummary }) => {
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

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const shareData = {
        title: context.contextTitle,
        text: `Check out this context: ${context.contextTitle}`,
        url: window.location.origin + `/context-details/${fullSlug}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareText = `${context.contextTitle}\n\nCheck out this context: ${window.location.origin}/context-details/${fullSlug}`;
        await navigator.clipboard.writeText(shareText);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Link href={`/context-details/${fullSlug}`}>
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

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleShare}
            className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 text-xs font-medium"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-3 w-3 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
              />
            </svg>
            Share
          </button>
        </div>
      </div>
    </Link>
  );
};

export default TypeThree;