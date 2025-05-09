import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Context from '@/models/Context';
import Post from '@/models/Post';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import Source from '@/models/Source';
import Theme from '@/models/Theme';

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
      .sort({ overallScore: -1 })
      .limit(5);

    const featuredTheme = await Theme.findOne({})
      .sort({ overallScore: -1 });

    const featuredEvent = await Context.findOne({ displayOrder: 1 })
      .sort({ date: -1 });

    const featuredOpinion = await Post.findOne({
      postType: 'Expert Opinion',
      homePageShow: true,
    })
      .sort({ date: -1 });

    const featuredInfographic = await Post.findOne({
      postType: 'Infographic',
      homePageShow: true,
    })
      .sort({ date: -1 });

      const slides = {
      slide1: {
        title: 'Featured Theme',
        themeTitle: featuredTheme ? featuredTheme.themeTitle : 'N/A',
        themeDescription: featuredTheme ? featuredTheme.themeDescription : 'N/A',
        redirectUrl:'/analyzer/trend'
      },
      slide2: {
        title: 'Featured Event',
        contextTitle: featuredEvent ? featuredEvent.contextTitle : 'N/A',
        summary: featuredEvent ? featuredEvent.summary : 'N/A',
        redirectUrl:'/pulse-today'
      },
      slide3: {
        title: 'Featured Opinion',
        postTitle: featuredOpinion ? featuredOpinion.postTitle : 'N/A',
        postSummary: featuredOpinion ? featuredOpinion.summary : 'N/A',
        redirectUrl:'/influencer-comment/Expert Opinion'
      },
      slide4: {
        title: 'Featured Infographic',
        postTitle: featuredInfographic ? featuredInfographic.postTitle : 'N/A',
        postSummary: featuredInfographic ? featuredInfographic.summary : 'N/A',
        redirectUrl:'/influencer-comment/Infographic'
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