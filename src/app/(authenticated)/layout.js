'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';

export default function AuthenticatedLayout({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [showThinkTankDropdown, setShowThinkTankDropdown] = useState(false);
  const [showAnalyzerDropdown, setShowAnalyzerDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState('');

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

    console.log("🔹 Checking token and user data...");
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo - with better mobile spacing */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="block">
                <Image
                  src="/assets/veerive_logo.svg"
                  alt="Veerive"
                  width={120}
                  height={40}
                  priority
                  className="w-24 md:w-32"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-12">
              <Link
                href="/"
                className="text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Pulse Today
              </Link>

              {/* Think Tank Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setShowThinkTankDropdown(true)}
                onMouseLeave={() => setShowThinkTankDropdown(false)}
              >
                <button className="text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Think Tank
                </button>
                
                {showThinkTankDropdown && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
                      <div className="w-3 h-3 bg-white rotate-45 border-l border-t border-gray-100" />
                    </div>
                    <Link href="/think-tank/influencer-comment" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                      INFLUENCER COMMENT
                    </Link>
                    <Link href="/think-tank/reports" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                      REPORTS
                    </Link>
                    <Link href="/think-tank/interviews" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                      INTERVIEWS
                    </Link>
                    <Link href="/think-tank/infographics" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                      INFOGRAPHICS & STATISTICS
                    </Link>
                  </div>
                )}
              </div>

              {/* Analyzer Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setShowAnalyzerDropdown(true)}
                onMouseLeave={() => setShowAnalyzerDropdown(false)}
              >
                <button className="text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Analyzer
                </button>
                
                {showAnalyzerDropdown && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
                      <div className="w-3 h-3 bg-white rotate-45 border-l border-t border-gray-100" />
                    </div>
                    <Link href="/analyzer/sector" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                      SECTOR ANALYSER
                    </Link>
                    <Link href="/analyzer/trend" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                      TREND ANALYZER
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* User Profile and Mobile Menu Button - improved spacing */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 hidden md:block mr-3">{user?.name}</span>
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-indigo-600">
                    {user?.name?.[0]?.toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Logout
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <span className="sr-only">Open main menu</span>
                {!isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Improved Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pulse Today
              </Link>

              {/* Mobile Think Tank Section - Collapsible */}
              <div className="space-y-1">
                <button
                  onClick={() => setOpenMobileSection(openMobileSection === 'think-tank' ? '' : 'think-tank')}
                  className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Think Tank
                  <svg
                    className={`h-5 w-5 transform transition-transform duration-200 ${
                      openMobileSection === 'think-tank' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openMobileSection === 'think-tank' && (
                  <div className="pl-4 space-y-1">
                    {[
                      { name: 'INFLUENCER COMMENT', href: '/think-tank/influencer-comment' },
                      { name: 'REPORTS', href: '/think-tank/reports' },
                      { name: 'INTERVIEWS', href: '/think-tank/interviews' },
                      { name: 'INFOGRAPHICS & STATISTICS', href: '/think-tank/infographics' },
                    ].map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Analyzer Section - Collapsible */}
              <div className="space-y-1">
                <button
                  onClick={() => setOpenMobileSection(openMobileSection === 'analyzer' ? '' : 'analyzer')}
                  className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Analyzer
                  <svg
                    className={`h-5 w-5 transform transition-transform duration-200 ${
                      openMobileSection === 'analyzer' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openMobileSection === 'analyzer' && (
                  <div className="pl-4 space-y-1">
                    {[
                      { name: 'SECTOR ANALYSER', href: '/analyzer/sector' },
                      { name: 'TREND ANALYZER', href: '/analyzer/trend' },
                    ].map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Logout Button */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 