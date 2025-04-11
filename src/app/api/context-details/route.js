import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Context from '@/models/Context';
import Post from '@/models/Post';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import Theme from '@/models/Theme';
import Signal from '@/models/Signal';
import SubSignal from '@/models/SubSignal';
import connectDB from '@/lib/db';

export async function POST(request) {
  try {
    await connectDB();
    if (!mongoose.models.Sector) mongoose.model('Sector', Sector.schema);
    if (!mongoose.models.SubSector) mongoose.model('SubSector', SubSector.schema);
    if (!mongoose.models.Post) mongoose.model('Post', Post.schema);
    if (!mongoose.models.Theme) mongoose.model('Theme', Theme.schema);
    if (!mongoose.models.Signal) mongoose.model('Signal', Signal.schema);
    if (!mongoose.models.SubSignal) mongoose.model('SubSignal', SubSignal.schema);

    const body = await request.json();
    const { contextId } = body;

    if (!contextId) {
      return NextResponse.json(
        { error: 'Context ID is required' },
        { status: 400 }
      );
    }

    const context = await Context.findById(contextId)
      .populate({
        path: 'themes',
        select: 'themeTitle themeDescription overallScore trendingScore impactScore predictiveMomentumScore',
      })
      .populate({
        path: 'sectors',
        select: 'sectorName',
      })
      .populate({
        path: 'subSectors',
        select: 'subSectorName',
      })
      .populate({
        path: 'posts.postId',
        select: 'postTitle postType date isTrending includeInContainer',
      })
      .lean();

    if (!context) {
      return NextResponse.json(
        { error: 'Context not found' },
        { status: 404 }
      );
    }

    let originalTheme = null;
    if (context.themes && context.themes.length > 0) {
      originalTheme = {
        themeTitle: context.themes[0].themeTitle,
        themeDescription: context.themes[0].themeDescription,
        overallScore: context.themes[0].overallScore || 0,
        trendingScore: context.themes[0].trendingScore || 0,
        impactScore: context.themes[0].impactScore || 0,
        predictiveMomentumScore: context.themes[0].predictiveMomentumScore || 0,
      };
    }

    let matchingThemes = await Theme.find({
      subSectors: { $in: context.subSectors.map(ss => ss._id) },
      isTrending: true
    })
    .populate({
      path: 'subSectors',
      select: 'subSectorName _id',
    })
    .select('themeTitle overallScore sectors subSectors')
    .limit(5)
    .lean();

    if (matchingThemes.length === 0) {
      matchingThemes = await Theme.find({
        sectors: { $in: context.sectors.map(s => s._id) },
        isTrending: true
      })
      .populate({
        path: 'sectors',
        select: 'sectorName _id',
      })
      .select('themeTitle overallScore sectors subSectors')
      .limit(5)
      .lean();
    }

    const processedMatchingThemes = matchingThemes.map(theme => {
      const contextSectorIds = context.sectors.map(s => s._id.toString());
      const contextSubSectorIds = context.subSectors.map(ss => ss._id.toString());

      const matchingSubSector = theme.subSectors.find(subSector =>
        contextSubSectorIds.includes(subSector._id.toString())
      );
      const matchingSector = theme.sectors.find(sector =>
        contextSectorIds.includes(sector._id.toString())
      );

      const matchedCategory = matchingSubSector 
        ? matchingSubSector.subSectorName 
        : matchingSector 
          ? matchingSector.sectorName 
          : null;

      return {
        themeTitle: theme.themeTitle,
        overallScore: theme.overallScore || 0,
        matchedCategory: matchedCategory,
      };
    }).filter(theme => theme.matchedCategory);

    let slides = [];
    if (context.hasSlider) {
      for (let i = 1; i <= 10; i++) {
        const slideKey = `slide${i}`;
        if (context[slideKey] && (context[slideKey].title || context[slideKey].description)) {
          slides.push({
            title: context[slideKey].title || '',
            description: context[slideKey].description || '',
          });
        }
      }
    }

    let processedSectors = [];
    if (context.sectors && context.sectors.length > 0) {
      processedSectors = context.sectors.map(sector => ({
        sectorId: sector._id,
        sectorName: sector.sectorName,
      }));
    } else {
      console.log('No sectors found in context');
    }

    let processedSubSectors = [];
    if (context.subSectors && context.subSectors.length > 0) {
      processedSubSectors = context.subSectors.map(subSector => ({
        subSectorId: subSector._id,
        subSectorName: subSector.subSectorName,
      }));
    } else {
      console.log('No subSectors found in context');
    }

    let processedPosts = [];
    if (context.posts && context.posts.length > 0) {
      const uniquePosts = Array.from(
        new Map(context.posts.map(post => [post.postId?._id.toString(), post])).values()
      ).filter(post => post.postId);

      processedPosts = uniquePosts
        .map(post => ({
          postId: post.postId._id,
          postTitle: post.postId.postTitle,
          postType: post.postId.postType,
          date: post.postId.date,
          isTrending: post.postId.isTrending,
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      console.log('No posts found in context');
    }

    const processedContext = {
      ...context,
      originalTheme,
      trendingThemes: processedMatchingThemes,
      slides,
      sectors: processedSectors,
      subSectors: processedSubSectors,
      posts: processedPosts,
    };

    return NextResponse.json({
      context: processedContext,
    });

  } catch (error) {
    console.error('Error fetching context details:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}