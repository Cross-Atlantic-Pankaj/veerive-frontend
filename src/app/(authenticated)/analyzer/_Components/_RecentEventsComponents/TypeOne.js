import Link from 'next/link';
import slugify from 'slugify';

const TypeOne = ({ context }) => {
  const slug = context.contextTitle
    ? slugify(context.contextTitle, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      })
    : `context-${context._id}`;
  const fullSlug = `${slug}-${context._id}`;

  return (
    <Link href={`/context-details/${fullSlug}`}>
      <div className="bg-white rounded-lg overflow-hidden w-full cursor-pointer hover:shadow-md transition-all duration-200">
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
            {[...(context.sectors || []), ...(context.subSectors || [])].slice(0,3).map((item, idx) => (
              <span
                key={idx}
                className="text-[10px] sm:text-xs text-black-600 relative inline-block font-medium border-b-2 border-green-500"
              >
                {item.sectorName || item.subSectorName}
              </span>
            ))}
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
            {context.contextTitle}
          </h3>
        </div>
      </div>
    </Link>
  );
};

export default TypeOne;