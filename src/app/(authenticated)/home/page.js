'use client';

import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="w-full bg-[#6366F1] min-h-[500px] flex items-center">
      <div className="w-full max-w-[990px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col max-[530px]:flex-col min-[531px]:flex-row items-center min-[531px]:items-start py-8 max-[530px]:py-6 min-[531px]:py-12">
          <div className="w-full min-[531px]:w-1/2 min-[531px]:pr-8 text-center min-[531px]:text-left">
            <h1 className="text-white">
              <span className="block text-[24px] max-[530px]:text-[24px] sm:text-[32px] md:text-[40px] lg:text-[56px] font-bold leading-tight">
                Decode global
              </span>
              <span className="block text-[24px] max-[530px]:text-[24px] sm:text-[32px] md:text-[40px] lg:text-[56px] font-bold leading-tight">
                fintech market
              </span>
              <span className="block text-[24px] max-[530px]:text-[24px] sm:text-[32px] md:text-[40px] lg:text-[56px] font-bold leading-tight">
                dynamics
              </span>
            </h1>

            <p className="mt-3 max-[530px]:mt-2 text-white/90 text-xs max-[530px]:text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-[400px] mx-auto min-[531px]:mx-0">
              Join Veerive for free and get deeper understanding of most important fintech developments. Get rid of noise to accurately assess business opportunities and market risks.
            </p>

            <div className="mt-4 max-[530px]:mt-3 flex justify-center min-[531px]:justify-start">
              <div className="flex w-full max-w-[350px] max-[530px]:max-w-[300px]">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  aria-label="Email address"
                  className="flex-1 px-3 max-[530px]:px-2 py-2 max-[530px]:py-1.5 rounded-l-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none text-xs max-[530px]:text-xs sm:text-sm"
                />
                <button
                  className="px-4 max-[530px]:px-3 py-2 max-[530px]:py-1.5 bg-black text-white rounded-r-full font-medium text-xs max-[530px]:text-xs sm:text-sm whitespace-nowrap hover:bg-gray-800 transition-colors"
                >
                  Join for free!
                </button>
              </div>
            </div>
          </div>

          <div className="w-full min-[531px]:w-1/2 mt-6 max-[530px]:mt-4 min-[531px]:mt-0">
            <Image
              src="/assets/Home_Page_section_1.png"
              alt="Illustration of fintech analytics with news, events, analyzer, and insights"
              width={500}
              height={500}
              className="w-full h-auto max-w-[300px] max-[530px]:max-w-[300px] sm:max-w-[350px] lg:max-w-[450px] mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}