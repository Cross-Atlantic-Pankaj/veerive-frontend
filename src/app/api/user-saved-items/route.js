import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Context from '@/models/Context';
import Post from '@/models/Post';
import Theme from '@/models/Theme';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import Source from '@/models/Source';

export async function POST(request) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 401 });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const savedItems = {
      contexts: [],
      posts: [],
      themes: [],
    };

    const savedPosts = Array.isArray(user.savedPosts) ? user.savedPosts : [];

    for (const savedPost of savedPosts) {
      const savedPostId = savedPost.SavedpostId;
      if (!mongoose.Types.ObjectId.isValid(savedPostId)) {
        console.warn(`Invalid SavedpostId: ${savedPostId}`);
        continue;
      }

      if (savedPost.SavedpostType === 'Context') {
        const context = await Context.findById(savedPostId)
          .select('contextTitle summary containerType posts date')
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
            path: 'posts.postId',
            model: 'Post',
            select: 'postTitle postType summary sourceUrl',
          })
          .lean();
        if (context) {
          savedItems.contexts.push({
            _id: context._id,
            contextTitle: context.contextTitle,
            summary: context.summary,
            containerType: context.containerType,
            sectorNames: context.sectors.map((sector) => sector.sectorName),
            subSectorNames: context.subSectors.map((subSector) => subSector.subSectorName),
            posts: context.posts.map((post) => ({
              postId: post.postId._id,
              postTitle: post.postId.postTitle,
              postType: post.postId.postType,
              summary: post.postId.summary,
              sourceUrl: post.postId.sourceUrl || '',
            })),
            date: context.date,
            savedAt: savedPost.savedAt,
          });
        }
      } else if (savedPost.SavedpostType === 'Post') {
        const post = await Post.findById(savedPostId)
          .select('postTitle postType summary sourceUrl sourceUrls contexts date')
          .populate({
            path: 'source',
            model: 'Source',
            select: 'sourceName',
          })
          .populate({
            path: 'contexts',
            model: 'Context',
            select: 'sectors',
            populate: {
              path: 'sectors',
              model: 'Sector',
              select: 'sectorName',
            },
          })
          .lean();
        if (post) {
          const sourceUrl = post.sourceUrl || (Array.isArray(post.sourceUrls) && post.sourceUrls[0]) || '';
          const sectorNames = Array.from(
            new Set(
              post.contexts
                .flatMap((context) => context.sectors)
                .map((sector) => sector.sectorName)
            )
          );
          savedItems.posts.push({
            _id: post._id,
            postTitle: post.postTitle,
            postType: post.postType,
            summary: post.summary,
            sourceName: post.source?.sourceName || 'Unknown Source',
            sourceUrl,
            sectorNames,
            date: post.date,
            savedAt: savedPost.savedAt,
          });
        }
      } else if (savedPost.SavedpostType === 'Theme') {
        const theme = await Theme.findById(savedPostId)
          .select(
            'themeTitle themeDescription trendingScore impactScore predictiveMomentumScore date'
          )
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
          .lean();
        if (theme) {
          savedItems.themes.push({
            _id: theme._id,
            themeTitle: theme.themeTitle,
            themeDescription: theme.themeDescription,
            trendingScore: theme.trendingScore || 0,
            impactScore: theme.impactScore || 0,
            predictiveMomentumScore: theme.predictiveMomentumScore || 0,
            sectorNames: theme.sectors.map((sector) => sector.sectorName),
            subSectorNames: theme.subSectors.map((subSector) => subSector.subSectorName),
            date: theme.createdAt,
            savedAt: savedPost.savedAt,
          });
        }
      }
    }

    return NextResponse.json({ savedItems }, { status: 200 });
  } catch (error) {
    console.error('Error fetching saved items:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}