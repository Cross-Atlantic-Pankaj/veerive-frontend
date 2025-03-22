'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

function MenuIcon({ open }) {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {open ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      )}
    </svg>
  );
}

function MobileNavLink({ href, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
    >
      {children}
    </Link>
  );
}

function MobileDropdown({ title, items, isOpen, onClick, currentPath }) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-3 text-base font-medium transition-colors duration-200 ${
          isOpen ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-gray-900'
        }`}
      >
        <span>{title}</span>
        <svg
          className={`ml-2 h-5 w-5 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-600' : 'text-gray-400'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50"
          >
            {items.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-8 py-3 text-sm transition-colors duration-150 ${
                  currentPath === item.href
                    ? 'text-indigo-600 bg-indigo-50/50 font-medium'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/30'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar({ user, onLogout }) {
  const pathname = usePathname();
  const [openMobileSection, setOpenMobileSection] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const thinkTankLinks = [
    { name: 'INFLUENCER COMMENT', href: '/think-tank/influencer-comment' },
    { name: 'REPORTS', href: '/think-tank/reports' },
    { name: 'INTERVIEWS', href: '/think-tank/interviews' },
    { name: 'INFOGRAPHICS & STATISTICS', href: '/think-tank/infographics' },
  ];

  const analyzerLinks = [
    { name: 'SECTOR ANALYSER', href: '/analyzer/sector' },
    { name: 'TREND ANALYZER', href: '/analyzer/trend' },
  ];

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-50">
          {/* Desktop Navigation */}
          <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image
                src="/assets/veerive_logo.svg"
                alt="Veerive"
                width={130}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>

            {/* Desktop Menu Items */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              <NavLink href="/" isActive={pathname === '/'}>
                Pulse Today
              </NavLink>
              <NavDropdown 
                title="Think Tank" 
                items={thinkTankLinks}
                isActive={pathname.includes('/think-tank')}
                currentPath={pathname}
                className="w-64"
              />
              <NavDropdown 
                title="Analyzer" 
                items={analyzerLinks}
                isActive={pathname.includes('/analyzer')}
                currentPath={pathname}
                className="w-48"
              />
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center ring-2 ring-white">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Logout
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <span className="sr-only">Open menu</span>
                <MenuIcon open={isMobileMenuOpen} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100"
            >
              <div className="px-4 py-3 space-y-3">
                <MobileNavLink 
                  href="/" 
                  isActive={pathname === '/'}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pulse Today
                </MobileNavLink>

                <MobileDropdown
                  title="Think Tank"
                  items={thinkTankLinks}
                  isOpen={openMobileSection === 'think-tank'}
                  onClick={() => setOpenMobileSection(openMobileSection === 'think-tank' ? '' : 'think-tank')}
                  currentPath={pathname}
                />

                <MobileDropdown
                  title="Analyzer"
                  items={analyzerLinks}
                  isOpen={openMobileSection === 'analyzer'}
                  onClick={() => setOpenMobileSection(openMobileSection === 'analyzer' ? '' : 'analyzer')}
                  currentPath={pathname}
                />

                {/* Mobile User Profile & Logout */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center px-4 py-2 mb-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center ring-2 ring-white mr-3">
                      <span className="text-sm font-medium text-white">
                        {user?.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>Logout</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

function NavLink({ href, children, isActive }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 text-sm font-medium transition-colors duration-200 relative group ${
        isActive ? 'text-indigo-600' : 'text-gray-900 hover:text-indigo-600'
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />
      )}
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
    </Link>
  );
}

function NavDropdown({ title, items, isActive, currentPath, className }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        className={`px-3 py-2 text-sm font-medium transition-all duration-200 relative group ${
          isActive ? 'text-indigo-600' : 'text-gray-900 hover:text-indigo-600'
        }`}
      >
        <span className="flex items-center">
          {title}
          <svg
            className={`ml-2 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
        {isActive && (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600" />
        )}
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute left-1/2 transform -translate-x-1/2 mt-3 ${className}`}
          >
            <div className="relative">
              {/* Arrow */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <div className="w-4 h-4 bg-white rotate-45 border-t border-l border-gray-200" />
              </div>
              
              {/* Dropdown Content */}
              <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="py-2">
                  {items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block px-6 py-3 text-sm transition-all duration-150 ${
                        currentPath === item.href
                          ? 'text-indigo-600 bg-indigo-50 font-medium'
                          : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                    >
                      <span className="relative">
                        {item.name}
                        {currentPath === item.href && (
                          <span className="absolute inset-y-0 left-0 -ml-4 w-1 bg-indigo-600 rounded-r-full" />
                        )}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 