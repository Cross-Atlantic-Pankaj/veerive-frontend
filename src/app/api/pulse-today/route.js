import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Context from '@/models/Context';
import Post from '@/models/Post';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import SidebarMessage from '@/models/SidebarMessage';
import Theme from '@/models/Theme';
import Source from '@/models/Source';
import connectDB from '@/lib/db';

export async function POST(request) {
  try {
    await connectDB();
    if (!mongoose.models.Sector) mongoose.model('Sector', Sector.schema);
    if (!mongoose.models.SubSector) mongoose.model('SubSector', SubSector.schema);
    if (!mongoose.models.Post) mongoose.model('Post', Post.schema);
    if (!mongoose.models.SidebarMessage) mongoose.model('SidebarMessage', SidebarMessage.schema);
    if (!mongoose.models.Theme) mongoose.model('Theme', Theme.schema);
    if (!mongoose.models.Source) mongoose.model('Source', Source.schema);

    const body = await request.json();
    const page = body.page || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    const [contextsResult, sidebarMessagesResult, trendingThemes, expertPostsResult] = await Promise.all([
      Context.find()
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sectors', 'sectorName')
        .populate('subSectors', 'subSectorName')
        .populate({
          path: 'posts.postId',
          select: 'postTitle date summary',
        })
        .exec(),

      SidebarMessage.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(1)
        .exec(),

      Theme.find({ isTrending: true })
        .sort({ overallScore: -1 })
        .limit(5)
        .populate('sectors', 'sectorName')
        .populate('subSectors', 'subSectorName')
        .exec(),

      Post.find({ postType: 'Expert Opinion' })
        .sort({ date: -1 })
        .limit(7)
        .populate('source', 'sourceName')
        .select('postTitle date sourceUrl sourceUrls _id')
        .exec(),
    ]);

    const totalCount = await Context.countDocuments();

    const seenIds = new Set();
    const uniqueContexts = contextsResult.filter((context) => {
      const idString = context._id.toString();
      if (seenIds.has(idString)) return false;
      seenIds.add(idString);
      return true;
    });

    const processedContexts = uniqueContexts.map((context) => {
      const uniquePosts = [];
      const seenPostIds = new Set();
      context.posts.forEach((p) => {
        if (p.postId && !seenPostIds.has(p.postId._id.toString())) {
          seenPostIds.add(p.postId._id.toString());
          uniquePosts.push({
            postTitle: p.postId.postTitle,
            date: p.postId.date,
            summary: p.postId.summary,
          });
        }
      });

      return {
        id: context._id,
        containerType: context.containerType,
        contextTitle: context.contextTitle,
        sectors: context.sectors.map((s) => s.sectorName),
        subSectors: context.subSectors.map((s) => s.subSectorName),
        bannerImage: context.bannerImage,
        summary: context.summary,
        dataForTypeNum: context.dataForTypeNum,
        posts: uniquePosts,
        displayOrder: context.displayOrder,
      };
    });

    const processedThemes = trendingThemes.map((theme) => ({
      id: theme._id,
      title: theme.themeTitle,
      score: theme.overallScore,
      description: theme.themeDescription,
      sectors: theme.sectors.map((s) => s.sectorName),
      subSectors: theme.subSectors.map((s) => s.subSectorName),
    }));

    const expertPosts = expertPostsResult.map((post) => {
      let effectiveSourceUrl = post.sourceUrl;
      if (!effectiveSourceUrl && post.sourceUrls) {
        effectiveSourceUrl = Array.isArray(post.sourceUrls)
          ? post.sourceUrls[0]
          : post.sourceUrls;  
      }
      return {
        _id: post._id,
        postTitle: post.postTitle,
        date: post.date,
        SourceUrl: effectiveSourceUrl || '',
      };
    });

    return NextResponse.json({
      contexts: processedContexts,
      messages: sidebarMessagesResult,
      trendingThemes: processedThemes,
      expertPosts,
      hasMore: skip + limit < totalCount,
    });
  } catch (error) {
    console.error('Error fetching Pulse Today data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}