import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import slugify from 'slugify';
import toast from 'react-hot-toast';

const TypeNum = ({ context, formatSummary }) => {
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  const contextId = context._id || context.id;
  const summaryPoints = formatSummary(context.summary);

  const slug = context.contextTitle
    ? slugify(context.contextTitle, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      })
    : `context-${contextId}`;
  const fullSlug = `${slug}-${contextId}`;

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
          `/api/context-save?contextId=${contextId}&email=${encodeURIComponent(email)}`,
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
  }, [contextId]);

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const shareData = {
        title: context.contextTitle,
        text: `Check out this context: ${context.contextTitle}`,
        url: window.location.origin + `/context-details/${fullSlug}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareText = `${context.contextTitle}\n\nCheck out this context: ${window.location.origin}/context-details/${fullSlug}`;
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
      router.push('/login');
      return;
    }

    try {
      const action = isSaved ? 'unsave' : 'save';
      const response = await fetch('/api/context-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextId, email, action }),
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

  return (
    <Link href={`/context-details/${fullSlug}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 w-full cursor-pointer">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="w-full sm:w-1/3 flex items-center justify-center">
            <div className="text-3xl sm:text-4xl font-bold text-indigo-600 whitespace-nowrap">
              {context.dataForTypeNum || 'N/A'}
            </div>
          </div>
          <div className="flex-1">
            {summaryPoints.length > 0 ? (
              summaryPoints.map((point, i) => (
                <div
                  key={i}
                  className="text-gray-800 font-semibold text-xs sm:text-sm mb-1"
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

        <div className="mt-4 flex justify-end gap-2">
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

export default TypeNum;