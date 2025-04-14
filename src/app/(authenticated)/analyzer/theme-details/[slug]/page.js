'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ThemeDetails() {
	const [theme, setTheme] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { slug } = useParams();
	const router = useRouter();

	useEffect(() => {
		const fetchThemeDetails = async () => {
			try {
				setLoading(true);
				const response = await fetch(
					`/api/analyzer/theme-details?slug=${encodeURIComponent(slug)}`
				);
				const result = await response.json();
				console.log('API Response for theme details:', result);

				if (result.success) {
					setTheme(result.data);
				} else {
					setError(result.error || 'Failed to load theme details');
				}
			} catch (err) {
				setError('Failed to load theme details');
				console.error('Fetch error:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchThemeDetails();
	}, [slug]);

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-400 border-t-transparent"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-red-500 text-xl">{error}</div>
			</div>
		);
	}

	if (!theme) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-gray-500 text-xl">Theme not found</div>
			</div>
		);
	}

	return (
		<div className="bg-gray-50 min-h-screen p-4">
			<div className="max-full mx-auto py-6 px-8">
				<h1 className="text-2xl font-bold text-gray-800 mb-4">
					{theme.themeTitle}
				</h1>
				<div className="space-y-4">
					{theme.sectors?.length > 0 && (
						<div>
							<div className="flex flex-wrap gap-2 mt-2">
								{theme.sectors.map((sector) => (
									<span
										key={sector._id}
										className="py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
									>
										{sector.sectorName}
									</span>
								))}
							</div>
						</div>
					)}
					{theme.subSectors?.length > 0 && (
						<div>
							<div className="flex flex-wrap gap-2 mt-2">
								{theme.subSectors.map((subSector) => (
									<span
										key={subSector._id}
										className="py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
									>
										{subSector.subSectorName}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
				{theme.themeDescription && (
					<div
						className="text-gray-600 mb-2 mt-4 text-base"
						dangerouslySetInnerHTML={{ __html: theme.themeDescription }}
					></div>
				)}

				<div className="flex divide-x divide-black-500 bg-gray-50 rounded-lg text-sm">
					<div className="flex">
						<span className="text-gray-500 mr-2 text-base">
							Trending Pulse{' '}
							<span className="text-purple-600 font-bold text-base">
								{theme.trendingScore?.toFixed(2) || 'N/A'}
							</span>
						</span>
					</div>
					<div className="flex px-2">
						<span className="text-gray-500 mr-2 text-base">
							Disruption Potential{' '}
							<span className="text-purple-600 font-bold text-base">
								{theme.impactScore?.toFixed(2) || 'N/A'}
							</span>
						</span>
					</div>
					<div className="flex px-2">
						<span className="text-gray-500 mr-2 text-base">
							Predictive Momentum{' '}
							<span className="text-purple-600 font-bold text-base">
								{theme.predictiveMomentumScore?.toFixed(2) || 'N/A'}
							</span>
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
