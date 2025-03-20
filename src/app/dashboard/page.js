'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    const userFromUrl = searchParams.get('user');

    if (tokenFromUrl && userFromUrl) {
      console.log("🔹 Found token and user in URL params...");
      localStorage.setItem('token', tokenFromUrl);
      localStorage.setItem('user', decodeURIComponent(userFromUrl));
    }

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    console.log("🔹 Checking token and user data in dashboard...");
    console.log("Token:", token);
    console.log("User:", userData);

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [router, searchParams]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-xl rounded-lg">
            {/* Dashboard content */}
          </div>
        </div>
      </main>
    </div>
  );
}