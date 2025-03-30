'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';

export default function PulseToday() {
	const [contexts, setContexts] = useState([]);
	const [sidebarMessage, setSidebarMessage] = useState(null);
	const [trendingThemes, setTrendingThemes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	// Intersection Observer setup
	const observerRef = useRef();
	const lastContextRef = useCallback(node => {
		if (loading) return;
		
		if (observerRef.current) {
			observerRef.current.disconnect();
		}

		observerRef.current = new IntersectionObserver(entries => {
			if (entries[0].isIntersecting && hasMore) {
				console.log('Loading more...', page + 1);
				setPage(prev => prev + 1);
			}
		}, {
			threshold: 0.5 // Trigger when 50% of the element is visible
		});

		if (node) {
			observerRef.current.observe(node);
		}
	}, [loading, hasMore, page]);

	// Fetch data
	const fetchData = async (pageNum) => {
		try {
			setLoading(true);
			const res = await fetch('/api/pulse-today', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ page: pageNum })
			});
			const data = await res.json();

			if (pageNum === 1) {
				setContexts(data.contexts);
			} else {
				setContexts(prev => [...prev, ...data.contexts]);
			}
			
			setHasMore(data.hasMore);
			setSidebarMessage(data.messages?.[0] || null);
			setTrendingThemes(data.trendingThemes || []);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData(page);
	}, [page]);

	// Maintain scroll position
	useEffect(() => {
		if (!loading) {
			const scrollPosition = window.scrollY;
			return () => {
				window.scrollTo(0, scrollPosition);
			};
		}
	}, [contexts, loading]);

	const formatSummary = (summary) => {
		if (!summary) return null;
		const cleaned = summary
			.replace(/<[^>]*>/g, '')
			.replace(/&nbsp;/g, ' ')
			.replace(/&amp;/g, '&')
			.trim();
		const points = cleaned.split('•').filter((s) => s.trim().length > 0);

		if (points.length <= 3) return points.map((point) => `• ${point.trim()}`);

		const groupedPoints = [];
		const groupSize = Math.ceil(points.length / (points.length > 4 ? 3 : 2));

		for (let i = 0; i < points.length; i += groupSize) {
			const group = points
				.slice(i, i + groupSize)
				.map((p) => p.trim())
				.join(' ');
			groupedPoints.push(`• ${group}`);
		}

		return groupedPoints;
	};

	if (error) return <div className="text-center text-red-500 py-10">Error: {error}</div>;

	return (
		<main className="px-6 py-6">
			<div className="flex flex-col lg:flex-row gap-6">
				<div className="w-full lg:w-[72%]">
					{/* First show Type-One items in grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
						{contexts
							.filter(ctx => ctx.containerType === 'Type-One')
							.map((ctx, idx) => (
								<div 
									key={idx}
									className="bg-white rounded-lg overflow-hidden"
								>
									{ctx.bannerImage ? (
										<img
											src={ctx.bannerImage}
											alt="banner"
											className="w-full h-[160px] object-cover"
										/>
									) : (
										<div className="w-full h-[160px] bg-gray-300 flex items-center justify-center text-gray-400 text-sm">
											1000 × 630
										</div>
									)}
									<div className="px-4 py-2">
										<div className="flex flex-wrap gap-2 mb-1">
											{[...ctx.sectors, ...ctx.subSectors].map(
												(name, idx) => (
													<span
														key={idx}
														className="text-xs text-green-600 relative inline-block font-medium"
													>
														{name}
														<span className="block h-[2px] bg-green-500 mt-0.5" />
													</span>
												)
											)}
										</div>
										<h3 className="text-sm font-semibold text-gray-900 leading-snug">
											{ctx.contextTitle}
										</h3>
									</div>
								</div>
							))}
					</div>

					{/* Then show other types */}
					{contexts
						.filter(ctx => ctx.containerType !== 'Type-One')
						.map((context, index, array) => {
							const isLastItem = index === array.length - 1;
							const sectorsLabel = [
								...context.sectors,
								...context.subSectors,
							].join(' • ');
							const summaryPoints = formatSummary(context.summary);

							switch (context.containerType) {
								case 'Type-Two':
									return (
										<div
											key={index}
											ref={isLastItem ? lastContextRef : null}
											className="mb-10"
										>
											<div className="text-red-600 text-xs font-bold mb-1">
												EXCLUSIVE
											</div>
											<h2 className="text-xl font-bold mb-2">
												{context.contextTitle}
											</h2>
											<ul className="list-disc list-inside text-sm text-gray-800 mb-3">
												{summaryPoints?.map((point, i) => (
													<li key={i}>{point}</li>
												))}
											</ul>
											<div className="grid grid-cols-2 gap-4 text-sm font-semibold text-blue-800">
												{context.posts?.slice(0, 2).map((post, i) => (
													<div key={i}>{post.postTitle}</div>
												))}
											</div>
										</div>
									);

								case 'Type-Three':
									return (
										<div
											key={index}
											ref={isLastItem ? lastContextRef : null}
											className="mb-10"
										>
											<div className="text-red-600 text-xs font-bold mb-1">
												EXCLUSIVE
											</div>
											<h2 className="text-xl font-bold mb-1">
												{context.contextTitle}
											</h2>
											<div className="text-xs text-gray-500 mb-2">
												{sectorsLabel}
											</div>
											<ul className="list-disc list-inside text-sm text-gray-800 mb-3">
												{summaryPoints?.map((point, i) => (
													<li key={i}>{point}</li>
												))}
											</ul>
											<div className="grid grid-cols-2 gap-4 text-sm font-semibold text-blue-800">
												{context.posts?.slice(0, 2).map((post, i) => (
													<div key={i}>{post.postTitle}</div>
												))}
											</div>
										</div>
									);

								// ... other cases remain same ...
							}
						})}

					{/* Loading indicator */}
					{loading && (
						<div className="text-center py-4">
							<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
						</div>
					)}

					{/* Sentinel element for intersection observer */}
					<div ref={lastContextRef} style={{ height: '10px' }} />
				</div>

				{/* Right: Sidebar */}
				<div className="w-full lg:w-[28%]">
					{sidebarMessage && (
						<div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-6">
							<div className="flex items-center gap-2 mb-2">
								<span className="text-green-500">✦</span>
								<span className="font-semibold">{sidebarMessage.title}</span>
							</div>
							<p className="text-gray-700 text-sm">{sidebarMessage.content}</p>
						</div>
					)}

					<div className="bg-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm">
						<div className="flex justify-between items-center mb-4">
							<h2 className="font-semibold text-lg text-gray-800">
								Trending Themes
							</h2>
							<Link
								href="/trend-analyzer"
								className="text-indigo-600 text-sm hover:underline"
							>
								VIEW ALL →
							</Link>
						</div>
						<div className="space-y-3">
							{trendingThemes.map((theme) => (
								<div
									key={theme.id}
									className="border-b border-dashed border-black pb-3 last:border-0"
								>
									<div className="flex items-start gap-3">
										<div className="flex-shrink-0 w-7 h-7 rounded-full border-2 border-blue-500 text-blue-500 font-medium text-sm flex items-center justify-center">
											{theme.score.toFixed(1)}
										</div>
										<div>
											<h3 className="font-bold text-sm text-gray-800">
												{theme.title}
											</h3>
											<p className="text-xs text-gray-500 mt-1">
												{theme.sectors.join(' • ')}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
