import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Post from '@/models/Post';
import Context from '@/models/Context';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import Source from '@/models/Source';
import connectDB from '@/lib/db';

export async function GET(request) {
  try {
    await connectDB();

    if (!mongoose.models.Sector) mongoose.model('Sector', Sector.schema);
    if (!mongoose.models.SubSector) mongoose.model('SubSector', SubSector.schema);
    if (!mongoose.models.Source) mongoose.model('Source', Source.schema);
    if (!mongoose.models.Post) mongoose.model('Post', Post.schema);
    if (!mongoose.models.Context) mongoose.model('Context', Context.schema);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const postType = searchParams.get('postType') || null;
    let sectorId = null;
    let subsectorId = null;

    // Safely convert and validate IDs
    try {
      const rawSectorId = searchParams.get('sectorId');
      if (rawSectorId && mongoose.Types.ObjectId.isValid(rawSectorId)) {
        sectorId = new mongoose.Types.ObjectId(rawSectorId);
        console.log('Validated sectorId:', sectorId.toString());
      }
      const rawSubsectorId = searchParams.get('subsectorId');
      if (rawSubsectorId && mongoose.Types.ObjectId.isValid(rawSubsectorId)) {
        subsectorId = new mongoose.Types.ObjectId(rawSubsectorId);
        console.log('Validated subsectorId:', subsectorId.toString());
      }
    } catch (error) {
      console.error('Error converting ObjectId:', error.message);
      return NextResponse.json(
        { success: false, error: 'Invalid sectorId or subsectorId format' },
        { status: 400 }
      );
    }

    const limit = 10;
    const skip = (page - 1) * limit;

    console.log('Request query params:', Object.fromEntries(searchParams.entries()));
    console.log('Processed - SectorId:', sectorId, 'SubsectorId:', subsectorId);

    const validPostTypes = [
      'Expert Opinion',
      'Infographic',
      'Interview',
      'News',
      'Research Report',
      'Loyalty Programs'
    ];

    const query = {};
    if (postType && validPostTypes.includes(postType)) {
      query.postType = postType;
    }

    let contextMatch = {};
    if (subsectorId) {
      const matchingContexts = await Context.find({ subSectors: subsectorId }).select('_id');
      console.log('Contexts found for subsectorId:', subsectorId, matchingContexts);
      if (matchingContexts.length > 0) {
        contextMatch = { contexts: { $in: matchingContexts.map(ctx => ctx._id) } };
      } else {
        console.log('No contexts found for subsectorId:', subsectorId);
        contextMatch = {}; // Explicitly set to empty if no contexts
      }
    } else if (sectorId) {
      const matchingContexts = await Context.find({ sectors: sectorId }).select('_id');
      console.log('Contexts found for sectorId:', sectorId, matchingContexts);
      if (matchingContexts.length > 0) {
        contextMatch = { contexts: { $in: matchingContexts.map(ctx => ctx._id) } };
      } else {
        console.log('No contexts found for sectorId:', sectorId);
        contextMatch = {}; // Explicitly set to empty if no contexts
      }
    }

    if (Object.keys(contextMatch).length === 0 && (sectorId || subsectorId)) {
      console.log('No valid context match, returning empty result');
      return NextResponse.json({
        success: true,
        posts: [],
        pagination: { currentPage: page, totalPages: 0, totalPosts: 0, hasMore: false }
      });
    }

    const posts = await Post.aggregate([
      { $match: query },
      { $match: contextMatch },
      { $sort: { date: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'contexts',
          localField: 'contexts',
          foreignField: '_id',
          as: 'contextData'
        }
      },
      {
        $lookup: {
          from: 'sources',
          localField: 'source',
          foreignField: '_id',
          as: 'sourceData'
        }
      },
      { $unwind: { path: '$sourceData', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          postTitle: 1,
          postType: 1,
          summary: 1,
          source: '$sourceData.sourceName',
          sourceUrl: {
            $cond: {
              if: { $eq: [{ $type: '$sourceUrls' }, 'array'] },
              then: { $arrayElemAt: ['$sourceUrls', 0] },
              else: '$sourceUrl'
            }
          },
          date: 1,
          contexts: 1,
          sectors: {
            $reduce: {
              input: '$contextData.sectors',
              initialValue: [],
              in: { $setUnion: ['$$value', '$$this'] }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'sectors',
          localField: 'sectors',
          foreignField: '_id',
          as: 'sectorData'
        }
      },
      {
        $project: {
          postTitle: 1,
          postType: 1,
          summary: 1,
          source: 1,
          sourceUrl: 1,
          date: 1,
          sectors: {
            $map: {
              input: '$sectorData',
              as: 'sector',
              in: '$$sector.sectorName'
            }
          }
        }
      }
    ]);

    console.log('Fetched posts:', posts.map(p => p.postTitle));

    const totalPosts = await Post.countDocuments({
      ...query,
      ...contextMatch
    });

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasMore: skip + posts.length < totalPosts
      }
    });

  } catch (error) {
    console.error('Error fetching posts:', error.message);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error: ' + error.message },
      { status: 500 }
    );
  }
}