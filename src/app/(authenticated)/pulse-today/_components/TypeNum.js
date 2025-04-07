import React from 'react';

const TypeNum = ({ context, isLastItem, lastContextCallback }) => {
  return (
    <div
      ref={isLastItem ? lastContextCallback : null}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 w-full"
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="w-full sm:w-1/3 flex items-center justify-center">
          <div className="text-3xl sm:text-4xl font-bold text-indigo-600 whitespace-nowrap">
            {context.dataForTypeNum}
          </div>
        </div>
        <div className="flex-1">
          {context.summary ? (
            <div className="text-gray-600 text-xs sm:text-sm">
              {context.summary
                .replace(/<[^>]*>/g, '')
                .replace(/ /g, ' ')
                .replace(/&/g, '&')
                .trim()}
            </div>
          ) : (
            <p className="text-gray-400 text-xs sm:text-sm italic">
              Summary will be available soon
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TypeNum; 