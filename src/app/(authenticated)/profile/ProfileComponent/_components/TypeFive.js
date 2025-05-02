import React, { useState } from 'react';
import Link from 'next/link';
import slugify from 'slugify';
import toast from 'react-hot-toast';

const TypeFive = ({ context, formatSummary, handleUnsave }) => {
  const [isSaved, setIsSaved] = useState(true);

  const summaryPoints = formatSummary(context.summary);
  const summaryPoint = summaryPoints.slice(0, 1);

  const slug = context.contextTitle
    ? slugify(context.contextTitle, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g })
    : `context-${context._id}`;
  const fullSlug = `${slug}-${context._id}`;

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const shareData = {
        title: context.contextTitle,
        text: `Check out this context: ${context.contextTitle}\nSectors: ${context.sectorNames.join(', ')}\nSub-Sectors: ${context.subSectorNames.join(', ')}`,
        url: `${window.location.origin}/context-details/${fullSlug}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareText = `${context.contextTitle}\n\nSectors: ${context.sectorNames.join(', ')}\nSub-Sectors: ${context.subSectorNames.join(', ')}\n\nCheck out this context: ${window.location.origin}/context-details/${fullSlug}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Error sharing context');
    }
  };

  const onUnsave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await handleUnsave(context._id);
    setIsSaved(false);
  };

  return (
    <Link href={`/context-details/${fullSlug}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 w-full cursor-pointer mb-4">
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
                    {context.posts[0].postTitle}
                  </div>
                )}
              </div>
              <div className="flex-1">
                {context.posts?.[1] && (
                  <div className="font-semibold text-gray-800 text-[13px]">
                    {context.posts[1].postTitle}
                  </div>
                )}
              </div>
              <div className="flex-1">
                {context.posts?.[2] && (
                  <div className="font-semibold text-gray-800 text-[13px] border border-black p-1 rounded">
                    {context.posts[2].postTitle}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                {summaryPoint.length > 0 ? (
                  summaryPoint.map((point, i) => (
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
                    {context.posts[3].postTitle}
                  </div>
                )}
              </div>
              <div className="flex-1">
                {context.posts?.[4] && (
                  <div className="font-semibold text-gray-800 text-[13px] border border-black p-1 rounded">
                    {context.posts[4].postTitle}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onUnsave}
            className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
              isSaved
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              fill={isSaved ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            {isSaved ? 'Saved' : 'Save'}
          </button>
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

export default TypeFive;