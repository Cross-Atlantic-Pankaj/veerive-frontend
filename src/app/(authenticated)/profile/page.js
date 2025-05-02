'use client';
import React, { useEffect, useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import toast, { Toaster } from 'react-hot-toast';

export default function Profile() {
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [timeLeft, setTimeLeft] = useState(240); // 4 minutes
  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      const user = JSON.parse(userDataStr);
      setUserData({
        name: user.name,
        email: user.email
      });
    }

    // Load saved posts
    const saved = localStorage.getItem('savedPosts');
    if (saved) {
      setSavedPosts(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (showModal && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      toast.error('OTP has expired. Please try again.');
      handleCloseModal();
    }
  }, [showModal, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleForgotPassword = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userData.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong');
        return;
      }

      toast.success('OTP sent to your email');
      setShowModal(true);
      setTimeLeft(240);
    } catch (error) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error('Please enter both OTP and new password');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          otp,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong');
        return;
      }

      toast.success('Password reset successfully');
      handleCloseModal();
    } catch (error) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setOtp('');
    setNewPassword('');
    setTimeLeft(240);
  };

  return (
    <div className="p-6 relative mb-64">
      <Toaster position="top-right" />
      <div className="flex items-start gap-6 bg-white rounded-xl shadow-lg px-4 py-4 max-w-2xl hover:shadow-xl transition-shadow duration-300 ml-6">
        <div className="text-purple-600 bg-purple-50 p-3 rounded-full">
          <FaUserCircle size={48} />
        </div>
        <div className="flex flex-col flex-grow">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">{userData.name}</h2>
            <button
              onClick={handleForgotPassword}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              {isLoading ? 'Sending OTP...' : 'Change Password'}
            </button>
          </div>
          <p className="text-gray-600">{userData.email}</p>
        </div>
      </div>

      {/* Saved Posts Section */}
      <div className="mt-8 ml-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Saved Posts</h2>
        {savedPosts.length === 0 ? (
          <p className="text-gray-600">No saved posts yet.</p>
        ) : (
          <div className="space-y-6">
            {savedPosts.map((post, index) => (
              <div
                key={`${post._id}-${index}`}
                className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex space-x-2">
                    {post.sectors.slice(0, 3).map((sector, i) => (
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
                <h2 className="text-lg font-bold text-gray-900 mb-2">{post.postTitle}</h2>
                <p className="text-gray-600 text-sm mb-2">
                  {post.source} | {post.postType}
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
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex justify-center z-50 h-fit mt-22">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-2 transform transition-all">
            <div className="flex justify-between items-center px-5 py-2 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Reset Password</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
              >
                <IoClose size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors duration-200"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Time remaining: {formatTime(timeLeft)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors duration-200"
                    placeholder="Enter new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
