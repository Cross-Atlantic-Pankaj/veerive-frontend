'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SavedPosts() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserEmail = () => {
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      const user = JSON.parse(userDataStr);
      return user.email;
    }
    return null;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  useEffect(() => {
    const fetchSavedPosts = async () => {
      const userDataStr = localStorage.getItem('user');
      if (!userDataStr) {
        setError('User not logged in');
        setIsLoading(false);
        return;
      }

      const { email } = JSON.parse(userDataStr);
      if (!email) {
        setError('User email not found');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user-saved-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (response.ok) {
          setPosts(data.savedItems.posts || []);
          // Initialize savedPosts state (all posts are saved)
          const savedStatus = {};
          data.savedItems.posts.forEach((post) => {
            savedStatus[post._id] = true;
          });
          setSavedPosts(savedStatus);
        } else {
          throw new Error(data.error || 'Failed to fetch saved posts');
        }
      } catch (err) {
        console.error('Error fetching saved posts:', err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedPosts();
  }, []);

  const handleSave = async (postId) => {
    const email = getUserEmail();
    if (!email) {
      router.push('/login');
      return;
    }

    try {
      const isSaved = savedPosts[postId];
      const action = isSaved ? 'unsave' : 'save';
      const response = await fetch('/api/post-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, email, action }),
      });
      const data = await response.json();
      if (response.ok) {
        setSavedPosts((prev) => ({ ...prev, [postId]: action === 'save' }));
        if (action === 'unsave') {
          setPosts((prev) => prev.filter((post) => post._id !== postId));
        }
        toast.success(data.message);
      } else {
        toast.error(data.error || `Failed to ${action} post`);
      }
    } catch (error) {
      console.error(`Error ${savedPosts[postId] ? 'unsaving' : 'saving'} post:`, error);
      toast.error(`Error ${savedPosts[postId] ? 'unsaving' : 'saving'} post`);
    }
  };

  const handleShare = async (post) => {
    try {
      const shareData = {
        title: post.postTitle,
        text: post.summary,
        url: post.sourceUrl,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareText = `${post.postTitle}\n\n${post.summary}\n\nRead more: ${post.sourceUrl}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Error sharing post');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full mt-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mt-8 text-red-600 text-center">
        Error: {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <></>
    );
  }

  return (
    <div className="w-full mt-8">
      <p className='text-xl font-semibold text-gray-800 mt-5 flex justify-center items-center mb-3'>Saved Posts</p>
      <div className="space-y-6">
        {posts.map((post, index) => (
          <div
            key={`${post._id}-${index}`}
            className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex space-x-2">
                {post.sectorNames.slice(0, 3).map((sector, i) => (
                  <span
                    key={`${sector}-${i}`}
                    className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded-full"
                  >
                    {sector}
                  </span>
                ))}
              </div>
              <span className="text-gray-500 text-sm">
                {formatDate(post.date || new Date())}
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {post.postTitle}
            </h2>
            <p className="text-gray-600 text-sm mb-2">
              {post.sourceName} | {post.postType}
            </p>
            <div className="text-gray-700 mb-4">
              <p dangerouslySetInnerHTML={{ __html: post.summary }} />
            </div>
            <div className="flex gap-3">
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm font-medium"
              >
                read full comment <span className="ml-1">→</span>
              </a>
              <button
                onClick={() => handleSave(post._id)}
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  savedPosts[post._id]
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill={savedPosts[post._id] ? 'currentColor' : 'none'}
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
                {savedPosts[post._id] ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={() => handleShare(post)}
                className="inline-flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-medium"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
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
        ))}
      </div>
    </div>
  );
}