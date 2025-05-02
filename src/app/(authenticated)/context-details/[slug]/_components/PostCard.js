import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const PostCard = ({ post }) => {
  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const shareData = {
        title: post.postTitle,
        text: `Check out this post: ${post.postTitle}`,
        url: post.sourceUrl || window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareText = `${post.postTitle}\n\nCheck out this post: ${post.sourceUrl || window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Link href={post.sourceUrl || '#'} target="_blank" rel="noopener noreferrer" className="block">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="relative w-full h-[150px]">
          {post.postImage ? (
            <Image
              src={post.postImage}
              alt={post.postTitle}
              layout="fill"
              objectFit="cover"
              className="rounded-t-lg"
              priority={false}
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg">
              <span className="text-gray-500 text-sm font-medium">1000*630</span>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="mb-2">
            <span className="text-xs text-black border-b-2 border-green-500 inline-block">
              {post.postType}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-gray-900">
            {post.postTitle}
          </h3>

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
      </div>
    </Link>
  );
};

export default PostCard;