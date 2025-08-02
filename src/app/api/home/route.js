import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Context from '@/models/Context';
import Post from '@/models/Post';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import Source from '@/models/Source';
import Theme from '@/models/Theme';
import tileTemplate from '@/models/TileTemplate';

export async function GET(request) {
	try {
		await connectDB();

		if (!mongoose.models.Sector) {
			mongoose.model('Sector', Sector.schema);
		}
		if (!mongoose.models.SubSector) {
			mongoose.model('SubSector', SubSector.schema);
		}
		if (!mongoose.models.Source) {
			mongoose.model('Source', Source.schema);
		}
		if (!mongoose.models.Theme) {
			mongoose.model('Theme', Theme.schema);
		}
		if (!mongoose.models.TileTemplate) {
			mongoose.model('TileTemplate', tileTemplate.schema);
		}

		const trendingEvents = await Context.find({ isTrending: true })
			.populate({
				path: 'sectors',
				model: 'Sector',
				select: 'sectorName',
			})
			.populate({
				path: 'subSectors',
				model: 'SubSector',
				select: 'subSectorName',
			})
			.populate({
				path: 'tileTemplates',
				model: 'TileTemplate',
				select: 'name type jsxCode',
				options: { strictPopulate: false },
			})
			.sort({ date: -1 });

		const trendingOpinions = await Post.find({
			postType: 'Expert Opinion',
			isTrending: true,
		})
			.populate({
				path: 'source',
				model: 'Source',
				select: 'sourceName',
			})
			.populate({
				path: 'tileTemplateId',
				model: 'TileTemplate',
				select: 'name type jsxCode',
				options: { strictPopulate: false },
			})
			.sort({ date: -1 })
			.limit(5);

		const marketStatistics = await Post.find({
			postType: 'Infographic',
			isTrending: true,
		})
			.populate({
				path: 'source',
				model: 'Source',
				select: 'sourceName',
			})
			.populate({
				path: 'tileTemplateId',
				model: 'TileTemplate',
				select: 'name type jsxCode',
				options: { strictPopulate: false },
			})
			.sort({ date: -1 })
			.limit(5);

		const trendingThemes = await Theme.find({})
			.populate({
				path: 'sectors',
				model: 'Sector',
				select: 'sectorName',
			})
			.populate({
				path: 'subSectors',
				model: 'SubSector',
				select: 'subSectorName',
			})
			
			.populate({
				path: 'tileTemplateId',
				model: 'TileTemplate',
				select: 'name type jsxCode',
				options: { strictPopulate: false },
			})
			.sort({ overallScore: -1 })
			.limit(5);

		const featuredTheme = await Theme.findOne({}).sort({ overallScore: -1 });

		const featuredEvent = await Context.findOne({ displayOrder: 1 }).sort({
			date: -1,
		});

		const featuredOpinion = await Post.findOne({
			postType: 'Expert Opinion',
			homePageShow: true,
		})
			.sort({ date: -1 })
			.populate({
				path: 'source',
				model: 'Source',
				select: 'sourceName',
			});

		const featuredInfographic = await Post.findOne({
			postType: 'Infographic',
			homePageShow: true,
		})
			.sort({ date: -1 })
			.populate({
				path: 'source',
				model: 'Source',
				select: 'sourceName',
			});

		const Trendurl = (text) => {
			return text
				.toString()
				.toLowerCase()
				.trim()
				.replace(/\s+/g, '-')
				.replace(/[^\w-]+/g, '')
				.replace(/--+/g, '-')
				.replace(/^-+|-+$/g, '');
		};

		const normalizeTitle = (text) => {
			return text
				.toString()
				.toLowerCase()
				.trim()
				.replace(/\$/g, 'dollar')
				.replace(/[^\w\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/--+/g, '-')
				.replace(/^-+|-+$/g, '');
		};

		const getPostRedirectUrl = (post) => {
			if (post && post.sourceUrl) {
				return post.sourceUrl;
			}
			if (
				post &&
				Array.isArray(post.sourceUrls) &&
				post.sourceUrls.length > 0
			) {
				return post.sourceUrls[0];
			}
			return `/influencer-comment/${post?.postType || 'Unknown'}`;
		};

		const slides = {
			slide1: {
				title: 'Featured Trend',
				themeTitle: featuredTheme ? featuredTheme.themeTitle : 'N/A',
				themeDescription: featuredTheme
					? featuredTheme.themeDescription
					: 'N/A',
				redirectUrl: `/analyzer/theme-details/${Trendurl(
					featuredTheme?.themeTitle || 'N/A'
				)}`,
			},
			slide2: {
				title: 'Featured Event',
				contextTitle: featuredEvent ? featuredEvent.contextTitle : 'N/A',
				summary: featuredEvent ? featuredEvent.summary : 'N/A',
				redirectUrl: `/context-details/${normalizeTitle(
					featuredEvent?.contextTitle || 'N/A'
				)}`,
			},
			slide3: {
				title: 'Featured Opinion',
				postTitle: featuredOpinion ? featuredOpinion.postTitle : 'N/A',
				postSummary: featuredOpinion ? featuredOpinion.summary : 'N/A',
				redirectUrl: getPostRedirectUrl(featuredOpinion),
			},
			slide4: {
				title: 'Featured Infographic',
				postTitle: featuredInfographic ? featuredInfographic.postTitle : 'N/A',
				postSummary: featuredInfographic ? featuredInfographic.summary : 'N/A',
				redirectUrl: getPostRedirectUrl(featuredInfographic),
			},
		};

		return new Response(
			JSON.stringify({
				trendingEvents,
				trendingOpinions,
				marketStatistics,
				trendingThemes,
				slides,
			}),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-store',
				},
			}
		);
	} catch (error) {
		console.error('Error in API:', error);
		return new Response(
			JSON.stringify({
				error: error.message,
				stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);
	}
}
