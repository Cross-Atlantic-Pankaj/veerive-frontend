import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Tile, parseJsxCode } from '../../../../../utils/Tile';

const normalizeTitle = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\$/g, 'dollar') 
    .replace(/[^\w\s-]/g, '') 
    .replace(/\s+/g, '-') 
    .replace(/--+/g, '-') 
    .replace(/^-+|-+$/g, '');
};

const TypeFour = ({ context, isLastItem, lastContextCallback, formatSummary }) => {
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  const sectorsLabel = [...(context.sectors || []), ...(context.subSectors || [])]
    .map((item) => item.sectorName || item.subSectorName || 'Unknown')
    .join(' • ');
  const formattedSummaryPoints = formatSummary(context.summary);
  const summaryPoints = formattedSummaryPoints.slice(0, 4);

  const slug = context.contextTitle
    ? normalizeTitle(context.contextTitle)
    : 'context-unnamed';
  console.log(`Generated slug for context "${context.contextTitle}": ${slug}`);

  const getUserEmail = () => {
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      const user = JSON.parse(userDataStr);
      return user.email;
    }
    return null;
  };

  useEffect(() => {
    const checkSavedStatus = async () => {
      const email = getUserEmail();
      if (!email) {
        return;
      }

      try {
        const response = await fetch(
          `/api/context-save?contextId=${context.id}&email=${encodeURIComponent(email)}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        const data = await response.json();
        if (data.isSaved) {
          setIsSaved(true);
        }
      } catch (error) {
        console.error('Error checking saved status:', error);
        toast.error('Error checking saved status');
      }
    };
    checkSavedStatus();
  }, [context.id]);

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const email = getUserEmail();
    if (!email) {
      toast.error('Login First to share');
      return;
    }
    try {
      const shareData = {
        title: context.contextTitle,
        text: `Check out this context: ${context.contextTitle}`,
        url: window.location.origin + `/context-details/${slug}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareText = `${context.contextTitle}\n\nCheck out this context: ${window.location.origin}/context-details/${slug}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Error sharing context');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const email = getUserEmail();
    if (!email) {
      toast.error('Login First to save');
      return;
    }

    try {
      const action = isSaved ? 'unsave' : 'save';
      const response = await fetch('/api/context-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextId: context.id, email, action }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsSaved(action === 'save');
        toast.success(data.message);
      } else {
        toast.error(data.error || `Failed to ${action} context`);
      }
    } catch (error) {
      console.error(`Error ${isSaved ? 'unsaving' : 'saving'} context:`, error);
      toast.error(`Error ${isSaved ? 'unsaving' : 'saving'} context`);
    }
  };

    const tileProps = context.tileTemplates && context.tileTemplates.length > 0
      ? parseJsxCode(context.tileTemplates[0].jsxCode)
      : null;

  return (
    <Link href={`/context-details/${slug}`}>
      <div
        ref={isLastItem ? lastContextCallback : null}
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 w-full cursor-pointer"
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="w-full sm:w-1/3">
                      {tileProps ? (
                                                <div className="w-full h-20 lg:h-24 rounded-lg overflow-hidden">
                                                  <Tile {...tileProps} />
                                                </div>
                                              ) : (
                                                <div className="w-full h-20 lg:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-xs sm:text-sm text-gray-500">
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

        <div className="flex flex-col sm:flex-row gap-4 mb-1">
          <div className="flex-1">
            <div className="mb-4">
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
                  Summary coming soon...
                </div>
              )}
            </div>
          </div>
          <div className="w-full sm:w-1/3">
            {context.posts?.[0] && (
              <div className="font-semibold text-gray-800 text-sm lg:px-3">
                {context.posts[0].postId?.postTitle}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:divide-y md:divide-y-0 md:divide-x divide-gray-300 gap-2 mt-5">
          {context.posts?.slice(1, 4).map((post, i) => (
            <div key={i} className="flex-1 px-2">
              <div className="font-semibold text-gray-800 text-sm">
                {post.postId?.postTitle}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleSave}
            className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
              isSaved
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
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
              className="h-5 w-5 mr-1"
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

export default TypeFour;