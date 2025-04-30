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
    const page = parseInt(searchParams.get('page') || '1');
    const postType = searchParams.get('postType') || null;
    const sector = searchParams.get('sector') || null;
    const subsector = searchParams.get('subsector') || null;
    const limit = 10;
    const skip = (page - 1) * limit;

    console.log('All query params:', Object.fromEntries(searchParams.entries()));
    console.log('Sector:', sector, 'Subsector:', subsector);

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
    if (subsector) {
      const subsectorDoc = await SubSector.findOne({ subSectorName: subsector });
      if (subsectorDoc) {
        const matchingContexts = await Context.find({
          subSectors: subsectorDoc._id
        }).select('_id');
        console.log('Matching contexts for subsector:', matchingContexts);
        if (matchingContexts.length > 0) {
          contextMatch = { contexts: { $in: matchingContexts.map(ctx => ctx._id) } };
        }
      }
    } else if (sector) {
      const sectorDoc = await Sector.findOne({ sectorName: sector });
      if (sectorDoc) {
        const matchingContexts = await Context.find({
          sectors: sectorDoc._id
        }).select('_id');
        console.log('Matching contexts for sector:', matchingContexts);
        if (matchingContexts.length > 0) {
          contextMatch = { contexts: { $in: matchingContexts.map(ctx => ctx._id) } };
        } else {
          console.log('No contexts found for sector:', sector);
        }
      } else {
        console.log('Sector not found:', sector);
      }
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

    console.log('Fetched posts:', posts);

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
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}