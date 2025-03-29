import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaHome, FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  const pathname = usePathname();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const isActive = (href) => pathname === href;

  return (
    <footer className="bg-gray-100 border-t-4 border-[#4A00E0] shadow-sm">
      <div className="flex justify-start px-6 py-4 md:px-12">
        <div
          onClick={scrollToTop}
          className="cursor-pointer text-[#4A00E0] text-2xl hover:text-[#8B00FF] hover:scale-110 transition-all duration-300"
        >
          <FaHome />
        </div>
      </div>

      <div className="flex flex-wrap justify-between px-6 py-10 md:px-12 gap-8 max-w-7xl mx-auto">
        <div className="flex-1 min-w-[250px]">
          <img
            src="/assets/veerive_logo.svg"
            alt="Veerive Logo"
            className="h-12 mb-4"
          />
          <p className="text-sm text-gray-600 leading-relaxed">
            Veerive helps you get deeper understanding of fintech market dynamics, opportunities, and risks for strategic decision making
          </p>
        </div>

        <div className="flex-1 min-w-[180px]">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Analyzer</h3>
          <ul className="text-sm text-gray-600 space-y-3">
            <li>
              <Link
                href="/sector-analyzer"
                className={`block transition-colors duration-200 hover:text-[#4A00E0] hover:underline ${
                  isActive('/sector-analyzer')
                    ? 'text-[#4A00E0] font-semibold underline'
                    : ''
                }`}
              >
                Sector Analyzer
              </Link>
            </li>
            <li>
              <Link
                href="/company-analyzer"
                className={`block transition-colors duration-200 hover:text-[#4A00E0] hover:underline ${
                  isActive('/company-analyzer')
                    ? 'text-[#4A00E0] font-semibold underline'
                    : ''
                }`}
              >
                Company Analyzer
              </Link>
            </li>
            <li>
              <Link
                href="/trend-analyzer"
                className={`block transition-colors duration-200 hover:text-[#4A00E0] hover:underline ${
                  isActive('/trend-analyzer')
                    ? 'text-[#4A00E0] font-semibold underline'
                    : ''
                }`}
              >
                Trend Analyzer
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex-1 min-w-[180px]">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Think Tank</h3>
          <ul className="text-sm text-gray-600 space-y-3">
            <li>
              <Link
                href="/influencer-comment"
                className={`block transition-colors duration-200 hover:text-[#4A00E0] hover:underline ${
                  isActive('/influencer-comment')
                    ? 'text-[#4A00E0] font-semibold underline'
                    : ''
                }`}
              >
                Influencer Comment
              </Link>
            </li>
            <li>
              <Link
                href="/reports"
                className={`block transition-colors duration-200 hover:text-[#4A00E0] hover:underline ${
                  isActive('/reports')
                    ? 'text-[#4A00E0] font-semibold underline'
                    : ''
                }`}
              >
                Reports
              </Link>
            </li>
            <li>
              <Link
                href="/interviews"
                className={`block transition-colors duration-200 hover:text-[#4A00E0] hover:underline ${
                  isActive('/interviews')
                    ? 'text-[#4A00E0] font-semibold underline'
                    : ''
                }`}
              >
                Interviews
              </Link>
            </li>
            <li>
              <Link
                href="/infographics-statistics"
                className={`block transition-colors duration-200 hover:text-[#4A00E0] hover:underline ${
                  isActive('/infographics-statistics')
                    ? 'text-[#4A00E0] font-semibold underline'
                    : ''
                }`}
              >
                Infographics & Statistics
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex-1 min-w-[180px]">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Our Information</h3>
          <ul className="text-sm text-gray-600 space-y-3">
            <li>
              <Link
                href="/privacy-policy"
                className={`block transition-colors duration-200 hover:text-[#4A00E0] hover:underline ${
                  isActive('/privacy-policy')
                    ? 'text-[#4A00E0] font-semibold underline'
                    : ''
                }`}
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms-of-service"
                className={`block transition-colors duration-200 hover:text-[#4A00E0] hover:underline ${
                  isActive('/terms-of-service')
                    ? 'text-[#4A00E0] font-semibold underline'
                    : ''
                }`}
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                href="/grievance-redressal"
                className={`block transition-colors duration-200 hover:text-[#4A00E0] hover:underline ${
                  isActive('/grievance-redressal')
                    ? 'text-[#4A00E0] font-semibold underline'
                    : ''
                }`}
              >
                Grievance Redressal
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Icons */}
        <div className="flex-1 min-w-[100px] flex justify-center md:justify-start">
          <div className="flex flex-col items-center md:items-start">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 text-xl mb-4 hover:text-[#4A00E0] hover:scale-110 transition-all duration-200"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 text-xl mb-4 hover:text-[#4A00E0] hover:scale-110 transition-all duration-200"
            >
              <FaTwitter />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 text-xl mb-4 hover:text-[#4A00E0] hover:scale-110 transition-all duration-200"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 max-w-7xl mx-auto" />

      <div className="bg-[#1A2526] text-white text-center py-4 text-xs">
        <p>© 2023 Veerive, All Rights Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;