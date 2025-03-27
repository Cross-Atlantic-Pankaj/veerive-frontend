import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Context from '@/models/Context';
import Post from '@/models/Post';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import SidebarMessage from '@/models/SidebarMessage';
import Theme from '@/models/Theme';
import connectDB from '@/lib/db';

export async function GET() {
  try {
    await connectDB();

    // Register models if they don't exist
    if (!mongoose.models.Sector) mongoose.model('Sector', Sector.schema);
    if (!mongoose.models.SubSector) mongoose.model('SubSector', SubSector.schema);
    if (!mongoose.models.Post) mongoose.model('Post', Post.schema);
    if (!mongoose.models.SidebarMessage) mongoose.model('SidebarMessage', SidebarMessage.schema);
    if (!mongoose.models.Theme) mongoose.model('Theme', Theme.schema);

    // Fetch all data in parallel
    const [contextsResult, sidebarMessagesResult, trendingThemes] = await Promise.all([
      Context.find()
        .populate({ path: 'sectors', model: Sector })
        .populate({ path: 'subSectors', model: SubSector })
        .populate({ path: 'posts.postId', model: Post })
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

    // Process contexts data
    const processedContexts = contextsResult.map((context) => {
      const sectors = context.sectors.map((sector) => sector.sectorName);
      const subSectors = context.subSectors.map((subSector) => subSector.subSectorName);

      let contextPosts = context.posts
        .filter((post) => post.postId)
        .map((post) => post.postId);

      contextPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

      const containerSpace = 3;
      if (contextPosts.length > containerSpace) {
        contextPosts = contextPosts.filter((post) => post.isTrending);
        contextPosts = contextPosts.slice(0, containerSpace);
      }

      return {
        contextTitle: context.contextTitle,
        summary: context.summary,
        sectors,
        subSectors,
        posts: contextPosts.map((post) => ({
          postTitle: post.postTitle,
          date: post.date,
          summary: post.summary,
        })),
        bannerShow: context.bannerShow,
        bannerImage: context.bannerImage,
      };
    });

    // Process trending themes
    const processedThemes = trendingThemes.map(theme => ({
      id: theme._id,
      title: theme.themeTitle,
      score: theme.overallScore,
      description: theme.themeDescription,
      sectors: theme.sectors.map(s => s.sectorName),
      subSectors: theme.subSectors.map(s => s.subSectorName)
    }));

    return NextResponse.json({ 
      contexts: processedContexts,
      messages: sidebarMessagesResult,
      trendingThemes: processedThemes
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching Pulse Today data:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}