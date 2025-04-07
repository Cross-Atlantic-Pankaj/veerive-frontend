import React from 'react';

const TypeOne = ({ context, isLastItem, lastContextCallback }) => {
  return (
    <div
      key={context.id}
      ref={isLastItem ? lastContextCallback : null}
      className="bg-white rounded-lg overflow-hidden w-full"
    >
      {context.bannerImage ? (
        <img
          src={context.bannerImage}
          alt="banner"
          className="w-full h-[120px] sm:h-[140px] md:h-[160px] object-cover"
        />
      ) : (
        <div className="w-full h-[120px] sm:h-[140px] md:h-[160px] bg-gray-300 flex items-center justify-center text-gray-400 text-xs sm:text-sm">
          1000 × 630
        </div>
      )}
      <div className="px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-1">
          {[...context.sectors, ...context.subSectors].map((name, idx) => (
            <span
              key={idx}
              className="text-[10px] sm:text-xs text-black-600 relative inline-block font-medium border-b-2 border-green-500"
            >
              {name}
            </span>
          ))}
        </div>
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
          {context.contextTitle}
        </h3>
      </div>
    </div>
  );
};

export default TypeOne; 