import React, { useState } from 'react';
import Link from 'next/link';
import slugify from 'slugify';
import toast from 'react-hot-toast';

const TypeOne = ({ context, formatSummary, handleUnsave }) => {
  const [isSaved, setIsSaved] = useState(true); // Always saved initially in profile

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
      <div className="bg-white rounded-lg overflow-hidden w-full cursor-pointer hover:shadow-md transition-all duration-200">
        {context.bannerImage ? (
          <img
            src={context.bannerImage}
            alt="banner"
            className="w-full h-[120px] sm:h-[140px] md:h-[160px] object-cover"
          />
        ) : (
          <div className="w-full h-[120px] sm:h-[140px] md:h-[160px] bg-gray-300 flex items-center justify-center text-gray-400 text-xs sm:text-sm">
            1000 × 630
          </div>
        )}
        <div className="px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-1">
            {[...context.sectorNames, ...context.subSectorNames].slice(0, 3).map((name, idx) => (
              <span
                key={idx}
                className="text-[10px] sm:text-xs text-black-600 relative inline-block font-medium border-b-2 border-green-500"
              >
                {name}
              </span>
            ))}
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
            {context.contextTitle}
          </h3>
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={onUnsave}
              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
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
              className="inline-flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-200 text-xs font-medium"
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
      </div>
    </Link>
  );
};

export default TypeOne;