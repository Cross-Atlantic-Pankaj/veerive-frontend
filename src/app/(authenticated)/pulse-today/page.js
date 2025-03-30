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
			threshold: 0.5
		});

		if (node) {
			observerRef.current.observe(node);
		}
	}, [loading, hasMore, page]);

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
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto gap-4">
						{contexts.map((context, index, array) => {
							const isLastItem = index === array.length - 1;
							const sectorsLabel = [...context.sectors, ...context.subSectors].join(' • ');
							const summaryPoints = formatSummary(context.summary);

							switch (context.containerType) {
								case 'Type-One':
									return (
										<div 
											key={index}
											ref={isLastItem ? lastContextRef : null}
											className="bg-white rounded-lg overflow-hidden col-span-1"
										>
											{context.bannerImage ? (
												<img
													src={context.bannerImage}
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
													{[...context.sectors, ...context.subSectors].map(
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
													{context.contextTitle}
												</h3>
											</div>
										</div>
									);

								case 'Type-Two':
									return (
										<div 
											key={index}
											ref={isLastItem ? lastContextRef : null}
											className="bg-white rounded-lg p-6 col-span-1"
										>
											<div className="text-red-600 text-xs font-bold mb-2">{sectorsLabel}</div>
											<h2 className="text-xl font-bold mb-3">{context.contextTitle}</h2>
											<div className="mb-4">
												{summaryPoints?.map((point, i) => (
													<div key={i} className="mb-2 text-gray-700">• {point}</div>
												))}
											</div>
											<div className="flex flex-wrap gap-4">
												{context.posts?.map((post, i) => (
													<div key={i} className="text-black-600">{post.postTitle}</div>
												))}
											</div>
										</div>
									);

								case 'Type-Num':
									return (
										<div 
											key={index}
											ref={isLastItem ? lastContextRef : null}
											className="bg-white p-6 rounded-lg shadow col-span-1"
										>
											<div className="flex items-center gap-4">
												<div className="text-4xl font-bold text-black-600 whitespace-nowrap">
													{context.dataForTypeNum || 'US$ XX Billion'}
												</div>
												<div className="flex-1">
													{summaryPoints?.length > 0 ? (
														<ul className="list-disc list-inside">
															{summaryPoints.map((point, i) => (
																<li key={i} className="text-gray-700">{point}</li>
															))}
														</ul>
													) : (
														<p className="text-gray-500">Summary will be soon</p>
													)}
												</div>
											</div>
										</div>
									);

								case 'Type-Three':
									return (
										<div 
											key={index}
											ref={isLastItem ? lastContextRef : null}
											className="bg-white rounded-lg p-6 col-span-2"
										>
											<div className="flex justify-between gap-8">
												<div className="flex-1">
													<div className="text-red-600 text-xs font-bold mb-2">{sectorsLabel}</div>
													<h2 className="text-xl font-bold mb-3">{context.contextTitle}</h2>
													<div className="mb-4">
														{summaryPoints?.map((point, i) => (
															<div key={i} className="mb-2 text-gray-700">• {point}</div>
														))}
													</div>
												</div>
												<div className="w-1/3">
													<div className="flex flex-col gap-3">
														{context.posts?.map((post, i) => (
															<div key={i} className="text-black-600">{post.postTitle}</div>
														))}
													</div>
												</div>
											</div>
										</div>
									);

								case 'Type-Four':
									return (
										<div 
											key={index}
											ref={isLastItem ? lastContextRef : null}
											className="bg-white rounded-lg p-6 shadow col-span-2"
										>
											<div className="text-red-600 text-xs font-bold mb-2">{sectorsLabel}</div>
											<h2 className="text-xl font-bold mb-3">{context.contextTitle}</h2>
											<div className="flex gap-8">
												<div className="flex-1">
													{summaryPoints?.map((point, i) => (
														<div key={i} className="mb-2 text-gray-700">• {point}</div>
													))}
												</div>
												<div className="w-1/3">
													{context.posts?.map((post, i) => (
														<div key={i} className="mb-3 text-black-600">{post.postTitle}</div>
													))}
												</div>
											</div>
										</div>
									);

								case 'Type-Five':
									return (
										<div 
											key={index}
											ref={isLastItem ? lastContextRef : null}
											className="bg-white rounded-lg p-6 col-span-2"
										>
											<h2 className="text-xl font-bold mb-4">{context.contextTitle}</h2>
											<div className="flex gap-8">
												<div className="w-1/3">
													{context.bannerImage ? (
														<img 
															src={context.bannerImage} 
															alt="" 
															className="w-full h-48 object-cover rounded"
														/>
													) : (
														<div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
															1000 × 630
														</div>
													)}
												</div>
												<div className="flex-1">
													<div className="mb-4">
														{context.posts?.map((post, i) => (
															<div key={i} className="mb-3 text-black-600">{post.postTitle}</div>
														))}
													</div>
													<div className="text-gray-700">
														{summaryPoints?.join(' ') || 'Summary will be soon'}
													</div>
												</div>
											</div>
										</div>
									);

								default:
									return null;
							}
						})}
					</div>

					{loading && (
						<div className="text-center py-4">
							<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
						</div>
					)}
				</div>

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
										<div className="flex-shrink-0 w-7 h-7 rounded-full border-2 border-black-500 text-black-500 font-medium text-sm flex items-center justify-center">
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
