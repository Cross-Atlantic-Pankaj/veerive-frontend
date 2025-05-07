'use client';

import React from 'react';

const Footer = () => {
  const analyzerLinks = ["Sector Analyzer", "Company Analyzer", "Trend Analyzer"];
  const thinkTankLinks = [
    "Influencer Comment",
    "Reports",
    "Interviews",
    "Infographics & Statistics"
  ];
  const infoLinks = ["Privacy Policy", "Terms of Service", "Grievance Redressal"];

  const socialIcons = [
    {
      href: "https://facebook.com",
      icon: "M22 12a10 10 0 10-11.6 9.9v-7h-2v-2.9h2V9.2c0-2 1.2-3.1 3-3.1.9 0 1.8.2 1.8.2v2h-1c-1 0-1.3.6-1.3 1.2v1.4h2.3l-.4 2.9h-1.9v7A10 10 0 0022 12z"
    },
    {
      href: "https://x.com",
      icon: "M20.5 3h-3l-4.5 6-4-6H3l6.5 9-6.5 9h3l4.5-6 4 6h3l-6.5-9L20.5 3z"
    },
    {
      href: "https://linkedin.com",
      icon:
        "M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v16H0V8zm7.5 0h4.7v2.2h.1c.7-1.3 2.3-2.2 4.3-2.2 4.6 0 5.5 3 5.5 6.8V24h-5v-7.2c0-1.7 0-3.9-2.4-3.9-2.4 0-2.8 1.9-2.8 3.8V24h-5V8z"
    },
    {
      href: "https://youtube.com",
      icon: "M19.6 3H4.4C3 3 2 4 2 5.4v13.2C2 20 3 21 4.4 21h15.2c1.4 0 2.4-1 2.4-2.4V5.4C22 4 21 3 19.6 3zM10 16V8l6 4-6 4z"
    }
  ];

  return (
    <footer className="bg-black text-white px-6 md:px-10 lg:px-16 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          <div>
            <h3 className="text-cyan-400 font-semibold mb-4">Insights</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <a href='/pulse-today' className="hover:underline">Pulse Today</a>
            </ul>
            <ul className="space-y-2 text-sm text-gray-300 mt-2">
              <a href='/analyzer/trend' className="hover:underline">Trend Analyzer</a>
            </ul>
          </div>

          <div>
            <h3 className="text-cyan-400 font-semibold mb-4">THINK TANK</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {thinkTankLinks.map((item, i) => (
                <li key={`think-${i}`}>
                  <a
                    href="/influencer-comment"
                    className="hover:underline"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-cyan-400 font-semibold mb-4">OUR INFORMATION</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {infoLinks.map((item, i) => (
                <li key={`info-${i}`}>
                  <a href={`/${item.toLowerCase().replace(/ /g, "-")}`} className="hover:underline">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 sm:col-span-2 col-span-1">
            <div>
              <h3 className="text-cyan-400 font-semibold mb-2">SOCIAL STREAM</h3>
              <div className="flex gap-4 flex-wrap sm:justify-start justify-center">
                {socialIcons.map((item, i) => (
                  <a key={`icon-${i}`} href={item.href} target="_blank" rel="noreferrer"
                    className="bg-[#1e1e1e] p-3 rounded-full hover:bg-gray-700">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d={item.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mt-12 border-t border-gray-700 pt-6">
          © Copyright 2025 Veerive, All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;