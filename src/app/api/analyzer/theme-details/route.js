import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Theme from '@/models/Theme';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import Context from '@/models/Context';
import Signal from '@/models/Signal';
import SubSignal from '@/models/SubSignal';
import Post from '@/models/Post';

function normalizeTitle(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-') 
    .replace(/--+/g, '-') 
    .replace(/^-+|-+$/g, '');
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug is required' },
        { status: 400 }
      );
    }

    if (!mongoose.models.Sector) mongoose.model('Sector', Sector.schema);
    if (!mongoose.models.SubSector) mongoose.model('SubSector', SubSector.schema);
    if (!mongoose.models.Theme) mongoose.model('Theme', Theme.schema);
    if (!mongoose.models.Context) mongoose.model('Context', Context.schema);
    if (!mongoose.models.Signal) mongoose.model('Signal', Signal.schema);
    if (!mongoose.models.SubSignal) mongoose.model('SubSignal', SubSignal.schema);
    if (!mongoose.models.Post) mongoose.model('Post', Post.schema);

    const normalizedSlug = normalizeTitle(slug);

    const themes = await Theme.find()
      .populate('sectors', 'sectorName')
      .populate('subSectors', 'subSectorName')
      .lean();

    const targetTheme = themes.find(t => normalizeTitle(t.themeTitle) === normalizedSlug);

    if (!targetTheme) {
      console.log(`No theme found for slug: ${slug}, normalized slug: ${normalizedSlug}, checked themes: ${themes.map(t => t.themeTitle).join(', ')}`);
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }

    const targetSubSectorIds = targetTheme.subSectors.map(sub => sub._id.toString());

    const relatedThemes = await Theme.find({
      subSectors: { $in: targetSubSectorIds },
      _id: { $ne: targetTheme._id }
    })
      .populate('sectors', 'sectorName')
      .populate('subSectors', 'subSectorName')
      .select('themeTitle sectors subSectors impactScore predictiveMomentumScore trendingScore trendingScoreImage overallScore')
      .sort({ overallScore: -1 })
      .lean();

    const contexts = await Context.find({
      themes: targetTheme._id,
      isTrending: true
    })
      .populate('sectors', 'sectorName')
      .populate('subSectors', 'subSectorName')
      .populate('signalCategories', 'signalName')
      .populate('signalSubCategories', 'subSignalName')
      .populate('themes', 'themeTitle')
      .populate('posts.postId')
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        theme: targetTheme,
        relatedThemes: relatedThemes,
        contexts: contexts
      }
    });
  } catch (error) {
    console.error('Error fetching theme, related themes, and contexts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch theme details' },
      { status: 500 }
    );
  }
}