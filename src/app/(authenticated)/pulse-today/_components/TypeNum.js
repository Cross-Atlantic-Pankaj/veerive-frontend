import React from 'react';
import Link from 'next/link';

const TypeNum = ({ context, isLastItem, lastContextCallback, formatSummary  }) => {
  const summaryPoints = formatSummary(context.summary);
  return (
    <Link href={`/context-details?id=${context.id}`}>
      <div
        ref={isLastItem ? lastContextCallback : null}
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 w-full cursor-pointer"
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="w-full sm:w-1/3 flex items-center justify-center">
            <div className="text-3xl sm:text-4xl font-bold text-indigo-600 whitespace-nowrap">
              {context.dataForTypeNum}
            </div>
          </div>
          <div className="flex-1">
          {summaryPoints.length > 0 ? (
                summaryPoints.map((point, i) => (
                  <div
                    key={i}
                    className="text-gray-800 font-semibold text-xs sm:text-sm mb-1"
                  >
                    {point}
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-xs sm:text-sm italic line-clamp-1">
                  Summary will be available soon
                </div>
              )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TypeNum; 