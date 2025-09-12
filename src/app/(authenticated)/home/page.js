'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import ContextImage from '../../../components/ContextImage';
import { parseJsxCode } from '../../utils/Tile';

const normalizeTitle = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\$/g, 'dollar')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default function HomePage() {
  const [contexts, setContexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [trendingOpinions, setTrendingOpinions] = useState([]);
  const [marketStatistics, setMarketStatistics] = useState([]);
  const [trendingThemes, setTrendingThemes] = useState([]);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/home');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setContexts(data.trendingEvents || []);
        setTrendingOpinions(data.trendingOpinions || []);
        setMarketStatistics(data.marketStatistics || []);
        setTrendingThemes(data.trendingThemes || []);
        setSlides([
          data.slides?.slide1,
          data.slides?.slide2,
          data.slides?.slide3,
          data.slides?.slide4,
        ]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(contexts.length / ITEMS_PER_PAGE);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleSubscribe = () => {
    router.push('/signup');
  };

  if (loading) {
    return (
      <div className="w-full py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-8">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-full">
        <div className="w-full bg-[#5F32D6] min-h-[500px] flex items-center">
          <div className="w-full max-w-[1200px] mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex flex-col max-[530px]:flex-col min-[531px]:flex-row items-center min-[531px]:items-start py-8 max-[530px]:py-6 min-[531px]:py-12">
              <div className="w-full min-[531px]:w-2/5 min-[531px]:pr-4 text-center min-[531px]:text-left">
                <h1 className="text-white block text-[24px] sm:text-[32px] md:text-[40px] lg:text-[50px] font-bold leading-tight">
                  Democratizing fintech intelligence
                </h1>
                <p className="mt-3 max-[530px]:mt-2 text-white/90 text-xs max-[530px]:text-xs sm:text-sm md:text-base lg:text-xl leading-relaxed max-w-[400px] mx-auto min-[531px]:mx-0">
                  One platform. Every fintech insight that matters.
                </p>
                <div className="mt-4 max-[530px]:mt-3 flex justify-center min-[531px]:justify-start">
                  <div className="flex w-full max-w-[350px] max-[530px]:max-w-[300px]">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      aria-label="Email address"
                      className="flex-1 px-3 max-[530px]:px-2 py-2 max-[530px]:py-1.5 rounded-l-full bg-white text-balck placeholder-black focus:outline-none text-xs max-[530px]:text-xs sm:text-sm"
                    />
                    <button className="px-4 max-[530px]:px-3 py-2 max-[530px]:py-1.5 bg-black text-white rounded-r-full font-medium text-xs max-[530px]:text-xs sm:text-sm whitespace-nowrap hover:bg-gray-800 transition-colors">
                      Join for free!
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-full min-[531px]:w-3/5 mt-6 max-[530px]:mt-4 min-[531px]:mt-0 flex justify-end">
                <div className="relative w-full max-w-[450px]">
                  {slides.length > 0 ? (
                    <div className="flex flex-col">
                      <div className="h-fit">
                        {slides.map((slide, index) => (
                          <div
                            key={index}
                            className={`transition-opacity duration-500 ${
                              currentSlide === index
                                ? 'opacity-100'
                                : 'opacity-0 hidden'
                            }`}
                          >
                            <div className="bg-white rounded-lg p-6 flex flex-col justify-between">
                              <div>
                                <p className="text-[#A084E8] text-sm uppercase font-semibold mb-2">
                                  Featured {slide.title.split('Featured ')[1]}
                                </p>
                                <h2 className="text-[#5F32D6] text-xl sm:text-xl lg:text-2xl font-bold leading-tight">
                                  {slide.themeTitle ||
                                    slide.contextTitle ||
                                    slide.postTitle ||
                                    'N/A'}
                                </h2>
                                <p
                                  className="text-black text-base sm:text-base mt-3 line-clamp-4"
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      slide.themeDescription ||
                                      slide.summary ||
                                      slide.postSummary,
                                  }}
                                />
                              </div>
                              <div className="flex justify-end mt-4">
                                <Link href={slide.redirectUrl}>
                                  <button className="bg-[#7A5AF8] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#E550A3] transition-colors">
                                    Read More
                                  </button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex space-x-2 mt-4 pl-6 z-10">
                        {slides.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => handleSlideChange(index)}
                            className={`w-8 h-1 rounded-full transition-opacity duration-300 ${
                              currentSlide === index
                                ? 'bg-[#A084E8] opacity-100'
                                : 'bg-[#E0D4FD] opacity-70 hover:opacity-90'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-200 rounded-lg h-[300px] flex items-center justify-center text-gray-500">
                      No slides available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Events Section */}
        <div className="w-full bg-white border-t border-gray-200">
          <div className="max-w-[1200px] mx-auto p-2 mt-6 md:mt-0 md:px-6 md:py-8">
            <div className="relative mb-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  TRENDING EVENTS
                </h2>
                <Link
                  href="/pulse-today"
                  className="flex items-center text-[15px] text-blue-600"
                >
                  VIEW ALL ›
                </Link>
              </div>
              <div className="absolute bottom-[-8px] left-0 w-full h-[1px] bg-gray-300"></div>
            </div>

            {contexts.length === 0 ? (
              <div className="text-gray-600 text-center py-12">
                No trending events found
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contexts
                    .slice(
                      currentPage * ITEMS_PER_PAGE,
                      (currentPage + 1) * ITEMS_PER_PAGE
                    )
                    .map((context) => {
                      const slug = context.contextTitle
                        ? normalizeTitle(context.contextTitle)
                        : `context-${context._id}`;
                      console.log(
                        `Generated slug for context "${context.contextTitle}": ${slug}`
                      );

                      // Parse tileTemplates.jsxCode if available
                      const tileTemplate =
                        context.tileTemplates?.length > 0
                          ? parseJsxCode(context.tileTemplates[0].jsxCode)
                          : null;

                      return (
                        <div
                          key={context._id}
                          className="flex flex-col"
                        >
                          <Link href={`/context-details/${slug}`}>
                            <div className="bg-gray-100 aspect-[1000/630] relative mb-4 w-full">
                              <ContextImage
                                context={context}
                                tileTemplate={tileTemplate}
                                className="w-full h-full"
                                fallbackText="1000 × 630"
                              />
                            </div>

                            {context.subSectors?.filter(
                              (subSector) => subSector.subSectorName
                            ).length > 0 && (
                              <div className="flex flex-wrap gap-x-2 gap-y-2 mb-3">
                                {context.subSectors
                                  .filter((subSector) => subSector.subSectorName)
                                  .slice(0, 3)
                                  .map((subSector, index) => (
                                    <div
                                      key={subSector._id}
                                      className="relative group inline-flex items-center"
                                    >
                                      {index > 0 && (
                                        <span className="mx-2 text-gray-400">
                                          |
                                        </span>
                                      )}
                                      <div className="relative">
                                        <span className="text-sm md:text-[15px] text-gray-600">
                                          {subSector.subSectorName}
                                        </span>
                                        <div className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-green-600"></div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}

                            <h3 className="text-base md:text-[17px] font-medium text-gray-900 leading-tight">
                              {context.contextTitle}
                            </h3>
                          </Link>
                        </div>
                      );
                    })}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 space-x-4">
                    <button
                      onClick={prevPage}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                      aria-label="Previous page"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextPage}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                      aria-label="Next page"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Trending Opinions and Market Statistics Section */}
        <div className="w-full bg-gray-50 py-4 sm:py-6 md:py-8">
          <div className="max-w-[1400px] mx-auto px-2 sm:px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              <div>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    TRENDING OPINIONS
                  </h2>
                  <Link
                    href="/influencer-comment/expert-opinion"
                    className="text-indigo-600 text-xs sm:text-sm flex items-center hover:text-indigo-700"
                  >
                    VIEW ALL →
                  </Link>
                </div>
                <div className="h-[1px] bg-gray-200 w-full mt-2 sm:mt-4 mb-3 sm:mb-6"></div>

                <div className="space-y-3 sm:space-y-4">
                  {trendingOpinions.map((post) => {
                    const tileTemplate = post.tileTemplateId
                      ? parseJsxCode(post.tileTemplateId.jsxCode)
                      : null;

                    return (
                      <a
                        key={post._id}
                        href={post.sourceUrl || post.sourceUrls[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col sm:flex-row gap-2 sm:gap-4 group"
                      >
                        <div className="w-full sm:w-[80px] md:w-[120px] h-[150px] sm:h-[50px] md:h-[75px] bg-gray-100 relative flex-shrink-0">
                          <ContextImage
                            post={post}
                            tileTemplate={tileTemplate}
                            className="w-full h-full"
                            fallbackText="1000 × 630"
                          />
                        </div>
                        <div className="flex-1 min-w-0 mt-2 sm:mt-0">
                          <h3 className="text-sm sm:text-base text-gray-900 group-hover:text-indigo-600 mb-1 sm:mb-2 line-clamp-2 font-medium">
                            {post.postTitle}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {new Date(post.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric',
                            })}
                            {post.source?.sourceName && (
                              <>
                                <span className="mx-1 sm:mx-2">|</span>
                                {post.source.sourceName}
                              </>
                            )}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    MARKET STATISTICS
                  </h2>
                  <Link
                    href="/influencer-comment/market-statistics"
                    className="text-indigo-600 text-xs sm:text-sm flex items-center hover:text-indigo-700"
                  >
                    VIEW ALL →
                  </Link>
                </div>
                <div className="h-[1px] bg-gray-200 w-full mt-2 sm:mt-4 mb-3 sm:mb-6"></div>

                <div className="space-y-3 sm:space-y-4">
                  {marketStatistics.map((post) => {
                    const tileTemplate = post.tileTemplateId
                      ? parseJsxCode(post.tileTemplateId.jsxCode)
                      : null;
                    return (
                      <a
                        key={post._id}
                        href={post.sourceUrl || post.sourceUrls[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col sm:flex-row gap-2 sm:gap-4 group"
                      >
                        <div className="w-full sm:w-[80px] md:w-[120px] h-[150px] sm:h-[50px] md:h-[75px] bg-gray-100 relative flex-shrink-0">
                          <ContextImage
                            post={post}
                            tileTemplate={tileTemplate}
                            className="w-full h-full"
                            fallbackText="1000 × 630"
                          />
                        </div>
                        <div className="flex-1 min-w-0 mt-2 sm:mt-0">
                          <h3 className="text-sm sm:text-base text-gray-900 group-hover:text-indigo-600 mb-1 sm:mb-2 line-clamp-2 font-medium">
                            {post.postTitle}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {new Date(post.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric',
                            })}
                            {post.source?.sourceName && (
                              <>
                                <span className="mx-1 sm:mx-2">| </span>
                                {post.source.sourceName}
                              </>
                            )}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HOT Trends Section */}
        <div className="w-full bg-white py-8">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <div className="relative pb-4 mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  HOT TRENDS
                </h2>
                <Link
                  href="/analyzer/trend-analyzer"
                  className="text-[#6366F1] text-sm"
                >
                  VIEW ALL →
                </Link>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-200"></div>
            </div>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="lg:w-[40%]">
                {trendingThemes?.[0] && (
                  <Link
                    href={`/analyzer/theme-details/${normalizeTitle(
                      trendingThemes[0].themeTitle
                    )}`}
                    className="block"
                  >
                    <div className="bg-gray-100 h-[320px] relative w-full">
                      <ContextImage
                        theme={trendingThemes[0]}
                        tileTemplate={trendingThemes[0].tileTemplateId ? parseJsxCode(trendingThemes[0].tileTemplateId.jsxCode) : null}
                        className="w-full h-full"
                        fallbackText="1000 × 630"
                      />
                    </div>
                    <div className="mt-3">
                      <div className="text-sm mb-2">
                        {trendingThemes[0].subSectors
                          ?.slice(0, 3)
                          .map((subSector, index) => (
                            <React.Fragment key={subSector._id}>
                              <span className="text-[#6366F1] relative inline-block">
                                {subSector.subSectorName}
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"></span>
                              </span>
                              {index <
                                trendingThemes[0].subSectors.length - 1 && (
                                <span className="text-gray-400 mx-1">|</span>
                              )}
                            </React.Fragment>
                          ))}
                      </div>
                      <h3 className="text-base font-medium mb-2">
                        {trendingThemes[0].themeTitle}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {trendingThemes[0].themeDescription?.replace(
                          /<[^>]*>/g,
                          ''
                        )}
                      </p>
                      <button className="text-white bg-[#6366F1] px-4 py-2 rounded text-sm hidden md:block hover:bg-[#5457E5] transition-colors">
                        Continue reading
                      </button>
                    </div>
                  </Link>
                )}
              </div>
              <div className="lg:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingThemes?.slice(1, 5).map((theme) => (
                  <Link
                    key={theme._id}
                    href={`/analyzer/theme-details/${normalizeTitle(
                      theme.themeTitle
                    )}`}
                    className="block"
                  >
                    <div className="bg-gray-100 h-[150px] relative w-full">
                      <ContextImage
                        theme={theme}
                        tileTemplate={theme.tileTemplateId ? parseJsxCode(theme.tileTemplateId.jsxCode) : null}
                        className="w-full h-full"
                        fallbackText="1000 × 630"
                      />
                    </div>
                    <div className="mt-3">
                      <div className="text-sm mb-2">
                        {theme.subSectors
                          ?.slice(0, 3)
                          .map((subSector, index) => (
                            <React.Fragment key={subSector._id}>
                              <span className="text-[#6366F1] relative inline-block">
                                {subSector.subSectorName}
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"></span>
                              </span>
                              {index < theme.subSectors.length - 1 && (
                                <span className="text-gray-400 mx-1">| </span>
                              )}
                            </React.Fragment>
                          ))}
                      </div>
                      <h3 className="text-base font-medium">
                        {theme.themeTitle}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Email Subscription Section */}
        <div className="w-full bg-[#6366F1] py-10">
          <div className="max-w-[990px] mx-auto px-4">
            <div className="text-center">
              <div className="text-white/90 text-base font-medium mb-1">
                Get Started
              </div>
              <h2 className="text-white text-3xl sm:text-4xl font-medium mb-6">
                Enter your e-mail address
                <br />
                and get started for free
              </h2>
              <div className="relative max-w-[600px] mx-auto">
                <input
                  type="email"
                  placeholder="Your Email address"
                  className="w-full px-5 h-14 rounded-full text-base border-2 border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all pr-[140px]"
                />
                <button
                  onClick={handleSubscribe}
                  className="absolute right-1 top-1 bg-black text-white px-8 h-12 rounded-full text-base hover:bg-gray-900 transition-colors font-medium"
                >
                  Subscribe
                </button>
              </div>
              <div className="text-white/80 text-sm mt-3">
                (We will never share your email with anyone, anywhere. Promise.)
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}