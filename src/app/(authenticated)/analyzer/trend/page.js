'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function TrendAnalyzer() {
	const [themes, setThemes] = useState([]);
	const [allThemes, setAllThemes] = useState([]);
	const [sectors, setSectors] = useState([]);
	const [selectedFilter, setSelectedFilter] = useState(''); // Tracks sectorId or subSectorId
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const themesPerPage = 21;

	useEffect(() => {
		const fetchThemes = async () => {
			try {
				const response = await fetch('/api/analyzer/trend-analyzer');
				const result = await response.json();

				if (result.success) {
					setAllThemes(result.data);
					setThemes(result.data);
					setSectors(result.Sectordata || []);
				} else {
					setError(result.error || 'Failed to fetch themes');
				}
			} catch (err) {
				setError('Failed to fetch themes data');
				console.error('Error fetching themes:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchThemes();
	}, []);

	useEffect(() => {
		if (!allThemes.length) return;

		let filteredThemes = [...allThemes];

		if (selectedFilter) {
			const isSector = sectors.some(
				(sector) => sector.sectorId === selectedFilter
			);
			if (isSector) {
				filteredThemes = filteredThemes.filter((theme) =>
					theme.sectors.some((sector) => sector._id === selectedFilter)
				);
			} else {
				let parentSectorId = null;
				for (const sector of sectors) {
					if (
						sector.subsectors.some((sub) => sub.subSectorId === selectedFilter)
					) {
						parentSectorId = sector.sectorId;
						break;
					}
				}
				filteredThemes = filteredThemes.filter(
					(theme) =>
						theme.subSectors.some(
							(subsector) => subsector._id === selectedFilter
						) && theme.sectors.some((sector) => sector._id === parentSectorId)
				);
			}
		}

		setThemes(filteredThemes);
		setCurrentPage(1);
	}, [selectedFilter, allThemes, sectors]);

	const indexOfLastTheme = currentPage * themesPerPage;
	const indexOfFirstTheme = indexOfLastTheme - themesPerPage;
	const currentThemes = themes.slice(indexOfFirstTheme, indexOfLastTheme);
	const totalPages = Math.ceil(themes.length / themesPerPage);

	const handleFilterChange = (e) => {
		setSelectedFilter(e.target.value);
	};

	const clearFilters = () => {
		setSelectedFilter('');
	};

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

	return (
		<div className="py-8 bg-gray-50 min-h-screen px-12">
			<div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-100">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-bold text-gray-800">
						Get Trends of Your Choice
					</h2>
					{selectedFilter && (
						<button
							onClick={clearFilters}
							className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
							Clear Filters
						</button>
					)}
				</div>

				<div className="flex flex-wrap gap-6">
					<div className="flex-1 min-w-[250px]">
						<label
							htmlFor="filter"
							className="block text-base font-semibold text-gray-700 mb-2"
						>
							Sector / SubSector
						</label>
						<div className="relative">
							<select
								id="filter"
								value={selectedFilter}
								onChange={handleFilterChange}
								className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
							>
								<option value="">All Trends</option>
								{sectors.map((sector) => (
									<optgroup
										key={sector.sectorId}
										label={sector.sectorName}
									>
										<option value={sector.sectorId}>{sector.sectorName}</option>
										{sector.subsectors.map((subsector) => (
											<option
												key={subsector.subSectorId}
												value={subsector.subSectorId}
												className="pl-6"
											>
												-- {subsector.subSectorName}
											</option>
										))}
									</optgroup>
								))}
							</select>
							<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
								<svg
									className="h-5 w-5 text-gray-400"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>
			</div>

			{themes.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm">
					<h3 className="text-xl font-semibold text-gray-700 mb-2">
						No Trend available
					</h3>
					<p className="text-gray-500 text-center max-w-md">
						No themes match your current filter criteria. Try adjusting your
						filters or check back later.
					</p>
					<button
						onClick={clearFilters}
						className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Clear Filters
					</button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
					{currentThemes.map((theme, index) => (
						<div
							key={theme._id || index}
							className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
						>
							<div className="relative w-full h-[160px]">
								{theme.bannerImage ? (
									<Image
										src={theme.bannerImage}
										alt={theme.themeTitle}
										fill
										className="object-cover"
									/>
								) : (
									<div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
										1000 x 180
									</div>
								)}
							</div>

							<div className="p-5">
								<h2 className="text-lg font-bold text-gray-800 mb-4">
									{theme.themeTitle}
								</h2>

								<div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 rounded-lg overflow-hidden">
									<div className="p-3 text-center border-r border-white">
										<div className="text-sm font-medium text-gray-500 mb-1">
											Trending <br/>Pulse
										</div>
										<div className="text-base font-bold text-blue-600">
											{theme.trendingScore?.toFixed(2) || 'N/A'}
										</div>
									</div>

									<div className="p-3 text-center border-r border-white">
										<div className="text-sm font-medium text-gray-500 mb-1">
											Disruption Potential
										</div>
										<div className="text-base font-bold text-purple-600">
											{theme.impactScore?.toFixed(2) || 'N/A'}
										</div>
									</div>

									<div className="p-3 text-center">
										<div className="text-sm font-medium text-gray-500 mb-1">
											Predictive Momentum
										</div>
										<div className="text-base font-bold text-indigo-600">
											{theme.predictiveMomentumScore?.toFixed(2) || 'N/A'}
										</div>
									</div>
								</div>

								<div className="space-y-3">
									{theme.sectors?.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{theme.sectors.map((sector) => (
												<span
													key={sector._id}
													className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium inline-flex items-center"
												>
													{sector.sectorName}
												</span>
											))}
										</div>
									)}

									{theme.subSectors?.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{theme.subSectors.map((subSector) => (
												<span
													key={subSector._id}
													className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium inline-flex items-center"
												>
													{subSector.subSectorName}
												</span>
											))}
										</div>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{totalPages > 1 && (
				<div className="flex justify-center items-center gap-6 pb-8">
					<button
						onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
						disabled={currentPage === 1}
						className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 text-sm ${
							currentPage === 1
								? 'bg-gray-100 text-gray-400 cursor-not-allowed'
								: 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 shadow-sm'
						}`}
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						Previous
					</button>

					<button
						onClick={() =>
							setCurrentPage((prev) => Math.min(prev + 1, totalPages))
						}
						disabled={currentPage === totalPages}
						className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 text-sm ${
							currentPage === totalPages
								? 'bg-gray-100 text-gray-400 cursor-not-allowed'
								: 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 shadow-sm'
						}`}
					>
						Next
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>
			)}
		</div>
	);
}
