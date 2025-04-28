import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Post from '@/models/Post';
import Context from '@/models/Context';
import Sector from '@/models/Sector';
import connectDB from '@/lib/db';

export async function GET(request) {
  try {
    await connectDB();
    if (!mongoose.models.Sector) mongoose.model('Sector', Sector.schema);
    if (!mongoose.models.SubSector) mongoose.model('SubSector', SubSector.schema);
    if (!mongoose.models.Post) mongoose.model('Post', Post.schema);
    if (!mongoose.models.Context) mongoose.model('Source', Context.schema);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (limit < 1 || limit > 100) {
      return NextResponse.json({ success: false, error: 'Limit must be between 1 and 100' }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    const posts = await Post.find({})
      .select('postTitle date summary sourceUrl sourceUrls contexts')
      .sort({ date: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log('API Query:', { page, limit, skip });
    console.log('API Fetched post IDs:', posts.map((p) => p._id.toString()));

    const processedPosts = await Promise.all(
      posts.map(async (post) => {
        const sourceUrl = post.sourceUrl || (Array.isArray(post.sourceUrls) && post.sourceUrls.length > 0 ? post.sourceUrls[0] : '');
        const contexts = await Context.find({ _id: { $in: post.contexts } })
          .select('sectors')
          .lean();
        const sectorIds = contexts.reduce((acc, context) => [...acc, ...context.sectors], []);
        const sectors = await Sector.find({ _id: { $in: sectorIds } })
          .select('sectorName')
          .lean();

        return {
          _id: post._id.toString(),
          postTitle: post.postTitle,
          date: post.date.toISOString(),
          summary: post.summary,
          sourceUrl,
          sectors: sectors.map((sector) => ({
            _id: sector._id.toString(),
            sectorName: sector.sectorName,
          })),
        };
      })
    );

    const totalPosts = await Post.countDocuments({});

    return NextResponse.json({
      success: true,
      data: processedPosts,
      totalPosts,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}