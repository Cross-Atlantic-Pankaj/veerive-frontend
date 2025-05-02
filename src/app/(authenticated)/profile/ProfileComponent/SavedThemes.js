'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SavedThemes() {
  const router = useRouter();
  const [themes, setThemes] = useState([]);
  const [savedThemes, setSavedThemes] = useState({});
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

  useEffect(() => {
    const fetchSavedThemes = async () => {
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
          setThemes(data.savedItems.themes || []);
          // Initialize savedThemes state (all themes are saved)
          const savedStatus = {};
          data.savedItems.themes.forEach((theme) => {
            savedStatus[theme._id] = true;
          });
          setSavedThemes(savedStatus);
        } else {
          throw new Error(data.error || 'Failed to fetch saved themes');
        }
      } catch (err) {
        console.error('Error fetching saved themes:', err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedThemes();
  }, []);

  const handleThemeClick = (theme) => {
    const slugified = theme.themeTitle
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
    router.push(`/analyzer/theme-details/${slugified}`);
  };

  const handleShare = async (theme) => {
    try {
      const slugified = theme.themeTitle
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '');

      const shareData = {
        title: theme.themeTitle,
        text: `Check out this trend: ${theme.themeTitle}`,
        url: window.location.origin + `/analyzer/theme-details/${slugified}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareText = `${theme.themeTitle}\n\nCheck out this trend: ${window.location.origin}/analyzer/theme-details/${slugified}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Error sharing theme');
    }
  };

  const handleSave = async (themeId) => {
    const email = getUserEmail();
    if (!email) {
      router.push('/login');
      return;
    }

    try {
      const isSaved = savedThemes[themeId];
      const action = isSaved ? 'unsave' : 'save';
      const response = await fetch('/api/theme-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId, email, action }),
      });
      const data = await response.json();
      if (response.ok) {
        setSavedThemes((prev) => ({ ...prev, [themeId]: action === 'save' }));
        if (action === 'unsave') {
          setThemes((prev) => prev.filter((theme) => theme._id !== themeId));
        }
        toast.success(data.message);
      } else {
        toast.error(data.error || `Failed to ${action} theme`);
      }
    } catch (error) {
      console.error(`Error ${savedThemes[themeId] ? 'unsaving' : 'saving'} theme:`, error);
      toast.error(`Error ${savedThemes[themeId] ? 'unsaving' : 'saving'} theme`);
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

  if (themes.length === 0) {
    return (
      <></>
    );
  }

  return (
    <div className="w-full mt-8">
      <p className='text-xl font-semibold text-gray-800 mt-5 flex justify-center items-center mb-3'>Saved Themes</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
        {themes.map((theme) => (
          <div
            key={theme._id}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 cursor-pointer"
            onClick={() => handleThemeClick(theme)}
          >
            <div className="relative w-full h-[160px]">
              <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                1000 x 630
              </div>
            </div>

            <div className="p-5">
              {theme.themeTitle && (
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  {theme.themeTitle}
                </h2>
              )}

              <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 rounded-lg overflow-hidden">
                <div className="p-3 text-center border-r border-white">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Trending <br /> Pulse
                  </div>
                  <div className="text-base font-bold text-blue-600">
                    {theme.trendingScore?.toFixed(2) || 'N/A'}
                  </div>
                </div>

                <div className="p-3 text-center border-r border-white">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Disruption Potential
                  </div>
                  <div className="text-base font-bold text-purple-600">
                    {theme.impactScore?.toFixed(2) || 'N/A'}
                  </div>
                </div>

                <div className="p-3 text-center">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Predictive Momentum
                  </div>
                  <div className="text-base font-bold text-indigo-600">
                    {theme.predictiveMomentumScore?.toFixed(2) || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {theme.sectorNames?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {theme.sectorNames.map((sector, index) => (
                      <span
                        key={`${sector}-${index}`}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium inline-flex items-center"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                )}

                {theme.subSectorNames?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {theme.subSectorNames.map((subSector, index) => (
                      <span
                        key={`${subSector}-${index}`}
                        className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium inline-flex items-center"
                      >
                        {subSector}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave(theme._id);
                  }}
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                    savedThemes[theme._id]
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill={savedThemes[theme._id] ? 'currentColor' : 'none'}
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
                  {savedThemes[theme._id] ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(theme);
                  }}
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
          </div>
        ))}
      </div>
    </div>
  );
}