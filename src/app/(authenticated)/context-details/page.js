'use client';

import React, { useEffect, useState, useRef } from 'react';
import {useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export default function ContextDetails() {
	const searchParams = useSearchParams();
	const contextId = searchParams.get('id');

	const [context, setContext] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [currentSlide, setCurrentSlide] = useState(0);
	const [searchQuery, setSearchQuery] = useState('');

	const sliderRef = useRef(null);

	useEffect(() => {
		if (!contextId) {
			setError('No context ID provided');
			setLoading(false);
			return;
		}

		const fetchContextDetails = async () => {
			try {
				setLoading(true);
				const response = await fetch('/api/context-details', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ contextId }),
				});

				if (!response.ok) {
					throw new Error('Failed to fetch context details');
				}

				const data = await response.json();
				setContext(data.context);
			} catch (err) {
				console.error('Error fetching context details:', err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchContextDetails();
	}, [contextId]);

	const formatSummary = (summary) => {
		if (!summary) return ['Summary will be available soon'];
		const paragraphs = summary.split('</p>').filter((p) => p.trim().length > 0);
		const formattedPoints = [];
		paragraphs.forEach((paragraph) => {
			const cleaned = paragraph
				.replace(/<[^>]*>/g, '')
				.replace(/&/g, '&')
				.trim();
			if (cleaned.length > 0) {
				const pointText = cleaned.startsWith('•')
					? cleaned.slice(1).trim()
					: cleaned;
				formattedPoints.push(`• ${pointText}`);
			}
		});
		return formattedPoints.length > 0
			? formattedPoints
			: ['Summary will be available soon'];
	};

	const nextSlide = () => {
		if (!context || !context.slides || !context.slides.length) return;
		setCurrentSlide((prev) =>
			prev === context.slides.length - 1 ? 0 : prev + 1
		);
	};

	const prevSlide = () => {
		if (!context || !context.slides || !context.slides.length) return;
		setCurrentSlide((prev) =>
			prev === 0 ? context.slides.length - 1 : prev - 1
		);
	};

	const handleSearch = (e) => {
		e.preventDefault();
		console.log('Searching for:', searchQuery);
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col justify-center items-center min-h-screen">
				<h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
				<p className="text-gray-800">{error}</p>
			</div>
		);
	}

	if (!context) {
		return (
			<div className="flex flex-col justify-center items-center min-h-screen">
				<h1 className="text-2xl font-bold text-gray-800 mb-4">
					Context Not Found
				</h1>
				<p className="text-gray-600">
					The requested context could not be found.
				</p>
			</div>
		);
	}

	const summaryPoints = formatSummary(context.summary);

	return (
		<div className="min-h-screen bg-white py-4">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="bg-[#f0f0f0] py-4 flex justify-center mb-4">
					<form
						onSubmit={handleSearch}
						className="flex w-1/2"
					>
						<input
							type="text"
							className="flex-grow px-2 py-3 text-sm text-gray-800 bg-white border border-gray-300 rounded-l-md focus:outline-none"
							placeholder="Search here..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						<button
							type="submit"
							className="bg-[#5d4be6] w-10 flex items-center justify-center rounded-r-md"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4 text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</button>
					</form>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6">
					<h1 className="text-2xl font-bold text-gray-900 mb-4 ml-2">
						{context.contextTitle}
					</h1>

					{context.theme && (
						<div className="bg-[#f1f8ff] p-3 mb-2 flex items-center justify-between flex-wrap gap-4">
							<span className="text-base text-[#174c77] font-medium">
								Theme: {context.theme.themeTitle}
							</span>

							<div className="flex gap-4 flex-wrap">
								<div className="flex items-center bg-[#f1f8ff] border border-[#174c77] rounded px-2 py-1 gap-2">
									<div className="text-sm text-[#174c77] leading-tight text-center">
										Disruption Potential
									</div>
									<div className="bg-[#f76c3c] text-white font-bold w-8 h-8 flex items-center justify-center rounded">
										{context.theme.overallScore}
									</div>
								</div>

								<div className="flex items-center bg-[#f1f8ff] border border-[#174c77] rounded px-2 py-1 gap-2">
									<div className="text-sm text-[#174c77] leading-tight text-center">
										Predictive Momentym
									</div>
									<div className="bg-[#f76c3c] text-white font-bold w-8 h-8 flex items-center justify-center rounded">
										{context.theme.predictiveMomentumScore}
									</div>
								</div>

								<div className="flex items-center bg-[#f1f8ff] border border-[#174c77] rounded px-2 py-1 gap-2">
									<div className="text-sm text-[#174c77] leading-tight text-center">
										Trending Pulse
									</div>
									<div className="bg-[#f76c3c] text-white font-semibold w-8 h-8 flex items-center justify-center rounded">
										{context.theme.trendingScore}
									</div>
								</div>
							</div>
						</div>
					)}

					<div className="mb-6 ml-2">
						<h2 className="text-lg font-bold text-gray-800 mb-2">Summary:</h2>
						<div className="text-gray-700">
							{summaryPoints.map((point, idx) => (
								<p
									key={idx}
									className="mb-2"
								>
									{point}
								</p>
							))}
						</div>
					</div>

					{context.hasSlider && context.slides && context.slides.length > 0 && (
						<div
							className="relative mt-8 mb-6 bg-slate-700 text-white rounded-lg overflow-hidden"
							ref={sliderRef}
						>
							<div className="h-[300px] relative">
								<div className="p-6 h-full flex flex-col justify-center">
									<h3 className="text-xl font-bold mb-4">
										{context.slides[currentSlide].themeTitle}
									</h3>
									<p className="text-gray-100">
										{context.slides[currentSlide].description}
									</p>
								</div>

								<button
									onClick={prevSlide}
									className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 19l-7-7 7-7"
										/>
									</svg>
								</button>

								<button
									onClick={nextSlide}
									className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</button>

								<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
									{context.slides.map((_, idx) => (
										<button
											key={idx}
											onClick={() => setCurrentSlide(idx)}
											className={`w-2 h-2 rounded-full ${
												currentSlide === idx ? 'bg-white' : 'bg-gray-400'
											}`}
										/>
									))}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
