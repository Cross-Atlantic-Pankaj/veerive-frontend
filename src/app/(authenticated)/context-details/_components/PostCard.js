// container-details/components/PostCard.jsx
import React from 'react';
import Image from 'next/image';

const PostCard = ({ post }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {/* Image or Placeholder (1000x630 aspect ratio, reduced height) */}
      <div className="relative w-full h-[200px]">
        {post.postImage ? (
          <Image
            src={post.postImage}
            alt={post.postTitle}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
            priority={false}
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg'; // Fallback on error
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg">
            <span className="text-gray-500 text-sm font-medium">1000*630</span>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Post Type with Green Underline */}
        <div className="mb-2">
          <span className="text-sm font-semibold text-black border-b-2 border-green-500 inline-block">
            {post.postType}
          </span>
        </div>

        {/* Post Title */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
          {post.postTitle}
        </h3>
      </div>
    </div>
  );
};

export default PostCard;