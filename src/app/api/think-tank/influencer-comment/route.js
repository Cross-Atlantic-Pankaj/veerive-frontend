import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Post from '@/models/Post';
import Context from '@/models/Context';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import Signal from '@/models/Signal';
import SubSignal from '@/models/SubSignal';
import connectDB from '@/lib/db';

export async function GET(request) {
  try {
    await connectDB();

    if (!mongoose.models.Sector) mongoose.model('Sector', Sector.schema);
    if (!mongoose.models.SubSector) mongoose.model('SubSector', SubSector.schema);
    if (!mongoose.models.Signal) mongoose.model('Signal', Signal.schema);
    if (!mongoose.models.SubSignal) mongoose.model('SubSignal', SubSignal.schema);
    if (!mongoose.models.Post) mongoose.model('Post', Post.schema);
    if (!mongoose.models.Context) mongoose.model('Context', Context.schema);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const subSectorId = searchParams.get('subSectorId') || null;
    const subSignalId = searchParams.get('subSignalId') || null;

    if (limit < 1 || limit > 100) {
      return NextResponse.json({ success: false, error: 'Limit must be between 1 and 100' }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    let postsQuery = Post.find({});
    let contextIds = null;

    if (subSectorId) {
      if (!mongoose.isValidObjectId(subSectorId)) {
        return NextResponse.json({ success: false, error: 'Invalid SubSector ID' }, { status: 400 });
      }

      const contexts = await Context.find({ subSectors: subSectorId })
        .select('_id')
        .lean();

      if (!contexts.length) {
        return NextResponse.json({
          success: true,
          data: [],
          totalPosts: 0,
          page,
          limit,
          sectors: [],
          signals: [],
        });
      }

      contextIds = contexts.map((context) => context._id);
      postsQuery = postsQuery.where('contexts').in(contextIds);
    }

    if (subSignalId) {
      if (!mongoose.isValidObjectId(subSignalId)) {
        return NextResponse.json({ success: false, error: 'Invalid SubSignal ID' }, { status: 400 });
      }

      const contexts = await Context.find({ signalSubCategories: subSignalId })
        .select('_id')
        .lean();

      if (!contexts.length) {
        return NextResponse.json({
          success: true,
          data: [],
          totalPosts: 0,
          page,
          limit,
          sectors: [],
          signals: [],
        });
      }

      const subSignalContextIds = contexts.map((context) => context._id);

      if (contextIds) {
        contextIds = contextIds.filter((id) => subSignalContextIds.includes(id));
      } else {
        contextIds = subSignalContextIds;
      }

      if (!contextIds.length) {
        return NextResponse.json({
          success: true,
          data: [],
          totalPosts: 0,
          page,
          limit,
          sectors: [],
          signals: [],
        });
      }

      postsQuery = postsQuery.where('contexts').in(contextIds);
    }

    const posts = await postsQuery
      .select('postTitle date summary sourceUrl sourceUrls contexts')
      .sort({ date: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

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

    const totalPosts = await (subSectorId || subSignalId
      ? Post.countDocuments({ contexts: { $in: contextIds } })
      : Post.countDocuments({}));

    const contexts = await Context.find({})
      .select('sectors subSectors signalCategories signalSubCategories')
      .lean();

    const validSectorIds = [...new Set(contexts.flatMap(context => context.sectors.map(id => id.toString())))];
    const validSubSectorIds = [...new Set(contexts.flatMap(context => context.subSectors.map(id => id.toString())))];
    const validSignalIds = [...new Set(contexts.flatMap(context => context.signalCategories.map(id => id.toString())))];
    const validSubSignalIds = [...new Set(contexts.flatMap(context => context.signalSubCategories.map(id => id.toString())))];

    const sectors = await Sector.find({ _id: { $in: validSectorIds } })
      .select('sectorName')
      .lean();

    const subSectors = await SubSector.find({ _id: { $in: validSubSectorIds } })
      .select('subSectorName sectorId')
      .lean();

    const groupedSectors = sectors.map(sector => {
      const subSectorsForSector = subSectors
        .filter(sub => sub.sectorId && sub.sectorId.toString() === sector._id.toString())
        .map(sub => ({
          _id: sub._id.toString(),
          subSectorName: sub.subSectorName,
        }));
      return {
        _id: sector._id.toString(),
        sectorName: sector.sectorName,
        subSectors: subSectorsForSector,
      };
    }).filter(sector => sector.subSectors.length > 0);

    const signals = await Signal.find({ _id: { $in: validSignalIds } })
      .select('signalName')
      .lean();

    const subSignals = await SubSignal.find({ _id: { $in: validSubSignalIds } })
      .select('subSignalName signalId')
      .lean();

    const groupedSignals = signals.map(signal => {
      const subSignalsForSignal = subSignals
        .filter(sub => sub.signalId && sub.signalId.toString() === signal._id.toString())
        .map(sub => ({
          _id: sub._id.toString(),
          subSignalName: sub.subSignalName,
        }));
      return {
        _id: signal._id.toString(),
        signalName: signal.signalName,
        subSignals: subSignalsForSignal,
      };
    }).filter(signal => signal.subSignals.length > 0);

    return NextResponse.json({
      success: true,
      data: processedPosts,
      totalPosts,
      page,
      limit,
      sectors: groupedSectors,
      signals: groupedSignals,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}