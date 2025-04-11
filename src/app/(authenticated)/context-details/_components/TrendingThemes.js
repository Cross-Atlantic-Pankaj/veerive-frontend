'use client';

import React from 'react';
import Link from 'next/link';

const TrendingThemes = ({ trendingThemes }) => {
	return (
		<div className="bg-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm lg:mt-12 ">
			<div className="flex justify-between items-center mb-4">
				<h2 className="font-semibold text-lg text-gray-800">Trending Themes</h2>
				<Link
					href="/trend-analyzer"
					className="text-indigo-600 text-sm flex items-center hover:text-indigo-700"
				>
					VIEW More →
				</Link>
			</div>
			<div className="space-y-3">
				{trendingThemes?.length > 0 ? (
					trendingThemes.map((theme, index) => (
						<div
							key={index}
							className="border-b border-dashed border-gray-300 pb-3 last:border-0 last:pb-0"
						>
              <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full border-2 border-blue-500 text-blue-500 font-medium text-sm">
                      {theme.overallScore}
                      </div>
                      <div className="break-words">
                        <h3 className="font-medium text-gray-800 text-sm">{theme.themeTitle}</h3>
                      </div>
                    </div>
						</div>
					))
				) : (
					<p className="text-gray-600 text-sm">No trending themes available.</p>
				)}
			</div>
		</div>
	);
};

export default TrendingThemes;
