// container-details/_components/SectorSubSectorCard.jsx
import React from 'react';

const SectorSubSectorCard = ({ item, type }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {/* Placeholder (1000x600 text) */}
      <div className="relative w-full h-[200px]">
        <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg">
          <span className="text-gray-500 text-sm font-medium">1000*600</span>
        </div>
      </div>

      {/* Sector/SubSector Name with Green Underline */}
      <div className="p-4">
        <span className="text-sm font-semibold text-black border-b-2 border-green-500 inline-block">
          {type === 'sector' ? item.sectorName : item.subSectorName}
        </span>
      </div>
    </div>
  );
};

export default SectorSubSectorCard;