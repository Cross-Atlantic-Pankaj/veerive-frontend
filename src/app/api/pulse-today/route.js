import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Context from '@/models/Context';
import Post from '@/models/Post';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import SidebarMessage from '@/models/SidebarMessage';
import Theme from '@/models/Theme';
import connectDB from '@/lib/db';

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const page = body.page || 1;
    const limit = 8; // 8 items per page
    const skip = (page - 1) * limit;

    const [contextsResult, sidebarMessagesResult, trendingThemes] = await Promise.all([
      Context.find()
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sectors')
        .populate('subSectors')
        .populate('posts.postId')
        .exec(),

      SidebarMessage.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(1)
        .exec(),

      Theme.find({ isTrending: true })
        .sort({ overallScore: -1 })
        .limit(5)
        .populate('sectors subSectors')
        .exec()
    ]);

    const totalCount = await Context.countDocuments();

    if (!mongoose.models.Sector) mongoose.model('Sector', Sector.schema);
    if (!mongoose.models.SubSector) mongoose.model('SubSector', SubSector.schema);
    if (!mongoose.models.Post) mongoose.model('Post', Post.schema);
    if (!mongoose.models.SidebarMessage) mongoose.model('SidebarMessage', SidebarMessage.schema);
    if (!mongoose.models.Theme) mongoose.model('Theme', Theme.schema);

    const processedContexts = contextsResult.map(context => ({
      containerType: context.containerType,
      contextTitle: context.contextTitle,
      sectors: context.sectors.map(s => s.sectorName),
      subSectors: context.subSectors.map(s => s.subSectorName),
      bannerImage: context.bannerImage,
      summary: context.summary,
      dataForTypeNum: context.dataForTypeNum,
      posts: context.posts
        .filter((p) => p.includeInContainer && p.postId)
        .map((p) => ({
          postTitle: p.postId.postTitle,
          date: p.postId.date,
          summary: p.postId.summary,
        })),
    }));

    const processedThemes = trendingThemes.map((theme) => ({
      id: theme._id,
      title: theme.themeTitle,
      score: theme.overallScore,
      description: theme.themeDescription,
      sectors: theme.sectors.map((s) => s.sectorName),
      subSectors: theme.subSectors.map((s) => s.subSectorName),
    }));

    return NextResponse.json({
      contexts: processedContexts,
      messages: sidebarMessagesResult,
      trendingThemes: processedThemes,
      hasMore: skip + limit < totalCount,
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching Pulse Today data:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
