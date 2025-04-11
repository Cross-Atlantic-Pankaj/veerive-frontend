import React from 'react';
import Image from 'next/image';

const PostCard = ({ post }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
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
          <span className="text-sm text-black border-b-2 border-green-500 inline-block">
            {post.postType}
          </span>
        </div>

        <h3 className="text-base font-semibold text-gray-900">
          {post.postTitle}
        </h3>
      </div>
    </div>
  );
};

export default PostCard;