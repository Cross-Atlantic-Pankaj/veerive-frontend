import React from 'react';
import Link from 'next/link';

const TypeFour = ({
	context,
	isLastItem,
	lastContextCallback,
	formatSummary,
}) => {
	const sectorsLabel = [...context.sectors, ...context.subSectors].join(' • ');
	const formatedsummaryPoints = formatSummary(context.summary);
	const summaryPoints = formatedsummaryPoints.slice(0, 3);

	return (
		<Link href={`/context-details?id=${context.id}`}>
			<div
				ref={isLastItem ? lastContextCallback : null}
				className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 w-full cursor-pointer"
			>
				<div className="flex flex-col sm:flex-row gap-4 mb-4">
					<div className="w-full sm:w-1/3">
						{context.bannerImage ? (
							<img
								src={context.bannerImage}
								alt="Banner"
								className="w-full h-16 sm:h-20 md:h-24 lg:h-28 object-cover rounded-lg"
							/>
						) : (
							<div className="w-full h-16 sm:h-20 md:h-24 lg:h-28 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs sm:text-sm">
								1000 × 630
							</div>
						)}
					</div>
					<div className="flex-1 flex flex-col">
						<div className="text-red-600 text-[10px] sm:text-xs font-semibold mb-1">
							{sectorsLabel}
						</div>
						<h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
							{context.contextTitle}
						</h2>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 mb-1">
					<div className="flex-1">
						<div className="mb-4">
							{summaryPoints.length > 0 ? (
								summaryPoints.map((point, i) => (
									<div
										key={i}
										className="text-gray-600 text-xs sm:text-sm line-clamp-1 mb-1"
									>
										{point}
									</div>
								))
							) : (
								<div className="text-gray-400 text-xs sm:text-sm italic line-clamp-1">
									Summary coming soon...
								</div>
							)}
						</div>
					</div>
					<div className="w-full sm:w-1/3">
						{context.posts?.[0] && (
							<div className="font-semibold text-gray-800 text-sm lg:px-3">
								{context.posts[0].postTitle}
							</div>
						)}
					</div>
				</div>

				<div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-300 gap-2">
					{context.posts?.slice(1, 4).map((post, i) => (
						<div
							key={i}
							className="flex-1 px-2"
						>
							<div className="font-semibold text-gray-800 text-sm">
								{post.postTitle}
							</div>
						</div>
					))}
				</div>
			</div>
		</Link>
	);
};

export default TypeFour;
